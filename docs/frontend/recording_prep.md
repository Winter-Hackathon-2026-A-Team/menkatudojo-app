# デバイスチェック画面機能設計

## 権限チェック・アバター選択

### a. 役割・機能

- 録画を開始するための環境と設定
  - カメラ・マイクの権限取得とプレビュー
  - デバイスが正常に動作することの確認
  - アバター（フィードバックを受ける師範）の選択

### b. 状態管理

#### グローバル状態

- globalMessage: { type: 'error'|'success'|'info', message: string } | null
  - 全画面のメッセージ表示を管理

#### ローカル状態

- videoStatus: checking（初期値） | ready | error
  - カメラ起動状態の管理

- audioStatus: checking（初期値） | ready | error
  - マイク起動状態の管理

- stream: MediaStream | null（初期値）
  - カメラ・音声のメディアオブジェクト

- audioLevel: number(0-100), 初期値: 0
  - マイク音量の視覚化用

- selectedAvatarId: number（初期値: localStorageから取得、なければ1）
  - 選択されているアバターID

- MediaErrorType: object | null（正常時）
  - エラー詳細情報
  - {
    type: 'permission_denied'（ブラウザ権限拒否）|'device_not_found'（デバイス未接続）|'already_in_use'（他で使用されている）| 'unknown'（予期せぬエラー）,
    device: 'camera'|'microphone'|'unknown',
    detail: string（ブラウザから返るエラーメッセージ）
    }

  - 検討事項と判断:
    - ストリーム管理について
      - LocalStateでの管理を採用。録画画面で再取得する。
      - 理由: cleanup忘れやバグによるメモリリークを回避し、安全性・保守性を高めるため
      - UX的にはグローバル状態管理の選択が良いと思われる

### c. 関数

#### handleAvatarSelect(avatarId)

- 役割：選択されたアバターIDをlocalstorageに保存
- 処理:
  - selectedAvatarIdを更新
  - localStorageにavatarIdを保存

- 処理フロー:
  - 初期化：
    - localstorageからavatarIdを取得
    - 取得できた場合はその値、nullの場合は1をselectedAvatarIdにセット
  - 選択:
    - ユーザーがアバターを選択→handleAvatarSelectを実行（localstorageに保存）

#### setupDevices()

- 役割: カメラとマイクのストリームを取得し、それぞれのステータスを更新

- 処理フロー:
  - 初期化:
    - videoStatus, audioStatusをcheckingにセット
  - カメラとマイクを個別に取得試行
    - video: getUserMedia({ video: true })
    - audio: getUserMedia({ audio: true })
  - 両方成功:
    - 両方を内包するstreamを作成
    - videoStatus, audioStatusをreadyにセット
    - globalMessageに準備完了アナウンスを流す
  - 失敗（両方・片方）:
    - 失敗したデバイスのStatusをerrorにセット
    - deviceErrorに詳細を保存
    - deviceError!==nullの時、モーダルを表示
      - NotAllowedError → permission_denied: 許可を促すメッセージとリトライボタン(handleRetry)を配置
      - NotFoundError → device_not_found: 外付けカメラ等の接続を促すメッセージとリトライボタン(handleRetry)を配置
      - NotReadableError → already_in_use: 他のアプリでデバイスを使っているか確認、閉じるように促す＋リトライボタン(handleRetry)を配置
      - 未知のエラー: このデバイスでは対応できない旨のメッセージ、トップ画面への遷移ボタン

  - 検討事項と判断:
    - deviceError発生時のモーダルの情報とglobalMessageの内容が視覚的に重複しUXを損ねるため、エラー時は後者を利用しないこととした

#### cleanupDevices()

- 役割: コンポーネント破棄時のクリーンアップ
- setupDevicesを実行するuseEffectのreturn部分で定義する

- 処理フロー:
  - streamがあれば全トラック停止

#### startAnalysis(stream)

- 役割: マイク音量のリアルタイム監視

- 処理フロー:
  - Web Audio APIを使用
  - audioLevelを0-100の範囲で更新
  - requestAnimationFrameでループ
  - アンマウント時は処理を終了

#### handleRetry()

- 役割: デバイス再取得

- 処理フロー:
  - 既存のstreamがあれば全トラック停止
  - stream, deviceError をnullにリセット
  - setupDevices()を再実行

#### handleStart()

- 役割: 録画画面への遷移

- 処理フロー:
  - videoStatusとaudioStatusがreadyの場合に、練習開始ボタンをenabled
  - 上記以外は練習開始ボタンをdisabled
  - ボタン押下で次画面へ遷移（質問IDをURLパラメータに保持したまま）＋streamをtrack.stop()

### d. ライフサイクル

#### マウント時

- localStorageからavatarId読み込み
- setupDevices()実行

#### アンマウント時

- cleanupDevices()実行

### e. UI状態による表示制御

#### 練習開始ボタン

- enabled: videoStatus === 'ready' AND audioStatus === 'ready'
- disabled: 上記以外

#### リトライボタン

- 表示: deviceError !== null

#### プレビュー映像

- 表示: stream !== null
- videoタグのsrcObjectにstreamをセット

#### 音量インジケーター

- 表示: audioStatus === 'ready'
- audioLevelに応じてバーの高さ変化

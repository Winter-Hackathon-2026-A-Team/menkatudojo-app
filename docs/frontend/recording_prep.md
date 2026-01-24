# デバイスチェック画面機能設計

## 1. 権限チェック・アバター選択 ====================================================

### a. 役割・機能
- 録画を開始するための環境と設定
  - カメラ・マイクの権限取得とストリーム確保
  - プレビュー映像の表示
  - マイク音声出力のチェック
  - アバター（フィードバックを受ける相手）の選択

### b. 状態管理
- [LocalState] videoStatus: checking（初期値） | ready | error ...video起動状態の管理
- [LocalState] audioStatus: checking（初期値） | ready | error ...マイク起動状態の管理
- [LocalState] stream: MediaStream | null ...カメラ・音声のメディアオブジェクト
- [LocalState] audioLevel: number(0-100) ...マイク音量の視覚化用
- [LocalState] selectedPersonalityId: integer（初期値: 1）...選択されているアバター
- [LocalState] errorMessage: string | null ...エラー表示



### c-1. 関数
- 関数名：handlePersonalitySelect
- 役割：選択されたアバターIDをlocalstrageに保存
- 引数：personalityId
- 処理:
  - selectedPersonalityIdを更新
  - localStrageにpersonalityIdを保存

### d-1. ロジック
- 初期化：
  - localstrageからpersonalityIdを取得
  - 取得できた場合はその値、nullの場合は1をselectedPersonalityIdにセット
- 選択:
  - ユーザーがアバターを選択→handlePersonalitySelectを実行（localstrageに保存）


### c-2. 関数
- 関数名: setupDevices
- 役割: カメラとマイクのストリームを取得し、それぞれのステータスを更新

### d-2. ロジック
- 初期化: 
  - videoStatus, audioStatusをcheckingにセット
- getUserMedia({video: true, audio: true})を実行
- 成功:
  - streamを保存
  - videoStatus, audioStatusをreadyにセット
- 失敗:
  - videoStatus, audioStatusをerrorにセット
  - errorMessageに内容を出力（ユーザーが拒否、接続失敗）


### c-3. 関数
- 関数名: handleStart
- 役割: 録画画面への遷移

### d-3. ロジック
- videoStatusとaudioStatusがreadyの場合に、練習開始ボタンをenabled
- 上記以外は練習開始ボタンをdisabled
- ボタン押下で次画面へ遷移（質問IDをURLパラメータに保持したまま）＋streamをtrack.stop()
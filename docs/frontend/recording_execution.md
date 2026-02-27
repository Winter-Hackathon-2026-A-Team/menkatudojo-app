# 録画画面機能設計

## 録画開始、アップロード、フィードバック依頼==============

### a. 役割・機能

- 質問内容の表示と録画可能時間の設定
- カメラ・マイクの再起動
- 録画開始・停止やタイマーの同期
- S3へのアップロード+プレビュー表示
- backendへの進捗確認・分析結果の取得・画面遷移

- 処理フロー
  - 録画画面遷移時、GETリクエストを送り、質問内容と録画可能時間を取得
  - 録画開始
  - 録画終了後、フィードバックを受ける選択をする
  - questionId,peronalityIdをbackendに送り、S3の署名付きURLとpublic_idを含めたパスを取得
  - S3へPUTリクエスト
  - (アップロード完了後、Lambdaで音声データを抽出、backendへ完了依頼→分析スタート)
  - S3へのアップロード完了後、backendへ完了確認のボーリングを開始
  - 分析結果がレスポンスされたら、分析結果画面へ遷移し結果を表示

### b. 状態管理

#### グローバル状態

- globalMessage: { type: 'error'|'success'|'info', message: string } | null
  - 全画面のメッセージ表示を管理


#### ローカル状態

- recordingState:
  | phase: 'initializing'（初期値）...質問取得中・カメラ起動中
  | phase: 'ready'; ...準備完了。録画開始ボタンが押せる状態。question, mediaState を保持。
  | phase: 'countdown'; ...開始前の5秒間。countを保持。
  | phase: 'recording'; ...録画中。elapsed（経過時間）を保持。
  | phase: 'completed'; ...録画終了。videoBlob, videoURL を保持（プレビュー可能状態）。
  | phase: 'uploading'; ...署名付きURL取得〜S3アップロード中。progress, answerId, storageKey を保持。
  | phase: 'analyzing'; ...バックエンドでのAI分析待ち（ポーリング中）。pollCount, answerId を保持。
  | phase: 'error'; error: ...異常発生。RecordingError オブジェクトを保持。

- recordingError:
  | code: string ...backendからのレスポンス
  | message: string ...userに出力するメッセージ
  | phase: recordingStateのphase ...どのphaseでエラーが起きたか
  | severity: 'recoverable'/ 'fatal' ...ユーザーが対応可能なエラーか、サーバー由来か

  // デバイスエラーの場合
  mediaError?: MediaErrorInfo;

  | recovery?: { label: string; action: () => Promise<void> }
  | details?: デバッグ用の詳細内容

- mediaRecorder: MediaRecorder | null
  - 録画の実体

- chunks: Blob[]
  - 録画データの断片

- selectedQuestion: {"questionContent": "", "durationLimitSecond": number}
  - 質問内容、録画時間

- videoURL: string | null
  - 録画直後のプレビュー用URL

- selectedAvatarId: localStorage（キー: selectedAvatarId）から取得したアバターID

- characterConfig: PERSONALITIES 定数から特定した { avatarId, personalityId }

- answerId: string | null（初期値）
  - backendから取得するanswerId(attemptsのpublic_id)

- strageKey: string | null（初期値）
  - S3のフォルダの場所の特定用

- isModalOpen: boolean(初期値false)
  - 練習強制終了モーダルが出ているか

====　initializing（質問取得・カメラ起動準備）　====

### c. 関数・処理

#### loadPersonalityId()

- 役割: localStrageからselectedAvatarId を取得。PERSONALITIES 定数と照合し、characterConfig を確定させる。未設定時は ID: 1 を採用。


#### fetchQuestion()

- 役割：選択した質問内容と録画時間を取得
- エンドポイント: /api/questions/questionId
- メソッド：GET
- 引数：questionId(number)
- 返り値：
  - 成功
    {
    "questionId": 12,
    "categoryName": "自己PR",
    "questionContent": "自己PRをしてください。",
    "source": "system",
    "sortOrder": 1,
    "durationLimitSeconds": 90
    }

  - 失敗
    { "code": "ERROR_CODE_STRING"}

- 処理
  - /api/questions/questionId にGETリクエストを送る
  - 成功：
    - selectedQuestionにレスポンスデータを保存
  - 失敗：
    - 通信エラー:
      - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
      - recordingState: errorにセット, recordingErrorをセットして対応（severity: fatal）
      - モーダルを展開、エラーメッセージとホームに戻るボタンを配置して処理を終了
    - URLの質問IDが不正:
      - recordingState: errorにセット, recordingErrorをセットして対応（severity: recoverable）
      - モーダルを展開、エラーメッセージとリトライ？

#### initializeScreen

- 役割: 録画開始に必要なデータとデバイスの準備を整え、利用開始状態にする

- 処理
  - 初期化：
    - 録画開始ボタンをdisabled
  - loadPersonalityIdを実行
  - fetchQuestionを実行
  - setupDevicesを実行（権限チェック画面で定義）
  - 成功：
    - recordingState: readyにセット, totalに録画時間を保存 === 録画開始ボタンをenabled
  - 失敗：
    - setupDevicesが失敗
      - recordingState: error, recordingErrorのseverty: recoverableにセットし対応

====　ready/countdown/recording　====

#### startMediaRecorder

- 役割: mediaRecorderの録画を開始し、データの断片（chunks）を保持する準備

- 処理
  - streamが確認できない場合
    - モーダルを展開、メッセージ＋再試行（setupDevices）を配置
  - mediaRecorderを実行
  - データの断片が届くたびに、chunksを保存

#### startRecordingTimer

- 役割: 1秒ごとにelapsedを更新。0になったら停止

- 処理
  - setIntervalを使う（IDをtimerRefに保存らしい）
  - 1秒ごとにelapsedを更新
  - 0になったら:
    - タイマーを破棄
    - stopRecordingを実行（後述する関数）
  - 録画停止ボタンが押され、stopRecordingが実行されたら:
    - タイマーを破棄
  - その他の理由（戻るボタンを押すなど）:
    - タイマーを破棄

#### startRecordingProcess

役割: 録画開始ボタンを押下時、カウントダウンを表示, 終了後に録画開始

- 処理
  - 録画ボタン押下をトリガーに、recordingState: countdownにセット
  - 画面中央にオーバーレイを設置、カウントダウンを表示
  - countが0:
    - startMediaRecorderを実行
      - 成功:
        - recordingStateをrecordingにセット
        - startRecordingTimerを実行

#### stopRecording

- 役割: 録画の停止、タイマーの解除

- 処理
  - タイマーが0、もしくは手動で停止ボタン押下がトリガー
  - elapsedを破棄（setInterval）
  - mediaRecorderをstop
  - recordingStateをuploadingにセット
  - 動画ファイルを生成（chunksを繋ぎ合わせる）。video/webmという形式, videoBlobとして保存
  - videoプレビュー用URLを発行、videoURLに保存

====　uploading（S3へのアップロード）　====

#### getPresignedUrl

- 役割: backendからS3の署名付きURLを取得する
- エンドポイント: /api/answers/pre-upload
- メソッド: POST
- 引数:
  {
  "questionId": number,
  "characterConfig": {
  "avatarId": 1,
  "personalityId": 1
  }
  }

- 返り値:
  - 成功:
    {”answerId”: “string”,
    ”uploadUrl”: “https://…”,
    ”storageKey”: “string”,}
  - 失敗:
    { "code": "ERROR_CODE_STRING"}

- 処理
  - 初期化:
    - フィードバックを受けるボタンをdisabledにセット
  - /api/answers/pre-uploadにPOSTリクエスト
  - 成功:
    - strageKeyにレスポンスデータを保存
    - uploadToS3を実行
    - オーバーレイを設置し、"動画を送信中..."のようなメッセージを出力

#### uploadToS3

- 役割: S3へ直接動画データをアップロード
- エンドポイント: 署名付きURL
- メソッド: PUT
- 引数: uploadUrl, blob
- 返り値: status: 200

- 処理
  - errorLevelをクリア
  - S3のURLにPUTリクエスト
  - 成功:
    - status: 200を受け取る
    - recordingStateをanalyzingにセット
    - checkAnalysisStatusを実行
    - オーバーレイに"動画を分析中..."のようなメッセージを出力
  - 失敗:
    - getPresignedUrlを実行（3回）、新しい署名つきURLを取得し、uploadToS3を実行
    - 3回やっても失敗: モーダル展開、エラー内容表示
    - handleAbortを実行し削除依頼

====　analyzing（backendへの分析結果確認）　====

#### checkAnalysisStatus

- 役割: 解析が完了したかどうかを定期的に確認
- エンドポイント: /api/answers/${answerId}
- メソッド: GET
- 成功:
  解析中：
  {
  "answerId": "string",
  "analysisStatus": "processing",
  "personalityId": ,
  "feedback": null
  }

  完了：
  {”answerId”: “string”,
  ”analysisStatus”: “completed”,
  ”personalityId”: number,
  ”feedback”: {
  ”score”: "string",
  ”goodPoints”: “string”,
  ”improvePoints”: “string”,
  ”nextTip”: “string”,
  ”videoUrl”: “https://…”,
  ”storageKey”: “string”,}
  }

- 失敗:
  {
  "answerId": "string",
  "analysisStatus": "failed",
  "personalityId": ,
  "feedback": null,
  ”code”: “string”
  }

- 処理
  - analysisStatusがprocessing
    - setIntervalで再起的に実行
    - オーバーレイに"AIが詳細を分析中..."みたいにする
  - analysisStatusがcomplete
    - setIntervalを停止
    - analysisResultに保存
    - 分析結果画面へ遷移
  - 失敗:
    - エラー（status: error（failedが返る場合） / timeout（一定回数のボーリングに達した場合）
    - ポーリング停止。
    - recordingState: error, recordingErrorのseverity: によって対応
  - アンマウントされた時もsetIntervalを停止
  - handleAbortが実行されたときもsetIntervalを停止

====　その他　====

#### videoURLの破棄

- アンマウントされる時、videoURLを破棄する

#### handleAbort

- 役割: 閉じるボタンを押した際の全フェーズ共通処理
- エンドポイント: /api/answers/${answerId}
- メソッド: DELETE
- 引数: answerId
- 返り値: { "answerId": "string", "message": "success" }

- 処理
  - 初期化：
    - 終了するボタンをdisabled
    - MediaRecorderを止める
    - streamを停止
    - タイマーを停止
    - メモリ上の動画データを破棄
    - videoURLを破棄
  - answerIdが存在しない場合は処理を終了しダッシュボードへ遷移
  - /api/answers/${answerId}にDELETEリクエストを送る
  - 成功：
    - IsModalOpen: falseにセット、モーダルを閉じる
    - dashbord画面へ遷移
  - 失敗：
    - 通信エラー:
      - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
      - できなかった旨のメッセージを流す
      - isSubmitting: falseにセット、ボタンを押せるようにする、もしくはDashboardに遷移するボタン

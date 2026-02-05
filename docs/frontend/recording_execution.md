# 録画画面機能設計

## 録画開始、アップロード、フィードバック依頼==============

### a. 役割・機能

- 質問内容の表示と録画可能時間の設定
- カメラ・マイクの再起動
- 録画開始・停止やタイマーの同期
- S3へのアップロード+プレビュー表示
- backendへのフィードバック依頼
- backendへの進捗確認・分析結果の取得・画面遷移

### b. 状態管理

- [globalState] analysisResult: feedbackオブジェクト ...解析完了後に取得するデータ
- [globalState] globalMessage: string | null, error | success | info | null...全体表示用のメッセージ
- [LocalState] appStatus:
  - preparing（初期値）...質問取得中・カメラ起動中
  - ready ...準備完了。録画開始ボタンが押せる状態
  - counting ...開始を押してから、実際に録画が始まるまでのカウントダウン3秒
  - recording ...録画中。タイマーが同期
  - uploading ...録画終了後、プレビュー表示orS3へアップロード
  - analyzing ...backendへの分析依頼＋進捗確認（ボーリング）
- [LocalState] videoStatus: checking（初期値） | ready | error ...video起動状態の管理
- [LocalState] audioStatus: checking（初期値） | ready | error ...マイク起動状態の管理
- [LocalState] countDown: number ...録画ボタン押下→録画開始までのカウントダウン3秒
- [LocalState] remainingTime: number ...録画の残り秒数(カウントダウン)
- [LocalState] mediaRecorder: MediaRecorder | null ...録画の実体
- [LocalState] chunks: Blob[] ...録画データの断片
- [LocalState] uploadProgress: number ...S3へのアップロード進捗率
- [localState] selectedQuestion: {"questionContent": "", "durationLimitSecond": integer} ...質問内容、録画時間
- [localState] videoURL: string | null ...録画直後のプレビュー用URL
- [localState] selectedPersonalityId: integer（初期値: 1）...選択されているアバター（localstrageから取得）
- [localState] answerId: string | null（初期値）...backendから取得するanswerId(attemptsのpublic_id)
- [localState] strageKey: string | null（初期値）...S3のフォルダの場所の特定用
- [LocalState] isModalOpen: boolean(初期値false) ...練習強制終了モーダルが出ているか
- [LocalState] errorMessage: string | null ...エラー表示
- [LocalState] infoMessage: string | null ...userへの案内表示
- [LocalState] errorLevel:
  - retry ...データを保持したまま次のアクションを用意（S3アップロード失敗など）
  - reset ...録画中のカメラ切断など。最初からやり直すアクションを用意
  - exit ...500エラー系。ホームに遷移など
  - null ...正常時（初期値）

====　preparing（質問取得・カメラ起動準備）　====

### c-1. 関数

- 関数名: loadPersonalityId
- 役割: localStrageからpersonalityIdを取得
- 引数: なし
- 返り値:

### d-1. ロジック

- localStrageからpersonalityIdを取得
- 成功: selectedPersonalityIdにセット
- 失敗: personalityIdが存在しない場合は1をセット

### c-2. 関数

- 関数名：fetchQuestion(useEffect)
- 役割：選択した質問内容と録画時間を取得
- エンドポイント: /api/questions/id
- メソッド：GET
- 引数：id(integer)
- 返り値：
  - 成功
    {　”questionId”: integer,
    ”questionContent”: “string”,
    ”durationLimitSeconds”: samllint
    }
  - 失敗
    { "code": "ERROR_CODE_STRING"}

### d-2. ロジック

- 初期化：
  - errorMessageをクリア, errorLevelをnullにセット
- /api/questions/id にGETリクエストを送る
- 成功：
  - selectedQuestionにレスポンスデータを保存
- 失敗：
  - 通信エラー:
    - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
    - status: errorLevelをresetに。
    - errorMessageに再試行の案内を入れ、ボタン（fetchQuestion）を配置し処理を終了
  - URLの質問IDが不正:
    - errorLevelをexitにセット、ホームに戻るボタンを押して処理を終了

### c-3. 関数

- 関数名: initializeScreen（useEffect）
- 役割: 録画開始に必要なデータとデバイスの準備を整え、利用開始状態にする

### d-3. ロジック

- 初期化：
  - appStatus: preparingにセット
  - errorMessage, infoMessageをクリア, errorLevelをnullにセット
  - 録画開始ボタンをdisabled
- loadPersonalityIdを実行
- fetchQuestionを実行
- setupDevicesを実行（権限チェック画面で定義）
- 成功：
  - remainingTimeに録画時間を保存
  - appStatusをreadyにセット, 録画開始ボタンをenabled
- 失敗：
  - setupDevicesが失敗
    - videoStatus/audioStatusいずれかがerror
    - errorLevelをresetにセット、デバイス再起動ボタン（setupDevices）を配置

====　ready（準備完了）　====

### c-4. 関数

- 関数名: startMediaRecorder
- 役割: mediaRecorderの録画を開始し、データの断片（chunks）を保持する準備

### d-4. ロジック

- streamが確認できない場合
  - 処理を終了、errorMessageに出力
- mediaRecorderを実行
- データの断片が届くたびに、chunksを保存

### c-5. 関数

- 関数名: startRecordingTimer
- 役割: 1秒ごとにremainingTimeを更新。0になったら停止

### d-5. ロジック

- setIntervalを使う（IDをtimerRefに保存らしい）
- 1秒ごとにremainingTimeを更新
- 0になったら:
  - タイマーを破棄
  - stopRecordingを実行（後述する関数）
- 録画停止ボタンが押され、stopRecordingが実行されたら:
  - タイマーを破棄
- その他の理由（戻るボタンを押すなど）:
  - タイマーを破棄

### c-6. 関数

関数名: startRecordingProcess
役割: 録画開始ボタンを押下時、カウントダウンを表示, 終了後に録画開始

### d-6. ロジック

- 録画ボタン押下をトリガーに、appStatusをcountingにセット
- 画面中央（infoMessageスペース？）に3,2,1とカウントダウン
- countが0:
  - startMediaRecorderを実行
    - 成功:
      - appStatusをrecordingにセット
      - startRecordingTimerを実行

### c-7. 関数

- 関数名:stopRecording
- 役割: 録画の停止、タイマーの解除

### d-7. ロジック

- タイマーが0、もしくは手動で停止ボタン押下がトリガー
- remainingTimeを破棄（setInterval）
- mediaRecorderをstop
- appStatusをuploadingにセット
- 動画ファイルを生成（chunksを繋ぎ合わせる）。video/webmという形式, videoBlobとして保存
- videoプレビュー用URLを発行、videoURLに保存

====　uploading（S3へのアップロード）　====

### c-8. 関数

- 関数名: getPresignedUrl
- 役割: backendからS3の署名付きURLを取得する
- エンドポイント: /api/answers/pre-upload
- メソッド: POST
- 引数: { "questionId": integer, "personalityId": integer }
- 返り値:
  - 成功:
    {”answerId”: “string”,
    ”uploadUrl”: “https://…”,
    ”storageKey”: “string”,}
  - 失敗:
    { "code": "ERROR_CODE_STRING"}

### d-8. ロジック

- 初期化:
  - フィードバックを受け取るボタンをdisabledにセット
  - errorMessage, errorLevelをクリア
- /api/answers/pre-uploadにPOSTリクエスト
- 成功:
  - answerId, strageKeyにレスポンスデータを保存
  - uploadToS3を実行
  - infoMessageに"動画を送信中..."のようなメッセージを出力

### c-9. 関数

- 関数名: uploadToS3
- 役割: S3へ直接動画データをアップロード
- エンドポイント: 署名付きURL
- メソッド: PUT
- 引数: uploadUrl, blob
- 返り値: status: 200

### d-9. ロジック

- errorMessage, errorLevelをクリア
- S3のURLにPUTリクエスト
- 成功:
  - status: 200を受け取る
  - appStatusをanalyzingにセット
  - requestAnalysisを実行
  - infoMessageに"動画を分析中..."のようなメッセージを出力
- 失敗:

====　analyzing（backendへの分析依頼）　====

### c-10. 関数

- 関数名: requestAnalysis
- 役割: backendへアップロード完了の通知＋分析依頼
- エンドポイント: /api/answers/complete
- メソッド: POST
- 引数:
  {”answerId”: “string”,
  ”storageKey”: “string”,
  ”personalityId”: “number”}
- 返り値:
  - 成功:
    {”answerId”: “string”,
    ”analysisStatus”: processing”}
  - 失敗:
    { "code": "ERROR_CODE_STRING"}

### d-10. ロジック

- errorMessage, errorLevelをクリア
- /api/answers/completeにPOSTリクエスト
- 成功:
  - checkAnalysisStatusを実行
  - infoMessageに"AIが解析中...."みたいな、フェーズ変わった的なアナウンスを流す
- 失敗:

### c-11. 関数

- 関数名: checkAnalysisStatus
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
  ”personalityId”: integer,
  ”feedback”: {
  ”score”: ?,
  ”goodPoints”: “string”,
  ”improvePoints”: “string”,
  ”nextTip”: “string”,
  ”videoUrl”: “https://…”,
  ”storageKey”: “string”,}
  }

- 失敗:

### d-11. ロジック

- analysisStatusがprocessing
  - setIntervalで再起的に実行
  - infoMessageに"AIが詳細を分析中..."みたいにする
- analysisStatusがcomplete
  - setIntervalを停止
  - analysisResultに保存
  - 分析結果画面へ遷移
- 失敗:
  - エラー（status: error / timeout
  - ポーリング停止。
  - errorLevel: retry にセットし、再試行ボタンを表示。



====　その他　====

### c-12. 関数
- 関数名: handleAbort
- 役割: 閉じるボタンを押した際の全フェーズ共通処理
- エンドポイント: /api/answers/${answerId}
- メソッド: DELETE
- 引数: answerId
- 返り値: { "answerId": "string", "message": "success" }

### d-12. ロジック
- 初期化：
    - errorMessage: nullにセットし前のエラーをクリア
    - 終了するボタンをdisabled
    - MediaRecorderを止める
    - streamを停止
    - タイマーを停止
    - メモリ上の動画データを破棄
- answerIdが存在しない場合は処理を終了しダッシュボードへ遷移
- /api/answers/${answerId}にDELETEリクエストを送る
- 成功：
    - IsModalOpen: falseにセット、モーダルを閉じる
    - dashbord画面へ遷移
- 失敗：
  - 通信エラー:
    - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
    - errorMessageにメッセージを流す
    - isSubmitting: falseにセット、ボタンを押せるようにする


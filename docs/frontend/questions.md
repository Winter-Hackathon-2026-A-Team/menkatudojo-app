# 質問選択画面機能設計

## 1. 質問の表示・選択・作成 ====================================================

### a. 役割・機能

- 質問IDをURLパラメータにのせて次の画面（カメラ権限チェック・アバター選択）へ遷移する
  - カテゴリの一覧表示
  - カテゴリ開閉により紐づく質問を表示
  - 指定したカテゴリに質問を新規作成・一覧への反映
  - 質問を一つ選択し次画面へ遷移
  - すべてのカテゴリからランダムに一つ質問を選択して次画面へ遷移

### b. 状態管理
- [globalState] globalMessage: string | null, error | success | info | null...全体表示用のメッセージ

- [LocalState] status: idle | loading（初期値） | error ...通信状態の管理
- [LocalState] questions: puestions[] (初期値：[]) ...APIから取得した質問リスト
- [LocalState] selectedQuestionId: selectedQuestionId() (初期値：null) ...どの質問に☑がついているか
- [LocalState] expandedCategories: expandedCategories[] (初期値：[]) ...どのカテゴリのアコーディオンが開いているか
- [LocalState] isModalOpen: boolean(初期値false) ...質問作成モーダルが出ているか
- [LocalState] formDate: { "newCategoryName": "", "newQuestionContent": "" } ...フォームの値
- [LocalState] isSubmitting: boolean（初期値false）...POST中のみtrue
- [LocalState] fetchError: string | null（初期値）...GET失敗時のメッセージを格納
- [LocalState] submitError: string | null（初期値）...POST失敗時のメッセージを格納


### c-1. 関数
- 関数名：fetchQuestionData(useEffect)
- 役割：カテゴリ・質問を取得し、画面に表示する
- エンドポイント: /api/questions
- メソッド：GET
- 引数：なし
- 返り値：
  - 成功
    {
    ”questions”: [
    　{
    ”questionId”: integer,
    ”categoryName”: “string”,
    ”questionContent”: “string”,
    ”source”: “string”,
    ”sortOrder”: integer,
    ”durationLimitSeconds”: samllint
    }
    ]
    }
  - 失敗
    { "code": "ERROR_CODE_STRING"}

### d-1. ロジック
- 初期化：
  - status: loadingにセット
  - fetchError, submitErrorをクリア
- /api/questionsにGETリクエストを送る
- 成功：
  - レスポンスをカテゴリ毎のオブジェクトに変換してquestionsに保存。
  - status: idleにセット
- 失敗：
  - 通信エラー:
    - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
    - status: error
    - fetchErrorに再試行の案内を入れ、ボタン（fetchQuestionData()）を配置し処理を終了


### c-2. 関数
- 関数名：fetchQuestionCreate
- 役割：入力された質問をbackendに送り、レスポンスを得る
- エンドポイント: /api/questions
- メソッド：POST
- 引数：categoryName, questionContent
- 返り値：
  - 成功
    { ”message”: "success" }
  - 失敗
    { "code": "ERROR_CODE_STRING"}

### d-2. ロジック
- 初期化：
    - submitError: nullにセットし前のエラーをクリア
    - isSubmitting: trueにセットしボタンを連打防止
- /api/questionsにPOSTリクエストを送る
- 成功：
    - IsModalOpen: falseにセット、モーダルを閉じる
    - formDataをクリア
    - isSubmitting: falseにセット、ボタンを押せるようにする
    - GET /api/questions を実行
- 失敗：
  - 通信エラー:
    - 非同期処理が開始できない | レスポンスが得られない | サーバーエラー
    - submitErrorにメッセージを流す
    - isSubmitting: falseにセット、ボタンを押せるようにする


### c-3. 関数
- 関数名：handleSelectQuestion（useState）
- 役割：チェックされた質問のIDを取得する
- 引数：id
- 返り値：selectedQuestionId
- 使用するstate：
    - questions: [ {questionId: 1, questionContent: "string"}… ]...APIから取得したもの
    - selectedQuestionId: null ...未選択

### d-3. ロジック
- もしidとselectedQuestionIdが不一致なら、selecteeQuestionIdを更新
- もしidとselectedQuestionIdが同一なら、値をnullに更新（選択解除）


### c-4. 関数
- 関数名：handleSelectedStart（useState）
- 役割：
  - 質問を選択して練習開始
  - 質問IDをURLパラメータにのせて次画面へ遷移する
- 引数：なし

### d-4. ロジック
  - questionsの中からidとselectedQuestionIdが同一のものを一件探す
  - 一致するものがみつからない場合、開始ボタンをdisabledにする
  - 成功:
    - selectedQuestionIdをURLパラメータにのせる
    - 次画面へ遷移


### c-5. 関数
- 関数名: handleRandomStart（useState）
- 役割: 
  - カテゴリ全体の中からランダムに質問を一つ選択
  - 質問IDをURLパラメータにのせて次画面へ遷移する
- 引数: なし

### d-5. ロジック
  - questions length>0の時
  - questionsの中からランダムにquestionIdを抽出
  - questions length=0の時はボタンをdisabled
  - 成功:
    - selectedQuestionIdをURLパラメータにのせる
    - 次画面へ遷移
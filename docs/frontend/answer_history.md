### 履歴一覧、詳細==============

### 役割

- フィードバックを受けた分析結果の一覧を表示
- 1ページに6件ずつ表示する
- 選択すると、分析結果の詳細へ遷移

### 状態管理
- [globalState] globalMessage: string | null, error | success | info | null ...全体表示用のメッセージ
- [localState] status: idle | loading（初期値） | error …通信の状態
- [localState] answers: オブジェクト | []（初期値）…面接結果のレスポンスデータを格納。date新しいもの順に。
- [localState] totalPage: number | null（初期値）…全ページ
- [localState] currentPage: number （初期値: 1）…表示中のページ
- [localState] errorMessage: string | null（初期値）…エラー表示

### c-1. 関数

- 関数名: fetchAnswers
- 役割: 履歴一覧ページを表示
- エンドポイント: /api/answers?page=1&limit=6
- メソッド: GET
- 引数: page: number
- 返り値:
  - 成功:
    {”answers": [
    { "public_id": "string",
    ”category”: “string”,
    ”question”: “string”,
    "date": "string",
    "score": integer,
    ”personality_id”: integer }
    ],
    "meta": {
    "total_count": 45,
    "current_page": 1
    }
    }
  - 失敗:
    { “CODE” : “ERROR” }

### d-1. ロジック

- currentPageの更新をトリガーに、currentPageの値を引数pageに利用する
- 初期化:
  - statusをloadingにセット
  - errorMessage, globalMessageをクリア
- もし引数pageの値が数値以外or負の値だったら、引数には1を指定
- totalPageに値がある場合、totalPage < page の場合は引数に1を指定
- 変数limitに6を格納
- /api/answers?page=${page}&limit=${limit}にGETリクエスト
- 成功:
  - 履歴なし:
    - answersエリアに”履歴データはありません。練習してみましょう”のようなメッセージを出力
  - 履歴あり:
    - answersにレスポンスデータを保存
    - totalPageにtotalCount/6の結果を保存（小数点切り上げ）
    - window.scrollTo(0, 0)（ページを切り替えた時に、前のページのスクロール位置が残らないようにするため）
  - statusをidleにセット
- 失敗:
  - 通信エラー:
    - statusをエラーにセット

- ### c-1. 関数
  - 関数名: fetchAnswerDetail
  - 役割: 指定した練習履歴の詳細を表示
  - エンドポイント: /api/answers/<id>
  - メソッド: GET
  - 引数・返り値は同一
  ### d-1. ロジック
  - 履歴一覧からのonClickイベントで発火、引数にanswerIdをわたす
  - /api/answers/<id>をGETリクエスト
  - 成功・失敗も同一

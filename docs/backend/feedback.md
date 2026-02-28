## ０．目的
ユーザーが面接回答を録画（音声/動画）し、システムが以下を生成して返す。
- 文字起こし（transcripts）
- AIフィードバック（feedbacks）
    - 良かった点/改善点（ポイント）
    - 次のワンポイントアドバイス
    - 総評（A/B/C）
    - 使用モデル名

これにより、ユーザーは回答の改善サイクルを回せる。

## １．用語
- Attempt（回答）：ある「質問」に対するユーザーの１回分の回答記録。状態・時間・エラーを持つ。
- Recording（録画データ）：Attemptに紐づく実データ（動画/音声）の保存先キーやMIMEなど。
- Transcript（文字起こし）：Attemptの音声から生成されたテキスト。原則１Attempt＝１Transcript。
- Feedback（フィードバック）：Attemptに対するAI評価結果。原則１Attempt＝１Feedback（再生成をしないMVP）
- Avatar（アバター）：フィードバックの口調/人格（personality_id）を選ぶ要素。

## ２．対象ユーザーと権限（最重要）
- ログインユーザーのみがAttemptを作成できる。
- Attempt/Transcript/Feedback/Recordingは作成者本人のみ閲覧可能
- 管理者機能はMVPでは不要

## ３．データ構造
**3.1 attempts（回答）**
- user_id（回答者）
- question_id（対象質問）
- status（処理状態：後述）
- duration_limit_s（録画上限秒）
- error_message（失敗時の詳細）
- deleted_at（論理削除）

**3.2 recordings（動画/音声）**
- attempt_id（FK+UQ）=1attemptにつき録画は１つ
- storage_key（ストレージ上のキー）
- mime_type/size_bytes

**3.3 transcipts（文字起こし）**
- attempt_id（FK+UQ）=1attemptにつき文字起こしは１つ
- text（MEDIUMTEXT）

**3.4 feedbacks（AIフィードバック）**
- attempt_id（FK）
- avatar_id（口調）
- good_point/improve_points（int）
- next_tip（ワンポイントアドバイス）
- grade（A/B/C）
- model_name（モデル名）

**3.5 avatars（アバター）**
- personality_id（口調・人格定義への参照）

## ４．状態遷移
AI処理は時間がかかる可能性があるため、Attemptに状態を持たせる。

**4.1 status候補**
- `CREATED`:Attempt作成直後（録画未紐づけ）
- `UPLOADED`:録画データ紐づけ完了
- `TRANSCRIBING`:文字起こし処理中
- `FEEDBACKING`:フィードバック生成中
- `DONE`:Transcript + Feedbackが揃った
- `ERROR`:処理失敗（error_messageに理由）
- `DELETED`:論理削除扱い

**4.2 失敗時の扱い**
- `ERROR`になったら、ユーザーは「再試行（追加機能）」ができる余地を残す
- MVPでは「失敗したら再回答してもらう」

## ５．ユースケース
**5.1 回答～AI結果確認まで（基本フロー）**
1. ユーザーが質問を選ぶ（またはランダムで出題）
1. 「録画開始」→終了
1. 録画データをアップロード（または送信）
1. サーバがattemptを`UPLOADED`に更新
1. サーバが文字起こし→フィードバック生成を実施
1. 完了したら`DONE`
1. ユーザーはattemptの詳細画面で
    - 文字起こし
    - AIフィードバック
    - 録画の再生

**5.2 アバター（口調）の扱い**
- ユーザーが回答開始前にアバターを選択できる
- 選択されたavatar_idをfeedbacksに保存
- 口調はフィードバック文章の生成にのみ影響し、点数・総評のロジックは同じ

## ６．MVP機能定義
MVPとして必須にするもの：
1. Attempt作成（質問ID・制限時間）
1. Recording紐づけ（動画/音声の保存先キー、MIME、サイズ）
1. Transcript生成（attempt_idに対して１つ）
1. Feedback生成（attempt_idに対して１つ）
1. Attempt詳細取得（status, recording, transcript, feedbackを確認できる）
1. ユーザー本人のみアクセス可
1. 失敗時はERRORで返却し、理由をerror_messageへ

## ７．API設計
**7.1 Attempt作成**
- `POST /api/attempts`
    - body:`{ question_id, duration_limit_s, avatar_id? }`
    - return:`{ attempt_id, status=CREATED }`

**7.2 録画の紐づけ**
- `POST /api/attempts/{attempt_id}/recording`
    - body:`{ storage_key, mime_type, size_bytes, duration_s }`
    - ここでstatusを`UPLOADED`にする

**7.3 Attempt詳細取得**
- `GET /api/attempts/{attempt_id}`
    - return:attempt + recording + transcript + feedback（存在するものだけ）

**7.4 一覧（履歴）**
- `GET /api/attempts?question_id=&status=&from=&to=`
    - 自分のattempt履歴を返す

**7.5 個別取得**
- `GET /api/attempts/{attempt_id}/transcript`
- `GET /api/attempts/{attempt_id}/feedback`

**7.6 論理削除**
- `DELETE /api/attempts/{attempt_id}`
    - deleted_atを入れる

## ８．AI処理の入力/出力
**8.1 入力**
- recoding（音声/動画）
- question本文（質問テキスト）
- 制限時間・実録画時間
- avatar人格（口調）

**8.2 出力**
- transcripts.text（全文）
- feedbacks
    - good_points/improve_points:0~100の整数
    - next_tip:255文字以内
    - grade:A/B/C
    - model_name:使用したモデル名

**8.3 文字数/制限に関する注意**
- next_tipは255文字以内に収める
- transcripts.textはMEDIUMTEXTなので長文OK

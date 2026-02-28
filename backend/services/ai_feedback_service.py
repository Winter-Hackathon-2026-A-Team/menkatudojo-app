import json
import re
from pathlib import Path

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import settings

DEFAULT_PERSONALITY = "標準（丁寧で簡潔）"

PERSONALITY_MAP = {
    1: "熱血（短く結論→理由→具体例で、背中を押す口調）",
    2: "冷静（論理的に不足点を指摘し、改善案を箇条書きで示す）",
    3: "優しい（肯定→改善点→次アクションの順で柔らかく）",
}

PROMPT_DIR = Path(__file__).resolve().parents[1] / "prompts" / "ai_feedback"


def _load_prompt(filename: str) -> str:
    return (PROMPT_DIR / filename).read_text(encoding="utf-8")


def _extract_json(text_response: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", text_response)
    cleaned = cleaned.replace("```", "").strip()

    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not m:
        raise ValueError("AI response does not contain JSON object")

    return json.loads(m.group(0))


def _clamp_int(v, min_v: int, max_v: int) -> int:
    try:
        n = int(v)
    except Exception:
        n = min_v
    return max(min_v, min(max_v, n))


def _normalize_grade(v) -> str:
    s = str(v).strip().upper()
    return s if s in ("A", "B", "C") else "B"


async def _call_gemini(*, system_prompt: str, user_prompt: str) -> str:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is empty")

    model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    params = {"key": settings.GEMINI_API_KEY}

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"[SYSTEM]\n{system_prompt}\n\n[USER]\n{user_prompt}"}],
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 800,
        },
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, params=params, json=payload)
        r.raise_for_status()
        data = r.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise RuntimeError(f"Unexpected Gemini response format: {data}")

def _mock_ai_json(*, personality: str) -> dict:
    # personalityに応じて口調を変えるならここで分岐してOK
    return {
        # ※ schema.json に合わせてキー名は必ず一致させる
        "good_points": 70,
        "improve_points": 30,
        "next_tip": "結論→理由→具体例（数字/期間）で1分以内にまとめる練習をしましょう。",
        "grade": "B",
        # もし schema に followup_questions / rewrite_example があるなら必ず入れる
        "followup_questions": [
            "その経験で一番工夫した点は何ですか？",
            "成果を数字で表すとどれくらいですか？",
            "再現するとしたら次は何を改善しますか？",
        ],
        "rewrite_example": "結論から言うと〜です。理由は〜で、具体例として〜（期間/数値）を行い〜の成果を出しました。",
    }

async def generate_ai_feedback_for_attempt(
    db: AsyncSession,
    attempt_public_id: str,
    current_user_id: int | None = None,
) -> dict:
    r = await db.execute(
        text("""
            SELECT
                a.id              AS attempt_id,
                a.public_id       AS attempt_public_id,
                a.user_id         AS user_id,
                a.status          AS status,
                q.question_text   AS question_text,
                t.text            AS transcript_text,
                f.id              AS feedback_id,
                f.avatar_id       AS avatar_id,
                av.personality_id AS personality_id
            FROM attempts a
            JOIN questions q ON q.id = a.question_id
            LEFT JOIN transcripts t ON t.attempt_id = a.id
            LEFT JOIN feedbacks f   ON f.attempt_id = a.id
            LEFT JOIN avatars av    ON av.id = f.avatar_id
            WHERE a.public_id = :public_id
            LIMIT 1
        """),
        {"public_id": attempt_public_id},
    )
    row = r.mappings().first()
    if not row:
        raise ValueError("Attempt not found (or missing transcripts/feedback/avatar)")

    # ✅ row を使う前に存在チェック
    if not row:
        raise ValueError("Attempt not found")

    if current_user_id is not None and int(row["user_id"]) != int(current_user_id):
        raise PermissionError("Not allowed")

    if not row.get("transcript_text"):
        raise ValueError("Transcript is empty (speech-to-text not finished yet)")

    # ✅ personality_id -> personality文字列（現状設計のまま）
    personality_id = row.get("personality_id")
    personality_str = (
        PERSONALITY_MAP.get(int(personality_id), DEFAULT_PERSONALITY)
        if personality_id is not None
        else DEFAULT_PERSONALITY
    )

    avatar_id = row.get("avatar_id")
    avatar_name = f"Avatar-{avatar_id}" if avatar_id is not None else "Interviewer"

    # ✅ テンプレ先頭に入れる「ペルソナ説明文」
    personality_text = (
        f"あなたは面接官『{avatar_name}』。性格は「{personality_str}」。\n"
    )

    # ✅ 話し方を personality_str から抽出（雑でもまず動く）
    # 例: "熱血（短く結論→理由→具体例で、背中を押す口調）"
    speaking_style = "丁寧で簡潔"
    if "（" in personality_str and "）" in personality_str:
        speaking_style = personality_str.split("（", 1)[1].split("）", 1)[0].strip()

    system_prompt = _load_prompt("system.txt")
    user_template = _load_prompt("user_template.txt")
    schema_json = _load_prompt("schema.json")

    # ✅ user_template.txt のプレースホルダと一致させる
    # ※テンプレ内の {transcript} が残っているなら transcript=row["transcript_text"] を渡す
    user_prompt = user_template.format(
        personality_text=personality_text,
        question_text=row.get("question_text") or "",
        transcript_text=row.get("transcript_text") or "",
        transcript=row.get("transcript_text") or "",  # ← {transcript} が残ってても落ちない保険
        output_schema=schema_json,
        avatar_name=avatar_name,
        avatar_personality=personality_str,
        avatar_speaking_style=speaking_style,
    )

    if getattr(settings, "AI_FEEDBACK_MODE", "gemini") == "mock":
        ai_json = _mock_ai_json(personality=p)
        ai_text = json.dumps(ai_json, ensure_ascii=False)
    else:
        ai_text = await _call_gemini(system_prompt=system_prompt, user_prompt=user_prompt)
        ai_json = _extract_json(ai_text)

    # ⚠️ good_points/improve_points が配列で返る想定なら、ここは後で整備が必要
    # とりあえず textカラムに入るように「文字列化」しておく
    def _to_text(v) -> str:
        if isinstance(v, list):
            return "\n".join([str(x).strip() for x in v if str(x).strip()]) or ""
        return str(v).strip()

    good_points = _to_text(ai_json.get("good_points", ""))
    improve_points = _to_text(ai_json.get("improve_points", ""))

    next_tip = str(ai_json.get("next_tip", "")).strip()
    if len(next_tip) > 255:
        next_tip = next_tip[:255]

    grade = _normalize_grade(ai_json.get("grade", "B"))

    model_name = getattr(settings, "GEMINI_MODEL", "gemini").strip()
    if len(model_name) > 100:
        model_name = model_name[:100]

    try:
        await db.execute(
            text("""
                UPDATE feedbacks
                SET
                    good_points = :good_points,
                    improve_points = :improve_points,
                    next_tip = :next_tip,
                    grade = :grade,
                    model_name = :model_name
                WHERE id = :feedback_id
            """),
            {
                "feedback_id": row["feedback_id"],
                "good_points": good_points,
                "improve_points": improve_points,
                "next_tip": next_tip,
                "grade": grade,
                "model_name": model_name,
            },
        )

        await db.execute(
            text("""
                UPDATE attempts
                SET status = 'completed', error_message = NULL
                WHERE id = :attempt_id
            """),
            {"attempt_id": row["attempt_id"]},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    return {
        "attemptPublicId": attempt_public_id,
        "goodPoints": good_points,
        "improvePoints": improve_points,
        "nextTip": next_tip,
        "grade": grade,
        "modelName": model_name,
        "raw": ai_json,
    }
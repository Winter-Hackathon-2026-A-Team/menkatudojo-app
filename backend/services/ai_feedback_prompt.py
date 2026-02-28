from pathlib import Path

PROMPT_DIR = Path(__file__).resolve().parents[1] / "prompts" / "ai_feedback"

def load_prompt(filename: str) -> str:
    return (PROMPT_DIR / filename).read_text(encoding="utf-8")

SYSTEM_PROMPT = load_prompt("system.txt")
USER_TEMPLATE = load_prompt("user_template.txt")

def build_user_prompt(
    *,
    avatar_name: str,
    avatar_personality: str,
    avatar_speaking_style: str,
    question_text: str,
    transcript: str,
) -> str:
    return USER_TEMPLATE.format(
        avatar_name=avatar_name,
        avatar_personality=avatar_personality,
        avatar_speaking_style=avatar_speaking_style,
        question_text=question_text,
        transcript=transcript,
    )
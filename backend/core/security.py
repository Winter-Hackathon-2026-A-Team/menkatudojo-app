import secrets
from passlib.context import CryptContext

def generate_session_id() -> str:
    return secrets.token_urlsafe(32)

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def verify_password(raw_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(raw_password, hashed_password)

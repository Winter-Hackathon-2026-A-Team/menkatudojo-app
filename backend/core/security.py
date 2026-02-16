
from fastapi import Request, HTTPException
from core.exceptions import InvalidCsrfTokenError
import secrets
from passlib.context import CryptContext

def verify_csrf(request: Request):

    cookie_token = request.cookies.get("csrf_token")
    header_token = request.headers.get("X-CSRF-Token")

    # CookieまたはヘッダーにCSRFトークンが存在しない場合、エラーを返す
    if not cookie_token or not header_token:
        raise InvalidCsrfTokenError()
    # CSRF検証結果がNGの場合、エラーを返す
    if cookie_token != header_token:
        raise InvalidCsrfTokenError()

def generate_session_id() -> str:
    return secrets.token_urlsafe(32)

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def verify_password(raw_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(raw_password, hashed_password)


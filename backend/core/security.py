
from fastapi import Request, HTTPException
from core.exceptions import InvalidCsrfTokenError
import secrets, hmac, hashlib, time, base64
from config.settings import settings
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

def generate_csrf_token(ttl_seconds: int = 60 * 60 * 12) -> str:
    exp = int(time.time()) + ttl_seconds
    msg = str(exp).encode()
    sig = hmac.new(settings.SECRET_KEY.encode(), msg, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(msg + b"." + sig).decode()
    return token

def verify_csrf_token(token: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(token.encode())
        msg, sig = raw.split(b".", 1)
        exp = int(msg.decode())
        if exp < int(time.time()):
            return False
        expected = hmac.new(settings.SECRET_KEY.encode(), msg, hashlib.sha256).digest()
        return hmac.compare_digest(sig, expected)
    except Exception:
        return False

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def verify_password(raw_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(raw_password, hashed_password)


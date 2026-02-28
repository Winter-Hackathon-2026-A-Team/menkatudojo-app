
from fastapi import Request, HTTPException, Header, Cookie
from core.exceptions import InvalidCsrfTokenError
import secrets, hmac, hashlib, time, base64
from config.settings import settings
from passlib.context import CryptContext


CSRF_COOKIE_NAME = "csrf_token"

def verify_csrf(
    x_csrf_token: str = Header(..., alias="X-CSRF-Token"),
    csrf_token: str | None = Cookie(default=None, alias=CSRF_COOKIE_NAME),
):
    if not csrf_token or x_csrf_token != csrf_token:
        raise HTTPException(status_code=403, detail={"code": "INVALID_CSRF_TOKEN"})
    
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


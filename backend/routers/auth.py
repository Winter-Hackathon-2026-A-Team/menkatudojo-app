from fastapi import APIRouter, Depends, HTTPException, Response, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import text

from database import get_db
from config.settings import settings
from core.security import verify_password
from schemas.auth import SignupRequest, LoginRequest, UserResponse
from services.user_service import UserService
from services.session_service import SessionService
from dependencies.auth import get_current_user, COOKIE_NAME

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_NAME = "session_id"

def set_session_cookie(response: Response, session_id: str):
    max_age = int(getattr(settings, "SESSION_EXPIRE_DAYS", 7)) * 24 * 60 * 60
    secure = bool(getattr(settings, "COOKIE_SECURE", False))
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite = "lax",
        secure=secure,
        max_age=max_age,
        path="/",
    )

def clear_session_cookie(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user_svc = UserService(db)
    user, err = await user_svc.create_user(payload.email, payload.username, payload.password)
    if err == "EMAIL_ALEREADY_EXISTS":
        raise HTTPException(status_code=409, detail="Email already exists")
    
    sess_svc = SessionService(db)
    session_id = await sess_svc.create_session(user["id"])
    set_session_cookie(response, session_id)

    return UserResponse(public_id=user["public_id"], email=user["email"], username=user["username"])

@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest, response: Response, db=Depends(get_db)):
    r = await db.execute(
        text("""
             SELECT id, public_id, email, username, password, is_active
             FROM users
             WHERE email = :email
             LIMIT 1
        """),
        {"email": payload.email},
    )
    user = r.mappings().first()

    if not user or int(user["is_active"]) != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    sess_svc = SessionService(db)
    session_id = await sess_svc.create_session(int(user["id"]))

    response.set_cookie(
        key=COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return {
        "public_id": user["public_id"],
        "email": user["email"],
        "username": user["username"],
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    session_id: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
):
    if session_id:
        sess_svc = SessionService(db)
        await sess_svc.revoke_session(session_id)
    
    response.delete_cookie(COOKIE_NAME, path="/")
    return

@router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    return current_user

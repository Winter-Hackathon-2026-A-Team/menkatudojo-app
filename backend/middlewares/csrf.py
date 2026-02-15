from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from core.security import generate_csrf_token, verify_csrf_token  

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
PROTECTED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}  

class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        cookie_name: str = "csrf_token",
        header_name: str = "X-XSRF-TOKEN",
        exempt_paths: set[str] | None = None,
        protect_prefixes: tuple[str, ...] = ("/api",),
    ):
        super().__init__(app)
        self.cookie_name = cookie_name
        self.header_name = header_name
        self.exempt_paths = exempt_paths or set()
        self.protect_prefixes = protect_prefixes

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # 対象パスでないならスキップ（/api 以外など）
        if self.protect_prefixes and not path.startswith(self.protect_prefixes):
            return await call_next(request)

        # 除外パス
        if path in self.exempt_paths:
            return await call_next(request)

        # まず先に次の処理へ（レスポンスを受け取る）  
        response = await call_next(request)

        # --- ここから「Cookieが無いなら常に発行」 ---
        cookie_token = request.cookies.get(self.cookie_name)
        if not cookie_token:
            token = generate_csrf_token()
            response.set_cookie(
                key=self.cookie_name,
                value=token,
                httponly=False,
                samesite="lax",
                secure=False,  
                path="/",
            )
            return response

        # 安全メソッドは検証しない（Cookie付与だけ）
        if request.method in SAFE_METHODS:
            return response

        # 変更系メソッドのみCSRF検証
        if request.method in PROTECTED_METHODS:
            header_token = request.headers.get(self.header_name)

            if not header_token:
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_MISSING"})

            if header_token != cookie_token:
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_MISMATCH"})

            # --- 「サーバで生成したものか」検証を追加 ---
            if not verify_csrf_token(header_token):
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_INVALID"})

        return response
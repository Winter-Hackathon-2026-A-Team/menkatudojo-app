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
        header_name: str = "x-xsrf-token", # 実態（小文字）をデフォルトに
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

        # 1. 除外判定（早期リターン）
        if (self.protect_prefixes and not path.startswith(self.protect_prefixes)) or (path in self.exempt_paths):
            return await call_next(request)

        # 2. 変数の取得と正規化（引用符の除去）
        # header_nameは大文字小文字を問わず取得できるよう正規化される
        raw_cookie = request.cookies.get(self.cookie_name) or ""
        raw_header = request.headers.get(self.header_name) or ""
        
        cookie_token = raw_cookie.strip('"')
        header_token = raw_header.strip('"')

        # 3. 検証（変更系メソッドかつAPI実行前）
        if request.method in PROTECTED_METHODS:

            if not header_token or not cookie_token:
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_MISSING"})

            if header_token != cookie_token:
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_MISMATCH"})

            if not verify_csrf_token(header_token):
                return JSONResponse(status_code=403, content={"code": "CSRF_TOKEN_INVALID"})

        # 4. 本処理の実行
        response = await call_next(request)

        # 5. Cookieの付与（存在しない場合のみレスポンスに追加）
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
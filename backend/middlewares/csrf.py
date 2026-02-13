from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        cookie_name: str = "csrf_token",
        header_name: str = "X-CSRF-Token",
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

        # 安全メソッドはスキップ
        if request.method in SAFE_METHODS:
            return await call_next(request)

        # CSRF検証
        cookie_token = request.cookies.get(self.cookie_name)
        header_token = request.headers.get(self.header_name)

        if not cookie_token or not header_token or cookie_token != header_token:
            return JSONResponse(
                status_code=403,
                content={"code": "CSRF_INVALID"},
            )

        return await call_next(request)
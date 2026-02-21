from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from core.exceptions import AppException

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code}
        )
    
    @app.exception_handler(Exception)
    async def internal_server_error_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"code": "INTERNAL_SERVER_ERROR"}
        )

    
    

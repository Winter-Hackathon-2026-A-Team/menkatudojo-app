from fastapi import Request, HTTPException
from core.exceptions import InvalidCsrfTokenError

def verify_csrf(request: Request):

    cookie_token = request.cookies.get("csrftoken")
    header_token = request.headers.get("X-CSRF-Token")

    # CookieまたはヘッダーにCSRFトークンが存在しない場合、エラーを返す
    if not cookie_token or not header_token:
        raise InvalidCsrfTokenError()
    # CSRF検証結果がNGの場合、エラーを返す
    if cookie_token != header_token:
        raise InvalidCsrfTokenError()


class AppException(Exception):
    """アプリケーション共通例外"""
    code: str = "APP_ERROR"
    status_code: int = 400

class UserNotFoundError(AppException):
    """ユーザーが見つからない場合"""
    code = "USER_NOT_FOUND"
    status_code = 404

class InvalidCsrfTokenError(AppException):
    code = "INVALID_CSRF_TOKEN"
    status_code = 403

class InvalidSessionError(AppException):
    code = "UNAUTHORIZED"
    status_code = 401

class QuestionNotFoundError(AppException):
    code = "QUESTION_NOT_FOUND"
    status_code = 404

class ForbiddenError(AppException):
    code = "FORBIDDEN"
    status_code = 403

class RecordingNotFoundError(AppException):
    code = "RECORDING_NOT_FOUND"
    status_code = 404


class RecordingFileSizeExceededError(AppException):
    code = "RECORDING_FILESIZE_EXCEEDED"
    status_code = 400


class InvalidRecordingMimeTypeError(AppException):
    code = "INVALID_RECORDING_MIMETYPE"
    status_code = 400
from pydantic import BaseModel, Field, ConfigDict

class SignupRequest(BaseModel):
    email: str
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=64)

class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=64)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    userId: str = Field(validation_alias="public_id", serialization_alias="userId")
    email: str
    username: str


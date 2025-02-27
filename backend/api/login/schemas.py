from pydantic import BaseModel

class LoginForm(BaseModel):
    email: str
    username: str
    password: str

class User(BaseModel):
    username: str
    email: str | None
    full_name: str | None
    disabled: bool | None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int | None

class ForgotPasswordForm(BaseModel):
    email: str

class ResetPasswordForm(BaseModel):
    password: str
    password_confirmation: str
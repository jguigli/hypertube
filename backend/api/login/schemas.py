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
    username: str | None
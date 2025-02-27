from pydantic import BaseModel


class UserRegister(BaseModel):
    email: str
    user_name: str
    first_name: str
    last_name: str
    password: str

    class Config:
        from_attributes = True

class UserRegisterReturn(BaseModel):
    access_token: str
    token_type: str

    class Config:
        from_attributes = True

class User(BaseModel):
    email: str
    user_name: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class OtherUser(BaseModel):
    user_name: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class UserEditInfos(BaseModel):
    email: str
    user_name: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True
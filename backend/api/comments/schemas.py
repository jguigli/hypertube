from pydantic import BaseModel


class Comment(BaseModel):
    id: int
    user_id: int
    user_name: str
    content: str

    class Config:
        orm_mode = True
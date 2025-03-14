from pydantic import BaseModel
from datetime import datetime


class Comment(BaseModel):
    id: int
    user_id: int
    user_name: str
    content: str
    # created_at: datetime


    class Config:
        from_attributes = True
        # orm_mode = True

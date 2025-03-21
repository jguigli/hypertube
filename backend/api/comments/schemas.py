from pydantic import BaseModel
from typing import Optional


class Comment(BaseModel):
    id: int
    user_id: int
    user_name: str
    parent_id: Optional[int]
    content: str
<<<<<<< HEAD
=======
    timestamp: Optional[int] = None

>>>>>>> f9bb6da9 (timestamp on comments fixed)
    replies: list['Comment'] = []

    class Config:
        from_attributes = True
        orm_mode = True

Comment.update_forward_refs()

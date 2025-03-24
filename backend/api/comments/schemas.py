from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Comment(BaseModel):
    id: int
    user_id: int
    user_name: str
    parent_id: Optional[int]
    content: str
    timestamp: Optional[int] = None

    replies: list['Comment'] = []

    class Config:
        from_attributes = True
        # orm_mode = True


Comment.update_forward_refs()

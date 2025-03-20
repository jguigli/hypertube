from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from api.database import get_db
from api.users import models as user_models
from api.login import security

from .crud import get_comment_by_id, create_comment, delete_comment
from api.movies.crud import get_movie_by_id
from .schemas import Comment


router = APIRouter(tags=["Comments"])

class CommentRequest(BaseModel):
    content: str
    parent_id: Optional[int] = None
    timestamp: int

@router.post('/comments/{movie_id}')
async def post_movie_comment(
    movie_id: int,
    comment_data:  CommentRequest,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):

    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")
    
    content = comment_data.content
    parent_id = comment_data.parent_id
    timestamp = comment_data.timestamp
    
    print(f"parent id is {parent_id}")
    print(f"timestamp is {timestamp}")

    if not len(content) or len(content) > 500:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment format")
    comment = create_comment(db, current_user.id, movie_id, parent_id, content, timestamp)
    return comment


@router.delete('/comments/{comment_id}')
async def delete_movie_comment(
    comment_id: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    comment = get_comment_by_id(db, comment_id, current_user.id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment")
    delete_comment(db, comment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get('/comments/{comment_id}', response_model=Comment)
async def get_movie_comment(
    comment_id: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    comment = get_comment_by_id(db, comment_id, current_user.id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment")
    return comment
from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from api.database import get_db
from api.users import models as user_models
from api.login import security

from .crud import get_comment_by_id, create_comment, delete_comment
from api.movies.crud import get_movie_by_id


router = APIRouter(tags=["Comments"])

class CommentRequest(BaseModel):
    content: str

@router.post('/comments/{movie_id}')
async def post_movie_comment(
    movie_id: int,
    comment_data:  CommentRequest,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):

    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")
    
    content = comment_data.content
    
    if not len(content) or len(content) > 500:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment format")
    create_comment(db, current_user.id, movie_id, content)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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





# @router.get('/comments')
# async def get_all_comments(
#     current_user: Annotated[user_models.User, Depends(security.get_current_user)],
#     db: Session = Depends(get_db)
# ):
#     lol=1

# @router.get('/comments/{comment_id}')
# async def get_comment(
#     current_user: Annotated[user_models.User, Depends(security.get_current_user)],
#     db: Session = Depends(get_db)
# ):
#     lol=1

# @router.put('/comments/{comment_id}')
# async def edit_comments(
#     current_user: Annotated[user_models.User, Depends(security.get_current_user)],
#     db: Session = Depends(get_db)
# ):
#     lol=1
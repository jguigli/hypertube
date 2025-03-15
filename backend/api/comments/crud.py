from sqlalchemy.orm import Session
from .models import Comment


def get_comment_by_id(db: Session, comment_id: int, user_id: int):
    return db.query(Comment).filter(Comment.id == comment_id).filter(Comment.user_id == user_id).first()

def create_comment(
        db: Session,
        user_id: int,
        movie_id: int,
        parent_id: int | None,
        content: str
):
    db_comment = Comment(
        movie_id=movie_id,
        user_id=user_id,
        parent_id=parent_id,
        content=content,
        )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment: Comment):
    db.delete(comment)
    db.commit()
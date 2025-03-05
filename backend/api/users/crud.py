import shutil
import os

from sqlalchemy.orm import Session

from . import models, schemas
from api.login import security
from fastapi import UploadFile, File, HTTPException, status
import re


PROFILE_PICTURES_FOLDER = "./profile_pictures"
DEFAULT_PICTURE_PATH = f"{PROFILE_PICTURES_FOLDER}/default.jpg"

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, user_name: str):
    return db.query(models.User).filter(models.User.user_name == user_name).first()

def get_users(db: Session):
    # Return all users {id, user_name}
    users = db.query(models.User).all()
    return {"users": [{"id": user.id, "user_name": user.user_name} for user in users]}

def create_user(db: Session, user: schemas.User):
    db_user = models.User(
        email=user.email,
        user_name=user.user_name,
        first_name=user.first_name,
        last_name=user.last_name,
        # hashed_password=security.get_password_hash(user.password),
        profile_picture_path=DEFAULT_PICTURE_PATH
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def edit_user(
        db: Session,
        user: models.User,
        user_infos: schemas.UserEditInfos
):
    if user_infos.email != user.email:
        db_user = get_user_by_email(db, user_infos.email)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken")
        email_regex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, user_infos.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
        user.email = user_infos.email

    if user_infos.user_name != user.user_name:
        db_user = get_user_by_username(db, user_infos.user_name)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        user.user_name = user_infos.user_name

    if user_infos.first_name != user.first_name:
        user.first_name = user_infos.first_name

    if user_infos.last_name != user.last_name:
        user.last_name = user_infos.last_name

    db.commit()
    db.refresh(user)
    return user

def manage_profile_picture(
        db: Session,
        user: models.User,
        profile_picture: UploadFile = File(...)
):
    os.makedirs(PROFILE_PICTURES_FOLDER, exist_ok=True)

    pattern_file_to_del = f"user_{user.id}"
    for filename in os.listdir(PROFILE_PICTURES_FOLDER):
        if filename.startswith(pattern_file_to_del):
            file_path = os.path.join(PROFILE_PICTURES_FOLDER, filename)
            os.remove(file_path)

    file_extension = os.path.splitext(profile_picture.filename)[-1].lower()
    file_name_unique = f"user_{user.id}{file_extension}"
    file_location = os.path.join(PROFILE_PICTURES_FOLDER, file_name_unique)

    print(file_location)
    with open(file_location, "wb") as file:
        shutil.copyfileobj(profile_picture.file, file)
        print("file copied")

    user.profile_picture_path = file_location
    db.commit()
    db.refresh(user)
    return user
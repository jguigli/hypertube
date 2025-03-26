from typing import Annotated
from fastapi import (
    Depends, HTTPException, APIRouter, status, UploadFile, File
)
from sqlalchemy.orm import Session
import re
from . import models, schemas, crud
from api.database import get_db
from api.login import security
from api.login.models import AuthProvider


router = APIRouter(tags=["Users"])


@router.post("/users/register", response_model=schemas.UserRegisterReturn)
async def register(
    user_infos: schemas.UserRegister,
    db: Session = Depends(get_db)
):

    user = crud.get_user_by_email(db, user_infos.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = crud.get_user_by_username(db, user_infos.user_name)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    email_regex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(email_regex, user_infos.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    password_pattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    if not re.match(password_pattern, user_infos.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must contain 8 characters with " +
                   "at least one lowercase, one uppercase, one digit and " +
                   "one special character"
        )

    if not user_infos.first_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name cannot be empty."
        )
    elif not user_infos.last_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last name cannot be empty."
        )

    user = crud.create_user(db, user_infos)

    authProvider = AuthProvider(
        user_id=user.id,
        provider="form",
        user_name=user_infos.user_name,
        email=user_infos.email,
        hashed_password=security.get_password_hash(user_infos.password)
    )
    db.add(authProvider)
    db.commit()

    return user


@router.get("/users/me", response_model=schemas.User)
async def get_my_user(
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):
    return current_user


@router.get("/users/{user_id}", response_model=schemas.OtherUser)
async def get_other_user(
    user_id: int,
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User doesn't exist"
        )
    return user


@router.get("/users/", response_model=schemas.UsersList)
async def get_users(
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):
    users = crud.get_users(db)
    return users


@router.put("/users/informations", response_model=schemas.User)
async def edit_user_informations(
    user_infos: schemas.UserEditInfos,
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):
    user = crud.edit_user(db, current_user, user_infos)
    return user


@router.get("/users/me/picture")
async def get_my_user_picture(
    current_user: Annotated[models.User, Depends(security.get_current_user)],
):
    return current_user.profile_picture


@router.get("/users/{user_id}/picture")
async def get_other_user_picture(
    user_id: int,
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User doesn't exist")
    return user.profile_picture


@router.put("/users/picture")
async def manage_user_picture(
    current_user: Annotated[models.User, Depends(security.get_current_user)],
    profile_picture: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User doesn't exist"
        )
    user = crud.manage_profile_picture(db, user, profile_picture)
    return user.profile_picture

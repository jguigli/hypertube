from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from database import get_db
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError


from api.login.schemas import User, Token, TokenData

router = APIRouter(tags=["Login"])



@router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user = UserInDB(**user_dict)
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user.username, "token_type": "bearer"}


# @router.post("/token", response_model=schemas.Token)
# async def login_for_access_token(
#     form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
#     ):
#     lol=1

# @router.post("/reset_password")
# async def report_forgotten_password(
#     user: schemas.ForgotPasswordForm,
#     db: Session = Depends(get_db)
#     ):
#     lol=1

# @router.put("/password")
# async def reset_password(
#     password: schemas.ResetPasswordForm,
#     current_user: Annotated[user_models.User, Depends(security.get_current_user_from_mail)],
#     db: Session = Depends(get_db)
#     ):
#     lol=1


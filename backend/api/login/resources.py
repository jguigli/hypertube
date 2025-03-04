from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from api.database import get_db
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

import api.users.schemas as schemas
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse
from api.config import (
    OAUTH42_CLIENT_ID,
    OAUTH42_CLIENT_SECRET,
    OAUTH42_REDIRECT_URI,
    OAUTH_GOOGLE_CLIENT_ID,
    OAUTH_GOOGLE_CLIENT_SECRET,
    OAUTH_GOOGLE_REDIRECT_URI
)

import jwt
from jwt.exceptions import InvalidTokenError

from .schemas import User, Token, TokenData, ForgotPasswordForm, ResetPasswordForm
from .security import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user_from_mail,
    verify_password,
    get_password_hash
)
from api.users import crud as user_crud
from api.users import models as user_models
from api.mail.send_email import send_email_reset_password
import re



router = APIRouter(tags=["Login"])

@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/reset_password")
async def report_forgotten_password(
    user: ForgotPasswordForm,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
    ):
    user = user_crud.get_user_by_email(db, user.email)
    if not user:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    background_tasks.add_task(send_email_reset_password, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/password")
async def reset_password(
    password: ResetPasswordForm,
    current_user: Annotated[user_models.User, Depends(get_current_user_from_mail)],
    db: Session = Depends(get_db)
    ):
    password_pattern =  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    if not re.match(password_pattern, password.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The new password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character")
    if verify_password(password.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can't change your password by an old one")
    current_user.hashed_password = get_password_hash(password.password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


oauth = OAuth()
oauth.register(
    name="fortytwo",
    client_id=OAUTH42_CLIENT_ID,
    client_secret=OAUTH42_CLIENT_SECRET,
    authorize_url="https://api.intra.42.fr/oauth/authorize",
    access_token_url="https://api.intra.42.fr/oauth/token",
    client_kwargs={"scope": "public"},
)

oauth.register(
    name="google",
    client_id=OAUTH_GOOGLE_CLIENT_ID,
    client_secret=OAUTH_GOOGLE_CLIENT_SECRET,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    access_token_url="https://oauth2.googleapis.com/token",
    client_kwargs={"scope": "openid email profile"},
)

###########################################################################################


@router.get("/auth/42")
async def auth_42(request: Request):
    return await oauth.fortytwo.authorize_redirect(request, OAUTH42_REDIRECT_URI)


@router.get("/auth/42/callback")
async def auth_42_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    token = await oauth.fortytwo.authorize_access_token(request)
    if not token:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    response = await oauth.fortytwo.get("https://api.intra.42.fr/v2/me", token=token)
    if response.status_code != 200:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)

    json = response.json()

    user = user_crud.get_user_by_email(db, json["email"])
    if not user:
        user_infos = schemas.User42(
            email=json["email"], user_name=json["login"],
            first_name=json["first_name"], last_name=json["last_name"],
            password="InsecureDPassw0rD!"
        )
        # Redirect to a frontend page to confirm all values
        user = user_crud.create_user(db, user_infos)

    access_token = create_access_token({"username": user.user_name})
    # return Token(access_token=access_token, token_type="bearer")
    return RedirectResponse(url=f"http://localhost:3000/auth/42/?access_token={access_token}&token_type=Bearer")


@router.get("/auth/google")
async def auth_google(request: Request):
    return await oauth.google.authorize_redirect(request, OAUTH_GOOGLE_REDIRECT_URI)


@router.get("/auth/google/callback")
async def auth_google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    user = user_crud.get_user_by_email(user_info["email"])
    if not user:
        user = user_crud.create_user(user_info["email"], user_info["name"], user_info["picture"]) ###############################

    access_token = create_access_token({"username": user.name})
    return Token(access_token=access_token, token_type="bearer")
###########################################################################################
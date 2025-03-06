from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from typing import Optional

import jwt
from jwt.exceptions import InvalidTokenError

from . import schemas
from api.database import get_db
from api.users import crud as user_crud
from api.users import models as user_models
from api.config import SECRET_KEY, SECRET_KEY_MAIL_LINK

from .models import AuthProvider


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
ACCESS_TOKEN_EXPIRE_MINUTES_RESET_PASSWORD = 60


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(db, username: str, password: str):
    """
    Get the user from the database if the username and password are correct
    """
    auth_provider = db.query(AuthProvider) \
        .filter(AuthProvider.provider == "form") \
        .filter(AuthProvider.user_name == username).first()
    if not auth_provider:
        return False
    if not verify_password(password, auth_provider.hashed_password):
        return False
    return auth_provider.user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    user = user_crud.get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_authentified_or_anonymous(
        token: Annotated[Optional[str], Depends(oauth2_scheme)],
        db: Session = Depends(get_db)
        ):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            if user_id is None:
                raise credentials_exception
            token_data = schemas.TokenData(user_id=user_id)
        except InvalidTokenError:
            raise credentials_exception
        user = user_crud.get_user_by_id(db, user_id=token_data.user_id)
        if user is None:
            raise credentials_exception
        return user
    else:
        return None


def create_access_token_mail_link(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(tz=timezone.utc) + expires_delta
    else:
        expire = datetime.now(tz=timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY_MAIL_LINK, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user_from_mail(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY_MAIL_LINK, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    user = user_crud.get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user


def create_token_user_for_mail_link(user: user_models.User, minutes: float):
    access_token_expires = timedelta(minutes=minutes)
    access_token = create_access_token_mail_link(data={"user_id": int(user.id)}, expires_delta=access_token_expires)
    token_type = user.token_type

    return access_token, token_type

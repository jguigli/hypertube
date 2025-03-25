from typing import Annotated
from fastapi import (
    Depends, Response, HTTPException, APIRouter, status,
    BackgroundTasks, UploadFile
)
from fastapi.security import OAuth2PasswordRequestForm
from api.database import get_db
from datetime import timedelta
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
    OAUTH_GOOGLE_REDIRECT_URI,
    OAUTH_GITHUB_REDIRECT_URI,
    OAUTH_GITHUB_CLIENT_ID,
    OAUTH_GITHUB_CLIENT_SECRET
)
from .schemas import Token, ForgotPasswordForm, ResetPasswordForm
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
import requests
from io import BytesIO
from api.login.models import AuthProvider


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
    auth_provider = db.query(AuthProvider) \
        .filter(AuthProvider.provider == "form") \
        .filter(AuthProvider.email == user.email).first()
    if not auth_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is not associated with an account registered by email"
        )
    found_user = db.query(user_models.User) \
        .filter(user_models.User.id == auth_provider.user_id).first()
    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    auth_provider.is_resetting_password = True
    db.commit()
    db.refresh(found_user)
    background_tasks.add_task(send_email_reset_password, found_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/password")
async def reset_password(
    password: ResetPasswordForm,
    current_user: Annotated[
        user_models.User,
        Depends(get_current_user_from_mail)
    ],
    db: Session = Depends(get_db)
):
    password_pattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    if not re.match(
        password_pattern,
        password.password
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The new password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character")

    # Get the password_hash from the AuthProvider table
    auth_provider = db.query(AuthProvider) \
        .filter(AuthProvider.provider == "form") \
        .filter(AuthProvider.user_id == current_user.id).first()

    if not auth_provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if not auth_provider.is_resetting_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must request a password reset before changing it"
        )

    if verify_password(
        password.password, auth_provider.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can't change your password by an old one"
        )

    auth_provider.hashed_password = get_password_hash(password.password)
    auth_provider.is_resetting_password = False
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
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
)

oauth.register(
    name="github",
    client_id=OAUTH_GITHUB_CLIENT_ID,
    client_secret=OAUTH_GITHUB_CLIENT_SECRET,
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    userinfo_endpoint="https://api.github.com/user",
    client_kwargs={"scope": "user:email"},
)

###########################################################################################


async def handle_oauth_callback(
        request: Request,
        db: Session,
        provider: str,
        user_info_url: str,
        provider_id_key: str,
        email_key: str,
        name_key: str,
        first_name_key: str,
        last_name_key: str,
        picture_key: tuple[str]
):

    token = await oauth.create_client(provider).authorize_access_token(request)
    if not token:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    response = await oauth.create_client(provider).get(user_info_url, token=token)
    if response.status_code != 200:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    json = response.json()

    provider_id = json[provider_id_key]

    # Get the user by provider_id and provider
    auth_provider = db.query(AuthProvider) \
        .filter(AuthProvider.provider == provider) \
        .filter(AuthProvider.provider_id == str(provider_id)).first()

    # If the user doesn't exist, create it
    if not auth_provider:

        # For github split the name into first_name and last_name
        if provider == "github":
            name = json[name_key].split(" ")
            json[first_name_key] = name[0]
            json[last_name_key] = name[-1]

        user_infos = schemas.UserRegister(
            email=json[email_key],
            user_name=json[name_key],
            first_name=json[first_name_key],
            last_name=json[last_name_key],
            password=""
        )

        # Check if the username or email already exists in the User table
        already_registered_email = db.query(user_models.User) \
            .filter(user_models.User.email == user_infos.email).first()
        already_registered_user_name = db.query(AuthProvider) \
            .filter(AuthProvider.user_name == user_infos.user_name).first()
        if already_registered_email or already_registered_user_name:
            import base64
            error_message = (
                "Sorry, this {} is already registered by " \
                .format("email" if already_registered_email else "username") +
                "another user.\nPlease try again with another one."
            )
            encoded_error_message = error_message.encode("utf-8")
            error_message = base64.b64encode(encoded_error_message) \
                .decode("utf-8")
            return RedirectResponse(
                url="http://localhost:3000/login/?error=" + error_message
            )

        user = user_crud.create_user(db, user_infos)

        picture_link = json
        for key in picture_key:
            picture_link = picture_link[key]
        response = requests.get(picture_link)
        if response.status_code == 200:
            profile_picture = UploadFile(
                size=len(response.content),
                file=BytesIO(response.content),
                filename="profile_picture.jpg",
            )
            user = user_crud.manage_profile_picture(db, user, profile_picture)

        auth_provider = AuthProvider(
            user_id=user.id, provider=provider,
            provider_id=provider_id, email=user_infos.email
        )
        db.add(auth_provider)
        db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": auth_provider.user.id},
        expires_delta=access_token_expires
    )
    return RedirectResponse(
        url=f"http://localhost:3000/auth/?access_token={access_token}" +
            "&token_type=Bearer")


@router.get("/auth/42")
async def auth_42(request: Request):
    return await oauth.fortytwo.authorize_redirect(
        request, OAUTH42_REDIRECT_URI
    )


@router.get("/auth/42/callback")
async def auth_42_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    return await handle_oauth_callback(
        request, db, provider="fortytwo",
        provider_id_key="id",
        user_info_url="https://api.intra.42.fr/v2/me",
        email_key="email", name_key="login",
        first_name_key="first_name", last_name_key="last_name",
        picture_key=("image", "link")
    )


@router.get("/auth/google")
async def auth_google(request: Request):
    return await oauth.google.authorize_redirect(
        request, OAUTH_GOOGLE_REDIRECT_URI
    )


@router.get("/auth/google/callback")
async def auth_google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    return await handle_oauth_callback(
        request, db, provider="google",
        provider_id_key="sub",
        user_info_url="https://openidconnect.googleapis.com/v1/userinfo",
        email_key="email", name_key="name",
        first_name_key="given_name", last_name_key="name",
        picture_key=("picture",)
    )


@router.get("/auth/github")
async def auth_github(request: Request):
    return await oauth.github.authorize_redirect(
        request, OAUTH_GITHUB_REDIRECT_URI
    )


@router.get("/auth/github/callback")
async def auth_github_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    return await handle_oauth_callback(
        request, db, provider="github",
        provider_id_key="id",
        user_info_url="https://api.github.com/user",
        email_key="email", name_key="name",
        first_name_key="firstname", last_name_key="lastname",
        picture_key=("avatar_url",)
    )


###########################################################################################

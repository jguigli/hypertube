from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from database import engine

# from database import create_db

from api.login.resources import router as login_router
from api.users.resources import router as users_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)
app.include_router(users_router)

# @app.on_event("startup")
# def on_startup():
#     create_db()

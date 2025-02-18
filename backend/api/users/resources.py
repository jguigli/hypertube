from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from database import get_db
from pydantic import BaseModel


router = APIRouter(tags=["Users"])


@router.post("/login")
async def register():
    lol=1


@router.get("/")
async def example_get():
    return

@router.post("/")
async def example_post():
    return

@router.put("/")
async def example_put():
    return

@router.delete("/")
async def example_delete():
    return
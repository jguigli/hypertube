from sqlmodel import create_engine, Session, SQLModel
from fastapi import Depends
from typing import Annotated
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)

def get_db():
    with Session(engine) as session:
        yield session

def create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]
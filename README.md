# hypertube

## Project Overview

Hypertube is a modern video streaming web application that allows users to search and watch movies using the BitTorrent protocol.

## Dev

### Alembic

**Generate Alembic revision**
   ```bash
   make exec_api
   alembic revision --autogenerate -m "name of migration"
   ```

**Apply revision**
   ```bash
   make alembic
   ```

## Setup

**Clone the Repository**
   ```bash
   git clone https://github.com/jguigli/hypertube.git
   cd hypertube
   ```

**Install the app**
   ```bash
   make build
   make
   ```
    

## Usage

- **Access hypertube**: Visit `http://localhost:3000` to access the hypertube site.



## Useful Links

[Tutorial FastAPI](https://fastapi.tiangolo.com/tutorial/)  
[Getting Started React](https://create-react-app.dev/docs/getting-started/)  
[FastAPI & Postgresql via Docker](https://medium.com/@kevinkoech265/dockerizing-fastapi-and-postgresql-effortless-containerization-a-step-by-step-guide-68b962c3e7eb)  
[FastAPI with SQLAlchemy](https://blog.stackademic.com/using-fastapi-with-sqlalchemy-5cd370473fe5)  
[Doc SQLAlchemy](https://docs.sqlalchemy.org/en/20/)  
[Alembic with fastAPI](https://www.nashruddinamin.com/blog/how-to-use-alembic-for-database-migrations-in-your-fastapi-application)  
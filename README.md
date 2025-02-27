# hypertube

## Project Overview

Hypertube is a modern video streaming web application that allows users to search and watch movies using the BitTorrent protocol.

## Setup

**Clone the Repository**
   ```bash
   git clone https://github.com/jguigli/hypertube.git
   cd hypertube
   ```

**Install the app**
   ```bash
   make
   ```
    
## Usage

- **Access hypertube**: Visit `http://localhost:3000` to access the hypertube site.


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



## Useful Links

[Tutorial FastAPI](https://fastapi.tiangolo.com/tutorial/)  
[Getting Started React](https://create-react-app.dev/docs/getting-started/)  
[FastAPI & Postgresql via Docker](https://medium.com/@kevinkoech265/dockerizing-fastapi-and-postgresql-effortless-containerization-a-step-by-step-guide-68b962c3e7eb)  
[FastAPI with SQLAlchemy](https://blog.stackademic.com/using-fastapi-with-sqlalchemy-5cd370473fe5)  
[Doc SQLAlchemy](https://docs.sqlalchemy.org/en/20/)  
[Alembic with fastAPI](https://www.nashruddinamin.com/blog/how-to-use-alembic-for-database-migrations-in-your-fastapi-application)  
[Send email with fastAPI byb Google](https://medium.com/nerd-for-tech/how-to-send-email-using-python-fastapi-947921059f0c)  
[Send email with fastAPI by SMTP](https://mailmug.net/blog/fastapi-mail/)  
[FastAPI OAuth Client](https://docs.authlib.org/en/latest/client/fastapi.html)  
[42 API](https://api.intra.42.fr/apidoc/guides/web_application_flow)  
[IMDb](https://developer.imdb.com/documentation/api-documentation/getting-access/)  
[TMDb API](https://developer.themoviedb.org/v4/reference/intro/getting-started)  
[YTS API](https://github.com/BrokenEmpire/YTS/blob/master/API.md)  
[Streaming torrent client with Python](https://www.youtube.com/watch?v=PKJeW80yLRY)  
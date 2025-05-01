FROM python:3.11.3

RUN apt-get update && apt-get install -y \
    gettext \
    ffmpeg

WORKDIR /app

COPY . .
COPY alembic.ini.template .

# Crée le venv et installe les dépendances au build
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install -r /app/requirements.txt

COPY ./entrypoint.sh /entrypoint.sh
EXPOSE 8000

ENV PATH /app/venv/bin:$PATH

ENTRYPOINT [ "sh", "/entrypoint.sh" ]

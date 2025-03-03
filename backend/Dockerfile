FROM python:3.11.3

RUN apt-get update && apt-get install -y gettext

WORKDIR /app

COPY alembic.ini.template .

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000

# CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# CMD ["/app/entrypoint.sh"]

CMD ["sh", "-c", \
    "envsubst < /app/alembic.ini.template > /app/alembic.ini && \
    alembic upgrade heads && \
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --root-path /api/ --reload"]

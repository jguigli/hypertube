FROM python:3.11.3

RUN apt-get update && apt-get install -y gettext

WORKDIR /app

COPY . .
COPY alembic.ini.template .

# Use an entrypoint script to run the pip install and uvicorn commands
# Virtual environment is created in /app/venv and shared with the host
COPY ./entrypoint.sh /entrypoint.sh

EXPOSE 8000

# CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# CMD ["/app/entrypoint.sh"]

ENV PATH /app/venv/bin:$PATH

ENTRYPOINT [ "sh", "/entrypoint.sh" ]

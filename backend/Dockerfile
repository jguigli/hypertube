FROM python:3.11.3

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000

ENV DATABASE_URL=postgresql://dev:dev@database/dev

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

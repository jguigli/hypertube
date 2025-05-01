#/bin/sh


# # Create the virtual environment
# python3 -m venv /app/venv

# # Install the dependencies
# /app/venv/bin/pip install --upgrade pip
# /app/venv/bin/pip install -r /app/requirements.txt

# Run the migrations and start the server using venv python
sh -c "envsubst < /app/alembic.ini.template > /app/alembic.ini && \
    alembic upgrade head && \
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --root-path /api/ --reload"

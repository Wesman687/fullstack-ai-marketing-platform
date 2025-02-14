FROM python:3.13.1-slim

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY pyproject.toml poetry.lock /app/

RUN pip install poetry

RUN poetry install --no-root

COPY . /app/

CMD ["poetry", "run", "asset-processing-service"]
FROM python:3.13.1-slim


WORKDIR /app

COPY pyproject.toml poetry.lock /app/

RUN pip install poetry

RUN poetry install --no-root

COPY . /app/

CMD ["poetry", "run", "asset-processing-service"]
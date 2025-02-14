FROM python:3.13.1-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# ✅ Copy everything (including README.md)
COPY . /app/

# ✅ Ensure files exist in the correct place
RUN ls -l /app/

# ✅ Install Poetry
RUN pip install poetry

# ✅ Ensure Poetry installs correctly
RUN poetry install --without dev

# ✅ Explicitly set the correct package path
ENV PYTHONPATH=/app

# ✅ Run the service
CMD ["poetry", "run", "python", "-m", "asset_processing_service.main"]

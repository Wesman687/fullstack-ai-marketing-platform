import os
from dotenv import load_dotenv
load_dotenv()


def get_required_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Environment variable {key} is not set.")
    return value.strip().strip("'\"")


class Config:
    API_BASE_URL = os.getenv("API_BASE_URL", "http://192.168.1.100:3000/api")
    SERVER_API_KEY = get_required_env("SERVER_API_KEY")
    STUCK_JOB_THRESHOLD_SECONDS = int(os.getenv("STUCK_JOB_THRESHOLD_SECONDS", 30))
    MAX_JOB_ATTEMPTS = int(os.getenv("MAX_JOB_ATTEMPTS", 3))
    MAX_NUM_WORKERS = int(os.getenv("MAX_NUM_WORKERS", 2))
    HEARTBEAT_INTERVAL_SECONDS = int(os.getenv("HEARTBEAT_INTERVAL_SECONDS", 10))
    MAX_CHUNK_SIZE_BYTES = int(os.getenv("MAX_CHUNK_SIZE_BYTES", str(24 * 1024 * 1024)))
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "whisper-1")
    OPENAI_API_KEY = get_required_env("OPENAI_API_KEY")
    
config = Config()

HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}



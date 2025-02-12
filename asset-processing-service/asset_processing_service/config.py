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
    
    
config = Config()

HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}



import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Load API key from environment variable (set in .env file)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG = os.getenv("DEBUG", "True") == "True"

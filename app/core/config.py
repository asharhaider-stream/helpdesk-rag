from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    groq_api_key: str
    postgres_url: str
    qdrant_host: str
    qdrant_port: int
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
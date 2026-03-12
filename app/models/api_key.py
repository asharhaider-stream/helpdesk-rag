from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.postgres import Base

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True)
    tenant_id = Column(String, ForeignKey("tenants.tenant_id"))
    key = Column(String, unique=True)
    created_at = Column(DateTime, server_default=func.now())
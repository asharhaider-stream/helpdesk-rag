from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.db.postgres import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    tenant_id = Column(String, unique=True)
    created_at = Column(DateTime, server_default=func.now())
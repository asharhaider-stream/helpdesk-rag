from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from app.db.postgres import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    filename = Column(String)
    tenant_id = Column(String)
    status = Column(String, default="processing")
    created_at = Column(DateTime, server_default=func.now())
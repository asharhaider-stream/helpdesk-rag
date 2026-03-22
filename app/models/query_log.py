from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.postgres import Base

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True)
    tenant_id = Column(String)
    question = Column(String)
    created_at = Column(DateTime, server_default=func.now())
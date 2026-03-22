from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from app.services.retrieval import query_document
from app.db.qdrant import client as qdrant_client
from app.core.dependencies import get_tenant_from_api_key
from sqlalchemy import select, func as sqlfunc
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import AsyncSessionLocal
from app.models.query_log import QueryLog
from app.core.dependencies import get_current_tenant
from datetime import datetime, timedelta

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class QueryRequest(BaseModel):
    question: str

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/stats")
async def get_query_stats(
    db: AsyncSession = Depends(get_db),
    current_tenant: str = Depends(get_current_tenant)
):
    total_result = await db.execute(
        select(sqlfunc.count(QueryLog.id))
        .where(QueryLog.tenant_id == current_tenant)
    )
    total = total_result.scalar()

    last_7_days = []
    for i in range(6, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        result = await db.execute(
            select(sqlfunc.count(QueryLog.id))
            .where(QueryLog.tenant_id == current_tenant)
            .where(sqlfunc.date(QueryLog.created_at) == day)
        )
        last_7_days.append(result.scalar())

    return {"total": total, "last_7_days": last_7_days}

@router.post("/ask")
@limiter.limit("30/minute")
async def ask_question(
    request: Request,
    query: QueryRequest,
    tenant_id: str = Depends(get_tenant_from_api_key)
):
    existing = [c.name for c in qdrant_client.get_collections().collections]
    if tenant_id not in existing:
        raise HTTPException(status_code=404, detail="Tenant not found")

    answer = await query_document(query.question, tenant_id)
    return {"answer": answer}
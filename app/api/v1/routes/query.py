from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from app.services.retrieval import query_document
from app.db.qdrant import client as qdrant_client
from app.core.dependencies import get_tenant_from_api_key

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class QueryRequest(BaseModel):
    question: str

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

    answer = query_document(query.question, tenant_id)
    return {"answer": answer}
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.retrieval import query_document
from app.db.qdrant import client as qdrant_client
from app.core.dependencies import get_tenant_from_api_key

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    

@router.post("/ask")
async def ask_question(
    request: QueryRequest,
    tenant_id: str = Depends(get_tenant_from_api_key)
):
    existing = [c.name for c in qdrant_client.get_collections().collections]
    if tenant_id not in existing:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    answer = query_document(request.question, tenant_id)
    return {"answer": answer}
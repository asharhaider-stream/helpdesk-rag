from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.retrieval import query_document
from app.db.qdrant import client as qdrant_client

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    tenant_id: str

@router.post("/ask")
async def ask_question(request: QueryRequest):
    existing = [c.name for c in qdrant_client.get_collections().collections]
    if request.tenant_id not in existing:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    answer = query_document(request.question, request.tenant_id)
    return {"answer": answer}
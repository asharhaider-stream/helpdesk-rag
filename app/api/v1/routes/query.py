from fastapi import APIRouter
from pydantic import BaseModel
from app.services.retrieval import query_document

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    tenant_id: str

@router.post("/ask")
async def ask_question(request: QueryRequest):
    answer = query_document(request.question, request.tenant_id)
    return {"answer": answer}
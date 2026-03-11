from fastapi import APIRouter, UploadFile, File
from app.schemas.document import DocumentResponse

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    tenant_id: str,
    file: UploadFile = File(...)
):
    return {"id": 1, "filename": file.filename, "tenant_id": tenant_id, "status": "processing"}
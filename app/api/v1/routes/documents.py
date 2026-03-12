import os
import shutil
from fastapi import APIRouter, UploadFile, File
from app.schemas.document import DocumentResponse
from app.services.ingestion import process_document

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    tenant_id: str,
    file: UploadFile = File(...)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    process_document.delay(file_path, tenant_id, 1)

    return {"id": 1, "filename": file.filename, "tenant_id": tenant_id, "status": "processing"}
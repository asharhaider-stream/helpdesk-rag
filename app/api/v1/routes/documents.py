import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.document import DocumentResponse
from app.services.ingestion import process_document
from app.db.postgres import AsyncSessionLocal
from app.models.document import Document

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    tenant_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = Document(
        filename=file.filename,
        tenant_id=tenant_id,
        status="processing"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    process_document.delay(file_path, tenant_id, doc.id)

    return {"id": doc.id, "filename": doc.filename, "tenant_id": doc.tenant_id, "status": doc.status}
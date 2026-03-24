from app.worker import celery_app
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from app.models.document import Document
from app.db.postgres import AsyncSessionLocal
from app.core.config import settings
from app.db.qdrant import client as qdrant_client, create_collection
from qdrant_client.models import PointStruct
import uuid
from sqlalchemy import update
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sync_engine = create_engine(
    settings.postgres_url.replace("postgresql+asyncpg", "postgresql+psycopg2")
)
SyncSession = sessionmaker(bind=sync_engine)

def mark_document_done(document_id: int):
    with SyncSession() as db:
        db.execute(
            update(Document)
            .where(Document.id == document_id)
            .values(status="done")
        )
        db.commit()

openai_client = OpenAI(api_key=settings.openai_api_key)

@celery_app.task
def process_document(file_path: str, tenant_id: str, document_id: int):
    reader = PdfReader(file_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(full_text)

    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=chunks
    )
    embeddings = [item.embedding for item in response.data]

    create_collection(tenant_id)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embeddings[i],
            payload={"chunk": chunks[i], "document_id": document_id}
        )
        for i in range(len(chunks))
    ]

    qdrant_client.upsert(
        collection_name=tenant_id,
        points=points
    )

    print(f"Stored {len(points)} vectors in Qdrant")

    mark_document_done(document_id)   
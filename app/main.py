from fastapi import FastAPI
from app.db.postgres import engine, Base
from app.db.qdrant import client
from app.api.v1.routes.documents import router as documents_router
from app.api.v1.routes.query import router as query_router
from app.models.document import Document
from app.models.tenant import Tenant
from app.models.api_key import APIKey
from app.api.v1.routes.auth import router as auth_router


app = FastAPI(title="Helpdesk RAG SaaS", version="1.0.0")
app.include_router(documents_router, prefix="/api/v1/documents")
app.include_router(query_router, prefix="/api/v1/query")
app.include_router(auth_router, prefix="/api/v1/auth")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    qdrant_status = client.get_collections()
    return {"status": "ok", "qdrant": "connected"}
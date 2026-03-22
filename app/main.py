from fastapi import FastAPI
from app.db.postgres import engine, Base
from app.db.qdrant import client
from app.api.v1.routes.documents import router as documents_router
from app.api.v1.routes.query import router as query_router
from app.models.document import Document
from app.models.tenant import Tenant
from app.models.api_key import APIKey
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.apikeys import router as apikeys_router
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request


app = FastAPI(title="Helpdesk RAG SaaS", version="1.0.0")
app.include_router(documents_router, prefix="/api/v1/documents")
app.include_router(query_router, prefix="/api/v1/query")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(apikeys_router, prefix="/api/v1/apikeys")

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend")

@app.get("/")
async def landing(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    qdrant_status = client.get_collections()
    return {"status": "ok", "qdrant": "connected"}

@app.get("/login.html")
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard.html")
async def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/documents.html")
async def documents_page(request: Request):
    return templates.TemplateResponse("documents.html", {"request": request})

@app.get("/widget.html")
async def widget_page(request: Request):
    return templates.TemplateResponse("widget.html", {"request": request})

@app.get("/test-widget.html")
async def test_widget_page(request: Request):
    return templates.TemplateResponse("test-widget.html", {"request": request})
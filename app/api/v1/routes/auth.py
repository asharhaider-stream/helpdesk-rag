from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.db.postgres import AsyncSessionLocal
from app.models.tenant import Tenant
from app.core.security import hash_password, verify_password, create_jwt
import uuid

router = APIRouter()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

import uuid

@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Tenant).where(Tenant.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant = Tenant(
        email=request.email,
        password=hash_password(request.password),
        tenant_id=str(uuid.uuid4())
    )
    db.add(tenant)
    await db.commit()
    return {"message": "Registered successfully", "tenant_id": tenant.tenant_id}

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.email == request.email))
    tenant = result.scalar_one_or_none()
    
    if not tenant or not verify_password(request.password, tenant.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt({"tenant_id": tenant.tenant_id})
    return {"access_token": token}
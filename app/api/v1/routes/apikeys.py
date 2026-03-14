from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import AsyncSessionLocal
from app.models.api_key import APIKey
from app.core.dependencies import get_current_tenant
from app.core.security import hash_password
import secrets

router = APIRouter()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/generate")
async def generate_api_key(
    db: AsyncSession = Depends(get_db),
    current_tenant: str = Depends(get_current_tenant)
):
    plain_key = secrets.token_hex(32)
    
    api_key = APIKey(
        tenant_id=current_tenant,
        key=hash_password(plain_key)
    )
    db.add(api_key)
    await db.commit()

    return {
        "api_key": plain_key,
        "message": "Store this key safely. It will never be shown again."
    }
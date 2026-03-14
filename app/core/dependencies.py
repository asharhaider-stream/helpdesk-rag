from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import decode_jwt, verify_password
from app.db.postgres import AsyncSessionLocal
from app.models.api_key import APIKey
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_tenant(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_jwt(token)
        tenant_id = payload.get("tenant_id")
        if not tenant_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return tenant_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

api_key_header = APIKeyHeader(name="X-API-Key")

async def get_tenant_from_api_key(api_key: str = Depends(api_key_header)):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(APIKey))
        all_keys = result.scalars().all()
        
        for stored_key in all_keys:
            if verify_password(api_key, stored_key.key):
                return stored_key.tenant_id
        
        raise HTTPException(status_code=401, detail="Invalid API key")
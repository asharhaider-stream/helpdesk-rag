from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    filename: str
    tenant_id: str
    status: str
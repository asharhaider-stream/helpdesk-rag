from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from app.core.config import settings

client = QdrantClient(
    host=settings.qdrant_host,
    port=settings.qdrant_port
)

def create_collection(tenant_id: str):
    existing = [c.name for c in client.get_collections().collections]
    if tenant_id not in existing:
        client.create_collection(
            collection_name=tenant_id,
            vectors_config=VectorParams(
                size=1536,
                distance=Distance.COSINE
            )
        )
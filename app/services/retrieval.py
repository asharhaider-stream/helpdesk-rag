from openai import OpenAI
from groq import Groq
from app.core.config import settings
from app.db.qdrant import client as qdrant_client

openai_client = OpenAI(api_key=settings.openai_api_key)
groq_client = Groq(api_key=settings.groq_api_key)

def query_document(question: str, tenant_id: str) -> str:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    )
    question_embedding = response.data[0].embedding

    results = qdrant_client.query_points(
    collection_name=tenant_id,
    query=question_embedding,
    limit=5
    ).points

    context = "\n\n".join([r.payload["chunk"] for r in results])

    answer = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer only based on the context provided."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ]
    )

    return answer.choices[0].message.content
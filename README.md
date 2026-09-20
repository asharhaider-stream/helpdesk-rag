# Deskmate — AI Helpdesk RAG SaaS

Deskmate is a B2B SaaS platform that turns your company documents into a 24/7 AI support agent. Business owners upload PDF documents, and an AI chatbot is automatically trained on them. Their customers can then use an embeddable chat widget to get instant, accurate answers sourced directly from those documents.

---

## How It Works

Upload PDFs → AI trains automatically → Embed widget once → Customers get instant answers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Background Processing | Celery + Redis |
| Vector Database | Qdrant |
| Relational Database | PostgreSQL |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | Groq (LLaMA 3.3 70b) |
| Frontend | HTML / CSS / JavaScript |
| Infrastructure | Docker Compose |
| Reverse Proxy | Nginx |
| Authentication | JWT + API Keys |

---

## Features

- **Document ingestion pipeline** — Upload PDFs, automatically chunked, embedded and stored in a vector database
- **RAG query pipeline** — Questions are embedded, matched against stored vectors via cosine similarity, answered by LLaMA 3.3
- **Multi-tenancy** — Every client's data is fully isolated at both the database and vector store level
- **Async processing** — PDF processing runs in the background via Celery, API returns immediately
- **JWT authentication** — Secure dashboard access with expiring tokens
- **API key system** — Permanent keys for embedding the widget on client websites
- **Embeddable chat widget** — One script tag, works on any website regardless of tech stack
- **Admin dashboard** — Upload documents, monitor processing status, view query analytics
- **Rate limiting** — 30 requests per minute per IP on the query endpoint

---

## Project Structure

helpdesk-rag/
├── app/
│ ├── api/v1/routes/ # HTTP route handlers
│ │ ├── auth.py # Register, login, user info
│ │ ├── documents.py # Upload and list documents
│ │ ├── query.py # Ask questions, query stats
│ │ └── apikeys.py # Generate and list API keys
│ ├── core/
│ │ ├── config.py # Environment variable validation
│ │ ├── security.py # JWT and password hashing
│ │ └── dependencies.py # Auth dependency injection
│ ├── db/
│ │ ├── postgres.py # SQLAlchemy async engine
│ │ └── qdrant.py # Qdrant client and collections
│ ├── models/ # PostgreSQL table definitions
│ ├── schemas/ # Pydantic request/response shapes
│ ├── services/
│ │ ├── ingestion.py # PDF → chunks → embeddings → Qdrant
│ │ └── retrieval.py # Question → search → LLM → answer
│ ├── worker.py # Celery configuration
│ └── main.py # FastAPI app entry point
├── frontend/
│ ├── index.html # Landing page
│ ├── login.html # Login and registration
│ ├── dashboard.html # Analytics and overview
│ ├── documents.html # Document management
│ ├── widget.html # Widget setup and embed code
│ └── static/
│ ├── css/style.css # Design system
│ └── js/ # Page logic and chat widget
├── docker-compose.yml # Development environment
├── docker-compose.prod.yml # Production environment
├── nginx.conf # Reverse proxy configuration
├── Dockerfile
├── requirements.txt
└── .env.example # Environment variable template


---

## Getting Started

### Prerequisites

- Docker Desktop installed and running
- WSL2 (Windows) or native Linux/macOS terminal
- OpenAI API key
- Groq API key (free at console.groq.com)

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/asharhaider-stream/helpdesk-rag.git
cd helpdesk-rag
```

**2. Create your environment file**
```bash
cp .env.example .env
```

**3. Fill in your credentials in `.env`**
```env
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
SECRET_KEY=generate_with_python_secrets_module
POSTGRES_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/helpdesk
QDRANT_HOST=qdrant
QDRANT_PORT=6333
```

To generate a secure SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**4. Start all services**
```bash
docker compose up --build
```

**5. Open the app**

http://localhost:8000


---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | None | Register a new tenant |
| POST | `/api/v1/auth/login` | None | Login and receive JWT |
| GET | `/api/v1/auth/me` | JWT | Get current tenant info |
| POST | `/api/v1/documents/upload` | JWT | Upload a PDF document |
| GET | `/api/v1/documents/` | JWT | List all documents |
| POST | `/api/v1/apikeys/generate` | JWT | Generate a widget API key |
| GET | `/api/v1/apikeys/my-key` | JWT | List existing API keys |
| POST | `/api/v1/query/ask` | API Key | Ask a question |
| GET | `/api/v1/query/stats` | JWT | Get query analytics |

Full interactive API documentation available at `http://localhost:8000/docs`

---

## Embedding the Widget

After generating an API key from the dashboard, paste this before the closing `</body>` tag on any website:

```html
<script src="https://yourdomain.com/static/js/chat-widget.js"
  data-api-key="your-api-key-here"></script>
```

The chat bubble appears automatically. No additional configuration required.

---

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for embeddings only |
| `GROQ_API_KEY` | Groq API key for LLM responses |
| `SECRET_KEY` | JWT signing secret — keep this private |
| `POSTGRES_URL` | PostgreSQL connection string |
| `QDRANT_HOST` | Qdrant service hostname |
| `QDRANT_PORT` | Qdrant service port (default 6333) |

---

## Key Engineering Decisions

**Why two databases?**
PostgreSQL handles structured relational data (users, metadata, logs). Qdrant handles vector similarity search. Each does what it is built for.

**Why Celery and Redis?**
PDF processing is slow and variable. Offloading it to a background worker means the upload API returns in milliseconds regardless of document size. Redis acts as the message broker between FastAPI and Celery.

**Why Groq instead of OpenAI for the LLM?**
Groq's free tier is fast enough for production use cases. OpenAI credits are conserved exclusively for embeddings where model quality matters most.

**Why separate JWT and API key auth?**
JWT is used for the dashboard because it expires — short lived tokens are safer for interactive sessions. API keys are used for the widget because they need to be permanent — a widget embedded on a website cannot refresh tokens automatically.

---

## License

MIT

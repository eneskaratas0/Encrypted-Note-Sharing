# Encrypted Note Sharing

A note-sharing service where notes are end-to-end encrypted and shared via
one-time or time-limited links. Encryption and decryption happen entirely in
the browser (client-side); the server only stores an opaque encrypted blob
and never parses or interprets it.

## How it works

1. The browser generates a random **AES-GCM 256-bit** key to encrypt the note
   (`frontend/src/lib/crypto.ts`).
2. The note is encrypted into an "envelope" of the form
   `[version][iv][ciphertext+tag]`, converted to base64url, and sent to the
   server as `encrypted_payload`.
3. The encryption key is **never sent to the server** — it's only carried in
   the URL fragment of the share link (`/s/<id>#k=<key>`). The fragment
   never reaches the server; it stays in the browser only.
4. When the recipient opens the link, the browser fetches `encrypted_payload`
   from the server and decrypts it locally using the key from the fragment.
5. The note is automatically deleted by the server once it expires (TTL) or
   reaches its view limit (`max_views`, one-time by default). Expired
   records are cleaned up by a periodic background task.

The server never sees the plaintext content; it only stores the encrypted
data, creation/expiry timestamps, and the view counter.

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (async) + aiosqlite (SQLite)
- Pydantic v2 / pydantic-settings
- slowapi (rate limiting)
- pytest / httpx

**Frontend**
- React 19 + TypeScript + Vite
- React Router, TanStack Query, React Hook Form + Zod
- Tailwind CSS v4, Radix UI / shadcn components
- Web Crypto API (AES-GCM)

## Directory Structure

```
app/
  api/        # Route/endpoint definitions (APIRouters)
  core/       # Configuration, database, rate limit settings
  models/     # SQLAlchemy ORM models
  schemas/    # Pydantic request/response schemas
  services/   # Business logic
tests/        # pytest tests
frontend/     # React + Vite client
requirements.txt
```

## Setup

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env   # edit values if needed
uvicorn app.main:app --reload
```

The API is served by default at `http://localhost:8000`, under `/api/v1`.
Health check: `GET /health`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if needed
npm run dev
```

Runs by default at `http://localhost:5173` and connects to the API via
`VITE_API_BASE_URL` (default `http://localhost:8000`).

## Environment Variables (Backend)

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | `Encrypted Note Sharing` |
| `DATABASE_URL` | Async SQLAlchemy connection string | `sqlite+aiosqlite:///./notes.db` |
| `DEFAULT_TTL_SECONDS` | Default expiry duration for a note | `86400` |
| `DEFAULT_MAX_VIEWS` | Default maximum number of views | `1` |
| `CLEANUP_INTERVAL_SECONDS` | Interval for cleaning up expired notes | `300` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |
| `DATABASE_BUSY_TIMEOUT_SECONDS` | SQLite busy timeout | `15.0` |
| `CREATE_SECRET_RATE_LIMIT` | Rate limit for the note creation endpoint | `20/minute` |

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/secrets/` | Creates the encrypted note, returns `id`, `expires_at`, `max_views` |
| `GET`  | `/api/v1/secrets/{id}` | Fetches the note and increments the view counter; returns `404` if the limit is reached or it has expired |
| `GET`  | `/health` | Health check |

## Running Tests

```bash
pytest
```

Tests send requests directly to the FastAPI app via `httpx.AsyncClient`;
no separate server needs to be started.

## Security Notes

- The encryption key never touches the server or HTTP logs; it only exists
  in the URL fragment of the share link.
- Whoever obtains the link can read the note — share it only through
  trusted channels.
- Notes are one-time by default; they are deleted from the server after
  the first view.

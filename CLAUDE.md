# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Project Overview

Encrypted Note Sharing: A FastAPI service that lets users create end-to-end
encrypted notes and share them via one-time or time-limited links. The
server never sees the plaintext content of notes; encryption/decryption
happens client-side, and the server only stores the encrypted data.

## Tech Stack

- **FastAPI** — HTTP API layer
- **Uvicorn** — ASGI server
- **SQLAlchemy** (async) + **aiosqlite** — database access (SQLite)
- **Pydantic v2 / pydantic-settings** — data validation and configuration
- **pytest / httpx** — testing

## Directory Structure

```
app/
  api/        # Route/endpoint definitions (APIRouters)
  core/       # Configuration, security helpers, settings (Settings)
  models/     # SQLAlchemy ORM models
  schemas/    # Pydantic request/response schemas
  services/   # Business logic (called from routes)
tests/        # pytest test files
requirements.txt
```

## Architectural Rules

- Route handlers (`app/api`) stay thin: validation + service call.
  Business logic lives in `app/services`.
- Database models (`app/models`) are kept separate from the API schemas
  exposed externally (`app/schemas`); ORM objects are never returned
  directly as a response.
- Configuration is read from environment variables in `app/core/config.py`
  via `pydantic-settings`; constants are not hardcoded in the code.
- Encryption/decryption logic never runs on the server — the client
  encodes the ciphertext (which includes the IV/nonce) as a single opaque
  `encrypted_payload` string and sends it; the server stores this blob
  transparently and never parses or interprets its contents.

## Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start the dev server
uvicorn app.main:app --reload

# Run tests
pytest
```

## Notes

- When adding a new endpoint, first define the request/response model in
  `app/schemas`, then the business logic in `app/services`, and finally
  the route in `app/api`.
- When writing tests, send requests directly to the FastAPI app using
  `httpx.AsyncClient` (without spinning up a real server).

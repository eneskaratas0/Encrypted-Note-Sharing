import asyncio
import contextlib
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import OperationalError

from app.api.v1.endpoints.secrets import router as secrets_router
from app.core.config import get_settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.rate_limit import limiter
from app.services.secret_service import purge_expired_secrets

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


async def _cleanup_loop() -> None:
    while True:
        await asyncio.sleep(settings.cleanup_interval_seconds)
        try:
            async with AsyncSessionLocal() as session:
                deleted = await purge_expired_secrets(session)
            if deleted:
                logger.info("Purged %d expired secret(s)", deleted)
        except Exception:
            logger.exception("Failed to purge expired secrets; will retry next cycle")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    cleanup_task = asyncio.create_task(_cleanup_loop())
    try:
        yield
    finally:
        cleanup_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await cleanup_task


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(secrets_router, prefix="/api/v1")


@app.exception_handler(OperationalError)
async def database_unavailable_handler(request: Request, exc: OperationalError) -> JSONResponse:
    logger.exception("Database operation failed")
    return JSONResponse(
        status_code=503,
        content={"detail": "Service temporarily unavailable, please retry"},
    )


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

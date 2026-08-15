import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.secret import Secret
from app.schemas.secret import SecretCreate


async def create_secret(db: AsyncSession, data: SecretCreate) -> Secret:
    settings = get_settings()
    ttl_seconds = data.ttl_seconds if data.ttl_seconds is not None else settings.default_ttl_seconds
    max_views = data.max_views if data.max_views is not None else settings.default_max_views

    secret = Secret(
        encrypted_payload=data.encrypted_payload,
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
        max_views=max_views,
    )
    db.add(secret)
    await db.commit()
    await db.refresh(secret)
    return secret


async def consume_secret(db: AsyncSession, secret_id: uuid.UUID) -> Secret | None:
    """Atomically registers one view and hard-deletes the secret once max_views is reached."""
    now = datetime.now(timezone.utc)
    stmt = (
        update(Secret)
        .where(Secret.id == secret_id)
        .where(or_(Secret.expires_at.is_(None), Secret.expires_at > now))
        .where(Secret.view_count < Secret.max_views)
        .values(view_count=Secret.view_count + 1)
        .returning(Secret)
    )
    result = await db.execute(stmt)
    secret = result.scalar_one_or_none()

    if secret is not None and secret.view_count >= secret.max_views:
        await db.execute(delete(Secret).where(Secret.id == secret_id))

    await db.commit()
    return secret


async def purge_expired_secrets(db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    stmt = delete(Secret).where(Secret.expires_at.is_not(None), Secret.expires_at < now)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount

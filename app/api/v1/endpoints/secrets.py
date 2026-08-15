import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.schemas.secret import SecretCreate, SecretOut, SecretResponse
from app.services.secret_service import consume_secret, create_secret

router = APIRouter(prefix="/secrets", tags=["secrets"])


@router.post("/", response_model=SecretResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().create_secret_rate_limit)
async def create_secret_endpoint(
    request: Request,
    data: SecretCreate,
    db: AsyncSession = Depends(get_db),
) -> SecretResponse:
    secret = await create_secret(db, data)
    return secret


@router.get("/{secret_id}", response_model=SecretOut)
async def read_secret_endpoint(
    secret_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SecretOut:
    secret = await consume_secret(db, secret_id)
    if secret is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secret not found or already consumed",
        )
    return secret

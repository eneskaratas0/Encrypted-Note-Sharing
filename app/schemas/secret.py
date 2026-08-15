import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


MAX_PAYLOAD_LENGTH = 200_000
MAX_TTL_SECONDS = 2_592_000  # 30 days
MAX_VIEWS_LIMIT = 100


class SecretCreate(BaseModel):
    encrypted_payload: str = Field(..., min_length=1, max_length=MAX_PAYLOAD_LENGTH)
    ttl_seconds: int | None = Field(default=None, gt=0, le=MAX_TTL_SECONDS)
    max_views: int | None = Field(default=None, gt=0, le=MAX_VIEWS_LIMIT)


class SecretResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    expires_at: datetime | None
    max_views: int


class SecretOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    encrypted_payload: str
    created_at: datetime
    expires_at: datetime | None
    max_views: int
    view_count: int

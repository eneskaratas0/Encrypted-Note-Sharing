import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from httpx import AsyncClient
from sqlalchemy import update

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.models.secret import Secret
from app.schemas.secret import MAX_PAYLOAD_LENGTH

PAYLOAD = {"encrypted_payload": "ciphertext-blob"}


async def test_create_secret(client: AsyncClient) -> None:
    response = await client.post("/api/v1/secrets/", json=PAYLOAD)

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["max_views"] == 1


async def test_read_secret_succeeds_on_first_request(client: AsyncClient) -> None:
    create_response = await client.post("/api/v1/secrets/", json=PAYLOAD)
    secret_id = create_response.json()["id"]

    read_response = await client.get(f"/api/v1/secrets/{secret_id}")

    assert read_response.status_code == 200
    data = read_response.json()
    assert data["id"] == secret_id
    assert data["encrypted_payload"] == PAYLOAD["encrypted_payload"]


async def test_second_read_returns_404(client: AsyncClient) -> None:
    create_response = await client.post("/api/v1/secrets/", json=PAYLOAD)
    secret_id = create_response.json()["id"]

    first_response = await client.get(f"/api/v1/secrets/{secret_id}")
    second_response = await client.get(f"/api/v1/secrets/{secret_id}")

    assert first_response.status_code == 200
    assert second_response.status_code == 404


async def test_max_views_allows_multiple_reads_then_404(client: AsyncClient) -> None:
    create_response = await client.post(
        "/api/v1/secrets/", json={**PAYLOAD, "max_views": 2}
    )
    secret_id = create_response.json()["id"]

    first_response = await client.get(f"/api/v1/secrets/{secret_id}")
    second_response = await client.get(f"/api/v1/secrets/{secret_id}")
    third_response = await client.get(f"/api/v1/secrets/{secret_id}")

    assert first_response.status_code == 200
    assert first_response.json()["view_count"] == 1
    assert second_response.status_code == 200
    assert second_response.json()["view_count"] == 2
    assert third_response.status_code == 404


async def test_expired_secret_returns_404(client: AsyncClient) -> None:
    create_response = await client.post("/api/v1/secrets/", json=PAYLOAD)
    secret_id = create_response.json()["id"]

    async with AsyncSessionLocal() as session:
        await session.execute(
            update(Secret)
            .where(Secret.id == uuid.UUID(secret_id))
            .values(expires_at=datetime.now(timezone.utc) - timedelta(seconds=1))
        )
        await session.commit()

    read_response = await client.get(f"/api/v1/secrets/{secret_id}")

    assert read_response.status_code == 404


async def test_create_secret_rejects_empty_payload(client: AsyncClient) -> None:
    response = await client.post("/api/v1/secrets/", json={"encrypted_payload": ""})

    assert response.status_code == 422


async def test_create_secret_rejects_oversized_payload(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/secrets/",
        json={"encrypted_payload": "a" * (MAX_PAYLOAD_LENGTH + 1)},
    )

    assert response.status_code == 422


async def test_create_secret_rejects_zero_max_views(client: AsyncClient) -> None:
    response = await client.post("/api/v1/secrets/", json={**PAYLOAD, "max_views": 0})

    assert response.status_code == 422


async def test_concurrent_reads_of_single_view_secret_only_one_succeeds(
    client: AsyncClient,
) -> None:
    create_response = await client.post("/api/v1/secrets/", json=PAYLOAD)
    secret_id = create_response.json()["id"]

    responses = await asyncio.gather(
        client.get(f"/api/v1/secrets/{secret_id}"),
        client.get(f"/api/v1/secrets/{secret_id}"),
    )

    status_codes = sorted(response.status_code for response in responses)
    assert status_codes == [200, 404]


async def test_create_secret_is_rate_limited(client: AsyncClient) -> None:
    limit = get_settings().create_secret_rate_limit
    max_requests = int(limit.split("/")[0])

    responses = [
        await client.post("/api/v1/secrets/", json=PAYLOAD) for _ in range(max_requests + 1)
    ]

    assert all(response.status_code == 201 for response in responses[:max_requests])
    assert responses[-1].status_code == 429

import asyncio

import pytest

import app.main as main_module


async def test_cleanup_loop_survives_purge_exception(monkeypatch: pytest.MonkeyPatch) -> None:
    call_count = 0

    async def flaky_purge(session: object) -> int:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RuntimeError("simulated database failure")
        return 0

    monkeypatch.setattr(main_module, "purge_expired_secrets", flaky_purge)
    monkeypatch.setattr(main_module.settings, "cleanup_interval_seconds", 0.01)

    task = asyncio.create_task(main_module._cleanup_loop())
    await asyncio.sleep(0.1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    assert call_count >= 2, "cleanup loop must keep running after a purge failure"

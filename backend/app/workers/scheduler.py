"""Dedicated scheduler process for deployments with multiple API replicas."""

import asyncio
import logging

from app.core.config import settings
from app.db.session import init_db
from app.services.scheduler import run_scheduler_loop


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    if settings.auto_init_db:
        init_db()
    await run_scheduler_loop(asyncio.Event())


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass

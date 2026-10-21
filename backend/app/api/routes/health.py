from fastapi import APIRouter
from redis import Redis
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine


router = APIRouter(tags=["health"])


#Tut ya vynes health, chtoby ne razduvat ostalnoy kod.
@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/live")
def liveness() -> dict[str, str]:
    """Process liveness probe; deliberately does not depend on external services."""
    return {"status": "ok"}


@router.get("/health/ready")
def readiness() -> dict[str, str]:
    """Readiness probe for traffic routing and deployment rollouts."""
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    client = Redis.from_url(settings.redis_url, socket_connect_timeout=1, socket_timeout=1)
    try:
        client.ping()
    finally:
        client.close()
    return {"status": "ready"}

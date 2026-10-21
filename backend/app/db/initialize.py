"""One-shot database migration and bootstrap command for deployments."""

from app.db.session import init_db


if __name__ == "__main__":
    init_db()

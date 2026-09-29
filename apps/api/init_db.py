import asyncio
from app.db.session import engine, Base
import app.db.models

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully!")

if __name__ == "__main__":
    asyncio.run(main())

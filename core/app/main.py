"""SteelCraft - Punto de entrada principal de FastAPI."""

from fastapi import FastAPI
from app.config import settings
from app.api.auth import router as auth_router

from app.database import engine
from app.models import Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado para Docker / Load Balancers."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
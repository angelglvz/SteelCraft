"""SteelCraft - Punto de entrada principal de FastAPI."""

from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado para Docker / Load Balancers."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
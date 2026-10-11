"""SteelCraft - Punto de entrada principal de FastAPI."""

from fastapi import FastAPI
from app.config import settings
#auth
from app.api.auth import router as auth_router
#muscle
from app.api.muscles import router as muscle_router
#exercises
from app.api.exercises import router as exercises_router
#measurements
from app.api.measurements import router as measurements_router
#workouts
from app.api.workouts import router as workouts_router

from app.database import engine
from app.models import Base


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

Base.metadata.create_all(bind=engine)

#registro de los APIs
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(muscle_router, prefix=settings.API_V1_STR)
app.include_router(exercises_router)
app.include_router(measurements_router)
app.include_router(workouts_router)

@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado para Docker / Load Balancers."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
"""SteelCraft - Punto de entrada principal de FastAPI."""
import os
from pathlib import Path
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
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

# Configuración básica de logging seguro
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("steelcraft")

BASE_DIR = Path(__file__).resolve().parent.parent.parent 
UPLOADS_DIR = BASE_DIR / "uploads"

AVATARS_DIR = UPLOADS_DIR / "avatars"
os.makedirs(AVATARS_DIR, exist_ok=True)

# Configuración del limitador de peticiones (Rate Limiting)
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Integración del limitador en el estado de la aplicación
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Base.metadata.create_all(bind=engine)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador global de excepciones no controladas (Control de errores seguro)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error interno no controlado en {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Ha ocurrido un error interno en el servidor. Inténtelo más tarde."},
    )

# Registro de los APIs
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(muscle_router, prefix=settings.API_V1_STR)
app.include_router(exercises_router, prefix=settings.API_V1_STR)
app.include_router(measurements_router, prefix=settings.API_V1_STR)
app.include_router(workouts_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado para Docker / Load Balancers."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
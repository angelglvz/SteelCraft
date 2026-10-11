"""SteelCraft - Endpoints para el módulo de Medidas Corporales."""

from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import BodyMeasurement, User
from app.schemas import BodyMeasurementCreate, BodyMeasurementResponse
from app.deps import get_current_user

router = APIRouter(prefix="/measurements", tags=["Body Measurements"])


@router.get("/", response_model=list[BodyMeasurementResponse])
def list_my_measurements(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Devuelve el historial completo de medidas corporales del usuario autenticado, ordenadas de más reciente a más antigua."""
    measurements = db.scalars(
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(BodyMeasurement.measured_at.desc())
    ).all()
    return measurements


@router.post("/", response_model=BodyMeasurementResponse, status_code=status.HTTP_201_CREATED)
def create_measurement(
    measurement_in: BodyMeasurementCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Registra una nueva medida corporal asociada al usuario autenticado."""
    # Validación de negocio opcional: asegurar que al menos un valor principal esté presente
    if not any([measurement_in.weight_kg, measurement_in.height_cm, measurement_in.body_fat_pct]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one measurement value (weight, height, or body fat percentage) must be provided.",
        )

    db_measurement = BodyMeasurement(
        user_id=current_user.id,
        measured_at=measurement_in.measured_at,
        weight_kg=measurement_in.weight_kg,
        height_cm=measurement_in.height_cm,
        body_fat_pct=measurement_in.body_fat_pct,
        source=measurement_in.source,
    )
    
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    return db_measurement


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(
    measurement_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Elimina una medida corporal propia por su ID."""
    measurement = db.scalar(
        select(BodyMeasurement)
        .where(BodyMeasurement.id == measurement_id)
        .where(BodyMeasurement.user_id == current_user.id)
    )

    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement not found or you do not have permission to delete it.",
        )

    db.delete(measurement)
    db.commit()
    return None
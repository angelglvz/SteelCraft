"""SteelCraft - Endpoints del Catálogo de Músculos."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Muscle, User, UserRole
from app.schemas import MuscleCreate, MuscleResponse
from app.deps import get_current_user  # Usaremos esta dependencia para validar roles si procede

router = APIRouter(prefix="/muscles", tags=["Muscles"])


@router.get("/", response_model=list[MuscleResponse])
def list_muscles(db: Annotated[Session, Depends(get_db)]):
    """Devuelve la lista completa de músculos y grupos musculares del catálogo."""
    muscles = db.query(Muscle).all()
    return muscles


@router.post("/", response_model=MuscleResponse, status_code=status.HTTP_201_CREATED)
def create_muscle(
    muscle_in: MuscleCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Crea un nuevo músculo en el catálogo (Solo administradores)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify the exercise catalog",
        )

    existing = db.query(Muscle).filter(Muscle.slug == muscle_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A muscle with this slug already exists.",
        )

    db_muscle = Muscle(
        slug=muscle_in.slug,
        name=muscle_in.name,
        parent_id=muscle_in.parent_id,
    )
    db.add(db_muscle)
    db.commit()
    db.refresh(db_muscle)
    return db_muscle

@router.delete("/{muscle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_muscle(
    muscle_id: int,  
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Elimina un músculo del catálogo por su ID (Solo administradores)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify the exercise catalog",
        )

    db_muscle = db.query(Muscle).filter(Muscle.id == muscle_id).first()
    if not db_muscle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Muscle not found",
        )

    db.delete(db_muscle)
    db.commit()
    return None
"""SteelCraft - Endpoints del Catálogo de Ejercicios."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import Exercise, ExerciseMuscle, User, UserRole
from app.schemas import ExerciseCreate, ExerciseResponse
from app.deps import get_current_user

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("/", response_model=list[ExerciseResponse])
def list_exercises(db: Annotated[Session, Depends(get_db)]):
    """Devuelve la lista completa de ejercicios del catálogo."""
    exercises = db.scalars(select(Exercise)).all()
    return exercises


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_in: ExerciseCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Crea un nuevo ejercicio en el catálogo con sus músculos asociados (Solo administradores)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify the exercise catalog",
        )

    existing = db.scalar(select(Exercise).where(Exercise.slug == exercise_in.slug))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An exercise with this slug already exists.",
        )

    db_exercise = Exercise(
        slug=exercise_in.slug,
        name=exercise_in.name,
        load_type=exercise_in.load_type,
        is_active=exercise_in.is_active,
    )
    db.add(db_exercise)
    db.flush()  # Para obtener el id generado del ejercicio

    # Asociar músculos si se han proporcionado
    for m_link in exercise_in.muscles:
        db_muscle_link = ExerciseMuscle(
            exercise_id=db_exercise.id,
            muscle_id=m_link.muscle_id,
            role=m_link.role,
        )
        db.add(db_muscle_link)

    db.commit()
    db.refresh(db_exercise)
    return db_exercise
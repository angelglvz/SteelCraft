"""SteelCraft - Endpoints del Catálogo de Ejercicios."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.database import get_db
from app.models import Exercise, ExerciseMuscle, User, UserRole
from app.schemas import ExerciseCreate, ExerciseResponse
from app.deps import get_current_user
from app.limiter import limiter

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("/", response_model=list[ExerciseResponse])
def list_exercises(db: Annotated[Session, Depends(get_db)]):
    """Devuelve la lista completa de ejercicios del catálogo con sus músculos."""
    exercises = db.scalars(
        select(Exercise).options(
            selectinload(Exercise.muscles).selectinload(ExerciseMuscle.muscle)
        )
    ).all()
    return exercises


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_exercise(
    request: Request,
    exercise_in: ExerciseCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Crea un nuevo ejercicio en el catálogo con sus músculos asociados (Solo administradores)."""
    _ = request
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
    db.flush()

    for m_link in exercise_in.muscles:
        db_muscle_link = ExerciseMuscle(
            exercise_id=db_exercise.id,
            muscle_id=m_link.muscle_id,
            role=m_link.role,
        )
        db.add(db_muscle_link)

    db.commit()

    stmt = (
        select(Exercise)
        .options(selectinload(Exercise.muscles).selectinload(ExerciseMuscle.muscle))
        .where(Exercise.id == db_exercise.id)
    )
    db_exercise_loaded = db.scalar(stmt)
    return db_exercise_loaded


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_exercise(
    request: Request,
    exercise_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Elimina un ejercicio del catálogo por su ID (Solo administradores)."""
    _ = request
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify the exercise catalog",
        )

    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found",
        )

    db.delete(db_exercise)
    db.commit()
    return None
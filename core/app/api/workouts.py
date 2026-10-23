"""SteelCraft - Endpoints para el módulo de Entrenamientos y Series."""

from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.database import get_db
from app.models import Workout, WorkoutExercise, SetLog, User
from app.schemas import WorkoutCreate, WorkoutResponse
from app.deps import get_current_user

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("/", response_model=list[WorkoutResponse])
def list_my_workouts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = 1000,
    offset: int = 0,
):
    """Devuelve la lista de entrenamientos del usuario autenticado, ordenados por fecha descendente."""
    workouts = db.scalars(
        select(Workout)
        .where(Workout.user_id == current_user.id)
        .order_by(Workout.performed_on.desc(), Workout.created_at.desc())
        .options(
            selectinload(Workout.exercises).selectinload(WorkoutExercise.sets)
        )
        .limit(limit)
        .offset(offset)
    ).all()
    return workouts


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout_in: WorkoutCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Registra un nuevo entrenamiento completo con sus ejercicios y series asociadas."""
    db_workout = Workout(
        user_id=current_user.id,
        performed_on=workout_in.performed_on,
        started_at=workout_in.started_at,
        ended_at=workout_in.ended_at,
        notes=workout_in.notes,
        source=workout_in.source,
    )
    db.add(db_workout)
    db.flush()  # Para obtener el ID del entrenamiento generado

    # Crear ejercicios y series anidadas
    for we_in in workout_in.exercises:
        db_we = WorkoutExercise(
            workout_id=db_workout.id,
            exercise_id=we_in.exercise_id,
            position=we_in.position,
            notes=we_in.notes,
        )
        db.add(db_we)
        db.flush()

        for set_in in we_in.sets:
            db_set = SetLog(
                workout_exercise_id=db_we.id,
                set_number=set_in.set_number,
                reps=set_in.reps,
                weight_kg=set_in.weight_kg,
                extra_kg=set_in.extra_kg,
                assist_kg=set_in.assist_kg,
                rpe=set_in.rpe,
            )
            db.add(db_set)

    db.commit()
    
    # Recargar con relaciones para devolver la respuesta completa con los IDs generados
    statement = (
        select(Workout)
        .where(Workout.id == db_workout.id)
        .options(selectinload(Workout.exercises).selectinload(WorkoutExercise.sets))
    )
    complete_workout = db.scalar(statement)
    return complete_workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Elimina un entrenamiento propio por su ID (la eliminación en cascada borra sus ejercicios y series)."""
    workout = db.scalar(
        select(Workout)
        .where(Workout.id == workout_id)
        .where(Workout.user_id == current_user.id)
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found or you do not have permission to delete it.",
        )

    db.delete(workout)
    db.commit()
    return None
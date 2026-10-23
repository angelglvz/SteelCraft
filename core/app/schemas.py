"""SteelCraft - Esquemas Pydantic para validación y serialización de datos de la API."""

from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models import UserRole
from app.models import LoadType, MuscleRole
from app.models import DataSource


# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="La contraseña debe tener al menos 8 caracteres")
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    birth_date: Optional[date] = None

class UserResponse(UserBase):
    id: UUID
    username: Optional[str] = None
    role: UserRole
    avatar_key: Optional[str] = Field(None, max_length=255)
    birth_date: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class TokenPayload(BaseModel):
    sub: UUID | None = None

# --- MUSCLE SCHEMAS ---
class MuscleBase(BaseModel):
    slug: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-z0-9-]+$")
    name: str = Field(..., min_length=2, max_length=100)
    parent_id: int | None = Field(None, gt=0)

class MuscleCreate(MuscleBase):
    pass

class MuscleResponse(MuscleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ExerciseMuscleLink(BaseModel):
    muscle_id: int = Field(..., gt=0)
    role: MuscleRole

    model_config = ConfigDict(from_attributes=True)

# --- EXERCISE SCHEMAS ---
class ExerciseCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    name: str = Field(..., min_length=2, max_length=150)
    load_type: LoadType = LoadType.OTHER
    is_active: bool = True
    muscles: list[ExerciseMuscleLink] = Field(default=[], max_length=20)  # Límite razonable de músculos asociados

class ExerciseResponse(BaseModel):
    id: int
    slug: str
    name: str
    load_type: LoadType
    is_active: bool
    created_at: datetime
    muscles: list[ExerciseMuscleResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- BODY MEASUREMENT SCHEMAS ---
class BodyMeasurementBase(BaseModel):
    measured_at: datetime
    weight_kg: Decimal | None = Field(None, ge=Decimal("20.0"), le=Decimal("500.0"))
    height_cm: Decimal | None = Field(None, ge=Decimal("50.0"), le=Decimal("260.0"))
    body_fat_pct: Decimal | None = Field(None, ge=Decimal("1.0"), le=Decimal("75.0"))
    source: DataSource = DataSource.MANUAL


class BodyMeasurementCreate(BodyMeasurementBase):
    """Esquema para registrar una nueva medida corporal."""
    pass


class BodyMeasurementResponse(BodyMeasurementBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- WORKOUT & SET SCHEMAS ---
class SetLogCreate(BaseModel):
    set_number: int = Field(..., ge=1, le=100)
    reps: int = Field(..., ge=0, le=1000)
    weight_kg: Decimal | None = Field(None, ge=Decimal("0.0"), le=Decimal("2000.0"))
    extra_kg: Decimal | None = Field(None, ge=Decimal("0.0"), le=Decimal("500.0"))
    assist_kg: Decimal | None = Field(None, ge=Decimal("0.0"), le=Decimal("500.0"))
    rpe: Decimal | None = Field(None, ge=Decimal("1.0"), le=Decimal("10.0"))

class SetLogResponse(SetLogCreate):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class WorkoutExerciseCreate(BaseModel):
    exercise_id: int = Field(..., gt=0)
    position: int = Field(..., ge=1, le=100)
    notes: str | None = Field(None, max_length=500)
    sets: list[SetLogCreate] = Field(default=[], max_length=50)


class WorkoutExerciseResponse(BaseModel):
    id: UUID
    exercise_id: int
    position: int
    notes: str | None
    sets: list[SetLogResponse] = []

    model_config = ConfigDict(from_attributes=True)


class WorkoutCreate(BaseModel):
    performed_on: date
    started_at: datetime | None = None
    ended_at: datetime | None = None
    notes: str | None = Field(None, max_length=1000)
    source: DataSource = DataSource.MANUAL
    exercises: list[WorkoutExerciseCreate] = Field(default=[], max_length=50)

    @model_validator(mode="after")
    def validate_workout_times(self) -> "WorkoutCreate":
        """Valida que si existen ambas horas, la de finalización sea estrictamente posterior a la de inicio."""
        if self.started_at and self.ended_at:
            if self.ended_at <= self.started_at:
                raise ValueError("La hora de finalización (ended_at) debe ser posterior a la de inicio (started_at).")
        return self


class WorkoutResponse(BaseModel):
    id: UUID
    user_id: UUID
    performed_on: date
    started_at: datetime | None
    ended_at: datetime | None
    notes: str | None
    source: DataSource
    created_at: datetime
    exercises: list[WorkoutExerciseResponse] = []

    model_config = ConfigDict(from_attributes=True)

class MuscleNestedResponse(BaseModel):
    id: int
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)

class ExerciseMuscleResponse(BaseModel):
    muscle_id: int
    role: MuscleRole
    muscle: MuscleNestedResponse | None = None  

    model_config = ConfigDict(from_attributes=True)
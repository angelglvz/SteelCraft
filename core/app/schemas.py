"""SteelCraft - Esquemas Pydantic para validación y serialización de datos de la API."""

from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import UserRole
from app.models import LoadType, MuscleRole
from app.models import DataSource


# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: UUID
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class TokenPayload(BaseModel):
    sub: UUID | None = None

class MuscleBase(BaseModel):
    slug: str
    name: str
    parent_id: int | None = None

class MuscleCreate(MuscleBase):
    pass

class MuscleResponse(MuscleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ExerciseMuscleLink(BaseModel):
    muscle_id: int
    role: MuscleRole

    model_config = ConfigDict(from_attributes=True)

class ExerciseCreate(BaseModel):
    slug: str
    name: str
    load_type: LoadType = LoadType.OTHER
    is_active: bool = True
    muscles: list[ExerciseMuscleLink] = []  # Lista opcional para asociar músculos principales/secundarios al crear

class ExerciseResponse(BaseModel):
    id: int
    slug: str
    name: str
    load_type: LoadType
    is_active: bool
    created_at: datetime
    muscles: list[ExerciseMuscleLink] = []

    model_config = ConfigDict(from_attributes=True)

class BodyMeasurementBase(BaseModel):
    measured_at: datetime
    weight_kg: Decimal | None = Field(None, ge=Decimal("20.0"), le=Decimal("500.0"))
    height_cm: Decimal | None = Field(None, ge=Decimal("50.0"), le=Decimal("260.0"))
    body_fat_pct: Decimal | None = Field(None, ge=Decimal("1.0"), le=Decimal("75.0"))
    source: DataSource = DataSource.MANUAL

    @field_validator("weight_kg", "height_cm", "body_fat_pct", mode="after")
    @classmethod
    def validate_at_least_one(cls, v, info):
        # Nota: La validación completa cruzada se realiza a nivel de base de datos con el CHECK constraint,
        # pero podemos asegurar que al menos los campos tengan sentido lógico.
        return v


class BodyMeasurementCreate(BodyMeasurementBase):
    """Esquema para registrar una nueva medida corporal. 
    El user_id se asignará automáticamente a partir del token del usuario autenticado."""
    pass


class BodyMeasurementResponse(BodyMeasurementBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SetLogCreate(BaseModel):
    set_number: int = Field(..., ge=1)
    reps: int = Field(..., ge=0, le=500)
    weight_kg: Decimal | None = Field(None, ge=Decimal("0.0"))
    extra_kg: Decimal | None = Field(None, ge=Decimal("0.0"))
    assist_kg: Decimal | None = Field(None, gt=Decimal("0.0"))
    rpe: Decimal | None = Field(None, ge=Decimal("1.0"), le=Decimal("10.0"))

class SetLogResponse(SetLogCreate):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class WorkoutExerciseCreate(BaseModel):
    exercise_id: int
    position: int = Field(..., ge=1)
    notes: str | None = None
    sets: list[SetLogCreate] = []


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
    notes: str | None = None
    source: DataSource = DataSource.MANUAL
    exercises: list[WorkoutExerciseCreate] = []


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
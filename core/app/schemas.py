"""SteelCraft - Esquemas Pydantic para validación y serialización de datos de la API."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import UserRole
from app.models import LoadType, MuscleRole


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
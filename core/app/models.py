"""SteelCraft - Programa 1 (núcleo): modelo de datos.

SQLAlchemy 2.x + PostgreSQL. Los enums se guardan como VARCHAR + CHECK explícito (no como
ENUM nativo de PostgreSQL) para que añadir un valor sea una migración trivial. El CHECK se
declara a mano con _in_check() porque el generado por SQLAlchemy (create_constraint=True)
se duplica con las migraciones de Alembic cuando hay naming_convention.

Convenciones
- Tablas de usuario (app_user, body_measurement, workout, workout_exercise, set_log): PK UUID.
- Tablas de catálogo (muscle, exercise, exercise_alias): PK entera autogenerada.
- Unidades siempre en kg / cm; la conversión a otras unidades es cosa de la capa de presentación.
- Aislamiento por usuario: workout y body_measurement llevan user_id; el resto de
  datos del usuario se alcanza a través de ellos. TODA consulta de la API debe filtrar
  por el user_id del token.
"""
from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, Enum, ForeignKey, Identity, Index,
    MetaData, Numeric, SmallInteger, String, Text, UniqueConstraint, Uuid, func, text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# ---------------------------------------------------------------- enums
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class LoadType(str, enum.Enum):
    """Cómo hay que interpretar el peso anotado de un ejercicio."""
    BARBELL = "barbell"        # barra: peso de las placas (+ extra_kg si se anota la barra)
    DUMBBELL = "dumbbell"      # mancuernas: peso POR mancuerna
    MACHINE = "machine"        # máquina de placas o selectorizada
    CABLE = "cable"            # polea
    BODYWEIGHT = "bodyweight"  # peso corporal (con lastre o asistencia opcionales)
    OTHER = "other"


class MuscleRole(str, enum.Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


class DataSource(str, enum.Enum):
    """Origen del dato. En workouts 'telegram_import' implica series/reps ASUMIDAS (3x8)."""
    MANUAL = "manual"
    TELEGRAM_IMPORT = "telegram_import"


def _enum(py_enum: type[enum.Enum], name: str) -> Enum:
    return Enum(
        py_enum, name=name, native_enum=False, create_constraint=False, length=20,
        values_callable=lambda e: [m.value for m in e],
    )


def _in_check(column: str, py_enum: type[enum.Enum]) -> CheckConstraint:
    """CHECK explícito que limita una columna a los valores de un enum."""
    values = ", ".join(f"'{m.value}'" for m in py_enum)
    return CheckConstraint(f"{column} IN ({values})", name=f"{column}_valid")


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ---------------------------------------------------------------- usuarios
class User(TimestampMixin, Base):
    """Cuenta. Se registra con email + contraseña; username y birth_date se completan después.

    Los datos de perfil ampliados (objetivo, experiencia...) irán en una tabla 1:1 aparte
    (user_profile) cuando exista el formulario de perfil; no forman parte de la v1.
    """
    __tablename__ = "app_user"  # "user" es palabra reservada en PostgreSQL

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)  # siempre en minúsculas
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)  # Argon2id, nunca la contraseña
    username: Mapped[str | None] = mapped_column(String(32))          # opcional: se elige más adelante
    birth_date: Mapped[date | None] = mapped_column(Date)             # opcional; la edad se calcula, no se guarda
    avatar_key: Mapped[str | None] = mapped_column(String(255))       # clave en el almacén de archivos
    role: Mapped[UserRole] = mapped_column(
        _enum(UserRole, "user_role"), nullable=False, default=UserRole.USER,
        server_default=UserRole.USER.value)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    measurements: Mapped[list[BodyMeasurement]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    workouts: Mapped[list[Workout]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True)

    __table_args__ = (
        CheckConstraint("email = lower(email)", name="email_lowercase"),
        CheckConstraint(r"email ~ '^[^@\s]+@[^@\s]+$'", name="email_shape"),
        CheckConstraint(r"username ~ '^[A-Za-z0-9_]{3,32}$'", name="username_format"),
        _in_check("role", UserRole),
    )


# username único sin distinguir mayúsculas (varios NULL permitidos: aún sin elegir)
Index("uq_app_user_username_lower", func.lower(User.username), unique=True)


class BodyMeasurement(Base):
    """Histórico de medidas: una fila por medición (relación 1:N con el usuario)."""
    __tablename__ = "body_measurement"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    height_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    body_fat_pct: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    source: Mapped[DataSource] = mapped_column(
        _enum(DataSource, "data_source"), nullable=False, default=DataSource.MANUAL,
        server_default=DataSource.MANUAL.value)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="measurements")

    __table_args__ = (
        CheckConstraint("weight_kg BETWEEN 20 AND 500", name="weight_range"),
        CheckConstraint("height_cm BETWEEN 50 AND 260", name="height_range"),
        CheckConstraint("body_fat_pct BETWEEN 1 AND 75", name="body_fat_range"),
        CheckConstraint(
            "weight_kg IS NOT NULL OR height_cm IS NOT NULL OR body_fat_pct IS NOT NULL",
            name="at_least_one_value"),
        _in_check("source", DataSource),
    )


Index("ix_body_measurement_user_measured_at",
      BodyMeasurement.user_id, BodyMeasurement.measured_at.desc())


# ---------------------------------------------------------------- catálogo
class Muscle(Base):
    """Músculos y grupos en una sola tabla: parent_id NULL = grupo (pecho, espalda...).

    Hoy el histórico importado solo conoce grupos. Cuando se elija el SVG anatómico se
    añadirán músculos concretos (hijos de un grupo) sin tocar el esquema.
    """
    __tablename__ = "muscle"

    id: Mapped[int] = mapped_column(Identity(always=True), primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("muscle.id", ondelete="RESTRICT"))

    parent: Mapped[Muscle | None] = relationship(remote_side="Muscle.id", back_populates="children")
    children: Mapped[list[Muscle]] = relationship(back_populates="parent")


MUSCLE_GROUPS = [  # semilla inicial: coincide con el vocabulario del CSV curado
    ("pecho", "Pecho"), ("espalda", "Espalda"), ("hombro", "Hombro"), ("biceps", "Bíceps"),
    ("triceps", "Tríceps"), ("cuadriceps", "Cuádriceps"), ("isquios", "Isquiotibiales"),
    ("gluteo", "Glúteo"), ("aductores", "Aductores"), ("gemelos", "Gemelos"),
    ("abdomen", "Abdomen"), ("lumbares", "Lumbares"),
]


class Exercise(Base):
    """Catálogo común a todos los usuarios; solo el rol admin escribe."""
    __tablename__ = "exercise"

    id: Mapped[int] = mapped_column(Identity(always=True), primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    load_type: Mapped[LoadType] = mapped_column(
        _enum(LoadType, "load_type"), nullable=False, default=LoadType.OTHER,
        server_default=LoadType.OTHER.value)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)

    aliases: Mapped[list[ExerciseAlias]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan", passive_deletes=True)
    muscles: Mapped[list[ExerciseMuscle]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan", passive_deletes=True)

    __table_args__ = (_in_check("load_type", LoadType),)


class ExerciseAlias(Base):
    """Variantes de escritura de un ejercicio (las usa el importador). Alias único global."""
    __tablename__ = "exercise_alias"

    id: Mapped[int] = mapped_column(Identity(always=True), primary_key=True)
    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercise.id", ondelete="CASCADE"), nullable=False)
    alias: Mapped[str] = mapped_column(String(160), nullable=False, unique=True)  # minúsculas, sin tildes

    exercise: Mapped[Exercise] = relationship(back_populates="aliases")


Index("ix_exercise_alias_exercise_id", ExerciseAlias.exercise_id)


class ExerciseMuscle(Base):
    __tablename__ = "exercise_muscle"

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercise.id", ondelete="CASCADE"), primary_key=True)
    muscle_id: Mapped[int] = mapped_column(
        ForeignKey("muscle.id", ondelete="RESTRICT"), primary_key=True)
    role: Mapped[MuscleRole] = mapped_column(_enum(MuscleRole, "muscle_role"), nullable=False)

    exercise: Mapped[Exercise] = relationship(back_populates="muscles")
    muscle: Mapped[Muscle] = relationship()

    __table_args__ = (_in_check("role", MuscleRole),)


# como máximo un músculo principal por ejercicio ("al menos uno" lo valida la API)
Index("uq_exercise_muscle_one_primary", ExerciseMuscle.exercise_id, unique=True,
      postgresql_where=text("role = 'primary'"))
Index("ix_exercise_muscle_muscle_id", ExerciseMuscle.muscle_id)


# ---------------------------------------------------------------- entrenos
class Workout(Base):
    __tablename__ = "workout"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    performed_on: Mapped[date] = mapped_column(Date, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
    source: Mapped[DataSource] = mapped_column(
        _enum(DataSource, "data_source"), nullable=False, default=DataSource.MANUAL,
        server_default=DataSource.MANUAL.value)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="workouts")
    exercises: Mapped[list[WorkoutExercise]] = relationship(
        back_populates="workout", cascade="all, delete-orphan", passive_deletes=True,
        order_by="WorkoutExercise.position")

    __table_args__ = (
        CheckConstraint(
            "started_at IS NULL OR ended_at IS NULL OR ended_at >= started_at",
            name="ended_after_started"),
        _in_check("source", DataSource),
    )


Index("ix_workout_user_performed_on", Workout.user_id, Workout.performed_on.desc())


class WorkoutExercise(Base):
    """Un ejercicio dentro de un entreno. Puede tener 0 series (p. ej. 'al fallo' importado)."""
    __tablename__ = "workout_exercise"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    workout_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workout.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercise.id", ondelete="RESTRICT"), nullable=False)
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    workout: Mapped[Workout] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()
    sets: Mapped[list[SetLog]] = relationship(
        back_populates="workout_exercise", cascade="all, delete-orphan", passive_deletes=True,
        order_by="SetLog.set_number")

    __table_args__ = (
        UniqueConstraint("workout_id", "position", name="uq_workout_exercise_workout_position"),
        CheckConstraint("position >= 1", name="position_positive"),
    )


# historial de un ejercicio concreto (progresión)
Index("ix_workout_exercise_exercise_workout", WorkoutExercise.exercise_id, WorkoutExercise.workout_id)


class SetLog(Base):
    """Una serie. Cada serie tiene sus propias reps y peso; el número de series es libre.

    weight_kg : peso de la carga (por mancuerna si load_type = dumbbell). NULL en peso corporal.
    extra_kg  : extra fijo aparte (barra, trineo de la prensa...). Carga total = weight_kg + extra_kg.
    assist_kg : peso de asistencia (dominadas asistidas). Excluyente con weight_kg.
    """
    __tablename__ = "set_log"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    workout_exercise_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workout_exercise.id", ondelete="CASCADE"), nullable=False)
    set_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    reps: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    extra_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    assist_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    rpe: Mapped[Decimal | None] = mapped_column(Numeric(3, 1))

    workout_exercise: Mapped[WorkoutExercise] = relationship(back_populates="sets")

    __table_args__ = (
        UniqueConstraint("workout_exercise_id", "set_number", name="uq_set_log_exercise_set_number"),
        CheckConstraint("set_number >= 1", name="set_number_positive"),
        CheckConstraint("reps BETWEEN 0 AND 500", name="reps_range"),
        CheckConstraint("weight_kg >= 0", name="weight_non_negative"),
        CheckConstraint("extra_kg >= 0", name="extra_non_negative"),
        CheckConstraint("assist_kg > 0", name="assist_positive"),
        CheckConstraint("rpe BETWEEN 1 AND 10", name="rpe_range"),
        CheckConstraint("NOT (weight_kg IS NOT NULL AND assist_kg IS NOT NULL)",
                        name="weight_xor_assist"),
    )
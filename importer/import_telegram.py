"""SteelCraft - Importador Fase 2: Sembrado de catálogo y carga del histórico de Telegram."""

import argparse
import csv
import re
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

# Permitir importar app desde core/
root_dir = Path(__file__).resolve().parents[1]
sys.path.append(str(root_dir / "core"))

load_dotenv(root_dir / ".env")

from app.models import (
    MUSCLE_GROUPS,
    DataSource,
    Exercise,
    ExerciseAlias,
    ExerciseMuscle,
    LoadType,
    Muscle,
    MuscleRole,
    SetLog,
    User,
    Workout,
    WorkoutExercise,
)


def normalize_text(text: str) -> str:
    """Normaliza texto: minúsculas, elimina tildes y espacios extra."""
    text = text.lower().strip()
    replacements = (
        ("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ü", "u")
    )
    for a, b in replacements:
        text = text.replace(a, b)
    return re.sub(r"\s+", " ", text)


def resolve_path(provided_path: Path, fallback_paths: list[Path]) -> Path:
    """Devuelve la primera ruta que exista entre la proporcionada o las alternativas."""
    if provided_path.exists():
        return provided_path
    for fb in fallback_paths:
        if fb.exists():
            return fb
    return provided_path


def seed_muscles(session: Session) -> dict[str, int]:
    """Siembra los grupos musculares iniciales y devuelve un mapa slug -> id."""
    muscle_map = {}
    for slug, name in MUSCLE_GROUPS:
        muscle = session.scalar(select(Muscle).where(Muscle.slug == slug))
        if not muscle:
            muscle = Muscle(slug=slug, name=name, parent_id=None)
            session.add(muscle)
            session.flush()
        muscle_map[slug] = muscle.id
    return muscle_map


def seed_catalog(
    session: Session, curado_csv_path: Path, muscle_map: dict[str, int]
) -> dict[str, int]:
    """Siembra ejercicios y alias a partir del CSV curado. Devuelve alias_normalizado -> exercise_id."""
    alias_to_exercise_id = {}

    with open(curado_csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_candidate = row.get("candidate", row.get("canonical_suggested", "")).strip()
            canonical_final = row.get("canonical_final", "").strip()
            muscle_group_final = row.get("muscle_group_final", "").strip()
            muscle_groups_secondary = row.get("muscle_groups_secondary", "").strip()
            load_type_str = row.get("load_type", "other").strip().lower()

            if canonical_final == "DESCARTAR":
                continue

            exercise_name = canonical_final if canonical_final else raw_candidate
            if not exercise_name:
                continue

            slug = normalize_text(exercise_name).replace(" ", "-")

            exercise = session.scalar(select(Exercise).where(Exercise.slug == slug))
            if not exercise:
                try:
                    load_type = LoadType(load_type_str)
                except ValueError:
                    load_type = LoadType.OTHER

                exercise = Exercise(
                    slug=slug,
                    name=exercise_name,
                    load_type=load_type,
                    is_active=True,
                )
                session.add(exercise)
                session.flush()

                if muscle_group_final in muscle_map:
                    session.add(
                        ExerciseMuscle(
                            exercise_id=exercise.id,
                            muscle_id=muscle_map[muscle_group_final],
                            role=MuscleRole.PRIMARY,
                        )
                    )

                if muscle_groups_secondary:
                    sec_slugs = [
                        s.strip() for s in muscle_groups_secondary.split("|") if s.strip()
                    ]
                    for sec_slug in sec_slugs:
                        if sec_slug in muscle_map and sec_slug != muscle_group_final:
                            session.add(
                                ExerciseMuscle(
                                    exercise_id=exercise.id,
                                    muscle_id=muscle_map[sec_slug],
                                    role=MuscleRole.SECONDARY,
                                )
                            )

            alias_norm = normalize_text(raw_candidate)
            if alias_norm and alias_norm not in alias_to_exercise_id:
                alias_obj = session.scalar(
                    select(ExerciseAlias).where(ExerciseAlias.alias == alias_norm)
                )
                if not alias_obj:
                    session.add(
                        ExerciseAlias(exercise_id=exercise.id, alias=alias_norm)
                    )
                alias_to_exercise_id[alias_norm] = exercise.id

    session.flush()
    return alias_to_exercise_id


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Importa el histórico de Telegram a PostgreSQL."
    )
    parser.add_argument(
        "--entries-raw",
        type=Path,
        default=root_dir / "importer" / "data" / "entries_raw.csv",
        help="Ruta a entries_raw.csv",
    )
    parser.add_argument(
        "--curado",
        type=Path,
        default=root_dir / "importer" / "data" / "exercise_candidates_curado.csv",
        help="Ruta al CSV curado de candidatos",
    )
    parser.add_argument(
        "--unmapped-out",
        type=Path,
        default=root_dir / "importer" / "data" / "entries_unmapped.csv",
        help="Ruta de salida para entradas no mapeadas",
    )
    parser.add_argument(
        "--admin-email",
        type=str,
        required=True,
        help="Email del usuario administrador asignado a los entrenos",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ejecuta la importación sin guardar cambios en la BD",
    )

    args = parser.parse_args()

    # Resolver rutas reales con alternativas
    entries_raw_path = resolve_path(
        args.entries_raw,
        [root_dir / "out" / "entries_raw.csv", root_dir / "entries_raw.csv"]
    )
    curado_path = resolve_path(
        args.curado,
        [root_dir / "exercise_candidates_curado.csv", root_dir / "out" / "exercise_candidates_curado.csv"]
    )

    if not entries_raw_path.exists():
        print(f"Error: No se encontró {entries_raw_path}")
        sys.exit(1)

    if not curado_path.exists():
        print(f"Error: No se encontró {curado_path}")
        sys.exit(1)

    print(f"[+] Usando entries_raw: {entries_raw_path}")
    print(f"[+] Usando CSV curado: {curado_path}")

    import os
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL no configurada en .env")
        sys.exit(1)

    engine = create_engine(db_url)

    with Session(engine) as session:
        admin = session.scalar(
            select(User).where(User.email == args.admin_email.strip().lower())
        )
        if not admin:
            print(f"Error: No se encontró ningún usuario con email '{args.admin_email}'")
            sys.exit(1)

        print(f"[+] Usuario destino: {admin.email} (ID: {admin.id})")

        print("[+] Sembrando grupos musculares...")
        muscle_map = seed_muscles(session)

        print("[+] Cargando catálogo de ejercicios y alias...")
        alias_map = seed_catalog(session, curado_path, muscle_map)

        print("[+] Procesando histórico de entrenamientos...")
        unmapped_entries = []
        workouts_created = 0
        exercises_created = 0
        sets_created = 0

        daily_workouts: dict[str, list[dict]] = {}

        with open(entries_raw_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                kind = row.get("kind", "").strip()
                if kind != "ejercicio":
                    continue

                dt_str = row.get("date", "").strip()
                exercise_raw = row.get("raw_text", row.get("name_norm", "")).strip()
                if not dt_str or not exercise_raw:
                    continue

                date_part = dt_str.split("T")[0]
                daily_workouts.setdefault(date_part, []).append(row)

        for date_str, rows in daily_workouts.items():
            performed_on = datetime.strptime(date_str, "%Y-%m-%d").date()

            workout = Workout(
                user_id=admin.id,
                performed_on=performed_on,
                source=DataSource.TELEGRAM_IMPORT,
            )
            session.add(workout)
            session.flush()
            workouts_created += 1

            position = 1
            for row in rows:
                raw_name = row.get("canonical_suggested", row.get("name_norm", "")).strip()
                alias_norm = normalize_text(raw_name)

                exercise_id = alias_map.get(alias_norm)
                if not exercise_id:
                    unmapped_entries.append(row)
                    continue

                workout_ex = WorkoutExercise(
                    workout_id=workout.id,
                    exercise_id=exercise_id,
                    position=position,
                )
                session.add(workout_ex)
                session.flush()
                exercises_created += 1
                position += 1

                load_val = row.get("load_kg", "").strip()
                extra_val = row.get("extra_kg", "").strip()
                assist_val = row.get("assist_kg", "").strip()

                weight_kg = float(load_val) if load_val else None
                extra_kg = float(extra_val) if extra_val else None
                assist_kg = float(assist_val) if assist_val else None

                for set_num in range(1, 4):
                    set_log = SetLog(
                        workout_exercise_id=workout_ex.id,
                        set_number=set_num,
                        reps=8,
                        weight_kg=weight_kg,
                        extra_kg=extra_kg,
                        assist_kg=assist_kg,
                    )
                    session.add(set_log)
                    sets_created += 1

        if unmapped_entries:
            args.unmapped_out.parent.mkdir(parents=True, exist_ok=True)
            with open(args.unmapped_out, "w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=unmapped_entries[0].keys())
                writer.writeheader()
                writer.writerows(unmapped_entries)
            print(f"[!] Se han aislado {len(unmapped_entries)} filas no mapeadas en: {args.unmapped_out}")

        print("\n=== Resumen de Importación ===")
        print(f"Entrenamientos creados: {workouts_created}")
        print(f"Ejercicios asociados:    {exercises_created}")
        print(f"Series creadas (3x8):    {sets_created}")

        if args.dry_run:
            session.rollback()
            print("\n[DRY RUN] Cambios revertidos. Ningún dato fue guardado en la BD.")
        else:
            session.commit()
            print("\n[OK] Importación completada y guardada con éxito en PostgreSQL.")


if __name__ == "__main__":
    main()
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir / "core"))
load_dotenv(root_dir / ".env")

from app.models import Muscle, MUSCLE_GROUPS

def seed_muscles() -> None:
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: Falta DATABASE_URL en el archivo .env")
        sys.exit(1)

    engine = create_engine(db_url)

    with Session(engine) as session:
        count_existing = session.scalar(select(Muscle))
        if count_existing:
            print("El catálogo de músculos ya contiene datos.")
            return

        print("Insertando grupos musculares iniciales...")
        for slug, name in MUSCLE_GROUPS:
            muscle = Muscle(slug=slug, name=name, parent_id=None)
            session.add(muscle)
        
        session.commit()
        print("¡Grupos musculares añadidos con éxito!")

if __name__ == "__main__":
    seed_muscles()
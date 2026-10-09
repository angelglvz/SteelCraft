#!/usr/bin/env python3
"""SteelCraft - Fase 1 del importador: Telegram (HTML) -> CSV de staging.

Uso:
    pip install beautifulsoup4
    python parse_telegram.py exports/messages*.html -o out/

Genera en out/:
    entries_raw.csv         una fila por línea de texto, clasificada y parseada
    exercise_candidates.csv una fila por ejercicio distinto (para curar a mano)

No escribe nada en la base de datos: eso es la fase 2, tras revisar los CSV.
"""
import argparse
import csv
import difflib
import glob
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup

NUM = r"\d+(?:[.,]\d+)?"

RE_HEADER = re.compile(r"^(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b")
RE_LINK = re.compile(r"^https?://")
RE_CARDIO = re.compile(r"^(cardio|cinta|carrera|correr|bici|eliptica|andar|caminata)\b")
RE_MULT = re.compile(rf"(?P<a>{NUM})\s*x\s*(?P<b>{NUM})\s*(?:kg|k)\b")
RE_NO_REPS = re.compile(r"\b(al fallo|series de|plancha)\b")
RE_ASSIST = re.compile(rf"(?:^|[\s,(])-\s*(?P<a>{NUM})\s*(?:kg|k)\b")
RE_LOAD = re.compile(rf"(?P<a>{NUM})\s*(?:\+\s*(?P<b>{NUM}))?\s*(?:kg|k)\b")
RE_EXTRA = re.compile(rf"^\s*\+\s*(?P<b>{NUM})\s*(?:kg|k)\b")
RE_TRAILING = re.compile(rf"^(?P<name>.*[a-z].*?)\s+(?P<a>{NUM})$")
RE_BODYWEIGHT = re.compile(r"\b(dominadas|fondos|plancha|elevaciones de piernas|flexiones)\b")

# Alias seguros (typos y singular/plural). Todo lo demás se cura a mano.
ALIASES = [
    (r"\bmancuerna\b", "mancuernas"), (r"\bmanc\b", "mancuernas"),
    (r"\babductor\b", "abductores"), (r"\baductor\b", "aductores"),
    (r"\bbulgara\b", "bulgaras"), (r"\bsentadilla\b", "sentadillas"),
    (r"\bjalon al pecho\b", "jalon a pecho"),
]

# Sugerencia de grupo muscular: primera regla que coincide. Es un borrador.
GROUP_RULES = [
    ("cardio", r"^(cardio|cinta|carrera|correr|bici|eliptica)"),
    ("triceps", r"triceps|frances|katana|fondos|barras paralelas"),
    ("biceps", r"curl|biceps"),
    ("pecho", r"banca|apertura|pecho|pec deck|cruces"),
    ("espalda", r"jalon|remo|dominadas|pullover|lumbares|peso muerto"),
    ("hombro", r"militar|elevaciones laterales|elevaciones frontales|facepull|deltoides|aguilas|pajaros"),
    ("abdomen", r"crunch|abdominales|oblicuos|plancha|elevaciones de piernas"),
    ("gluteo", r"hip thrust|abductor|patada"),
    ("aductores", r"aductor"),
    ("gemelos", r"gemelo"),
    ("isquios", r"flexion de piernas|femoral|rumano"),
    ("cuadriceps", r"extension de (cuadriceps|piernas)|prensa|sentadilla|bulgara|hack|zancada"),
]


def strip_accents(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def to_float(x):
    return float(x.replace(",", ".")) if x else None


def clean_name(s: str) -> str:
    s = re.sub(r"[°*º]", " ", s)
    s = re.sub(r"[,;:()]+", " ", s)
    s = re.sub(r"[-+]+\s*$", "", s.strip())
    return re.sub(r"\s+", " ", s).strip(" -+")


def canonical(name: str) -> str:
    for pat, rep in ALIASES:
        name = re.sub(pat, rep, name)
    return name


def suggest_group(name: str) -> str:
    for group, pat in GROUP_RULES:
        if re.search(pat, name):
            return group
    return ""


def parse_line(raw: str) -> dict:
    t = strip_accents(raw).strip()
    r = dict(kind="", name_norm="", load_kg=None, extra_kg=None, multiplier=None,
             assist_kg=None, status="ok", note="")
    if RE_HEADER.match(t):
        r["kind"] = "cabecera_dia"; return r
    if RE_LINK.match(t):
        r["kind"] = "enlace"; return r
    if t.startswith("peso barras"):
        r["kind"] = "nota"; r["name_norm"] = clean_name(t)
        r["note"] = "tara de barras/máquinas: útil para interpretar '+ barra'"
        return r
    if RE_CARDIO.match(t):
        r["kind"] = "cardio"; r["name_norm"] = clean_name(t); return r

    if t.startswith("comprar"):
        r["kind"] = "nota"; r["name_norm"] = clean_name(t); return r

    m = RE_MULT.search(t)
    if m:
        a, b = to_float(m["a"]), to_float(m["b"])
        r.update(kind="ejercicio", name_norm=clean_name(t[:m.start()]))
        if a <= 4 and a == int(a):        # "2x30 kg": 2 mancuernas de 30
            r["multiplier"], r["load_kg"] = int(a), b
        elif b <= 4 and b == int(b):      # "15 x 2 kg": 2 mancuernas de 15
            r["multiplier"], r["load_kg"] = int(b), a
        else:
            r["load_kg"], r["status"] = b, "revisar"
            r["note"] = "patron 'N x M kg' ambiguo"
        return r

    m = RE_ASSIST.search(t)
    if m:
        r.update(kind="ejercicio", name_norm=clean_name(t[:m.start()]),
                 assist_kg=to_float(m["a"]))
        return r

    m = RE_LOAD.search(t)
    if m:
        extra = to_float(m["b"])
        rest = t[m.end():]
        m2 = RE_EXTRA.match(rest)
        if m2 and extra is None:
            extra = to_float(m2["b"]); rest = rest[m2.end():]
        r.update(kind="ejercicio", name_norm=clean_name(t[:m.start()]),
                 load_kg=to_float(m["a"]), extra_kg=extra)
        if rest.strip():
            r["status"] = "revisar"; r["note"] = f"texto tras el peso: {rest.strip()}"
        if "asistid" in r["name_norm"]:
            r["assist_kg"], r["load_kg"] = r["load_kg"], None
        return r

    m = RE_TRAILING.match(t)
    if m:
        r.update(kind="ejercicio", name_norm=clean_name(m["name"]), load_kg=to_float(m["a"]))
        r["note"] = "peso sin unidad (se asume kg)"
        return r

    if RE_BODYWEIGHT.search(t):
        r.update(kind="ejercicio", name_norm=clean_name(t), status="sin_carga",
                 note="peso corporal / sin peso anotado")
        return r

    if re.search(r"\d", t) and re.search(r"[a-z]{3}", t):
        r.update(kind="sin_parsear", name_norm=clean_name(t), status="revisar",
                 note="contiene números pero no encaja en ningún patrón")
        return r

    r["kind"] = "nota"; r["name_norm"] = clean_name(t)
    return r


def read_messages(paths):
    seen = set()
    for p in paths:
        soup = BeautifulSoup(Path(p).read_text(encoding="utf-8"), "html.parser")
        for m in soup.select("div.message"):
            if "service" in m.get("class", []):
                continue
            mid = re.sub(r"\D", "", m.get("id", ""))
            if mid in seen:
                continue
            seen.add(mid)
            d, t = m.select_one(".date"), m.select_one(".text")
            if not d or not t:
                continue
            for br in t.find_all("br"):
                br.replace_with("\n")
            dt = datetime.strptime(d["title"][:19], "%d.%m.%Y %H:%M:%S")
            yield Path(p).name, mid, dt, t.get_text()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+", help="messages.html, messages2.html... (admite comodines)")
    ap.add_argument("-o", "--out", default="out")
    ap.add_argument("--sets", type=int, default=3, help="series asumidas por línea (por defecto 3)")
    ap.add_argument("--reps", type=int, default=8, help="repeticiones asumidas por serie (por defecto 8)")
    args = ap.parse_args()

    paths = sorted({p for pat in args.inputs for p in glob.glob(pat)})
    if not paths:
        sys.exit("No se encontró ningún archivo de entrada")
    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)

    rows = []
    for fname, mid, dt, text in read_messages(paths):
        for line in text.split("\n"):
            if not line.strip():
                continue
            r = parse_line(line)
            r["canonical_suggested"] = canonical(r["name_norm"]) if r["kind"] in ("ejercicio", "cardio") else ""
            r["muscle_group_suggested"] = suggest_group(r["canonical_suggested"]) if r["canonical_suggested"] else ""
            if r["kind"] == "ejercicio":
                if RE_NO_REPS.search(strip_accents(line)):
                    r["note"] = (r["note"] + "; " if r["note"] else "") + "series/reps no asumidas"
                else:
                    r["sets"], r["reps"] = args.sets, args.reps
            r.update(data_origin="telegram_estimado", source_file=fname, message_id=mid, date=dt.date().isoformat(),
                     time=dt.strftime("%H:%M:%S"), raw_text=line.strip())
            rows.append(r)

    cols = ["source_file", "message_id", "date", "time", "kind", "raw_text", "name_norm",
            "canonical_suggested", "muscle_group_suggested", "load_kg", "extra_kg",
            "multiplier", "assist_kg", "sets", "reps", "data_origin", "status", "note"]
    with open(out / "entries_raw.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)

    groups = defaultdict(list)
    for r in rows:
        if r["kind"] == "ejercicio":
            groups[r["canonical_suggested"]].append(r)
    frequent = [n for n, rs in groups.items() if len(rs) >= 3]

    def merge_hint(name, n):
        if n >= 3:
            return ""
        m = difflib.get_close_matches(name, [b for b in frequent if b != name], n=1, cutoff=0.86)
        return m[0] if m else ""

    cand_cols = ["canonical_suggested", "muscle_group_suggested", "n_entries", "n_days",
                 "first_date", "last_date", "raw_variants", "merge_suggestion", "canonical_final", "muscle_group_final"]
    with open(out / "exercise_candidates.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cand_cols)
        w.writeheader()
        for name, rs in sorted(groups.items(), key=lambda kv: -len(kv[1])):
            dates = sorted({x["date"] for x in rs})
            variants = " | ".join(v for v, _ in Counter(x["name_norm"] for x in rs).most_common(3))
            w.writerow(dict(canonical_suggested=name, muscle_group_suggested=rs[0]["muscle_group_suggested"],
                            n_entries=len(rs), n_days=len(dates), first_date=dates[0], last_date=dates[-1],
                            raw_variants=variants, merge_suggestion=merge_hint(name, len(rs)),
                            canonical_final="", muscle_group_final=""))

    kinds = Counter(r["kind"] for r in rows)
    days = {r["date"] for r in rows if r["kind"] in ("ejercicio", "cardio")}
    print(f"Archivos: {len(paths)} | líneas: {len(rows)} | días con entreno: {len(days)}")
    print("Por tipo:", dict(kinds))
    print(f"Ejercicios distintos (tras alias): {len(groups)}")
    sin_grupo = [n for n in groups if not suggest_group(n)]
    print(f"Sin grupo muscular sugerido: {len(sin_grupo)}")
    print(f"Líneas a revisar: {sum(1 for r in rows if r['status'] == 'revisar')}")


if __name__ == "__main__":
    main()
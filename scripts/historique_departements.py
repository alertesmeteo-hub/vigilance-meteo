"""Historique quotidien des vigilances par département, lu sur les calendriers publics du site.

Pour chaque mois depuis octobre 2001, la page /departement/XX/AAAA/MM donne, jour par jour, la
couleur maximale et les phénomènes (info-bulle « jeudi 23 janvier 2020 — Rouge : Pluie-inondation »).
On publie departements/XX.json : uniquement les jours jaune, orange ou rouge (les autres sont verts).

Usage : python scripts/historique_departements.py --out build/historique 66 11 34
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://vigilance-meteo.alertes-meteo.com"
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
COULEURS = {"Vert": 1, "Jaune": 2, "Orange": 3, "Rouge": 4}
PHENOMENES = ["Vent violent", "Pluie-inondation", "Orages", "Crues", "Neige-verglas", "Canicule", "Grand froid", "Avalanches", "Vagues-submersion"]
NIVEAUX = {"jaune": 2, "orange": 3, "rouge": 4}
TITRE = re.compile(r'title="[a-zéû]+ (\d{1,2}) ([a-zéû]+) (\d{4}) — (Vert|Jaune|Orange|Rouge) : ([^"]*)"')
NOMS = {
    "66": "Pyrénées-Orientales", "11": "Aude", "09": "Ariège", "12": "Aveyron", "30": "Gard", "31": "Haute-Garonne",
    "32": "Gers", "34": "Hérault", "46": "Lot", "48": "Lozère", "65": "Hautes-Pyrénées", "81": "Tarn", "82": "Tarn-et-Garonne",
}


def lire(url: str) -> str:
    for essai in range(5):
        try:
            with urlopen(Request(url, headers={"User-Agent": "alertes-meteo-historique/1.0"}), timeout=60) as r:
                return r.read().decode("utf-8")
        except Exception as e:  # noqa: BLE001
            print(f"  {url} : {e} (essai {essai + 1})", flush=True)
            time.sleep(5 * (essai + 1))
    raise RuntimeError(f"page illisible : {url}")


def phenomenes(detail: str) -> list[list]:
    """« Pluie-inondation (orange), Orages (jaune) » -> [["Pluie-inondation", 3], ["Orages", 2]] ; 0 = couleur inconnue."""
    out = []
    for morceau in detail.split(", "):
        m = re.match(r"(.+?)(?: \((jaune|orange|rouge|vert)\))?$", morceau.strip())
        if m and m.group(1) in PHENOMENES:
            out.append([m.group(1), NIVEAUX.get(m.group(2) or "", 0)])
    return out


def departement(code: str) -> dict:
    jours: dict[str, list] = {}
    auj = date.today()
    a, m = 2001, 10
    while (a, m) <= (auj.year, auj.month):
        page = html.unescape(lire(f"{BASE}/departement/{code}/{a}/{m}"))
        for j, mois, annee, couleur, detail in TITRE.findall(page):
            d = date(int(annee), MOIS.index(mois) + 1, int(j)).isoformat()
            c = COULEURS[couleur]
            if c >= 2:
                jours[d] = [d, c, phenomenes(detail)]
        m += 1
        if m == 13:
            a, m = a + 1, 1
        time.sleep(0.15)
    lignes = [jours[d] for d in sorted(jours)]
    return {
        "schema_version": 1,
        "department": code,
        "nom": NOMS.get(code, code),
        "debut": "2001-10-01",
        "fin": auj.isoformat(),
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "colonnes": ["date", "couleur (2 jaune, 3 orange, 4 rouge)", "phénomènes [nom, couleur ; 0 = inconnue]"],
        "notes": [
            "Jours verts omis.",
            "Avant fin 2022 : reconstitution vigiscript.fr (non officielle) ; ensuite archive officielle data.gouv.fr.",
            "Phénomènes des jours jaunes connus seulement depuis 2023.",
        ],
        "source": f"{BASE}/departement/{code}",
        "jours": lignes,
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--out", default="build/historique")
    p.add_argument("departements", nargs="+")
    args = p.parse_args()
    out = Path(args.out) / "departements"
    out.mkdir(parents=True, exist_ok=True)
    index = {}
    for code in args.departements:
        data = departement(code)
        if len(data["jours"]) < 100:
            raise RuntimeError(f"{code} : seulement {len(data['jours'])} jours en vigilance, données suspectes")
        (out / f"{code}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        n = {c: sum(1 for j in data["jours"] if j[1] == c) for c in (2, 3, 4)}
        index[code] = {"file": f"departements/{code}.json", "jaune": n[2], "orange": n[3], "rouge": n[4]}
        print(f"{code} : {n[2]} jours jaunes, {n[3]} orange, {n[4]} rouges", flush=True)
    (Path(args.out) / "index.json").write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "departements": index,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())

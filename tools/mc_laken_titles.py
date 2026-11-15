"""Zusatzfeed v5: Spannbettlaken-Titel nach Suchbegriff (15.11.2026).

python tools/mc_laken_titles.py ALT.csv NEU_DE.txt NEU_AT.txt

Search Console 28 Tage: „spannbettlaken“ 28.030 Impressionen, „spannbetttuch“ 4.760; gut die Hälfte mit Größe.
Shop und Zusatzfeed sagten bisher „Spannbetttuch“ (Biber-Laken schon „Spannbettlaken“). Neues Muster:

  <Typ> Spannbettlaken <Größe> <Farbe>[ – bis <X> cm Steghöhe] – <Marke> <Qualität>
  z. B. „Boxspring Jersey Spannbettlaken 180x200-200x220 cm Weiss – biberna Jersey-Elastic-Boxspring“

Steghöhe nur, wo sie im Produkttext steht (Feinjersey 22 cm, Castell Jersey-Stretch 25 cm) – nichts erfinden.
Alle anderen Zeilen und custom_label_0 bleiben unverändert (daran hängt die PMax-Biber-Listing-Gruppe).
Neue Laken-Varianten, die im alten Feed fehlen, bekommen custom_label_0 vom Geschwister-Eintrag desselben Produkts.
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "biberna_ads_autopilot" / "scripts"))

from bestandswaechter import gql, shopify_token

QUERY = """query($c:String){products(first:100,after:$c,query:"product_type:Spannbetttuch status:active"){
 pageInfo{hasNextPage endCursor} nodes{legacyResourceId title vendor descriptionHtml variants(first:100){nodes{legacyResourceId title}}}}}"""
# (Muster im Produkttitel, Typ-Wort vorn, Qualität hinten) – Reihenfolge zählt: spezifisch vor allgemein
TYPES = [
    (r"Feinjersey Kinder", "Kinder Jersey", "Feinjersey"),
    (r"Jersey-Elastic-Boxspring", "Boxspring Jersey", "Jersey-Elastic-Boxspring"),
    (r"Jersey-Elastic-Topper", "Topper Jersey", "Jersey-Elastic-Topper"),
    (r"Jersey-Elastic", "Jersey Elastic", "Jersey-Elastic"),
    (r"Jersey-Stretch", "Jersey Stretch", "Jersey-Stretch"),
    (r"Feinjersey", "Jersey", "Feinjersey"),
    (r"Jersey", "Jersey", "Jersey"),
    (r"Feinbiber-Stretch", "Biber Stretch", "Feinbiber-Stretch"),
    (r"Feinbiber", "Biber", "Feinbiber"),
    (r"Melange-Flanell", "Biber Flanell", "Melange-Flanell"),  # Shop-Tag „Qualität: Biber“
    (r"Frottee", "Frottee", "Frottee-Stretch"),
    (r"Stretchmolton", "Molton Stretch", "Stretchmolton"),
]
MAX_LEN = 150


def brand(product: dict) -> str:
    t = product["title"]
    if t.startswith("Sleep & Protect"):
        return "Sleep & Protect"
    if t.startswith("Castell"):
        return "Castell"
    return "biberna"


def depth(product: dict) -> str | None:
    text = re.sub(r"\s+", " ", re.sub("<[^>]+>", " ", product["descriptionHtml"]))
    m = re.search(r"(?:Matratzenhöhen?|Höhe|Steghöhe)\s*(?:von\s*)?bis(?:\s*zu)?\s*(\d{1,2})\s*cm", text) or \
        re.search(r"bis\s*(\d{1,2})\s*cm\s*(?:Matratzenhöhe|Höhe|Steghöhe)", text)
    return m.group(1) if m else None


def size_of(variant_title: str) -> str:
    part = variant_title.split(" / ")[-1]
    sizes = re.findall(r"\d{2,3}x\d{2,3}", part)
    return ("-".join(sizes[:2]) + " cm") if sizes else part.replace("1x ", "").strip()


def title_for(product: dict, variant: dict) -> str:
    kind, quality = next((k, q) for pat, k, q in TYPES if re.search(pat, product["title"]))
    colour = variant["title"].split(" / ")[0].strip()
    h = depth(product)
    steg = f" – bis {h} cm Steghöhe" if h else ""
    title = f"{kind} Spannbettlaken {size_of(variant['title'])} {colour}{steg} – {brand(product)} {quality}"
    return title[:MAX_LEN]


def fetch() -> list[dict]:
    shop, token = shopify_token()
    out, cursor = [], None
    while True:
        data = gql(shop, token, QUERY, {"c": cursor})["products"]
        out += data["nodes"]
        if not data["pageInfo"]["hasNextPage"]:
            return out
        cursor = data["pageInfo"]["endCursor"]


def main() -> None:
    old, out_de, out_at = (Path(a) for a in sys.argv[1:4])
    rows = list(csv.DictReader(old.open(encoding="utf-8-sig")))
    fields = list(rows[0].keys())
    by_id = {r["id"]: r for r in rows}
    changed = added = 0
    for p in fetch():
        sibling_label = next((by_id[k].get("custom_label_0", "") for k in by_id
                              if k.startswith(f"shopify_ZZ_{p['legacyResourceId']}_")), "")
        for v in p["variants"]["nodes"]:
            fid = f"shopify_ZZ_{p['legacyResourceId']}_{v['legacyResourceId']}"
            new_title = title_for(p, v)
            if fid in by_id:
                if by_id[fid]["title"] != new_title:
                    by_id[fid] = {**by_id[fid], "title": new_title}
                    changed += 1
            else:
                by_id[fid] = {"id": fid, "title": new_title, "size": size_of(v["title"]), "custom_label_0": sibling_label}
                added += 1
    for path in (out_de, out_at):
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(by_id.values())
    print(f"Zeilen gesamt {len(by_id)} | Laken-Titel geändert {changed} | neu {added}")


if __name__ == "__main__":
    main()

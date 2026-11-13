"""Merchant-Center-Zusatzfeed fuer Vorbestell-Varianten.

python tools/mc_preorder_feed.py AUSGABE.csv [--horizon 21]

Holt alle Varianten aktiver Produkte aus Shopify (Admin-GraphQL, Zugang wie im
Bestandswaechter: Client-Credentials aus ../shopify-zolldaten/.env) und schreibt fuer
jede Vorbestell-Variante (inventoryPolicy CONTINUE, Bestand <= 0, Metafeld
custom.wieder_verfuegbar_ab in der Zukunft) eine Zeile:

  id, availability, availability_date, custom_label_1

- availability = preorder + availability_date fuer ALLE Vorbestell-Varianten
  (Google-Pflicht: Verfuegbarkeit muss zur Produktseite passen).
- custom_label_1 = vorbestellung nur, wenn der Termin weiter als --horizon Tage
  entfernt ist. Dieses Label wird in den PMax-Listing-Gruppen ausgeschlossen.
  Alle anderen Zeilen bekommen ein leeres custom_label_1, damit ein frueher
  gesetztes Label nach Wareneingang wieder verschwindet.

custom_label_0 wird hier nie geschrieben (daran haengt die Biber-Listing-Gruppe).
Varianten mit Termin in der Vergangenheit und Bestand <= 0 werden nur gemeldet.
Termine innerhalb von --skip-within Tagen (Standard 7) bleiben draussen: Die Datei wird
von Hand hochgeladen; kommt die Ware, wuerde ein veraltetes "preorder" sonst gegen die
Produktseite ("auf Lager") laufen. Datei deshalb spaetestens alle 7 Tage neu erzeugen.
"""
from __future__ import annotations

import argparse
import csv
import datetime
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

SCRIPTS = Path(__file__).resolve().parents[2] / "biberna_ads_autopilot" / "scripts"
sys.path.insert(0, str(SCRIPTS))

from bestandswaechter import gql, shopify_token

QUERY = """
query($cursor: String) {
  productVariants(first: 250, after: $cursor, query: "product_status:active") {
    pageInfo { hasNextPage endCursor }
    nodes {
      legacyResourceId
      sku
      inventoryPolicy
      inventoryQuantity
      product { legacyResourceId title }
      metafield(namespace: "custom", key: "wieder_verfuegbar_ab") { value }
    }
  }
}
"""
FIELDS = ["id", "availability", "availability_date", "custom_label_1"]


def fetch_variants(shop: str, token: str) -> list[dict]:
    variants, cursor = [], None
    while True:
        data = gql(shop, token, QUERY, {"cursor": cursor})["productVariants"]
        variants.extend(data["nodes"])
        if not data["pageInfo"]["hasNextPage"]:
            return variants
        cursor = data["pageInfo"]["endCursor"]


def parse_date(value: str | None) -> datetime.date | None:
    if not value:
        return None
    try:
        return datetime.date.fromisoformat(value.strip()[:10])
    except ValueError:
        return None


def build_rows(variants: list[dict], today: datetime.date, horizon: int,
               skip_within: int) -> tuple[list[dict], list[dict]]:
    rows, overdue = [], []
    for v in variants:
        due = parse_date((v.get("metafield") or {}).get("value"))
        if v["inventoryPolicy"] != "CONTINUE" or (v["inventoryQuantity"] or 0) > 0 or due is None:
            continue
        feed_id = f"shopify_ZZ_{v['product']['legacyResourceId']}_{v['legacyResourceId']}"
        if due <= today:
            overdue.append({"id": feed_id, "sku": v["sku"], "date": due.isoformat()})
            continue
        days_left = (due - today).days
        if days_left <= skip_within:
            continue
        far = days_left > horizon
        rows.append({
            "id": feed_id,
            "availability": "preorder",
            "availability_date": f"{due.isoformat()}T08:00+01:00",
            "custom_label_1": "vorbestellung" if far else "",
            "_sku": v["sku"],
            "_title": v["product"]["title"],
        })
    return rows, overdue


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output")
    parser.add_argument("--horizon", type=int, default=21)
    parser.add_argument("--skip-within", type=int, default=7,
                        help="Termine in so vielen Tagen weglassen (Datei-Upload veraltet sonst bei Wareneingang)")
    args = parser.parse_args()

    shop, token = shopify_token()
    variants = fetch_variants(shop, token)
    today = datetime.datetime.now(ZoneInfo("Europe/Berlin")).date()
    rows, overdue = build_rows(variants, today, args.horizon, args.skip_within)

    with open(args.output, "w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    far = sum(1 for r in rows if r["custom_label_1"])
    print(f"Varianten aktiv: {len(variants)} | Vorbestellung: {len(rows)} "
          f"(davon > {args.horizon} Tage = Ausschluss: {far}) | Termin ueberfaellig: {len(overdue)}")
    for o in overdue:
        print(f"  ueberfaellig: {o['sku']} Termin {o['date']} ({o['id']})")


if __name__ == "__main__":
    main()

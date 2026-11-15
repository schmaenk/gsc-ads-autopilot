"""Shop: „Spannbetttuch“ -> „Spannbettlaken“ in Produkttitel und SEO-Titel (15.11.2026, Go im Chat).

python tools/shop_laken_rename.py            # Plan zeigen, nichts ändern
python tools/shop_laken_rename.py --apply    # umsetzen, Protokoll tools/shop_laken_rename_2026-11-15.json
python tools/shop_laken_rename.py --revert   # alte Titel/SEO-Titel/Tags aus dem Protokoll zurückschreiben

Grund: Search Console 28 Tage – „spannbettlaken“ 28.030 Impressionen, „spannbetttuch“ 4.760.
Unverändert bleiben: Handle (URL), Produkttyp „Spannbetttuch“ (About-You-Upload, Kollektionsregeln), Beschreibung.
Zusätzlicher Tag „Spannbetttuch“, damit die Shop-Suche das alte Wort weiter findet.
Geprüft am 15.11.: Laken-Kollektionen hängen am Tag „Kategorie: Spannbettlaken“; Titel-Regeln (feinbiber, melange,
Topper, Molton) prüfen Wörter, die erhalten bleiben; XXXL mappt über die ERP-Gruppe, nicht den Shopify-Titel.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "biberna_ads_autopilot" / "scripts"))

from bestandswaechter import gql, shopify_token

LOG = Path(__file__).resolve().parent / "shop_laken_rename_2026-11-15.json"
OLD, NEW, TAG = "Spannbetttuch", "Spannbettlaken", "Spannbetttuch"
QUERY = """{products(first:100,query:"product_type:Spannbetttuch"){nodes{id title handle status tags seo{title}}}}"""
MUTATION = """mutation($p:ProductUpdateInput!){productUpdate(product:$p){product{id title handle tags seo{title}}
 userErrors{field message}}}"""


def plan(shop: str, token: str) -> list[dict]:
    items = []
    for p in gql(shop, token, QUERY, {})["products"]["nodes"]:
        if OLD not in p["title"] and OLD not in (p["seo"]["title"] or ""):
            continue
        items.append({
            "id": p["id"], "handle": p["handle"], "status": p["status"],
            "before": {"title": p["title"], "seo_title": p["seo"]["title"], "tags": p["tags"]},
            "after": {"title": p["title"].replace(OLD, NEW),
                      "seo_title": re.sub(OLD, NEW, p["seo"]["title"]) if p["seo"]["title"] else None,
                      "tags": sorted(set(p["tags"]) | {TAG})},
        })
    return items


def write(shop: str, token: str, pid: str, state: dict) -> dict:
    payload = {"id": pid, "title": state["title"], "tags": state["tags"]}
    if state["seo_title"] is not None:
        payload["seo"] = {"title": state["seo_title"]}
    res = gql(shop, token, MUTATION, {"p": payload})["productUpdate"]
    if res["userErrors"]:
        raise RuntimeError(f"{pid}: {res['userErrors']}")
    return res["product"]


def main() -> None:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--revert", action="store_true")
    args = parser.parse_args()
    shop, token = shopify_token()

    if args.revert:
        for item in json.loads(LOG.read_text(encoding="utf-8"))["items"]:
            write(shop, token, item["id"], item["before"])
            print("zurück:", item["before"]["title"])
        return

    items = plan(shop, token)
    for item in items:
        b, a = item["before"], item["after"]
        print(f"{b['title']}\n  -> {a['title']}\n  SEO: {b['seo_title']!r} -> {a['seo_title']!r}")
    print(f"{len(items)} Produkte")
    if not args.apply:
        return
    done = []
    try:
        for item in items:
            result = write(shop, token, item["id"], item["after"])
            done.append({**item, "result": result})
    finally:
        LOG.write_text(json.dumps({"items": done}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"umgesetzt: {len(done)} – Protokoll {LOG.name}")


if __name__ == "__main__":
    main()

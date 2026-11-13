"""Merchant-Center-Titelfeed v3: Biber-Familie mit Suchbegriff-first-Titeln.

python tools/mc_title_feed.py ALT.csv NEU.csv

Liest den bestehenden Zusatzfeed (id,title,size), holt die Biber-Familie aus dem
oeffentlichen Shopify-Katalog und ersetzt bzw. ergaenzt deren Zeilen nach dem Muster

  Biber Bettwaesche 135x200 Salbei - biberna Feinbiber, 100 % Baumwolle
  Biber Spannbettlaken 90x200 Weiss - biberna Feinbiber
  Biber Kinderbettwaesche 100x135 Zootiere - biberna Feinbiber

Alle anderen Zeilen bleiben unveraendert. Keine Herkunftsaussagen im Titel.
"""
import csv
import io
import json
import re
import sys
import time
import urllib.request

SHOP = "https://www.biberna.de"
COLLECTIONS = ["bettwasche-biber", "bettwasche-biber-155x220", "bettwasche-biber-155x200",
               "kinderbettwasche-biber", "spannbettlaken-biber"]
MAX_LEN = 150


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def catalog():
    seen = {}
    for c in COLLECTIONS:
        page = 1
        while True:
            d = fetch(f"{SHOP}/collections/{c}/products.json?limit=250&page={page}")["products"]
            for p in d:
                seen[p["id"]] = p
            if len(d) < 250:
                break
            page += 1
            time.sleep(1.2)
        time.sleep(1.2)
    return list(seen.values())


def tag(p, key):
    for t in p.get("tags", []):
        if t.lower().startswith(key.lower() + ":"):
            return t.split(":", 1)[1].strip()
    return ""


def quality_word(p):
    q = tag(p, "Qualität")
    if "flanell" in q.lower():
        return "Flanell", "Melange-Flanell"
    if "biber" in q.lower() or "biber" in tag(p, "QualGruppe").lower():
        t = p["title"].lower()
        if "polycotton" in t:
            return "Biber", "Polycotton-Biber"   # Mischgewebe, keine Baumwoll-Aussage
        fein = "Feinbiber-Stretch" if "stretch" in t else "Feinbiber"
        return "Biber", fein
    return None, None


def product_kind(p):
    pt = (p.get("product_type") or "").lower()
    kat = tag(p, "Kategorie").lower()
    if "kinder" in p["title"].lower() or "kinder" in kat:
        return "Kinderbettwäsche"
    if pt == "garnitur":
        return "Bettwäsche"
    if pt in ("spannbetttuch", "betttuch"):
        return "Spannbettlaken" if pt == "spannbetttuch" else "Betttuch"
    if "kissenbezug" in pt or "kissen" in pt:
        return "Kissenbezug"
    if "auflage" in pt or "schoner" in pt:
        return "Matratzenschoner"
    return None


def dessin(p):
    """Dessin/Motiv = alles hinter dem Produktart-Wort, ohne Artikelnummer."""
    t = re.sub(r"\(\d{6,7}\)\s*$", "", p["title"]).strip()
    m = re.search(r"(Kinderbettwäsche|Bettwäsche|Spannbetttuch|Betttuch|Kissenbezug|Matratzenschoner|Matratzenauflage)\s*(.*)$", t, flags=re.I)
    t = m.group(2) if m else re.sub(r"^(biberna|Castell)\s+", "", t, flags=re.I)
    t = t.replace("–", " ").replace("-", " ") if " – " in t else t.replace("–", " ")
    t = re.sub(r"^Polycotton\s+Biber\s*", "", t, flags=re.I)
    t = re.sub(r"\s{2,}", " ", t).strip(" -")
    return t


def size_short(opt):
    pairs = re.findall(r"(\d{2,3})\s*x\s*(\d{2,3})", opt or "")
    if not pairs:
        return ""
    if len(pairs) >= 2 and " - " in (opt or ""):
        (w1, l1), (w2, l2) = pairs[0], pairs[1]
        if int(l2) - int(l1) == 10:            # 90x190 - 100x200 passt fuer 90x200 und 100x200
            return f"{w1}x{l2} / {w2}x{l2}"
        return f"{w1}x{l1} / {w2}x{l2}"
    return f"{pairs[0][0]}x{pairs[0][1]}"


def build_title(p, v):
    qword, qname = quality_word(p)
    kind = product_kind(p)
    if not qword or not kind:
        return None
    color = v.get("option1") or ""
    size = size_short(v.get("option2") or v.get("option1") or "")
    if "x" not in size:
        size = size_short(v.get("option1") or "")
        color = v.get("option2") or ""
    des = dessin(p)
    norm = lambda s: re.sub(r"[\s\-/]", "", s.lower())
    if color and norm(color) in norm(des):
        color = ""
    brand = "Castell" if p["title"].lower().startswith("castell") else "biberna"
    parts = [f"{qword} {kind}", size, des, color]
    head = " ".join(x for x in parts if x).strip()
    des = re.sub(r"^Polycotton\s+Biber\s*", "", des, flags=re.I)
    tail = f"{brand} {qname}"
    # 100 % Baumwolle nur fuer biberna-Feinbiber (facts.yaml); Castell-Zusammensetzung nicht verifiziert
    if kind in ("Bettwäsche", "Kinderbettwäsche") and qname == "Feinbiber" and brand == "biberna":
        tail += ", 100 % Baumwolle"
    title = f"{head} - {tail}"
    title = re.sub(r"\s{2,}", " ", title)
    return title[:MAX_LEN]


def main():
    old_path, new_path = sys.argv[1], sys.argv[2]
    raw = open(old_path, "rb").read()
    enc = "utf-16" if raw[:2] in (b"\xff\xfe", b"\xfe\xff") else "utf-8-sig"
    rows = list(csv.reader(raw.decode(enc).splitlines()))
    header, body = rows[0], rows[1:]
    if "custom_label_0" not in header:
        header = header + ["custom_label_0"]
        body = [r + [""] for r in body]
    by_id = {r[0]: r for r in body}

    prods = catalog()
    changed, added, skipped = 0, 0, []
    for p in prods:
        for v in p["variants"]:
            vid = f"shopify_ZZ_{p['id']}_{v['id']}"
            title = build_title(p, v)
            if not title:
                skipped.append(p["title"])
                continue
            size_full = (v.get("option2") or v.get("option1") or "")
            label = "biber" if title.startswith("Biber ") else "flanell"
            if vid in by_id:
                if by_id[vid][1] != title or by_id[vid][3] != label:
                    by_id[vid][1] = title
                    by_id[vid][3] = label
                    changed += 1
            else:
                by_id[vid] = [vid, title, size_full, label]
                added += 1
    out = [header] + list(by_id.values())
    with io.open(new_path, "w", encoding="utf-8", newline="") as f:
        csv.writer(f).writerows(out)
    print(f"Produkte Biber-Familie: {len(prods)}; Titel geaendert: {changed}; neu: {added}; "
          f"uebersprungen: {len(set(skipped))} Produkte; Zeilen gesamt: {len(out)-1}")
    for t in sorted(set(skipped)):
        print("  uebersprungen:", t)
    # Beispiele
    ex = [r for r in out[1:] if r[1].startswith(("Biber", "Flanell"))]
    for r in ex[:12]:
        print("  ", r[1])
    too_long = [r for r in out[1:] if len(r[1]) > MAX_LEN]
    print("zu lang:", len(too_long))


if __name__ == "__main__":
    main()

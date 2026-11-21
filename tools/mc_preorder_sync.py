"""Taeglicher Abgleich Vorbestellungen -> Merchant Center per SFTP.

python tools/mc_preorder_sync.py [--dry-run] [--check]

1. Holt die Vorbestell-Varianten aus Shopify (Logik aus mc_preorder_feed.py).
2. Schreibt sie tabulatorgetrennt nach tools/out/<REMOTE_NAME>.
3. Laedt die Datei per SFTP auf partnerupload.google.com hoch, einmal je Feedlabel
   (REMOTE_NAMES). Das Merchant Center verarbeitet je Dateinamen eine Zusatzquelle.

Weil die Datei jeden Morgen neu entsteht, bleiben auch Termine der naechsten Tage
drin (--skip-within 0): Kommt Ware an, ist der Bestand > 0 und die Zeile faellt
beim naechsten Lauf heraus, Google nimmt dann wieder den Wert aus Shopify.

Zugang: MC_SFTP_USER / MC_SFTP_PASSWORD aus ../.env (nie im Repo).
--check  baut nur die SFTP-Verbindung auf und listet das Verzeichnis.
--dry-run erzeugt die Datei, laedt aber nichts hoch.
Protokoll: tools/out/mc_preorder_sync.log
"""
from __future__ import annotations

import argparse
import datetime
import logging
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

import paramiko

sys.path.insert(0, str(Path(__file__).resolve().parent))

from mc_preorder_feed import FIELDS, build_rows, fetch_variants, shopify_token

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "tools" / "out"
ENV_PATH = ROOT / ".env"
REMOTE_NAME = "biberna_vorbestellung_sftp.txt"
# Ein Zusatzfeed haengt im Merchant Center an genau einem Feedlabel. Dieselbe Datei
# wird deshalb unter einem Namen je Feedlabel hochgeladen (je eine SFTP-Zusatzquelle im MC).
REMOTE_NAMES = {
    "EUR_111841149259": REMOTE_NAME,                        # DE
    "EUR_114747670859": "biberna_vorbestellung_sftp_AT.txt",
    "CHF_114747507019": "biberna_vorbestellung_sftp_CH.txt",
    "EUR_118086959435": "biberna_vorbestellung_sftp_NL.txt",
    "EUR_118093807947": "biberna_vorbestellung_sftp_BE.txt",     # BE nl
    "EUR_118093807947 fr": "biberna_vorbestellung_sftp_BE_fr.txt",  # BE fr (eigene Quelle, eigener Dateiname)
    "EUR_118530638155": "biberna_vorbestellung_sftp_FR.txt",
    "USD_117802074443": "biberna_vorbestellung_sftp_US.txt",
}
SFTP_HOST = "partnerupload.google.com"
SFTP_PORT = 19321
HORIZON_DAYS = 21
LOG = logging.getLogger("mc_preorder_sync")


def read_env(path: Path) -> dict[str, str]:
    values = {}
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


def sftp_credentials() -> tuple[str, str]:
    env = read_env(ENV_PATH)
    user, password = env.get("MC_SFTP_USER", ""), env.get("MC_SFTP_PASSWORD", "")
    if not user or not password:
        raise RuntimeError(f"MC_SFTP_USER/MC_SFTP_PASSWORD fehlen in {ENV_PATH}")
    return user, password


def open_sftp() -> tuple[paramiko.Transport, paramiko.SFTPClient]:
    user, password = sftp_credentials()
    transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
    transport.connect(username=user, password=password)
    return transport, paramiko.SFTPClient.from_transport(transport)


def write_tsv(rows: list[dict], path: Path) -> None:
    lines = ["\t".join(FIELDS)] + ["\t".join(r[f] for f in FIELDS) for r in rows]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")


def build_file() -> Path:
    shop, token = shopify_token()
    variants = fetch_variants(shop, token)
    today = datetime.datetime.now(ZoneInfo("Europe/Berlin")).date()
    rows, overdue = build_rows(variants, today, HORIZON_DAYS, skip_within=0)
    if not variants:
        raise RuntimeError("Shopify lieferte 0 Varianten - Abbruch, nichts hochgeladen")
    path = OUT_DIR / REMOTE_NAME
    write_tsv(rows, path)
    far = sum(1 for r in rows if r["custom_label_1"])
    LOG.info("Varianten %d | Vorbestellung %d | Label vorbestellung %d | ueberfaellig %d",
             len(variants), len(rows), far, len(overdue))
    for o in overdue:
        LOG.warning("Termin ueberfaellig, Bestand <= 0: %s (%s)", o["sku"], o["date"])
    return path


def upload(path: Path) -> None:
    transport, sftp = open_sftp()
    try:
        for label, remote in REMOTE_NAMES.items():
            sftp.put(str(path), remote)
            LOG.info("Hochgeladen: %s -> %s (%d Bytes)", label, remote, sftp.stat(remote).st_size)
    finally:
        sftp.close()
        transport.close()


def check() -> None:
    transport, sftp = open_sftp()
    try:
        LOG.info("SFTP-Verbindung ok, Dateien: %s", sftp.listdir("."))
    finally:
        sftp.close()
        transport.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    OUT_DIR.mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[logging.FileHandler(OUT_DIR / "mc_preorder_sync.log", encoding="utf-8"),
                  logging.StreamHandler()],
    )
    try:
        if args.check:
            check()
            return
        path = build_file()
        if not args.dry_run:
            upload(path)
    except Exception:
        LOG.exception("Abgleich fehlgeschlagen")
        sys.exit(1)


if __name__ == "__main__":
    main()

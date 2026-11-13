# GSC → Google Ads Autopilot — Einrichtung

Reihenfolge einhalten. Abschnitt A muss vollständig fertig sein, bevor das
Ads Script erstmals läuft — es bricht sonst mit einer klaren Meldung ab.

Kernprinzip: **Alles wird pausiert angelegt.** Kein Skript erzeugt Kampagnen
oder Budgets. Die einzige Budget-Obergrenze ist die, die du in Abschnitt A
selbst setzt.

---

## A) Google Ads vorbereiten (manuell, einmalig)

### A1 — Kampagne anlegen

Kampagnen → **+** → Ziel *Verkäufe* → Kampagnentyp **Suche**

| Feld | Wert |
|---|---|
| Name | `Search \| Generic \| DE` (exakt, das Skript sucht danach) |
| Gebotsstrategie | **Manueller CPC** — kein Smart Bidding |
| Tagesbudget | **10 €** zum Start |
| Standort | Deutschland |
| Sprache | Deutsch |
| Suchnetzwerk-Partner | **aus** |
| Display-Ausweitung | **aus** |
| Status nach Anlage | **pausiert** |

> **Stand 12.09.2026, im Konto geprüft (Konto 483-667-3168):** Die Kampagne heißt
> seit dem 10.09.2026 `Search | Generic | DE` — umbenannt aus dem ursprünglichen
> Namen nach der Struktur aus `sea-autopilot/STRATEGIE.md`. Sie ist inzwischen
> **aktiv**, nicht mehr pausiert: 10 €/Tag, manueller CPC, in den letzten
> 30 Tagen 391 Impressionen, 35 Klicks, 6,52 € Kosten, 0 Conversions. Die
> Tabelle oben beschreibt die Ersteinrichtung, nicht den heutigen Zustand.

> Manueller CPC ist Absicht, kein Übergangszustand. Bei ~50 % Bestellungen ohne
> Session-Zuordnung sind die Conversion-Daten im Konto systematisch
> untererfasst — tROAS/tCPA würden auf falschen Zahlen optimieren. Erst wenn
> die Checkout-Messlücke geschlossen ist, wird Smart Bidding sinnvoll.

Google verlangt bei der Anlage mindestens eine Anzeigengruppe. Lege eine
Platzhalter-Gruppe `AG | platzhalter` an und **pausiere sie**. Das Skript
erzeugt seine eigenen Gruppen und lässt diese unangetastet.

### A1b — Final-URL-Suffix (gesetzt 09.09.2026)

Kampagneneinstellungen → *Weitere Einstellungen* → **URL-Optionen für die
Kampagne** → Feld *Suffix der finalen URL*:

```
utm_source=google&utm_medium=cpc&utm_campaign=gsc-autopilot
```

Ohne diesen Suffix ist die Kampagne in der Shopify-Auswertung unsichtbar: Laut
[[project-biberna-cro-datenqualitaet]] zeigt `referrer_source` für paid nur 4
Sessions, während `utm_source`/`utm_medium` 521 liefern — gemessen wird also
über UTM. `utm_campaign=gsc-autopilot` erlaubt zusätzlich, diese Kampagne
getrennt von PMax auszuwerten.

Kein Widerspruch zur URL-Bereinigung im Code: Der Collector entfernt die
**organischen** Parameter, die GSC in der Seiten-URL mitliefert
(`utm_medium=product_sync`); Google Ads hängt die **bezahlten** an. Umgekehrt
wäre es falsch.

---
### A2 — Zwei Ausschlusslisten anlegen

Tools → Gemeinsame Bibliothek → **Ausschließende Keyword-Listen** → **+**

| Liste | Inhalt | Verknüpfen mit |
|---|---|---|
| `Global Negatives` | dauerhafte Ausschlüsse, Stand 08.09.2026 als Broad: `gebraucht`, `kostenlos`, `gratis`, `ebay`, `kleinanzeigen`, `reparatur`, `job`, `karriere` | **allen** Kampagnen, auch der Autopilot-Kampagne |
| `PMax Carve-Out` | leer lassen — das Skript pflegt sie | **nur den PMax-Kampagnen** |

> **Google speichert keine leere Ausschlussliste** — das Formular verlangt mindestens
> ein Keyword. Beide Listen enthalten deshalb je einen wirkungslosen Platzhalter:
> `[zzz platzhalter carve out]` bzw. `[zzz platzhalter global]`, beide Exact Match.
> Diese Begriffe haben null Suchvolumen und blockieren nichts Reales. Nicht löschen —
> sonst ist die Liste wieder leer und Google verwirft sie.

> **Vorsicht bei Erweiterungen von `Global Negatives`:** Die Liste hängt auch an
> `Performance Max-1` (aktiv, 100 €/Tag). Jeder neue Begriff verändert dort sofort die
> Auslieferung. Zurückhaltung bei Begriffen, die kaufnahen Traffic tragen können —
> `erfahrungen`, `anleitung`, `nähen`, `pdf`. Die gehören in den `blocklist`-Tab des
> Sheets, der nur Kandidaten filtert und PMax nicht berührt.

**Der wichtigste Schritt der ganzen Einrichtung:** `PMax Carve-Out` darf
**nicht** mit `Search | Generic | DE` verknüpft werden. Sonst schließt
die Kampagne genau die Keywords aus, die sie bebuchen soll — und liefert
lautlos nichts aus. Das Skript prüft das bei jedem Start und bricht ab, falls
die Verknüpfung doch existiert.

So funktioniert die Aufteilung: Exact-Match-Keywords haben in der Auktion
Priorität vor PMax. Zusätzlich sind genau diese Begriffe für PMax gesperrt.
Damit gehört jede Suchanfrage eindeutig einer Kampagne — kein Ad-Rank-Duell
zwischen deinen eigenen Kampagnen.

### A3 — Label anlegen

Keywords → Label-Spalte → **+** → `gsc-autopilot`

Alles vom Skript Erzeugte wird damit markiert. Damit kannst du jederzeit
filtern, auswerten oder in einem Zug entfernen.

> **Nicht optional, und ursprünglich falsch dokumentiert.** `applyLabel()`
> erzeugt kein Label — es scheitert, wenn der Name im Konto nicht existiert,
> und reißt den ganzen Lauf mit. Genau daran ist der erste Vorschau-Lauf am
> 08.09.2026 nach der ersten Anzeigengruppe gestorben: zwei Änderungen,
> dann Abbruch ohne Keywords.
>
> Das Skript prüft seit dem Fix in `resolveLabelReadiness_()` über
> `labelExists_()`, ob das Label vorhanden ist; im echten Lauf legt es das Label
> selbst an, und wenn es fehlt, wird nur das Labeln übersprungen statt den Lauf
> mitzureißen. Im **Vorschau-Modus** wendet Google Ads `createLabel` aber nicht
> wirklich an — dort erscheinen dann Label-Warnungen im Log. Wer die Vorschau
> sauber sehen will, legt das Label vorher manuell an.
>
> Wichtig bleibt es trotzdem: `countAutopilotKeywords_()` zählt den
> Revier-Deckel (100 Keywords) über dieses Label. Ohne Label zählt der Deckel
> zu niedrig.

---

## B) Google Sheet anlegen

Neues Sheet, **drei Tabs mit exakt diesen Namen**:

| Tab | Zweck |
|---|---|
| `gsc_candidates` | wird bei jedem Lauf vom Collector überschrieben |
| `blocklist` | Spalte A, ein Begriff pro Zeile, keine Kopfzeile |
| `changelog` | Protokoll aller Änderungen, wird nur angehängt |

**Angelegt am 08.09.2026** unter `mschmaenk@biberna.de`, Name `GSC Ads Autopilot`:

| | |
|---|---|
| Sheet-ID (für `SHEET_ID` in den Script Properties) | `10gJEzsH9pCqCqCfLFnvbycK89_fjdE_2Vkq9U5VDAhc` |
| Sheet-URL (bereits in `ads-writer.js` eingetragen) | https://docs.google.com/spreadsheets/d/10gJEzsH9pCqCqCfLFnvbycK89_fjdE_2Vkq9U5VDAhc/edit |

Die drei Tabs sind angelegt, `blocklist` ist mit den 16 Startbegriffen gefüllt.

Startbestückung für `blocklist` — je Zeile ein Eintrag:

```
kostenlos
gratis
gebraucht
ebay
kleinanzeigen
reparatur
anleitung
naehen
nähen
selber machen
job
karriere
pdf
erfahrungen
grosshandel
großhandel
```

**Veto-Mechanismen — Korrektur (09.09.2026):**

Die `override`-Spalte in `gsc_candidates` (Spalte L) wirkt **nur zwischen zwei
Läufen desselben Montags**: Der Collector leert den Tab bei jedem Lauf
(`sheet.clear()`), ein `skip` überlebt also nur das Fenster zwischen 05:00
(Collector) und 07:00 (Writer). Als dauerhaftes Veto ist sie ungeeignet.

Das **dauerhafte Veto ist der `blocklist`-Tab**: Jeder Begriff dort verwirft
Kandidaten schon im Collector (Regel R6), bei jedem Lauf, ohne PMax zu berühren.
Wer ein Thema nie bewerben will, trägt die Begriffe hier ein.

Bereits angelegte Keywords, die nicht laufen sollen, **pausiert lassen, nicht
entfernen** — pausierte Keywords zählen im Dedup-Abgleich weiter, entfernte
nicht. Ein entferntes Keyword käme beim nächsten Lauf zurück.

---

## C) Shopify — entfällt

**Kein Token, keine Custom App nötig.** Die Sortimentsdaten kommen vom
öffentlichen Storefront-Endpunkt `https://www.biberna.de/products.json`.

Hintergrund: Shopify hat Custom Apps ins Dev Dashboard verlagert. Dort gibt es
keinen statischen Admin-API-Token mehr — der angebotene
„App-Automatisierungstoken" ist ein CI/CD-Credential mit Ablaufdatum und
authentifiziert nicht gegen den Shop, und `shpss_` ist ein Storefront-Token
ohne Zugriff auf Bestände.

`/products.json` liefert genau die benötigten Felder und hat drei Vorteile:

- keine Authentifizierung, also kein Token, das ablaufen oder rotiert werden muss
- nur aktive **und** im Onlineshop veröffentlichte Produkte — genau die Menge,
  für die geworben werden soll
- `available` pro Variante berücksichtigt „Verkauf bei ausverkauftem Bestand
  fortsetzen", ist für die Frage „kann das jemand kaufen?" also genauer als ein
  reiner Bestandswert

Geprüft am 08.09.2026: **309 aktive Produkte** auf 2 Seiten, davon **58
komplett ausverkauft** (19 %) — genau die, die Regel R7 aussortiert.

Grenze: Der Endpunkt ist öffentlich. Bekäme der Shop einen Passwortschutz,
liefert er kein JSON mehr — `fetchShopifyCatalog_()` bricht dann mit klarer
Meldung ab, ebenso wenn weniger als 50 Produkte zurückkommen.

---

## D) Apps Script einrichten (Collector)

> **FERTIG — erster erfolgreicher Lauf am 08.09.2026, 16:17 (6,1 s).**
>
> | | |
> |---|---|
> | Projekt | `gsc-collector` unter `mschmaenk@biberna.de` |
> | Script-ID | `1SK8qS8rsmC86la39APYkH6lmXKI6aeZAVEHTw_dbzscnd-87GaZ_ZT91` |
> | Cloud-Projekt | `biberna-gsc-autopilot` / `445381628046`, verknüpft |
> | OAuth | Zustimmungsbildschirm vollständig, **In Produktion**, Freigabe erteilt |
> | Script Property | `SHEET_ID` gesetzt |
> | Ergebnis | 4 Kandidaten im Sheet |
>
> **Trigger eingerichtet, am 12.09.2026 im Projekt geprüft:** Funktion `main`,
> zeitgesteuert, Wochentimer, **jeden Montag 5:00–6:00 Uhr**. Der erste
> automatische Lauf ist Montag, der 14.09.2026 — die drei Einträge im
> Ausführungsprotokoll stammen alle vom 08.09. und wurden von Hand im Editor
> gestartet, deshalb steht beim Trigger noch „zuletzt ausgeführt: –“.
>
> **Regelwerk-Fixes aus dem ersten Lauf (08.09.2026)** — der Rohlauf lieferte 22
> Zeilen, davon 18 unbrauchbar. Vier Ursachen, alle behoben und gegen die echten
> Daten nachgeprüft (4 Kandidaten bleiben, alles andere fällt korrekt weg):
>
> | Befund | Fix |
> |---|---|
> | `schmänk bettwäsche` und `castell …` kamen durch | `BRAND_PATTERN` um `schm(ä\|ae)nk` und `castell` erweitert |
> | eine Landingpage trug `utm_medium=product_sync` — hätte bezahlten Traffic als Shopping-Eintrag verbucht | `cleanPageUrl_()` in `gsc.gs` **und** `canonicalizeUrl_()` in `ads-writer.js` schneiden Query und Fragment ab |
> | 14 Zeilen mit 1 Impression / CTR 100 % als R3-Flag | `MIN_IMPRESSIONS_R3: 50` |
> | `gute qualität` passierte R6, weil Tag-Schlüssel wie `Qualität:` im Vokabular landeten | in `buildVocabulary_()` wird nur der Teil **nach** dem `:` verwendet |
>
> Die URL-Bereinigung sitzt absichtlich an **beiden** Stellen: der Collector
> normalisiert, damit dieselbe Produktseite mit und ohne `?variant=` nicht zwei
> Anzeigengruppen erzeugt; das Ads Script sichert nach, weil dort der Schaden
> entstünde.
>
> **Bei R3 feuert bei diesem Traffic nichts mehr** — der stärkste Kandidat hatte
> 29 Impressionen. Das ist gewollt (R3 ist ein Warnmechanismus, kein Treiber).
> Wer ihn sehen will, setzt die Schwelle auf 20.

1. [script.google.com](https://script.google.com) → **Neues Projekt** →
   umbenennen in `gsc-collector`

   **Achte auf das Konto:** Es muss `mschmaenk@biberna.de` sein — im Chrome das
   zweite Konto (`/u/1`). Das private googlemail-Konto hat keinen Zugriff auf
   die Search-Console-Property.

2. Projekteinstellungen → **„appsscript.json"-Manifestdatei im Editor anzeigen**
   aktivieren

3. Dateien aus `apps-script/` übertragen. Für jede `.gs`-Datei im Editor eine
   neue Skriptdatei mit demselben Namen anlegen:

   | Datei | Inhalt |
   |---|---|
   | `appsscript.json` | Manifest inkl. OAuth-Scopes — vorhandenen Inhalt ersetzen |
   | `config.gs` | Konfiguration und Regelparameter |
   | `gsc.gs` | Search-Console-Abruf |
   | `shopify.gs` | Produktvokabular und Bestand |
   | `rules.gs` | Regelwerk R1–R8 |
   | `Code.gs` | Entrypoint `main()` |

4. Projekteinstellungen → **Skripteigenschaften** → **ein** Eintrag:

   | Eigenschaft | Wert |
   |---|---|
   | `SHEET_ID` | `10gJEzsH9pCqCqCfLFnvbycK89_fjdE_2Vkq9U5VDAhc` |

5. **Erster Test:** Funktion `listGscProperties` auswählen → *Ausführen* →
   OAuth-Zustimmung erteilen. Im Ausführungsprotokoll muss stehen:

   ```
   URL-PRAEFIX  https://www.biberna.de/   (siteOwner)
   ```

   Damit sind Konto, Scope und Property in einem Schritt bestätigt.

6. **Zweiter Test:** Funktion `main` ausführen. Erwartung im Protokoll:
   Zeilenanzahl aus GSC, Produktanzahl aus Shopify, geschriebene Kandidaten.
   Danach `gsc_candidates` im Sheet prüfen — die Spalten `rule`, `reason` und
   `score` sagen dir, warum jede Zeile drinsteht.

   **Erst weitermachen, wenn die Kandidatenliste plausibel aussieht.** Das ist
   der eigentliche Qualitätscheck der ganzen Pipeline.

7. ~~Trigger (Uhr-Symbol) → Auslöser hinzufügen: Funktion `main`,
   zeitgesteuert, **wöchentlich, Montag, 05:00–06:00**~~ — **erledigt**,
   siehe Statuskasten oben.

---

## D2) Google-Cloud-Projekt verknüpfen (zwingend)

Apps Script hängt jedes Projekt an ein selbst verwaltetes Cloud-Projekt. Für die
meisten Google-APIs genügt das — die **Search Console API muss aber explizit
aktiviert werden**, und im verwalteten Standardprojekt geht das nicht: Es liefert
„Sie benötigen zusätzliche Zugriffsrechte". Ohne diesen Schritt endet jeder Lauf mit:

```
GSC API 403 - ... "Google Search Console API has not been used in project
<nummer> before or it is disabled."
```

Es gibt keine Abkürzung: In der Liste der erweiterten Apps-Script-Dienste
(AdSense, BigQuery, Drive, Gmail, Analytics, Calendar …) ist **keine Search
Console API** enthalten — geprüft 08.09.2026.

**Angelegt am 08.09.2026:**

| | |
|---|---|
| Projektname / Projekt-ID | `biberna-gsc-autopilot` |
| **Projektnummer** | **445381628046** |
| Organisation | keine |
| Abrechnung | keine, wird auch nicht gebraucht |

**Erledigt am 08.09.2026:**

- Search Console API im Projekt aktiviert
- OAuth-Zustimmungsbildschirm konfiguriert: Anwendungsname `gsc-collector`,
  Support- und Kontakt-E-Mail `mschmaenk@biberna.de`, Nutzertyp **Extern**,
  Status **Test**

> **Warum Extern:** `mschmaenk@biberna.de` ist kein Google-Workspace-Konto,
> sondern ein normales Google-Konto mit eigener Domain. „Intern" ist damit
> gesperrt — Google meldet: „Da Sie kein Google Workspace-Nutzer sind, können
> Sie die Anwendung nur für externe Nutzer zur Verfügung stellen."

**Erledigt am 08.09.2026 — Verknüpfung im Apps Script** (Ablauf zur Referenz):

Apps Script → **Projekteinstellungen** → *Google Cloud Platform (GCP)* →
**„Projekt ändern"** → `445381628046` → **„Projekt festlegen"**.

Danach muss unter *GCP* das Projekt stehen, **nicht mehr „Standard"**. Erst dann
`listGscProperties` ausführen; dabei kommt einmalig eine neue OAuth-Freigabe
(„Erweitert" → „gsc-collector öffnen (unsicher)" → „Zulassen").

**Erledigt am 08.09.2026 — Branding vervollständigt** (Ablauf zur Referenz,
falls das Projekt einmal neu aufgesetzt werden muss):

Solange der Zustimmungsbildschirm unvollständig ist, meldet die Seite *Zielgruppe*
„Die OAuth-Konfiguration Ihrer App ist unvollständig“ — und dann lässt sich die
OAuth-Freigabe im Apps Script **nicht erteilen**. Das Ausführungsprotokoll zeigt
stattdessen nur: „Für die Ausführung dieses Projekts ist der Zugriff auf Ihr
Google-Konto erforderlich. Versuchen Sie es bitte noch einmal und erlauben Sie
diesmal den Zugriff.“ — irreführend, denn der Dialog erscheint gar nicht.

[Branding-Seite](https://console.cloud.google.com/auth/branding?project=biberna-gsc-autopilot&authuser=1) — diese Werte eintragen und **speichern**
(alle vier URLs am 08.09.2026 geprüft, HTTP 200):

| Feld | Wert |
|---|---|
| Autorisierte Domains → *Domain hinzufügen* | `biberna.de` (**zuerst**, sonst werden die URLs abgelehnt) |
| Startseite der Anwendung | `https://www.biberna.de/` |
| Link zur Datenschutzerklärung | `https://www.biberna.de/policies/privacy-policy` |
| Link zu den Nutzungsbedingungen | `https://www.biberna.de/policies/terms-of-service` |

Danach [Zielgruppe](https://console.cloud.google.com/auth/audience?project=biberna-gsc-autopilot&authuser=1) → **Testnutzer** → *Add users* →
`mschmaenk@biberna.de`. Im Status „Test“ dürfen nur eingetragene Testnutzer die
Freigabe erteilen — bei 0 Testnutzern blockiert Google auch den Inhaber.

**Danach: Veröffentlichungsstatus „In Produktion“.** Im Testmodus verfallen
OAuth-Freigaben nach **7 Tagen** — für einen wöchentlichen Trigger fatal.
Sobald Branding vollständig ist, wird der Button *App veröffentlichen* auf der
Seite *Zielgruppe* aktiv. Symptom, falls man es vergisst: Der Lauf bricht nach
etwa einer Woche mit einem Autorisierungsfehler ab, obwohl vorher alles lief.

---

## E) Ads Script einrichten (Writer)

> **FERTIG — am 12.09.2026 im Konto geprüft.** Die Schritte 1–6 unten sind
> abgearbeitet; sie bleiben als Ablaufbeschreibung stehen.
>
> | | |
> |---|---|
> | Konto | 483-667-3168 unter `mschmaenk@biberna.de` |
> | Skript | `ads-writer`, Status *Aktiviert* |
> | Zeitplan | **jede Woche Montag, 07:00–08:00** |
> | Letzte Bearbeitung | 10.09.2026, 16:06 |
> | Letzter Lauf | 10.09.2026, 16:07 — *Ohne Änderungen abgeschlossen* |
> | Code-Stand | `CFG`-Block identisch mit `ads-script/ads-writer.js` |
>
> Der `CFG`-Block im Konto wurde Zeile für Zeile gegen die Datei geprüft:
> gleiche Sheet-URL, `CAMPAIGN_NAME: 'Search | Generic | DE'`, gleiche Deckel
> und Limits. **Ein erneutes Einfügen ist nicht nötig** — anders als in
> `sea-autopilot/README.md`, Schritt 5, behauptet.
>
> Ob der Lauf vom 10.09. eine Vorschau oder ein echter Lauf war, geht aus der
> Übersicht nicht hervor — Google führt beides in derselben Spalte.
>
> Im selben Konto liegen drei weitere Skripte aus `sea-autopilot`:
> `availability-guard` (täglich 06:00–07:00, zuletzt 11.09. 06:09, abgeschlossen),
> `create-brand-carveout` (ohne Zeitplan, 10.09., abgeschlossen) und
> `create-brand-lists` (ohne Zeitplan, 10.09. 10:59, **fehlgeschlagen** —
> gehört zu `sea-autopilot`, nicht hierher).

1. Google Ads → Tools → Bulk-Aktionen → **Skripte** → **+** →
   Name `ads-writer`
2. Inhalt von `ads-script/ads-writer.js` einfügen
3. In `CFG` ersetzen: `SHEET_URL` → deine Sheet-URL. *Bereits erledigt: Die
   URL steht seit dem 08.09.2026 in `ads-script/ads-writer.js` und im Konto.*
4. **Autorisieren**
5. **Vorschau ausführen** — nicht *Ausführen*. Die Vorschau wendet keine
   Änderungen an und protokolliert nur, was passieren würde.

   Erwartete Log-Zeilen:
   ```
   VORSCHAU-MODUS - es werden keine Aenderungen angewendet.
   Bestand: N Keywords, M Negatives, Autopilot-Revier 0/100, Basis-CPC 0,xx EUR
   Kandidaten: 25 gelesen, K zulaessig (Limit 25)
   Ad Group angelegt (pausiert): AG | products/...
   PMax Carve-Out: K Begriffe ausgeschlossen
   ```

6. ~~**Vor dem ersten echten Lauf melden**~~ — erledigt. Das Skript läuft seit
   dem 10.09.2026 im Konto, Zeitplan **wöchentlich Montag 07:00–08:00**.

---

## E1b) Kampagnen-Assets: Sitelinks und Zusatzinformationen (angelegt 09.09.2026)

Assets liegen auf **Kampagnenebene** (Assets → Verknüpfungen → *Asset erstellen*,
„Hinzufügen zu: Kampagne“). Sie gelten damit für jede Anzeigengruppe, die das
Skript künftig anlegt, ohne dass das Skript Assets kennen muss. Status nach dem
Anlegen: *Ausstehend / Wird überprüft* — das ist die normale Richtlinienprüfung.

**Sechs Sitelinks** (je Kollektion, alle mit ≥ 13 lieferbaren Produkten):

| Sitelink-Text | Textzeile 1 | Textzeile 2 | Finale URL |
|---|---|---|---|
| Biber-Bettwäsche | Vom Erfinder der Biber-Bettwäsche | In allen Größen ab 135x200 | `https://www.biberna.de/collections/bettwasche-biber` |
| Flanell-Bettwäsche | Weich angeraut & wärmend | Melange-Optik | `https://www.biberna.de/collections/bettwasche-melange-flanell` |
| Linon-Bettwäsche | Glatte Baumwoll-Bettwäsche | Zeitlose Dessins | `https://www.biberna.de/collections/bettwasche-linon` |
| Spannbettlaken | Jersey, Biber & Frottee | Für Boxspring & Standard | `https://www.biberna.de/collections/spannbettlaken` |
| Kinderbettwäsche | Bunte Motive fürs Kinderzimmer | Auch in Biber-Qualität | `https://www.biberna.de/collections/kinderbettwasche` |
| Satin-Bettwäsche | Seidig glatt & kühlend | Für warme Nächte | `https://www.biberna.de/collections/bettwasche-satin` |

**Fünf Zusatzinformationen (Callouts)**, jede im Shop verifiziert:
`Versandkostenfrei` (ohne Mindestbestellwert) · `Gratis Rückversand` ·
`Kauf auf Rechnung` (Klarna) · `Eigene Weberei seit 1932` ·
`Lieferzeit 1-3 Werktage` (DHL).

Bewusst **nicht** angelegt: Sitelink *Werksverkauf* (soll nicht beworben werden),
Sitelink *Jersey* (nur 4 Produkte), Callouts „Made in Germany“ (nur 32 von 309
Produkten) und „Versandkostenfrei ab 50 €“ (falsch, Shop ist ohne Schwelle
versandkostenfrei), Snippet-Erweiterung (siehe Memory: falsche Achse).

Sitelink-URLs ohne UTM-Parameter eintragen — der Kampagnen-Suffix aus A1b hängt
sie an.

---

## E3) Manuelle Keyword-Erweiterung über `seed_keywords` (seit 08.10.2026)

Zweiter Zulauf neben den GSC-Kandidaten: das Tab **`seed_keywords`** im Sheet.
Jede Zeile wird vom `ads-writer` wie ein GSC-Kandidat behandelt — Exact Match,
pausiert angelegt, Label, Carve-Out-Sync, Dedup gegen den Kontobestand. Nur
Herkunft, Landingpage und Gebot kommen aus dem Sheet statt aus GSC.

| Spalte | Inhalt |
|---|---|
| A `keyword` | Suchbegriff in Kleinschreibung, ohne Klammern |
| B `landing_page` | vollständige URL mit `https://www.biberna.de/` — andere Hosts werden ignoriert |
| C `max_cpc` | optional, Dezimalkomma erlaubt; wird auf `MAX_CPC_CEILING` gedeckelt; leer = Basis-CPC |
| D `quelle` | Notiz (Planer-Volumen, GSC-Impressionen) — nur für Menschen |
| E `override` | `skip` = aussetzen, `done` = erledigt (Zeile bleibt als Register stehen) |

Seeds laufen **vor** den GSC-Kandidaten durch den Trichter und zählen gegen
dieselben Deckel (`MAX_NEW_KEYWORDS_PER_RUN` 25, `MAX_NEW_ADGROUPS_PER_RUN` 8,
Revier 100). Stand 08.10.2026 stehen **96 Begriffe** im Tab: 27 aus der
Handrecherche plus 69 aus den Keyword-Planer-Exporten der drei Mitbewerber
(Erwin Müller 1.797 Ideen, Bettwaren-Shop 4.103, schlafgut 1.090 → 6.990
eindeutige Begriffe). Am 08.10.2026 wurden die Deckel auf 120 Keywords / 40 Anzeigengruppen pro
Lauf und 150 im Revier angehoben (`MAX_CPC_CEILING` 0,80 €), damit die Liste in
einem Lauf durchgeht; der Lauf um 17:27 hat alle 96 angelegt (Konto danach:
107 Keywords, 46 Anzeigengruppen, Carve-Out 107 Begriffe).

**Filterwerkzeug:** `tools/filter_planner.py OUT.tsv EXPORT1.csv …` liest die
UTF-16-TSV-Exporte des Planers und wendet nacheinander an: Informational-,
Blocklist- und Fremdmarken-Sperre → Volumen ≥ 300/Monat → nicht schon im
Konto oder in `tools/seeds_bestand.txt` → unteres Erstseitengebot ≤ 0,60 €
→ Sortimentssperre (Decken, Kissen, Leinen, Matratzen …) → Kollektion mit
≥ 3 Produkten, Material/Kinder/Größe müssen zur Kollektion passen, Farben
werden verworfen → Wortreihenfolge-Dubletten zusammengelegt. Ergebnis vom
08.10.2026: `tools/planer_kandidaten_2026-10-08.tsv`. Ausbeute ≈ 1 %. Nach dem Lauf: Keywords **und**
Anzeigengruppen manuell aktivieren (Staging-Prinzip, siehe F).

**Herkunft der ersten Liste:** Schnittmenge aus (1) Kategoriestruktur der
Mitbewerber Erwin Müller, Bettwaren-Shop und schlafgut, (2) eigener
GSC-Nachfrage (28 Tage, Filter je Materialfeld), (3) Keyword-Planer-Volumen mit
Gebotsspanne und (4) einer biberna-Kollektion mit ≥ 3 lieferbaren Produkten als
Landingpage. Gebote = unterer Bereich des Planer-Erstseitengebots.

**Bewusst nicht aufgenommen:** `spannbettlaken` generisch (22.200/Mon, aber
0,77–2,88 € und ohne Größenbezug), `tencel bettwäsche` (0,69–2,70 €, PMax hat
schon 63 % Impressionsanteil), `frottee spannbettlaken` (Kollektion hat 1
Produkt), `bettwäsche 200x200` (6 Produkte), Daunen/Kissen/Decken/Matratzen
(Mitbewerber-Sortiment, nicht biberna).

**Blog-Sperre (08.10.2026):** `filterEligible_` verwirft Kandidaten mit
`/blogs/` in der Landingpage, und R7 im Collector lehnt sie ab. Die beiden
Blog-Gruppen vom 28.09. und 05.10. (`biber bettwäsche 200x200`, `feinbiber
bettwäsche 155x220`) bleiben pausiert; als Seeds mit Kollektions-URL
nachziehen, sobald `bettwasche-200x200` mehr als 6 Produkte hat.

---

## E2) Manuelle Landingpage-Korrekturen (Keyword-Ebene)

Das Skript setzt als Final URL die Seite, die GSC für die Suchanfrage meldet —
dort ist die Relevanz gemessen. Für bezahlte Klicks ist das nicht immer die
beste Seite: GSC meldet oft die generische Übersicht, obwohl eine passende
Facettenseite existiert. Solche Fälle werden **manuell auf Keyword-Ebene**
korrigiert (Keyword-Tabelle → Spalte *Finale URL*). Die Keyword-URL überschreibt
die Anzeigen-URL; das Skript fasst bestehende Keywords nie an, die Korrektur
bleibt also dauerhaft. **Nicht automatisieren** — Keyword → beste Facette ist eine
inhaltliche Entscheidung.

| Datum | Keyword | GSC-Seite (Anzeige) | Keyword-URL | Grund |
|---|---|---|---|---|
| 09.09.2026 | `[bettwäsche biber]` | `/collections/bettwasche` (262 gemischte Produkte) | `https://www.biberna.de/collections/bettwasche-biber` | 75 Biber-Garnituren, 61 lieferbar; Title „Biber Bettwäsche … vom Erfinder“, H1 „Biber Bettwäsche“ |

Eingabe immer **mit `www`** (biberna.de leitet per 301 um) und **ohne**
UTM-Parameter (die hängt der Kampagnen-Suffix an, sonst doppelt).

**SEO-Nebenbefund dazu:** Für `bettwäsche biber` bekommt laut GSC die generische
Seite die Impressionen (216, Pos. 12,7), obwohl `/collections/bettwasche-biber`
sauber optimiert ist. Ob die Biber-Seite für dieselbe Anfrage *auch* rankt, ist
aus der gefilterten Kandidatenliste nicht ablesbar — direkt in der Search Console
prüfen (Leistung → Filter Suchanfrage → Dimension Seiten). Falls nicht:
interne Verlinkung auf die Facette stärken.

---
## F) Freigabe-Routine (wöchentlich, ~5 Minuten)

1. Report-Mail lesen — sie listet jedes neue Keyword mit Regel und Gebot
2. In Ads nach Label `gsc-autopilot` filtern, Status *pausiert*
3. Keywords durchsehen, Unpassendes **entfernen** (nicht nur pausieren —
   entfernte Keywords werden vom Dedup nicht mehr blockiert und könnten
   zurückkommen; besser: passenden Begriff in die `blocklist` aufnehmen)
4. Rest aktivieren, Ad Group aktivieren
5. ~~Nach dem ersten geprüften Batch: Kampagne aktivieren~~ — **erledigt**,
   `Search | Generic | DE` läuft seit dem 10.09.2026 aktiv

Ab dem zweiten Monat: RSA-Texte der best laufenden Gruppen von Hand
schärfen. Das Skript fasst vorhandene Anzeigen nie wieder an.

---

## G) Betrieb und Kalibrierung

| Wann | Was |
|---|---|
| wöchentlich | Freigabe-Routine, Suchbegriffsbericht der Autopilot-Kampagne prüfen |
| wöchentlich | Close-Variant-Nachläufer aus dem Suchbegriffsbericht als zusätzliche Exact-Keywords + Carve-Out-Einträge nachziehen |
| nach 4 Wochen | Ad-Group-Struktur prüfen: bleibt „eine Gruppe pro Landingpage" sinnvoll, oder nach Kollektion bündeln? |
| nach 8 Wochen | `CTR_CURVE` in `config.gs` aus eigenen GSC-Daten je Positions-Bucket neu berechnen |
| bei Revier-Deckel | `MAX_ACTIVE_AUTOPILOT_KEYWORDS` bewusst erhöhen — nie automatisch |

**Die eine bekannte Unschärfe:** Exact Match umfasst Close Variants
(Tippfehler, Plural, Umstellungen), negative Keywords tun das nicht. Bei
solchen Varianten entscheidet weiterhin Ad Rank zwischen Suchkampagne und
PMax. Der Kern des Carve-Outs ist eindeutig, die Ränder sind es nicht — der
Suchbegriffsbericht zeigt dir genau, welche Varianten einlaufen. Erwartbar
eine Handvoll in vier Wochen, dann nachziehen.

---

## Fehlerbilder

| Meldung / Symptom | Ursache und Behebung |
|---|---|
| `GSC API 403` | Falsches Konto (privates googlemail statt biberna) oder falscher Property-String. `listGscProperties` ausführen |
| `Nur N GSC-Rows erhalten` | Absichtlicher Abbruch gegen stilles Leerlaufen. Property prüfen — eine falsche antwortet mit `200 OK` und fast keinen Zeilen |
| `Fehlende Script Properties` | Abschnitt D4 nachholen |
| `products.json antwortete 4xx` oder „lieferte kein JSON" | Shop passwortgeschützt, Endpunkt deaktiviert oder `SHOP_BASE` falsch |
| `Nur N Produkte erhalten` | Absichtlicher Abbruch — ohne Sortiment verwirft R6 jeden Kandidaten |
| `Kampagne … nicht gefunden` | Abschnitt A1 — Name muss exakt stimmen |
| `Ausschlussliste … fehlt` | Abschnitt A2. Achtung: Keywords sind dann schon angelegt, Liste zügig nachziehen |
| `Liste … ist mit der Autopilot-Kampagne verknüpft` | Abschnitt A2, Verknüpfung entfernen |
| Zweiter Lauf legt nichts an | Normal, wenn keine neuen Kandidaten die Regeln erfüllen. Log zeigt `K zulaessig` |

---

## Was das System bewusst *nicht* tut

- keine Kampagnen oder Budgets erzeugen
- nichts aktiv schalten
- keine vorhandenen Anzeigen, Gebote oder Keywords ändern
- keine Brand-Keywords bebuchen (Regel R4)
- keine Begriffe bebuchen, die organisch in den Top 3 stehen (Regel R3)
- keine Conversion-basierten Gebotsentscheidungen, solange die
  Attributionslücke offen ist

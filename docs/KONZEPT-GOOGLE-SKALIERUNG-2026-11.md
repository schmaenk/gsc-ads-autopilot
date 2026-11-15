# Google Ads biberna.de: Hochfahrplan auf 800–1.000 €/Tag (Stand 10.11.2026)

Entscheidungsvorlage. Datenquellen: Google Ads Konto 483-667-3168 (Chrome, 10.11.2026 vormittags),
Merchant Center 5807193868, Shopify-Bestellungen mit Customer Journey (UTM first/last visit, Skript
`utm_orders.py`, Abzug 10.11. 06:30 UTC), `biberna_ads_autopilot/profit_snapshot.json` (export_profit vom 10.11. 05:24 UTC).
**Im Konto wurde nichts geändert.** Jede Maßnahme in Abschnitt 6 wartet auf ein „Go“ im Chat.

## 0. Kurzfassung

1. **Das Konto gibt heute schon ≈ 780–800 €/Tag aus** (14 Tage: 10.909 €, 7 Tage: 5.556 €; Budgetsumme 830 €/Tag). Die Annahme „≈ 550 €/Tag“ ist überholt – 550 € war der Stand Ende Oktober. Die Frage lautet also nicht „wie komme ich auf 800“, sondern „wie halte ich 800 bei ROAS ≥ 3 und komme danach auf 1.000“.
2. **Mit dem Ausgabensprung ist der ROAS gefallen:** 30 Tage 3,00 → 14 Tage 2,87 → 7 Tage 2,60 (Google-Zählung). Ohne Brand: 7 Tage 1,84. Treiber: PMax-1 7 Tage ROAS 1,27 (60 % der Kosten laufen in Discover bei ROAS 0,63), PMax Biber 2,23 (Shopping-Anteil ROAS 1,9), PMAX ohne Shopping 2,35, aber zu ≈ 40 % aus Markensuchen.
3. **Shopify-Basis liegt systematisch bei ≈ 45 % der Google-Zählung** (Google 343 Conv. in 14 Tagen vs. 153 Shopify-Bestellungen mit Google-UTM first visit; Umsatz 31.295 € vs. 13.863 €). Das ist kein Google-Fehler, sondern die bekannte Messlücke (48 % der Bestellungen ohne Journey oder „direct“). Für die Steuerung braucht es deshalb drei Zahlen nebeneinander (Abschnitt 7), nicht nur eine.
4. **Reihenfolge:** erst drei Struktur-Fehler beheben (Brand-Leck in PMax Biber und PMAX ohne Shopping, Discover-Anteil in PMax-1, Vorbestell-Artikel im Feed als „Auf Lager“), **dann** ab 16.11. in drei Stufen skalieren: 830 → 900 → 1.000 → 1.150 €/Tag, jede Stufe nur bei erfüllten Voraussetzungen, Rückstufung bei ROAS < 2,5 über 5 Tage.
5. **Optimierungsfaktor 76,8 %:** 12 Empfehlungen ablehnen, 4 übernehmen (Logo, Sitelinks, Kundenabgleich, PMax-Assets), 4 später. Nach den Ablehnungen bleibt der Faktor dauerhaft bei ≈ 80 % – das ist gewollt. Auto-Apply ist aus (0 von 21), und bleibt aus.

## 1. Ist-Aufnahme je Kampagne

### 1.1 Google-Zählung (Conversion = Kauf, Shopify-&-Google-App-Tag)

| Kampagne (ID) | Typ / Gebot | Budget | Status | OF | 30 T Kosten → Wert / Conv. / ROAS / CPA | 14 T Kosten → Wert / Conv. / ROAS | 7 T Kosten → Wert / Conv. / ROAS |
|---|---|---|---|---|---|---|---|
| Search \| Brand \| DE (24231603831) | Search, Conv. maximieren | 200 € | aktiv | 77 % | 2.454 → 14.071 / 152 / **5,73** / 16 € | 1.470 → 9.271 / 96 / 6,31 | 770 → 5.628 / 55 / 7,31 |
| PMax \| Biber \| DE (24370721896) | PMax, Conv.-Wert max. ohne Ziel | 280 € | eingeschränkt („keine Produkte für AT“) | 84 % | 5.098 → 15.464 / 178 / **3,03** / 29 € | 3.970 → 10.951 / 126 / 2,76 | 2.141 → 4.771 / 51 / 2,23 |
| Performance Max-1 (23943165305) | PMax, tROAS 225,62 % | 220 € | durch Budget eingeschränkt | 70 % | 6.380 → 14.907 / 179 / **2,34** / 36 € | 3.817 → 8.026 / 90 / 2,10 | 1.677 → 2.129 / 23 / 1,27 |
| PMAX ohne Shopping (24405834876), seit 29.10. | PMax ohne Feed, Conv. maximieren (Anzahl) | 100 € | eingeschränkt (Richtlinie Gesundheit) + Budget | 82 % | 1.217 → 2.470 / 22 / **2,03** / 55 € | identisch (Laufzeit 12 T) | 737 → 1.735 / 15 / 2,35 |
| Search \| Generic \| DE (24232515295) | Search Exact, Conv. maximieren | 30 € | „nicht genug relevante Keywords“ + Budget | 39 % | 936 → 1.280 / 18,5 / **1,37** / 51 € | 435 → 577 / 8,5 / 1,33 | 232 → 178 / 3 / 0,77 |
| **Konto** | | **830 €** | | 76,8 % | 16.085 → 48.193 / 550 / **3,00** / 29 € (Vorperiode: 6.293 € Kosten) | 10.909 → 31.295 / 343 / 2,87 | 5.556 → 14.441 / 148 / 2,60 |

Impression-Share (14 T, Suchnetzwerk): Brand 84 % (Rang-Verlust oben 4 %, Budget-Verlust oben 13 %); Generic < 10 % (Rang 68 %, Budget 28 %); alle PMax < 10 % Such-IS (normal, PMax läuft überwiegend Shopping/Discover).

Conversion-Lag: Google weist „Conversions einschl. prognostizierte“ aus – 7 T 148 → 178 (+20 %), 14 T 343 → 388 (+13 %), 30 T 550 → 599 (+9 %). **Jede 7-Tage-Zahl ist also noch rund 15–20 % zu niedrig**, jede Stufenentscheidung braucht mindestens 7 abgeschlossene Tage plus 3 Tage Nachlauf.

### 1.2 Kanäle innerhalb der PMax-Kampagnen (3.–9.11., Bericht „Kanalleistung“)

| Kampagne | Google Suche (inkl. Shopping) | davon Shopping | Discover | YouTube / Display / Maps |
|---|---|---|---|---|
| PMax Biber | 1.888 € → 46,8 Käufe / 4.255 € (ROAS 2,25), 88 % der Kosten | 994 € → 24,8 / 1.911 € (1,92); Textanzeigen 894 € → 22 / 2.344 € (2,62) | 179 € → 4,6 / 516 € (2,89) | 29 € / 43 € / 0 € ohne Kauf |
| Performance Max-1 | 666 € → 16,1 / 1.494 € (2,24), 40 % | 565 € → 13,1 / 1.308 € (2,31) | **1.010 € → 7,0 / 635 € (0,63), 60 % der Kosten** | 0 € |
| PMAX ohne Shopping | 442 € → 8,0 / 947 € (2,14), 60 % | – (kein Feed) | 249 € → 7,1 / 788 € (3,16) | 31 € / 6 € / 3 € ohne Kauf |

Befund PMax-1: Der tROAS 225 % lässt Google in den billigen Discover-Klick (CPC 0,07 €) ausweichen; dort kommt in 7 Tagen weniger als 1 € Wert je 1 € Kosten zurück. Die Shopping-Hälfte wäre allein auf ROAS 2,3.

### 1.3 Suchbegriffe (3.–9.11.)

- **Brand:** 907 Klicks, 741 €, 53 Conv. – sauber, 100 % Markenbegriffe (biberna 229 Klicks, biberna bettwäsche 529, Spannbettlaken 28, Castell 7). Redundanz: `[bettwäsche biberna]`/`[biberna bettwaesche]` doppelt (Google-Empfehlung, harmlos).
- **PMax Biber:** 1.619 Klicks, 1.176 €, 26,8 Conv. (Google-Suche ohne Shopping). **Markenbegriffe ≈ 160 € ≈ 14 % der Such-Kosten und tragen die Hälfte der Conversions** („biberna bettwäsche“ 75 € → 3 Conv., „biberna flanell“ 27 € → 0,5, „biberna“ 35 €, „biberna sale“, „biberna dingden“). Die generischen Biber-Begriffe (biber bettwäsche 114 €, 135x200 36 €, 155x220 37 €) haben in der Woche 0 Conv. über Textanzeigen – die Käufe laufen über Shopping. Die Liste `Brand Carve-Out` hängt laut Suchbegriffen nicht an dieser Kampagne.
- **PMAX ohne Shopping:** Top-Suchkategorien = biberna bettwäsche hirsch, biberna lagerverkauf, biberna dingden, flanell bettwäsche, biber bettwäsche. Suchbegriffe 30 T: 394 Klicks, 368 €, 5 Conv.; die Conversions kommen aus „biberna flanell bettwäsche“ und Markenvarianten, dazu Mitbewerber-Begriffe (erwin müller, bierbaum) ohne Kauf. **Die „guten Werte der letzten Tage“ sind zu ≈ 60 % Markensuche (eigentlich Brand-Kampagne, dort 14 € CPA) und zu ≈ 35 % Discover.** Klick-Conversions, keine View-through (Discover zählt nur Klicks; YouTube 0 Conv.). Asset-Gruppe „Sehr gut“, aber eingeschränkt durch Richtlinie „Gesundheit in personalisierten Anzeigen“ und Texte „beidseitig angeraut“/„1968 erfunden“ (Feedback-Regeln: nur „geraut“; 1968 ohne Beleg).
- **Generic:** 202 Klicks, 211 €, 3 Conv., CPC 1,04 €; Biber-Größen-Keywords (`biber bettwäsche 135x200` 41 €, `feinbiber bettwäsche` 35 €) ohne Kauf in der Woche; Rang-Verlust 68 % → Google bietet unter „Conversions maximieren“ trotzdem zu wenig für Seite 1.

### 1.4 Shopify-Gegenprobe (UTM first visit, 27.10.–9.11., 964 Bestellungen, 225 ohne Journey, 238 „direct“)

| Kampagne | Google-Conv. 14 T | Shopify-Bestellungen (first) | Shopify-Umsatz netto | Google-Spend | **Shop-ROAS (UTM)** | Shopify/Google-Quote |
|---|---|---|---|---|---|---|
| Brand | 96 | 50 | 5.345 € | 1.470 € | 3,64 | 52 % |
| PMax Biber | 126 | 55 | 4.367 € | 3.970 € | 1,10 | 44 % |
| PMax-1 | 90 | 34 | 2.764 € | 3.817 € | 0,72 | 38 % |
| PMAX ohne Shopping | 22 | 8 | 881 € | 1.217 € | 0,72 | 36 % |
| Generic | 8,5 | 6 | 505 € | 435 € | 1,16 | 70 % |
| **Summe** | **343** | **153** | **13.863 €** | **10.909 €** | **1,27** (last visit 0,92) | **45 %** |

Dazu 67 Bestellungen / 6.084 € mit Referrer „Google“ ohne UTM (organisch oder Klicks mit verlorenem Parameter) → 1,83 bei voller Zurechnung. Die Quote Shopify/Google von 36–52 % deckt sich mit der Session-Quote vom September (41 %). **Faustregel: Shopify-UTM × 2,2 ≈ Google-Zählung.** Gesamt-Shop (alle Bestellungen / alle Werbekosten) laut export_profit: 7 Tage ROAS 3,26, DB nach Werbung 11.478 € = 1.640 €/Tag, Break-even-ROAS 1,69. Tageswerte Google-Spend vs. Shopify-UTM-Umsatz in Abschnitt 7.

## 2. Optimierungsfaktor: Bewertung aller 24 Empfehlungen (76,8 %, Auto-Apply 0/21)

| # | Empfehlung | Punkte | Was Google ändern würde | Urteil | Begründung |
|---|---|---|---|---|---|
| 1 | Demand-Gen-Kampagne hinzufügen | +6,5 | Neue Kampagne auf YouTube/Discover/Gmail | **später** | Nicht jetzt: Discover frisst schon 60 % von PMax-1 bei ROAS 0,6. Erst Pinterest-Test (ab 17.11.) abwarten; Reels liegen bereit (creatives/google-2026-10-21). Frühestens Januar als eigener Test mit 30 €/Tag. |
| 2 | Budgets optimieren: PMax-1 220 → 440 € | +2,9 | Budget verdoppeln, „ROAS 245 % > Ziel“ | **ablehnen** | Googles 245 % ist 30-Tage-Schnitt; letzte 7 Tage 127 %. Grenz-ROAS der letzten Erhöhungen ≈ 1,3 (Memory 06.11.). Mehr Budget in PMax-1 geht zu 60 % in Discover. |
| 3 | Listen zum Kundenabgleich importieren | +2,6 | Customer-Match-Listen (Käufer, Newsletter) | **übernehmen** (Nutzerklick) | Kostet nichts, Klaviyo-Export von Käufern + Abonnenten als Signal für PMax und als Ausschluss (Bestandskunden aus Brand/Generic). DSGVO: nur Kontakte mit Marketing-Einwilligung. |
| 4 | Video-Asset hinzufügen | +2,3 | Videos in Asset-Gruppen | **später** | Eigene Reels nur in PMax Biber (9:16/16:9/1:1 liegen bereit), aber bewusst **nicht** in PMax-1 (öffnet YouTube/Discover weiter). Nach Stufe 1. |
| 5 | Budgets anpassen (Conv. max., 2 Kampagnen) | +1,9 | Brand/Generic Budget rauf, CPA +12 € | **ablehnen** | Brand ist nicht budgetbeschränkt (gibt 110 € von 200 € aus); Generic braucht Struktur, nicht Budget. |
| 6 | Dynamische Bilder | +1,4 | Landingpage-Bilder in Textanzeigen | **ablehnen** | Google wählt Bilder selbst, Herkunfts-/CI-Kontrolle entfällt; Nutzen bei Brand-Anzeigen (CTR 42 %) null. |
| 7 | Ziel-CPA festlegen (PMAX ohne Shopping) | +1,2 | tCPA + Budgetempfehlung | **ablehnen** | Kampagne wird umgebaut (Abschnitt 6); Ziel wird Conversion-Wert, nicht Anzahl. |
| 8 | Bilder zu Suchanzeigen (2) | +0,8 | Image-Assets an RSAs | **später** | Nur mit eigenen Lifestyle-Bildern (Biber-Fotos stehen noch aus), nicht mit Google-Autobildern. |
| 9 | Mit „Conversion-Wert maximieren“ bieten (Search) | +0,8 | Brand + Generic auf Wert-Gebote | **ablehnen für Brand, später für Generic** | Brand: Conv. max. liefert ROAS 7 bei CPC 0,82 €; Umstellung löst Lernphase aus. Generic: zu wenig Conversions (3/Woche). |
| 10 | Auf alle infrage kommenden Shopping-Produkte ausrichten | +0,7 | Neue „universelle“ PMax mit allen Produkten | **ablehnen** | Zerstört die Topf-Logik (Biber getrennt, Carve-Outs). Nicht beworbene Produkte sind absichtlich nicht beworben (Vorbestellung, Reichweite). |
| 11 | Ziel-CPA wegen steigender Zugriffe | +0,7 | tCPA + Budget +278 €/Woche | **ablehnen** | Saison-Argument stimmt, Mittel nicht: Stufenplan statt Google-Automatik. |
| 12 | Partnerwebsites im Suchnetzwerk (2) | +0,5 | Suchpartner für Brand/Generic | **ablehnen** | Suchpartner = minderwertiger Traffic ohne Suchbegriffsbericht; Brand-Klicks dort sind meist Navigations-Tippfehler. |
| 13 | Asset-Optimierung (Textanpassung + URL-Erweiterung, 2 PMax) | 0 | Google schreibt Texte um, leitet auf beliebige URLs | **ablehnen, dauerhaft** | Herkunftsregeln (Biber ≠ DE-Produktion, „geraut“) lassen sich nicht an Google delegieren; URL-Erweiterung schickt Biber-Traffic auf Nicht-Biber-Seiten. |
| 14 | Automatische Rabatte für Shopping | 0 | Google senkt Preise im Feed dynamisch | **ablehnen** | Preisführung ist Nutzersache; Secret BF und Gutscheinaktion laufen bewusst nicht öffentlich. |
| 15 | Produkte zu PMax hinzufügen (= PMAX ohne Shopping mit Feed) | 0 | Feed an 24405834876 | **ablehnen** | Dann wäre es PMax-1 Nummer 2. Entweder bleibt sie feedlos mit klarem Zweck (Discover/YouTube-Test) oder sie wird pausiert. |
| 16 | Conversion-Daten für Kundenabgleich | 0 | Listen aus Conversion-Daten | **übernehmen mit #3** | Gleiche Maßnahme. |
| 17 | Primäre Aktion zu Zielvorhaben (4) | 0 | Seitenaufrufe/YouTube/Anruf als primär | **ablehnen** | Nur „Kauf“ darf primär sein (Audit 06.11.: Kauf ist einzige Kauf-Aktion). Genau das Gegenteil ist offen: Seitenaufrufe aus PMAX ohne Shopping als Zielvorhaben raus. |
| 18 | Firmenlogo in Suchanzeigen | 0 | Logo-Asset Kontoebene | **übernehmen** (Nutzerklick) | Reine Darstellung, Logo-URL in reference-biberna-ci. |
| 19 | Videos mit unterschiedlicher Ausrichtung | 0 | Hoch-/Quer-/Quadrat-Videos | **später** mit #4 | Liegen bereit, Upload = YouTube-Kanal des Nutzers. |
| 20 | Portfoliogebotsstrategie | 0 | Gemeinsames Budget/Gebot für PMax-Kampagnen | **ablehnen** | Hebt die Topf-Trennung auf, mit der Biber überhaupt messbar wurde. |
| 21 | Sitelinks (≥ 6) | +0,5 | Sitelinks für PMax/Generic | **übernehmen** | Bestehende 6 Kollektions-Sitelinks der Generic-Kampagne an Brand/PMax hängen; keine Google-Texte. |
| 22 | 3 Anzeigengruppen ohne Keywords | +0,3 | Keywords aus Vorschlag | **ablehnen, aufräumen** | AGs spannbettlaken-140-160x200, bettwaesche-gestreift, matratzenschutz-140-160x200 sind Autopilot-Leerhüllen → pausieren statt füllen. |
| 23 | Displaynetzwerk-Aktivierung (2) | +0,2 | Nicht aufgebrauchtes Suchbudget auf Display | **ablehnen, dauerhaft** | Klassische Falle: Restbudget von Brand (90 €/Tag) würde in Display verbrannt. |
| 24 | Redundante Keywords entfernen (4) | +0,1 | Dubletten löschen | **übernehmen** | Reine Hygiene, keine Reichweitenänderung. |
| 25 | AI Max für Suchkampagnen | +0,1 | Broad-Match-artige Erweiterung + Textgenerierung | **ablehnen, dauerhaft** | Exact-Match-Carve-Out gegen PMax lebt von genauer Übereinstimmung; AI Max hebt sie auf. |
| 26 | PMax-Asset-Gruppen optimieren | +0,1 | Assets ergänzen | **übernehmen, eigenhändig** | Biber-Lifestyle-Bilder, Titel-Slot „Kalte Nächte? Nicht mit Biber.“ – ohne Textanpassung. |
| 27 | Responsive Suchanzeigen hinzufügen (3) | <0,1 | Zweite RSA je AG mit Google-Texten | **ablehnen** | Google-Texte („Made in Germany“-Risiko). |
| 28 | Neue Keywords (5): spannbetttuch 180x200, kinderbettwäsche 135x100 … | <0,1 | Exact-Keywords in Generic | **später, einzeln** | Erst nach Bestands-/Reichweitenprüfung (Laken-Größen oft ausverkauft). |
| 29 | Weitgehend passende Keywords | <0,1 | Broad-Match-Varianten in Brand/Generic | **ablehnen, dauerhaft** | Broad Match + Smart Bidding = Generic-Begriffe über die Brand-Kampagne, zerstört den Markenbericht (ROAS 7) und das Carve-Out. |

**Was nach dem Abhaken bleibt:** Die dauerhaft abgelehnten Punkte (#1 bis Januar, #2, #5, #9 Brand, #10–#15, #17, #20, #23, #25, #27, #29) summieren sich auf ≈ 15–18 Punkte. **Der Faktor bleibt also bei ≈ 80–85 %** und das ist in Ordnung: Der Faktor misst Googles Automatisierungsgrad, nicht die Rendite. Jeder einzelne abgelehnte Punkt heißt „mehr Ausgaben oder weniger Kontrolle“. Beim Google-Termin ansprechen: Empfehlungen mit „Ablehnen“ wegklicken, dann verschwinden sie 90 Tage aus dem Faktor.

**Auto-Apply:** 0 von 7 „Anzeigen besser verwalten“ und 0 von 14 „Umsatz steigern“ aktiv (geprüft 10.11.). Bleibt so; die Liste wird monatlich kontrolliert, weil Google neue Typen vorangekreuzt einführt.

## 3. Feed- und Bestandscheck

**Merchant Center (10.11., 08:13 Aktualisierung):** 6.180 Produkte, 6.165 freigegeben, 0 begrenzt, 15 nicht genehmigt („Bild nicht verarbeitet“, temporär, Renforcé Rose/Castell Satin, läuft in 3 Tagen nach). Keine priorisierten Korrekturen. Händlerqualität DE „Sehr gut“, AT/CH „fehlende Signale“. Versand: DE kostenlos 2–3 Tage, AT/CH kostenlos 4–6 Tage – korrekt. Primärquellen: Shopify App API je DE/AT/CH 2.054 Produkte. Zusatzfeeds: `biberna_zusatzfeed.txt` (DE, Stand 16.10. 18:58) und `biberna_zusatzfeed_AT.txt` (AT, 31.10.). CSS „Google Shopping“ (06.11., offen: Partner-CSS).

**Befund 1 – Vorbestell-Artikel laufen als „Auf Lager“:** Shopify hat 119 aktive Varianten mit `inventoryPolicy CONTINUE` + `custom.wieder_verfuegbar_ab` (Termine 11.11. bis 13.01., Schwerpunkt 18.12. mit 40 und 11.12. mit 16 Varianten) und 572 ausverkaufte Varianten ohne Vorbestellung; 1.332 lieferbar. Stichprobe im MC: `0002744/019/087/001` (Feinbiber Spannbetttuch Grau 180x200, Shopify: Bestand ≤ 0, Vorbestellung bis 11.12.) steht im MC als **„Auf Lager“** (Angebot shopify_ZZ_15773817667915_57510958301515, aktualisiert 10.11. 06:19). Die Shopify-Google-App übersetzt „verkaufbar“ in `in_stock`; `preorder` + `availability_date` werden nicht gesendet. Folge: Shopping-Klicks auf Ware mit 4–6 Wochen Lieferzeit, Kaufabbruch oder Wartende als teure Conversion. **Das ist auch der Grund für den MC-Monitor-Befund vom 08.10. (172 ausverkaufte Varianten mit Impressionen).**

**Befund 2 – Zusatzfeed DE ist 25 Tage alt:** custom_label_0 (biber/flanell) und Suchbegriff-Titel fehlen für alles, was seit 16.10. angelegt wurde (z. B. Thermo-Fleece Tanne 155x220 vom 10.11., Wohndecke). Diese Produkte fallen in PMax-1 „Alles andere“.

**Befund 3 – Listing-Gruppen hängen nur an custom_label_0 = biber:** keine Labels für Topseller, Marge, Saison, Reichweite. PMax-1 bewirbt „alles außer biber“, inklusive Vorbestellware.

**Vorschlag Behandlung Vorbestell-Artikel (Entscheidung Nutzer):**

| Option | Wirkung | Empfehlung |
|---|---|---|
| A: `availability = preorder` + `availability_date` aus `wieder_verfuegbar_ab` per Zusatzfeed | Google zeigt „Vorbestellung“, Klickpreis bleibt, Klickrate sinkt, Käufer wissen Bescheid | für Varianten mit Termin ≤ 21 Tage (18./20.11., 25.–27.11.) |
| B: `custom_label_1 = vorbestellung` + Ausschluss in beiden PMax-Listing-Gruppen | Kein Werbegeld auf Wartende, Google-Conversions sinken (Vorbestellungen sind 30 % der Bestellungen) | für Termin > 21 Tage (11./18.12., Januar) |
| C: nichts tun | Weiter „Auf Lager“ bei Lieferzeit 4–6 Wochen | nicht empfohlen: Händlerqualität und Retouren |

Beide Labels kommen aus demselben Zusatzfeed (Werkzeug `tools/mc_title_feed.py` erweitern: Spalten `availability`, `availability_date`, `custom_label_1`). Pflegeintervall: täglich 05:30 vor dem metrics-export, Upload bleibt Nutzerklick oder SFTP (MC bietet SFTP/GCS-Tab).

**Reichweiten-Logik (Bestandswächter als Vorbild):** `bestandswaechter.py` rechnet Reichweite = Bestand / Tagesabsatz der letzten 14 Tage je Variante und warnt unter 10 Tagen. Für Google:
`custom_label_2 = reichweite_lt14` wenn Bestand / Ø Tagesabsatz(14 T) < 14 und keine Vorbestellung → Listing-Gruppe schließt das Label aus. Umgekehrt `custom_label_3 = topseller` für die 50 Varianten mit höchstem 14-Tage-Absatz und Reichweite ≥ 21 → eigene Asset-Gruppe mit höherer Priorität in PMax-1. Beides täglich aus Shopify (GraphQL wie im Wächter) in den Zusatzfeed, kein Shopify-Token-Problem (Client-Credentials in shopify-zolldaten/.env). **Nie custom_label_0 anfassen** (PMax-Biber-Listing-Gruppe hängt daran).

## 4. Zielbild Kontostruktur

| Kampagne | Zweck | Gebot | Carve-Outs / Signale | Budget Zielbild (Stufe 3) |
|---|---|---|---|---|
| Search \| Brand \| DE | Markennachfrage abschöpfen, Mitbewerber fernhalten | Conv. maximieren (bleibt), Budget ohne Deckel-Wirkung | nur Exact Brand, keine Broad-Erweiterung; Bestandskunden-Liste später als Gebotssignal | 200 € (gibt ≈ 110 € aus) |
| Search \| Generic \| DE | Exact-Carve-Out für Begriffe mit nachgewiesener Nachfrage (GSC) | Conv. maximieren, bis 20 Conv./Monat; danach tROAS 250 % | Autopilot-Leerhüllen pausieren, Blog-URLs raus | 30 € |
| PMax \| Biber \| DE | Saison-Topf Biber/Flanell (Feed-Label biber) | Conv.-Wert maximieren → tROAS 280 % ab Stufe 2 | **Brand Carve-Out anhängen** (fehlt), Vorbestell-Ausschluss, Reels als Video-Assets | 350 → 420 € |
| Performance Max-1 | Rest-Sortiment mit Feed | tROAS 225 → 250 % | Brand Carve-Out (hängt), Vorbestell-/Reichweiten-Ausschluss, **Test: zweite Asset-Gruppe „nur Feed“ (ohne Bilder/Texte/Video), um Discover zu drosseln** | 220 → 260 € |
| PMAX ohne Shopping → umbenennen „PMax \| Discover-YouTube \| DE“ | Nachfrageerzeugung mit Reels, kein Suchnetz-Anteil | Conv.-Wert maximieren, Zielvorhaben nur Kauf | **Brand Carve-Out + Mitbewerber-Negativliste anhängen**, Textanpassung/URL-Erweiterung aus, Gesundheits-Richtlinie beheben („geraut“, keine Gesundheitsversprechen), Texte „1968“ raus | 50 € (Stufe 0) → 100 € nur bei ROAS ≥ 3 |
| Demand Gen (optional, Januar) | Reels-Reichweite | tCPA | eigene Reels, Zielgruppe Bettwäsche-Kaufbereit | 30 € Test |

Wichtig: Es gibt kein Budget für AT in Google (AT ohne Feed-Kampagne, Markt 4,5 %); USA wird nicht beworben; Weihnachts-Gutschein und Secret BF bekommen keine Google-Anzeigen (nicht öffentlich).

## 5. Hochfahrplan in Stufen

Messgröße je Stufe (immer 7 abgeschlossene Tage + 3 Tage Nachlauf, Google-Zählung „einschl. prognostizierte“ **und** Shopify-UTM **und** Gesamt-DB):

| Stufe | Zeitraum | Konto-Budget/Tag | Änderungen | Voraussetzung (alle drei) | Wartezeit | Abbruch → Rückstufung |
|---|---|---|---|---|---|---|
| **0 Umbau** | 11.–15.11. | 830 → **780 €** (PMAX ohne Shopping 100 → 50) | Sofortliste Abschnitt 6: Brand-Carve-Out an Biber + ohne Shopping, ohne Shopping auf Conv.-Wert/Kauf, Vorbestell-Feed, Leerhüllen pausieren | – | 5 Tage | – |
| **1** | ab 16.11. (Peak-Start) | **900 €**: Biber 280 → 350, PMax-1 220 bleibt, Brand 200, Generic 30, Discover-YouTube 50 | Biber +25 % (Google-Regel: Budgetschritte ≤ 20–30 % lösen keine Lernphase aus); keine tROAS-Änderung | Konto-ROAS 7 T ≥ 3,0 (Google), Shopify-UTM-ROAS ≥ 1,3, DB nach Werbung ≥ Vorwoche; Biber „durch Budget eingeschränkt“ oder Budget-IS-Verlust > 20 % | 7 + 3 Tage → Entscheidung 26.11. | Konto-ROAS < 2,5 an 5 von 7 Tagen oder Biber < 2,2 → Biber zurück auf 280 |
| **2** | ab 27.11. (nach BF-Entscheidung) | **1.000 €**: Biber 350 → 420, PMax-1 220 → 260 (nur wenn Feed-only-Asset-Gruppe Discover < 35 % gedrückt hat), Rest gleich | PMax-1 tROAS 225 → 235 → 250 % in 10-Punkte-Schritten je 5 Tage, parallel Biber auf tROAS 280 % setzen (hat dann > 30 Conv./Woche) | wie Stufe 1, zusätzlich Bestandsreichweite der Biber-Topseller ≥ 21 Tage (sonst wird Geld auf Vorbestellung gekauft), Shopify-UTM-Umsatz Google ≥ 1.300 €/Tag | 7 + 3 Tage → Entscheidung 7.12. | ROAS < 2,5 über 5 Tage → Stufe 1; ROAS 2,5–3,0 → halten, tROAS +10 |
| **3** | ab 8.12. bis Versandschluss | **1.150 €**: Biber 420 → 480, Brand ohne Deckel, Discover-YouTube 100 falls ≥ 3 | letzte Erhöhung vor Weihnachten; ab 17.12. (Versandschluss DHL 1–3 Werktage → Bestellschluss ≈ 19.12.) keine Erhöhung mehr | wie Stufe 2 | 7 Tage | Rückbau auf Stufe 2 am 20.12., auf Stufe 1 am 27.12. |
| **Abflachung** | 2.–31.1. | 700–800 € | Biber auf 250, PMax-1 200, Discover-YouTube pausieren oder Demand-Gen-Test 30 € | Januar-Nachfrage Biber hält bis Mitte Februar (GSC-Saisonkurve), Sommer-Keywords noch aus | – | – |

**Saisonkalender:** 16.11. Peak-Start; 26.–30.11. Secret Black Friday nur für eingeloggte Newsletter-Kunden → **kein BF-Messaging in Google**, aber Brand-Budget offen lassen (Markensuche steigt durch Klaviyo-Mails, Brand-ROAS wird in der Woche optisch besser, nicht hochrechnen); Weihnachts-Gutschein ab Freischaltung nicht bewerben; Bestellschluss ≈ 19.12. (DHL 1–3 Werktage); 20.–26.12. Budget zurück, keine Vorbestellware mit Termin Januar bewerben; Januar-Abflachung.

**Lernphasen:** Budget ±20–30 % → keine Lernphase. Gebotsstrategie wechseln (Conv. max. → Conv.-Wert max., tROAS neu) → 5–7 Tage Lernphase, in dieser Zeit keine zweite Änderung an derselben Kampagne. Neue Asset-Gruppe → 2 Wochen bis belastbar.

## 6. Sofortmaßnahmen diese Woche (jede einzeln per „Go“)

> **Aktualisierung 14.11.2026:** Der Nutzer hat am 10.–13.11. selbst geändert (Brand 100 → 200 €, PMAX ohne Shopping auf Conversion-Wert maximieren + 150 €, PMax-1 220 → 100 €). Wirkung und die daraus angepasste Sofortliste (S0 Identitätsbestätigung bis 12.12., S2e jetzt 150 → 50 €, S3 verschärft, S8 Stufe 1 verschoben auf frühestens 23.11., S9 Brand 200 → 150 €) stehen in `BERICHT-GOOGLE-AENDERUNGEN-2026-11-14.md`. Die Tabelle unten ist der Stand vom 10.11.


| # | Kampagne | Änderung | Erwarteter Effekt | Risiko | Beleg nach Umsetzung |
|---|---|---|---|---|---|
| S1 | PMax \| Biber \| DE | Negativ-Keyword-Liste `Brand Carve-Out` anhängen | ≈ 160 €/Woche Markenklicks wandern in Brand (CPA 14 € statt 41 €); Biber-ROAS sinkt optisch um 10–15 %, Konto-DB steigt | Google-Conversions der Biber-Kampagne fallen um ≈ 10/Woche; keine Lernphase | Screenshot Kampagneneinstellungen → Ausschlüsse; Suchbegriffe nach 7 Tagen ohne „biberna“ |
| S2 | PMAX ohne Shopping | a) Gebot „Conversions maximieren“ → „Conversion-Wert maximieren“ ohne Ziel; b) Zielvorhaben nur Kauf (Seitenaufruf, YouTube, Anruf, Engagement raus); c) `Brand Carve-Out` + Mitbewerber-Negativliste (erwin müller, bierbaum, bettwaren-shop) anhängen; d) Textanpassung + URL-Erweiterung + Video-Optimierung aus; e) Budget 100 → 50 €; f) Texte: „beidseitig angeraut“ → „geraut“, „1968 erfunden“ raus (Richtlinienfreigabe) | Kampagne zeigt, ob Discover/YouTube ohne Markensuche trägt (Discover-Anteil ROAS 3,2 in der Woche) | Lernphase 7 Tage, Conversions halbieren sich sichtbar; wenn danach < 2,5 → pausieren | Einstellungs-Panel-Screenshot, Kanalleistung nach 7 Tagen |
| S3 | Performance Max-1 | Zweite Asset-Gruppe „Feed only“ anlegen (nur Produkte, keine Bilder/Logos/Videos/Texte außer Pflichtfeldern), Listing-Gruppe = gleiche Produkte; bestehende Asset-Gruppe pausieren **nicht** sofort, sondern nach 7 Tagen Vergleich | Discover-Anteil fällt von 60 % Richtung < 30 %, Shopping-Anteil steigt bei ROAS ≈ 2,3 | Google nimmt feedlose Asset-Gruppen manchmal für Shopping-Text-Anzeigen; wenn Impressionen nach 3 Tagen < 10 %, abbrechen | Kanalleistung je Asset-Gruppe |
| S4 | Merchant Center / Zusatzfeed | Zusatzfeed v5 mit `availability=preorder` + `availability_date` (Termin ≤ 21 Tage) und `custom_label_1=vorbestellung` (Termin > 21 Tage) für 119 Varianten; Ausschluss custom_label_1 in Biber und PMax-1 Listing-Gruppen; Zusatzfeed-Titel für neue Produkte nachziehen | 30 % Vorbestell-Anteil in Google-Conversions sinkt, Händlerqualität bleibt „Sehr gut“ | Umsatzrückgang der Google-Conversions um geschätzt 15–20 % bei gleicher DB; Produktbericht auf „Angebot existiert nicht“ prüfen | MC-Produktliste: Stichprobe 0002744/019/087 zeigt „Vorbestellung“ |
| S5 | Search \| Generic \| DE | Leerhüllen pausieren (3 AGs ohne Keywords, 2 Blog-AGs), 4 redundante Brand-Dubletten entfernen (Brand) | Optimierungsfaktor +0,5, saubere Struktur | keins | Änderungsverlauf |
| S6 | Kontoebene | Logo-Asset + 6 Kollektions-Sitelinks an Brand/PMax; Customer-Match-Upload (Klaviyo-Käufer + Abonnenten mit Einwilligung) | Darstellung, Signal für Smart Bidding | DSGVO-Prüfung der Liste durch Nutzer | Assets-Übersicht |
| S7 | Empfehlungen | 17 Empfehlungen per „Ablehnen“ wegklicken (Liste Abschnitt 2) | Faktor steigt auf ≈ 85 %, Rauschen weg | keins | Empfehlungsseite leer bis auf „später“ |
| S8 | Stufe 1 | Am 16.11. nach Prüfung Biber 280 → 350 € | +≈ 1.500 € Google-Umsatz/Woche bei ROAS ≥ 2,8 | Grenz-ROAS fällt (zuletzt ≈ 1,3 bei Erhöhungen); Gegenprobe Shopify-UTM Pflicht | Lagemeldung 23.11. |

Reihenfolge: S1 und S2 zuerst (Dienstag/Mittwoch), S4 parallel vorbereiten (Zusatzfeed lokal erzeugen, Upload Nutzerklick), S3 Donnerstag, S5–S7 jederzeit. Nichts davon ist eine Budgeterhöhung; S2e senkt um 50 €/Tag.

## 7. Messplan

**Tägliche Zahl (bestehend):** `export_profit.py --google-json <metrics-export>` liefert je Tag `ad_cost.google_ads` und Gesamt-DB; ergänzen um Spalte „Shopify-Umsatz mit Google-UTM (first visit)“ aus dem heutigen Skript `utm_orders.py` (Scratchpad; nach `biberna_ads_autopilot/scripts/google_utm.py` übernehmen). Basis-Reihe 27.10.–9.11.:

| Tag | Google-Spend | Shopify-UTM-Umsatz first (Best.) | Shop-ROAS UTM | ref:Google o. UTM |
|---|---|---|---|---|
| 27.10. | 521 | 353 (5) | 0,68 | 0 |
| 28.10. | 562 | 1.010 (12) | 1,80 | 830 |
| 29.10. | 743 | 468 (9) | 0,63 | 609 |
| 30.10. | 861 | 768 (9) | 0,89 | 324 |
| 31.10. | 1.047 | 1.620 (14) | 1,55 | 228 |
| 01.11. | 636 | 652 (9) | 1,03 | 468 |
| 02.11. | 982 | 851 (8) | 0,87 | 63 |
| 03.11. | 549 | 493 (5) | 0,90 | 673 |
| 04.11. | 992 | 978 (10) | 0,99 | 742 |
| 05.11. | 925 | 869 (11) | 0,94 | 289 |
| 06.11. | 745 | 1.438 (13) | 1,93 | 622 |
| 07.11. | 800 | 1.207 (13) | 1,51 | 554 |
| 08.11. | 778 | 1.995 (20) | 2,57 | 590 |
| 09.11. | 765 | 1.159 (15) | 1,52 | 0 (Journeys noch unvollständig) |

Lesart: Tage mit > 900 € Spend (29.10., 30.10., 02.11., 04.11., 05.11.) liegen alle unter 1,0 Shop-ROAS-UTM, Tage um 750–800 € bei 1,5–2,6. Das ist die Grenzrendite-Warnung, die Google nicht zeigt.

**Drei Ampeln je Stufenentscheidung (7 Tage):**

| Ampel | grün (Stufe hoch) | gelb (halten) | rot (Stufe runter) |
|---|---|---|---|
| Google-ROAS Konto, einschl. prognostizierte | ≥ 3,0 | 2,5–3,0 | < 2,5 an 5 von 7 Tagen |
| Shopify-UTM-ROAS Google (first visit) | ≥ 1,4 und Umsatz absolut gestiegen | 1,2–1,4 | < 1,2 oder Umsatz trotz Mehrbudget gleich |
| DB nach Werbung gesamt (export_profit `contribution`, 7-Tage-Summe) | > Vorwoche | ± 5 % | < Vorwoche bei höherem Spend |

Zwei von drei grün → nächste Stufe; eine rot → zurück. Zusätzlich je Kampagne: Biber Google-ROAS ≥ 2,8, PMax-1 ≥ 2,3, Discover-YouTube ≥ 3,0, Brand ≥ 5,0 (Vergleich mit Markensuche-Trend in GSC, damit Brand nicht nur Klaviyo-Nachfrage abschöpft).

**Lagemeldung:** bestehende Aufgabe `sea-autopilot-lagemeldung` um Abschnitt „Google-Stufe: aktuell X, Ampeln, nächste Entscheidung am …“ ergänzen.

**Was der GSC-Ads-Autopilot liefern müsste (Throttle/Saison nie eingespielt):**
- `performance-throttle`: je Kampagne 7-Tage-ROAS (einschl. prognostizierte) aus `metrics-export` lesen, bei rot Budget automatisch auf die vorige Stufe setzen (Stufen-Tabelle als Konfig im Sheet), bei grün nur **melden**, nie erhöhen (Erhöhung bleibt Nutzerklick).
- `season-weather-bidder`: Saisonkalender als Tabelle (Datum → Budgetfaktor je Kampagne: 16.11. 1,0; 27.11. 1,1; 8.12. 1,15; 20.12. 0,85; 2.1. 0,7), plus Temperatur-Trigger für Biber (Tagestiefst < 3 °C in NRW/BY → Biber +10 % für 3 Tage).
- `metrics-export`: zusätzlich Kanalaufteilung je PMax (Discover-Anteil) und Markenanteil der PMax-Suchbegriffe, damit S1/S3 täglich überwacht werden.
- Shopify-UTM-Spalte: Skript `utm_orders.py` täglich 05:30, Ergebnis in `profit_snapshot.json` als `google_utm_revenue`.

## 8. Offene Punkte und Annahmen

- Google-Conversions zählen „Alle“ (Enhanced Conversions aktiv); Vorbestellungen sind darin enthalten – nach S4 sinkt die Google-Zählung sichtbar, ohne dass DB verloren geht.
- Shopify-Journeys des jeweils letzten Tages sind unvollständig (09.11. ohne ref:Google); Auswertung immer bis Vortag −1.
- Herstellkosten-Stand 08.10.; Retouren und Zahlungsgebühren nicht in der DB.
- AT: „Keine Produkte für einige Standorte“ an Biber bleibt, bis AT als Standort entfernt oder eigene AT-Kampagne angelegt ist (Entscheidung Nutzer, Memory 31.10.).
- PMax-Discover lässt sich nicht direkt abschalten; S3 ist ein Test, kein Schalter. Alternative, falls S3 nicht greift: PMax-1 auf Standard-Shopping-Kampagne umbauen (kein Discover, kein YouTube, aber auch keine Suchtext-Anzeigen).

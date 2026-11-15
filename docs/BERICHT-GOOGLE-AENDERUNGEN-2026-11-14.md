# Google Ads: Wirkung der Nutzeränderungen 10.–13.11.2026

Datenziehung: 14.11.2026, 07:10–07:40 MEZ (Google Ads Konto 483-667-3168 per Chrome; Shopify-Bestellungen mit Customer Journey per `google_utm.py` 14.11. 06:10 UTC; `profit_snapshot.json` vom 14.11. 06:07 UTC, Fenster 31.10.–13.11.). **Nichts im Konto geändert.** Google-Zahlen für 11.–13.11. sind noch ohne Conversion-Nachlauf (erfahrungsgemäß +15–20 % in den Folgetagen); Shopify-Journeys des 13.11. sind unvollständig.

**Achtung, Kontohinweis:** Google verlangt bis **12.12.2026** die Identitätsbestätigung des Werbetreibenden („Einige Ihrer Anzeigen sind möglicherweise pausiert oder werden eingeschränkt ausgeliefert“). Ohne Abschluss werden Anzeigen ab dem Datum gestoppt. Das ist eine Nutzeraufgabe (Ausweis/Firmenunterlagen), unabhängig von allem Folgenden.

## 1. Änderungsverlauf 7.–13.11. (nur manuelle Änderungen, Auto-Apply war und ist aus)

| Datum, Uhrzeit | Kampagne | Änderung | Typ |
|---|---|---|---|
| 10.11. 07:54 | Search \| Brand \| DE | Tagesbudget **100 → 200 €** | Budget |
| 12.11. 15:52 | PMAX ohne Shopping | Gebotsstrategie **„Conversions maximieren“ → „Conversion-Wert maximieren“** (ohne Ziel-ROAS) | Gebot |
| 12.11. 15:52 | PMAX ohne Shopping | Tagesbudget **100 → 150 €** | Budget |
| 13.11. 19:04 | Performance Max-1 | Tagesbudget **220 → 100 €** | Budget |

Keine manuellen Änderungen an Status, Assets, Ausschlusslisten, Zielvorhaben oder tROAS. Skript-Änderungen im selben Zeitraum (keine Nutzeränderungen): ads-writer 09.11. (Anzeigengruppe spannbettlaken-frottee pausiert angelegt, Carve-Out-Liste +1), availability-guard 12./13.11. (`[nicki bettwäsche]` wegen Ausverkauf pausiert, Label auto-oos). Kontobudget jetzt 760 €/Tag (Brand 200, Biber 280, PMax-1 100, ohne Shopping 150, Generic 30).

Aus der Sofortliste des Konzepts (10.11.) ist damit nur ein Teil von S2 umgesetzt (Gebotsart), und zwar mit Budgeterhöhung statt der vorgeschlagenen Senkung. **Nicht umgesetzt:** S1 (Brand Carve-Out an PMax Biber), S2 b/c/d/f (Zielvorhaben nur Kauf, Brand- und Mitbewerber-Negativliste, Textanpassung/URL-Erweiterung aus, Richtlinien-Texte), S3 (Feed-only-Asset-Gruppe PMax-1), S4 (Vorbestell-Feed), S5–S7.

## 2. Leistung je Kampagne: 11.–13.11. (3 Tage nach den Änderungen) gegen 4.–10.11. (7 Tage davor)

Google-Zählung, Conversion = Kauf. Impression-Share nur für Suchkampagnen.

| Kampagne | Zeitraum | Spend/Tag | Conv. | Conv.-Wert | ROAS | CPA | Ø CPC | IS / Budget-Verlust oben |
|---|---|---|---|---|---|---|---|---|
| Search \| Brand \| DE (200 € seit 10.11.) | 4.–10.11. | 125 € | 67,0 | 7.003 € | **7,98** | 13,10 € | 0,85 € | 90,6 % / 6,3 % |
| | 11.–13.11. | **206 €** | 23,9 (8,0/Tag) | 2.401 € | **3,88** | 25,95 € | **1,29 €** | 95,1 % / 1,9 % |
| PMax \| Biber \| DE (unverändert 280 €) | 4.–10.11. | 323 € | 66,6 | 6.275 € | 2,77 | 33,98 € | 0,16 € | – |
| | 11.–13.11. | 307 € | 20,4 (6,8/Tag) | 1.862 € | **2,02** | 45,28 € | 0,15 € | – |
| Performance Max-1 (220 €, seit 13.11. abends 100 €) | 4.–10.11. | 236 € | 20,4 | 1.744 € | 1,06 | 80,92 € | 0,10 € | – |
| | 11.–13.11. | 210 € | **0,05** | 6 € | **0,01** | 12.730 € | 0,12 € | – |
| PMAX ohne Shopping (seit 12.11. Conv.-Wert max., 150 €) | 4.–10.11. | 113 € | 17,5 | 1.867 € | 2,37 | 45,15 € | 0,14 € | – |
| | 11.–13.11. | 141 € | 6,6 (2,2/Tag) | 541 € | **1,28** | 64,48 € | 0,14 € | – |
| Search \| Generic \| DE (unverändert 30 €) | 3.–9.11. (Referenz) | 33 € | 3,0 | 178 € | 0,77 | 77 € | 1,04 € | <10 % / 28 % |
| | 11.–13.11. | 27 € | 1,1 | 93 € | 1,15 | 74 € | 0,73 € | <10 % / 42 % |
| **Konto** | 4.–10.11. | **833 €** | 175,5 | 17.152 € | **2,94** | 33,22 € | 0,16 € | |
| | 11.–13.11. | **892 €** | 52,0 (17,3/Tag) | 4.904 € | **1,83** | 51,53 € | 0,18 € | |

### Kanalaufteilung der PMax-Kampagnen (Bericht „Kanalleistung“, feste 7 Tage 7.–13.11.)

| Kampagne (7.–13.11.) | Gesamt | Google Suche gesamt | davon Shopping | davon Textanzeigen | Discover | YouTube/Display/Maps |
|---|---|---|---|---|---|---|
| PMax Biber | 2.106 € → 57,5 / 5.351 € (2,54) | 1.869 € (89 %) → 53,8 / 4.965 € (2,66) | 969 € → 36,3 / 3.174 € (**3,27**) | 900 € → 17,5 / 1.791 € (1,99) | 177 € → 3,7 / 386 € (2,19) | ≈ 60 € ohne Kauf |
| Performance Max-1 | ≈ 1.551 € → 6,9 / 486 € (**0,31**) | 265 € (17 %) → 3,5 / 199 € (0,75) | 180 € → 2,5 / 109 € | 85 € → 1,0 / 90 € | **1.285 € (83 %) → 3,4 / 288 € (0,22)** | ≈ 1 € |
| PMAX ohne Shopping | 841 € → 20,0 / 2.058 € (2,45) | 522 € (62 %) → 13,5 / 1.411 € (2,70) | – | 522 € | 282 € (33 %) → 6,1 / 608 € (2,16) | 15 € YouTube → 0,4 / 39 €; 13 € Display; 3 € Maps |

Lesart PMax-1: Seit Wochenbeginn fließen 83 % der Kosten in Discover; dort kommen 22 Cent je Euro zurück. In den drei Tagen 11.–13.11. ist auch die Suche praktisch ohne Kauf (0,05 Conversions bei 630 €). Die Budgetsenkung auf 100 € greift erst ab 14.11.

## 3. Shopify-Gegenprobe (Bestellungen mit Google-UTM im ersten Besuch, netto)

| Tag | Google-Spend | Shopify-Bestellungen Google (n) / Umsatz | je Kampagne (n / €) | Shop-ROAS UTM | DB nach Werbung gesamt (export_profit) |
|---|---|---|---|---|---|
| 04.11. | 989 € | 10 / 745 € | Biber 7/409, Brand 2/238, PMax-1 1/97 | 0,75 | 488 € |
| 05.11. | 925 € | 11 / 869 € | Brand 5/623, Biber 2/137, PMax-1 3/82, Generic 1/28 | 0,94 | 1.249 € |
| 06.11. | 745 € | 13 / 1.387 € | Brand 8/705, ohne Shopping 2/291, PMax-1 2/258, Biber 1/132 | 1,86 | 1.193 € |
| 07.11. | 800 € | 13 / 1.207 € | Brand 7/791, Biber 5/338, ohne Shopping 1/79 | 1,51 | 2.729 € |
| 08.11. | 778 € | 20 / 1.995 € | Biber 5/710, Brand 8/680, ohne Shopping 4/401, PMax-1 2/116, Generic 1/90 | 2,57 | 1.914 € |
| 09.11. | 765 € | 15 / 1.159 € | Brand 5/553, Biber 8/456, PMax-1 1/90, Generic 1/60 | 1,52 | 2.182 € |
| 10.11. | 829 € | 12 / 993 € | Biber 6/485, Brand 3/303, ohne Shopping 2/175, PMax-1 1/30 | 1,20 | 936 € |
| **11.11.** | 845 € | 15 / 1.760 € | Brand 6/922, Biber 6/497, ohne Shopping 2/261, Generic 1/80 | 2,08 | 2.159 € |
| **12.11.** | 898 € | 15 / 1.596 € | Brand 7/922, Biber 4/302, Generic 3/218, PMax-1 1/154 | 1,78 | 826 € |
| **13.11.** (Journeys unvollständig) | 934 € | 11 / 894 € | Brand 5/530, Biber 4/235, ohne Shopping 2/130 | 0,96 | 876 € |
| Summe 4.–10.11. | 5.831 € | 94 / 8.355 € | Brand 38 / 3.893 €, Biber 34 / 2.667 €, PMax-1 10 / 673 €, ohne Shopping 9 / 946 €, Generic 3 / 178 € | **1,43** | 10.691 € (1.527 €/Tag) |
| Summe 11.–13.11. | 2.677 € | 41 / 4.250 € | Brand 18 / 2.374 €, Biber 14 / 1.034 €, ohne Shopping 4 / 391 €, PMax-1 1 / 154 €, Generic 4 / 298 € | **1,59** | 3.861 € (1.287 €/Tag) |

Einordnung: Shopify sieht weiter rund 45 % der Google-Käufe (3 Tage: 41 Bestellungen gegen 52 Google-Conversions, hier sogar 79 %, weil die Google-Zählung durch PMax-1 fast ausfällt). Brand liefert in Shopify 791 €/Tag (vorher 556 €/Tag, +42 %) bei +65 % Spend. PMax-1 hat in 10 Tagen 11 Shopify-Bestellungen für 2.340 € Spend gebracht. Gesamt-DB nach Werbung ist in den drei Tagen auf 1.287 €/Tag gefallen (vorher 1.527 €/Tag), bei höherem Google-Spend und leicht niedrigerem Meta-Spend.

## 4. Bewertung je Kampagne

**Search | Brand | DE (100 → 200 €):** Die Verdopplung wirkt nicht als Reichweite, sondern als Gebotsfreigabe: Impression-Share stieg nur von 91 auf 95 %, der Klickpreis von 0,85 auf 1,29 €, der ROAS fiel von 8,0 auf 3,9; Shopify bestätigt mehr Markenumsatz (+42 %/Tag), aber zu +65 % Kosten. Keine Lernphase nötig, der Effekt ist seit 10.11. voll sichtbar; ein Teil der zusätzlichen Markennachfrage kommt aus den Klaviyo-Mails und wäre auch ohne Anzeige gekauft worden. Nächster Schritt: Budget auf 150 € zurück (Budget-Verlust lag vorher bei 6 %, das deckt 150 € ab) und Brand als Markenbericht-Kampagne mit ROAS ≥ 5 führen; die 200 € sind erst im Secret-Black-Friday-Fenster 26.–30.11. sinnvoll, wenn die Markensuche durch die Mails steigt.

**PMAX ohne Shopping (Conv.-Wert max., 100 → 150 €):** Die Umstellung ist 1,5 Tage alt, die Lernphase (5–7 Tage) läuft bis etwa 19.11., ROAS 1,28 in den drei Tagen ist zum Teil Lernphase, zum Teil die gleichzeitige Budgeterhöhung; Discover-Anteil 33 % mit ROAS 2,2 ist tragbar, die Suche (62 %) lebt weiter zu rund 60 % von Markenbegriffen. Die Umstellung entspricht S2a, aber ohne Zielvorhaben-Bereinigung und ohne Brand-Ausschluss misst die Kampagne weiter Markenumsatz, der in Brand mit 14–26 € CPA günstiger wäre. Nächster Schritt: bis 19.11. nichts an Gebot oder Budget ändern, aber jetzt S2b/c/d anhängen (Negativlisten und Zielvorhaben lösen keine neue Lernphase aus), Budget nicht über 150 € heben; Stufenplan-Rolle bleibt „Discover-YouTube-Topf“ mit 50–100 €, nicht 150.

**Performance Max-1 (220 → 100 € am 13.11. abends):** Die Kampagne ist in der Woche zusammengebrochen: 7 Tage ROAS 0,31, drei Tage praktisch null Conversions bei 630 €, 83 % der Kosten in Discover; die Senkung war richtig und kommt spät, ihre Wirkung ist erst ab 14.11. messbar. Eine Lernphase gibt es nicht (nur Budget), der Zustand ist strukturell: tROAS 225 % bei einer Asset-Gruppe mit Bildern und Texten lässt Google in den billigsten Klick ausweichen. Nächster Schritt: nicht auf 100 € weiterlaufen lassen, sondern entweder (a) sofort pausieren und die 100 € in PMax Biber geben, oder (b) S3 umsetzen (zweite Asset-Gruppe nur mit Feed, bestehende Asset-Gruppe pausieren) – Empfehlung (b), weil sonst 1.332 lieferbare Nicht-Biber-Varianten ohne Shopping-Anzeige sind; wenn (b) nach 5 Tagen nicht unter 35 % Discover kommt, Standard-Shopping-Kampagne „Shopping | Rest | DE“ mit tROAS 250 % statt PMax-1.

**PMax | Biber | DE (unverändert):** ROAS fiel ohne Änderung von 2,77 auf 2,02 (3 Tage), Shopping innerhalb der Kampagne ist mit 3,27 (7 Tage) der beste Nicht-Marken-Baustein, die Textanzeigen (1,99) tragen die Markenbegriffe. Keine Lernphase, aber die Woche lag unter der Stufe-1-Schwelle von 3,0. Nächster Schritt: S1 (Brand Carve-Out anhängen) sofort, Budget 280 € halten; **Stufe 1 (350 €) am 16.11. ist nicht freigegeben**, weil zwei von drei Ampeln rot sind (Google-ROAS Konto 1,83, DB nach Werbung gefallen; nur Shopify-UTM 1,59 ist grün).

**Search | Generic | DE (unverändert):** ROAS 1,15 bei 27 €/Tag, Rang-Verlust 52 %, Budget-Verlust 42 %; der Guard pausiert korrekt ausverkaufte Keywords. Keine Änderung, keine Lernphase. Nächster Schritt: S5 (Leerhüllen und Blog-AGs pausieren), sonst nichts.

**Konto:** 892 €/Tag bei ROAS 1,83 (Google) bzw. 1,59 (Shopify-UTM) und sinkender DB. Das ist Ampel rot nach dem Messplan: Stufe 1 bleibt aus, bis sieben Tage nach den Umbauten S1–S3 der Konto-ROAS wieder über 2,5 liegt. Frühester Termin für Stufe 1: 23.11., wenn S1–S3 bis 16.11. umgesetzt sind.

## 5. Sofortliste, aktualisiert (jede Änderung einzeln per „Go“)

| # | Kampagne | Änderung | Stand 14.11. |
|---|---|---|---|
| S0 | Konto | **Identitätsbestätigung des Werbetreibenden bis 12.12.** starten (Banner „Los geht’s“, Nutzer mit Firmenunterlagen) | neu, dringend |
| S1 | PMax Biber | Negativ-Keyword-Liste `Brand Carve-Out` anhängen | offen, unverändert |
| S2 | PMAX ohne Shopping | a) Conv.-Wert max.: **erledigt 12.11.**; b) Zielvorhaben nur Kauf; c) `Brand Carve-Out` + Mitbewerber-Negativliste; d) Textanpassung/URL-Erweiterung/Video-Optimierung aus; e) Budget **150 → 50 €** (statt 100 → 50); f) Texte „geraut“, Richtlinienfreigabe | b–f offen; e angepasst; kein Gebotswechsel vor 19.11. |
| S3 | Performance Max-1 | Feed-only-Asset-Gruppe anlegen, bestehende Asset-Gruppe pausieren, Budget 100 € belassen; Abbruchregel: nach 5 Tagen Discover > 35 % oder ROAS < 1,5 → Kampagne pausieren und Standard-Shopping „Shopping \| Rest \| DE“ (tROAS 250 %) anlegen | verschärft: bestehende Asset-Gruppe sofort pausieren statt erst nach 7 Tagen |
| S4 | Merchant Center | Zusatzfeed v5 mit preorder/availability_date + custom_label_1 für 119 Vorbestell-Varianten, Ausschluss in Biber und PMax-1 | offen |
| S5–S7 | Generic / Konto / Empfehlungen | Leerhüllen pausieren, Dubletten raus, Logo + Sitelinks, 17 Empfehlungen ablehnen | offen |
| S8 | Stufe 1 (Biber 350 €) | **verschoben**: frühestens 23.11., Bedingung Konto-ROAS 7 T ≥ 3,0 nach S1–S3 | verschoben |
| S9 | Search Brand | Budget **200 → 150 €**; 200 € erst ab 25.11. für das Secret-BF-Fenster | neu |

Reihenfolge-Empfehlung für heute: S0 anstoßen, dann S3 (größter Geldabfluss), S1, S2b–e, S9. Alles ohne Lernphase außer S3 (neue Asset-Gruppe, 5–7 Tage).

## 6. Umsetzung S3 am 14.11.2026 (Go des Nutzers: „B: Standard-Shopping“)

Vorab geprüft: Eine Asset-Gruppe nur aus dem Feed ist in Google Ads nicht mehr anlegbar (drei Überschriften, langer Titel und Textzeile sind „Erforderlich“, auch im Kampagnen-Assistenten). Google füllte die Felder sofort mit eigenen Texten, darunter „aus deutscher Herstellung“ (Herkunftsregel). Daher Weg B.

| Zeit (MEZ) | Änderung | Beleg |
|---|---|---|
| ≈ 13:45 | Neue Kampagne **„Shopping \| Rest \| DE“ (ID 24471439624)**, Typ Standard-Shopping, Ziel Umsatz, MC 5807193868, Feedlabel EUR_111841149259, Budget **100 €/Tag**, **Ziel-ROAS 250 %**, Standort Deutschland, Suchnetzwerk-Partner aus (Kanalpriorität niedrig), AI Max aus, URL-Erweiterung aus, Kampagnenpriorität niedrig, Suffix `utm_source=google&utm_medium=cpc&utm_campaign=shopping-rest`, Anzeigengruppe „AG \| Rest ohne Biber“ (ID 204858222449) | Kampagnentabelle: Status „Aktiv (lernt)“ |
| ≈ 13:50 | Produktgruppe: „Alle Produkte“ nach custom_label_0 unterteilt, **biber = Ausgeschlossen**, „Alles andere“ = Automatisch | Produktgruppen-Seite |
| ≈ 13:55 | **Performance Max-1 (23943165305) pausiert** (vorher 100 €/Tag, 7 T ROAS 0,31) | Kampagnentabelle: „Pausiert“; Kontobudget jetzt 760 €/Tag (Brand 200, Biber 280, ohne Shopping 150, Shopping Rest 100, Generic 30) |

Offen im Konto: Kampagnen-Entwurf „PMax | Rest | DE (Feed only)“ (Draft 10222713641) ist unbenutzt und kann gelöscht werden. Zielvorhaben der Shopping-Kampagne sind die Kontostandards (Käufe + Anruf/Engagement/YouTube); bei Shopping praktisch nur Kauf wirksam, trotzdem bei S2b mit bereinigen.

Nächste Prüfung: 19.11. (5 Tage Lernphase): Shopping Rest ≥ 2,3 ROAS und Discover im Konto nur noch aus Biber (8 %) und ohne Shopping (33 %). Fällt Shopping Rest unter 1,5 → pausieren, Budget zu Biber.

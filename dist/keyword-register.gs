/* ===================== register.gs =====================
 *
 * Keyword-Register biberna.de
 *
 * Erweiterung des GSC-Collectors. Nutzt denselben API-Abruf, dieselbe
 * CTR-Kurve und dasselbe Sheet - erzeugt daraus aber keine Ads-Kandidaten,
 * sondern eine priorisierte SEO-Liste.
 *
 * WARUM DAS NOETIG WAR
 *
 * Die SEO-Priorisierung wurde bis 09/2026 in jeder Sitzung neu aus einem
 * CSV-Export hergeleitet. Das ging zweimal schief, weil der Export
 * 90-Tage-Durchschnitte liefert und die nach Optimierungen systematisch zu
 * pessimistisch sind. Gemessen an "mikrofaser bettwaesche":
 *
 *     90 Tage 20,9   28 Tage 11,1   7 Tage 6,7   24 Stunden 4,5
 *
 * Daraus wurde "tief vergraben, dringend" - tatsaechlich war das Keyword
 * bereits auf Seite 1. Dieses Skript laeuft auf LOOKBACK_DAYS (30) und
 * wiederholt den Fehler nicht.
 *
 * DIE DREI INTENT-KLASSEN
 *
 * Gemessen 09/2026 ueber 1.000 Queries:
 *
 *     MARKE  224 Queries  1.339 Kl  112k Impr  CTR 1,20 %
 *     TRANS  544 Queries    980 Kl  112k Impr  CTR 0,88 %
 *     INFO   232 Queries    152 Kl   54k Impr  CTR 0,28 %
 *
 * Die Chance wird NUR fuer TRANS berechnet. Bei INFO gilt die CTR-Kurve
 * nachweislich nicht: biberna steht bei "bettwaesche groessen" auf Position
 * 3,0 und bekommt null Klicks, waehrend "biber bettwaesche" auf 3,1 mit
 * 2,9 % klickt. Google beantwortet die Frage selbst. Wer dort rechnet,
 * plant Umsatz ein, der nicht kommt.
 *
 * STATUS: EINGEBAUT UND GETESTET am 20.09.2026
 *
 * Dieser Code ist bereits im Apps-Script-Projekt gsc-collector
 * (Script-ID 1SK8qS8rsmC86la39APYkH6lmXKI6aeZAVEHTw_dbzscnd-87GaZ_ZT91)
 * ans Ende von Code.gs angehaengt, plus eine Zeile in main():
 *
 *     writeRegister_(buildRegister_(gscRows), window);
 *
 * Erster Lauf 20.09.2026, 12:32 Uhr, fehlerfrei:
 *     GSC-Fenster 2026-08-19 bis 2026-09-17, 15.259 Zeilen
 *     TRANS 5.893 Queries / 655 Kl / 97.295 Impr / CTR 0,67 %
 *     INFO  1.605 Queries / 121 Kl / 47.842 Impr / CTR 0,25 %
 *     MARKE 1.443 Queries / 539 Kl / 104.833 Impr / CTR 0,51 %
 *     Potenzial 3.642 Klicks im Fenster, 60 Zeilen ins Sheet
 *
 * Der Tab wird bei Bedarf selbst angelegt - kein manueller Schritt noetig.
 * Laeuft ab jetzt mit dem bestehenden Montags-Trigger (5-6 Uhr) mit.
 *
 * WICHTIG BEI AENDERUNGEN: Quelle der Wahrheit ist das Apps-Script-Projekt,
 * nicht diese Datei. Wer hier editiert, muss den Stand dort nachziehen -
 * der Editor speichert nur ueber den Symbolleisten-Knopf zuverlaessig,
 * Strg+S wird sporadisch verschluckt. Nach dem Speichern neu laden und
 * gegenpruefen.
 * ==================================================================== */

const REGISTER = Object.freeze({
  TAB: 'keyword_register',

  // Zielposition fuer die Chancenrechnung. 3 ist bewusst konservativ -
  // Platz 1 und 2 sind bei kommerziellen Queries meist von Grosshaendlern
  // besetzt.
  TARGET_POSITION: 3,

  // Unter dieser Impressionszahl ist die Position statistisch wertlos.
  MIN_IMPRESSIONS: 200,

  // Zeilen ins Sheet. Mehr liest ohnehin niemand durch.
  MAX_ROWS: 60,

  // Informationale Suchabsicht. Bewusst breit: lieber eine transaktionale
  // Query faelschlich als INFO einsortiert (dann fehlt sie in der Liste)
  // als umgekehrt (dann steht Potenzial drin, das nicht existiert).
  INFO_PATTERN: new RegExp(
    '\\b(was ist|wie |warum|welche[rs]? |wann |unterschied|vorteile|waschen|' +
    'wechseln|pflege|grad|temperatur|trockner|b(ü|ue)geln|erkennen|bedeutet|' +
    'test|vergleich|ratgeber|erkl(ä|ae)rt|gr(ö|oe)ss?e[n]?\\b|standardgr)', 'i'
  ),

  // Artikelnummern im Suchstring = Produkttitel aus dem Feed, keine
  // organische Nachfrage.
  ARTICLE_PATTERN: /\b0\d{6}\b|\d{7}/,
});

const REGISTER_HEADER = Object.freeze([
  'stand', 'rang', 'suchanfrage', 'intent', 'impressionen', 'klicks',
  'ctr', 'position', 'chance_klicks', 'landingpage', 'notiz',
]);

/**
 * MARKE / TRANS / INFO. BRAND_PATTERN kommt aus RULES und wird hier
 * mitbenutzt, damit beide Skripte dieselbe Markendefinition verwenden.
 */
function classifyIntent_(query) {
  if (RULES.BRAND_PATTERN.test(query)) return 'MARKE';
  if (REGISTER.ARTICLE_PATTERN.test(query)) return 'MARKE';
  if (REGISTER.INFO_PATTERN.test(query)) return 'INFO';
  return 'TRANS';
}

/**
 * Verdichtet die query+page-Zeilen der API auf eine Zeile je Suchanfrage.
 *
 * Die Position wird impressionsgewichtet gemittelt - ein ungewichteter
 * Mittelwert ueber Landingpages verzerrt stark, sobald eine Nebenseite mit
 * drei Impressionen auf Position 40 mitzaehlt.
 *
 * Die staerkste Landingpage wird mitgefuehrt. Sie beantwortet ohne
 * Zusatzabfrage, ob ueberhaupt die richtige Seite rankt - der haeufigste
 * Grund fuer eine schlechte Position ist eine falsche Zielseite.
 */
function buildRegister_(gscRows) {
  const byQuery = {};

  gscRows.forEach(function (row) {
    const key = row.query;
    if (!byQuery[key]) {
      byQuery[key] = {
        query: key, clicks: 0, impressions: 0, posSum: 0, pages: {},
      };
    }
    const agg = byQuery[key];
    agg.clicks += row.clicks;
    agg.impressions += row.impressions;
    agg.posSum += row.position * row.impressions;
    agg.pages[row.page] = (agg.pages[row.page] || 0) + row.impressions;
  });

  const entries = Object.keys(byQuery).map(function (key) {
    const agg = byQuery[key];
    const position = agg.impressions > 0 ? agg.posSum / agg.impressions : 0;
    const intent = classifyIntent_(agg.query);

    let topPage = '';
    let topImpr = -1;
    Object.keys(agg.pages).forEach(function (page) {
      if (agg.pages[page] > topImpr) {
        topImpr = agg.pages[page];
        topPage = page;
      }
    });

    // Anteil der staerksten Seite. Unter 60 % ranken mehrere eigene Seiten
    // fuer dieselbe Query - das ist ein Kannibalisierungs-Verdacht und
    // gehoert in die Notizspalte.
    const pageShare = agg.impressions > 0 ? topImpr / agg.impressions : 0;

    let chance = 0;
    if (intent === 'TRANS' && position > REGISTER.TARGET_POSITION) {
      const delta = expectedCtr_(REGISTER.TARGET_POSITION) - expectedCtr_(position);
      chance = agg.impressions * Math.max(0, delta);
    }

    const notizen = [];
    if (pageShare < 0.6 && agg.impressions >= REGISTER.MIN_IMPRESSIONS) {
      notizen.push('mehrere Seiten ranken (' + Math.round(pageShare * 100) + ' % auf der staerksten)');
    }
    if (intent === 'INFO') {
      notizen.push('informational - CTR-Kurve gilt hier nicht');
    }
    if (intent === 'TRANS' && position <= REGISTER.TARGET_POSITION) {
      notizen.push('Ziel erreicht');
    }

    return {
      query: agg.query,
      intent: intent,
      clicks: agg.clicks,
      impressions: agg.impressions,
      ctr: agg.impressions > 0 ? agg.clicks / agg.impressions : 0,
      position: position,
      chance: chance,
      page: topPage,
      notiz: notizen.join('; '),
    };
  });

  const relevant = entries.filter(function (e) {
    return e.impressions >= REGISTER.MIN_IMPRESSIONS;
  });

  relevant.sort(function (a, b) {
    if (b.chance !== a.chance) return b.chance - a.chance;
    return b.impressions - a.impressions;
  });

  // Klassenbilanz ins Protokoll - macht im Ausfuehrungslog sofort sichtbar,
  // ob sich das Verhaeltnis der Intent-Klassen verschoben hat.
  ['TRANS', 'INFO', 'MARKE'].forEach(function (typ) {
    const s = entries.filter(function (e) { return e.intent === typ; });
    const k = s.reduce(function (a, e) { return a + e.clicks; }, 0);
    const i = s.reduce(function (a, e) { return a + e.impressions; }, 0);
    Logger.log(
      typ + ': ' + s.length + ' Queries, ' + k + ' Klicks, ' + i +
      ' Impressionen, CTR ' + (i > 0 ? (k / i * 100).toFixed(2) : '0') + ' %'
    );
  });
  Logger.log(
    'Register-Potenzial (TRANS, ' + REGISTER.MIN_IMPRESSIONS + '+ Impr): ' +
    Math.round(relevant.reduce(function (a, e) { return a + e.chance; }, 0)) +
    ' Klicks im Fenster'
  );

  return relevant;
}

/**
 * Schreibt das Register. Wie writeCandidates_ wird der Tab bei jedem Lauf
 * geleert - das Register ist eine Momentaufnahme, keine Historie. Wer den
 * Verlauf braucht, kopiert den Tab vor dem naechsten Montag weg.
 */
function writeRegister_(entries, window) {
  const buch = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = buch.getSheetByName(REGISTER.TAB);

  // Tab bei Bedarf selbst anlegen. Ein fehlender Tab ist kein Fehlerfall,
  // sondern der Normalzustand beim allerersten Lauf.
  if (sheet === null) {
    sheet = buch.insertSheet(REGISTER.TAB);
    Logger.log('Tab "' + REGISTER.TAB + '" neu angelegt.');
  }

  const rows = entries.slice(0, REGISTER.MAX_ROWS).map(function (e, index) {
    return [
      window.endDate,
      index + 1,
      e.query,
      e.intent,
      e.impressions,
      e.clicks,
      Number(e.ctr.toFixed(4)),
      Number(e.position.toFixed(1)),
      Math.round(e.chance),
      e.page,
      e.notiz,
    ];
  });

  const table = [REGISTER_HEADER].concat(rows);

  sheet.clear();
  sheet.getRange(1, 1, table.length, REGISTER_HEADER.length).setValues(table);
  sheet.setFrozenRows(1);

  Logger.log('Register geschrieben: ' + rows.length + ' Zeilen.');
}

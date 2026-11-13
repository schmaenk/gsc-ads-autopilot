/* ===================== blog.gs =====================
 *
 * Blog-Themenkandidaten biberna.de
 *
 * Dritte Ausgabe des GSC-Collectors, neben gsc_candidates (Ads) und
 * keyword_register (SEO-Kollektionen). Schreibt in den Tab "blog_themen".
 *
 * KORREKTUR 14.10.2026 — DIE FORMATREGEL WAR EIN POSITIONSEFFEKT
 *
 * Die erste Fassung (30.09.) rechnete die Chance gegen einen Benchmark je
 * FORMAT. Grundlage war die Beobachtung, dass Vergleiche und Problemartikel
 * um ein Vielfaches besser klicken als reine Wissensfragen.
 *
 * Am 14.10. mit konstant gehaltener Position nachgerechnet — und die
 * Begruendung faellt in sich zusammen:
 *
 *     Band            VERGLEICH  PROBLEM  SONSTIGE  WISSEN
 *     Position < 6       1,67 %   1,34 %    1,46 %  1,39 %
 *     Position 6-9       0,72 %   0,61 %    1,32 %  0,49 %
 *     Position > 9          -        -      0,50 %  0,36 %
 *
 * Unter Position 6 ist der Formatunterschied verschwunden. Wissensartikel
 * klicken dort so gut wie Vergleiche. Der sauberste Einzelbeleg:
 * "hausstaubmilben-abtoeten-waschen-60-grad" ist eine reine Gradfrage,
 * steht auf Position 4,3 und holt 1,67 % auf 15.394 Impressionen.
 *
 * Der Unterschied liegt darin, WO die Formate ranken:
 *
 *     PROBLEM    Ø Pos 5,7    85 % der Impressionen unter Position 6
 *     VERGLEICH  Ø Pos 6,0    42 %
 *     SONSTIGE   Ø Pos 6,7    42 %
 *     WISSEN     Ø Pos 7,5    12 %
 *
 * Die Chance wird deshalb ab jetzt gegen den Benchmark des POSITIONSBANDES
 * gerechnet. Das Format bleibt als Spalte stehen — es sagt weiterhin etwas
 * darueber aus, welches Ranking ueberhaupt erreichbar ist, und ist damit
 * eine Schreibhilfe. Es ist nur kein Massstab fuer die Klickluecke mehr.
 *
 * Was die alte Fassung falsch machte: Eine Wissensfrage auf Position 4 galt
 * als chancenlos (Benchmark 0,41 %), obwohl sie das Doppelte holt. Und eine
 * SONSTIGE-Anfrage auf Position 12 bekam ein Potenzial zugerechnet, das auf
 * dieser Position niemand hebt.
 *
 * WAS DIE ZAHL NICHT KANN
 *
 * Die Chance vergleicht "was diese Anfrage heute auf ihrer Position holt"
 * mit "was Ratgeber auf derselben Position holen". Dahinter steckt die
 * Annahme, dass ein neuer Artikel dieselbe Position erreicht wie die
 * Kollektion, die heute dort steht. Das ist nicht garantiert - eine
 * Kollektion rankt aus anderen Gruenden als ein Ratgeber.
 *
 * Die Spalte ist also eine Reihenfolge, kein Umsatzversprechen. Wer eine
 * Prognose daraus macht, wiederholt den Fehler, der bei der Formatregel
 * sechs Wochen unentdeckt blieb.
 *
 * EINBAU: Datei anhaengen, dann in main() eine Zeile ergaenzen:
 *     writeBlogThemen_(buildBlogThemen_(gscRows), window);
 * ==================================================================== */

const BLOG = Object.freeze({
  TAB: 'blog_themen',
  MIN_IMPRESSIONS: 150,
  MAX_ROWS: 40,

  // Positionsbaender. Die Grenzen bei 6 und 9 sind gemessen, nicht geraten:
  // Dort springt die CTR im eigenen Blog deutlich (1,47 / 0,76 / 0,38 %).
  BAENDER: [
    ['<6',  0, 6],
    ['6-9', 6, 9],
    ['>9',  9, 999],
  ],

  // Unter dieser Impressionszahl im Band ist der Benchmark nicht belastbar;
  // dann wird fuer dieses Band keine Chance gerechnet.
  MIN_BAND_IMPRESSIONS: 500,

  // Formate in Pruefreihenfolge - die erste Uebereinstimmung gewinnt.
  // VERGLEICH vor WISSEN, weil "was ist der unterschied" ein Vergleich ist.
  // Dient nur noch der Einordnung, nicht mehr der Chancenrechnung.
  FORMATE: [
    ['VERGLEICH',    /\b(oder|vs\.?|unterschied|besser|vergleich|statt)\b/i],
    ['PROBLEM',      /schwitz|kratz|pill|fussel|riech|rutsch|knitter|einlauf|verf(ä|a)rb|schimmel|juck|flecken|muffig|d(ü|u)nn|kalt/i],
    ['ENTSCHEIDUNG', /\b(welche[rs]?|worauf|erkennen|geeignet|empfehl|lohnt|braucht?|richtige[rsn]?)\b/i],
    ['WISSEN',       /\b(was ist|wie viel|wie oft|wann|grad|temperatur|bedeutet|gr(ö|oe|o)(ß|ss|s)e)/i],
  ],
});

const BLOG_HEADER = Object.freeze([
  'stand', 'rang', 'suchanfrage', 'band', 'format', 'impressionen', 'klicks',
  'ctr', 'position', 'zielseite_heute', 'chance_klicks', 'hinweis',
]);

function blogFormat_(query) {
  for (var i = 0; i < BLOG.FORMATE.length; i++) {
    if (BLOG.FORMATE[i][1].test(query)) return BLOG.FORMATE[i][0];
  }
  return 'SONSTIGE';
}

/**
 * Ordnet eine Position einem Band zu. Gibt den Bandnamen zurueck.
 */
function positionsBand_(position) {
  for (var i = 0; i < BLOG.BAENDER.length; i++) {
    var b = BLOG.BAENDER[i];
    if (position >= b[1] && position < b[2]) return b[0];
  }
  return BLOG.BAENDER[BLOG.BAENDER.length - 1][0];
}

/**
 * Verdichtet auf Suchanfragen, misst je POSITIONSBAND die tatsaechliche CTR
 * und meldet die Anfragen, die heute auf einer Shop-Seite statt auf einem
 * Ratgeber landen.
 *
 * Die Logik dahinter: Wenn jemand "welches waschmittel fuer bettwaesche"
 * sucht und auf einer Kollektion landet, beantwortet die Seite die Frage
 * nicht - das ist die Luecke, die ein Artikel fuellt. Landet die Anfrage
 * bereits auf einem Ratgeber, ist das Thema besetzt.
 */
function buildBlogThemen_(gscRows) {
  const byQuery = {};
  gscRows.forEach(function (row) {
    const a = byQuery[row.query] || (byQuery[row.query] = {
      query: row.query, clicks: 0, impressions: 0, posSum: 0, pages: {},
    });
    a.clicks += row.clicks;
    a.impressions += row.impressions;
    a.posSum += row.position * row.impressions;
    a.pages[row.page] = (a.pages[row.page] || 0) + row.impressions;
  });

  const alle = Object.keys(byQuery).map(function (k) {
    const a = byQuery[k];
    let top = '', best = -1;
    Object.keys(a.pages).forEach(function (p) {
      if (a.pages[p] > best) { best = a.pages[p]; top = p; }
    });
    const position = a.impressions > 0 ? a.posSum / a.impressions : 0;
    return {
      query: a.query,
      format: blogFormat_(a.query),
      band: positionsBand_(position),
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: a.impressions > 0 ? a.clicks / a.impressions : 0,
      position: position,
      page: top,
      istRatgeber: top.indexOf('/blogs/') >= 0,
      istMarke: RULES.BRAND_PATTERN.test(a.query),
    };
  });

  // Benchmark je Positionsband: welche CTR erreichen Anfragen, die auf
  // dieser Position schon auf einem Ratgeber landen? Das ist die
  // realistische Zielmarke - was auf Position 8 erreichbar ist, hat mit
  // dem, was auf Position 3 geht, nichts zu tun.
  const benchmark = {};
  BLOG.BAENDER.forEach(function (b) {
    const name = b[0];
    const s = alle.filter(function (e) {
      return e.band === name && e.istRatgeber && !e.istMarke;
    });
    const k = s.reduce(function (x, e) { return x + e.clicks; }, 0);
    const i = s.reduce(function (x, e) { return x + e.impressions; }, 0);
    benchmark[name] = i >= BLOG.MIN_BAND_IMPRESSIONS ? k / i : 0;
    Logger.log('Blog-Benchmark Band ' + name + ': ' + (benchmark[name] * 100).toFixed(2) +
               ' % aus ' + s.length + ' Anfragen / ' + i + ' Impressionen');
  });

  // Zur Kontrolle weiter mitprotokolliert: die CTR je Format INNERHALB der
  // Baender. Laufen die Werte eines Bandes wieder auseinander, ist die
  // Entscheidung von heute neu zu pruefen.
  BLOG.BAENDER.forEach(function (b) {
    const zeile = [];
    ['VERGLEICH', 'PROBLEM', 'ENTSCHEIDUNG', 'WISSEN', 'SONSTIGE'].forEach(function (f) {
      const s = alle.filter(function (e) {
        return e.band === b[0] && e.format === f && e.istRatgeber && !e.istMarke;
      });
      const i = s.reduce(function (x, e) { return x + e.impressions; }, 0);
      const k = s.reduce(function (x, e) { return x + e.clicks; }, 0);
      if (i > 0) zeile.push(f + ' ' + (k / i * 100).toFixed(2) + ' %');
    });
    Logger.log('  Band ' + b[0] + ' nach Format: ' + zeile.join('  |  '));
  });

  // Kandidat = genug Nachfrage, kein Ratgeber als Zielseite, keine Marke,
  // und eine CTR unter dem, was auf dieser Position erreichbar waere.
  const kandidaten = alle.filter(function (e) {
    return e.impressions >= BLOG.MIN_IMPRESSIONS
      && !e.istRatgeber
      && !e.istMarke
      && benchmark[e.band] > e.ctr;
  });

  kandidaten.forEach(function (e) {
    e.chance = e.impressions * (benchmark[e.band] - e.ctr);
    const h = [];
    if (e.band === '>9') {
      h.push('Position ' + e.position.toFixed(1) + ' - erst ranken, dann texten');
    }
    if (e.format === 'WISSEN' && e.band !== '<6') {
      h.push('Wissensfrage ausserhalb der Top 5 - braucht einen Grund, warum sie dort hinkaeme');
    }
    if (e.page.indexOf('/products/') >= 0) {
      h.push('landet heute auf einer Produktseite');
    } else if (e.page.indexOf('/collections/') >= 0) {
      h.push('landet heute auf einer Kollektion');
    }
    e.hinweis = h.join('; ');
  });

  kandidaten.sort(function (a, b) { return b.chance - a.chance; });
  Logger.log('Blog-Themen: ' + kandidaten.length + ' Kandidaten, Potenzial ' +
             Math.round(kandidaten.reduce(function (x, e) { return x + e.chance; }, 0)) +
             ' Klicks im Fenster');
  return kandidaten;
}

function writeBlogThemen_(eintraege, window) {
  const buch = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = buch.getSheetByName(BLOG.TAB);
  if (sheet === null) {
    sheet = buch.insertSheet(BLOG.TAB);
    Logger.log('Tab "' + BLOG.TAB + '" neu angelegt.');
  }

  const rows = eintraege.slice(0, BLOG.MAX_ROWS).map(function (e, i) {
    return [
      window.endDate, i + 1, e.query, e.band, e.format, e.impressions, e.clicks,
      Number(e.ctr.toFixed(4)), Number(e.position.toFixed(1)),
      e.page, Math.round(e.chance), e.hinweis,
    ];
  });

  const table = [BLOG_HEADER].concat(rows);
  sheet.clear();
  sheet.getRange(1, 1, table.length, BLOG_HEADER.length).setValues(table);
  sheet.setFrozenRows(1);
  Logger.log('Blog-Themen geschrieben: ' + rows.length + ' Zeilen.');
}

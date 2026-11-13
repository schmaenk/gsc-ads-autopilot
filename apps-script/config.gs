/**
 * Zentrale Konfiguration des GSC-Collectors.
 *
 * Einzige benoetigte Script Property:
 *   Projekteinstellungen -> Skripteigenschaften -> SHEET_ID
 *
 * Es gibt bewusst kein Shopify-Token: die Sortimentsdaten kommen vom
 * oeffentlichen Endpunkt /products.json.
 */
const PROPS = PropertiesService.getScriptProperties();

const CONFIG = Object.freeze({
  // Geprueft am 06.09.2026: einzige bestaetigte Property des Kontos
  // mschmaenk@biberna.de. www ist der kanonische Host, biberna.de leitet
  // per 301 dorthin um. sc-domain:biberna.de existiert nicht.
  GSC_SITE: 'https://www.biberna.de/',

  SHEET_ID:       PROPS.getProperty('SHEET_ID'),
  TAB_CANDIDATES: 'gsc_candidates',
  TAB_BLOCKLIST:  'blocklist',

  LOOKBACK_DAYS: 30,
  DATA_LAG_DAYS: 3,      // GSC-Daten sind erst nach ca. 3 Tagen final
  GSC_PAGE_SIZE: 25000,  // API-Maximum pro Request

  // Abbruchschwelle gegen stilles Leerlaufen: liefert die API weniger Zeilen,
  // stimmt etwas mit der Property nicht - dann lieber ein harter Fehler als
  // eine leere Kandidatenliste, die niemandem auffaellt.
  MIN_EXPECTED_GSC_ROWS: 50,

  // Sortimentsdaten kommen vom oeffentlichen Storefront-Endpunkt
  // /products.json - kein Token, keine Custom App, nichts was ablaeuft.
  // Geprueft 08.09.2026: 309 aktive Produkte auf 2 Seiten, 58 ausverkauft.
  SHOP_BASE:             'https://www.biberna.de',
  SHOP_PAGE_SIZE:        250,
  MIN_EXPECTED_PRODUCTS: 50,

  REPORT_TO: 'mschmaenk@biberna.de',
});

const RULES = Object.freeze({
  MIN_IMPRESSIONS_R1: 100,
  MIN_IMPRESSIONS_R2: 250,
  // R3 braucht eine Untergrenze: bei 1 Impression ist jede CTR trivial ueber
  // der Erwartung. Ohne Schwelle bestand die erste Kandidatenliste zu zwei
  // Dritteln aus solchen Messartefakten.
  MIN_IMPRESSIONS_R3: 50,
  STRIKING_MIN_POS:   8.0,
  STRIKING_MAX_POS:   20.0,
  MIN_CTR_RATIO:      0.7,
  MIN_WORDS:          2,     // Ein-Wort-Queries sind zu breit
  MAX_WORDS:          6,     // 7+ Woerter sind Longtail-Rauschen
  // Eigenmarken und Firmenname. Gehoeren in die separate Brand-Kampagne.
  // Ergaenzt 08.09.2026: der erste echte Lauf lieferte "schmaenk bettwaesche"
  // und "castell bettwaesche hersteller" als Kandidaten.
  BRAND_PATTERN:      /bib+e?r+na|bibarna|schm(ä|ae)nk|castell/i,
  MAX_CANDIDATES:     25,    // pro Lauf ins Sheet
});

/**
 * Erwartete organische CTR je Ø-Position. Heuristik.
 * Nach ca. 8 Wochen aus den eigenen GSC-Daten je Positions-Bucket
 * neu berechnen - Shopping-Boxen druecken die organische CTR auf
 * kommerziellen SERPs deutlich unter diese Kurve.
 */
const CTR_CURVE = Object.freeze(
  [0.27, 0.15, 0.11, 0.08, 0.07, 0.05, 0.04, 0.035, 0.03, 0.025]
);

function expectedCtr_(position) {
  const index = Math.round(position) - 1;
  if (index < 0) return CTR_CURVE[0];
  if (index < CTR_CURVE.length) return CTR_CURVE[index];
  return position <= 20 ? 0.015 : 0.008;
}

/** Bricht mit klarer Meldung ab, wenn Script Properties fehlen. */
function requireConfig_() {
  const missing = ['SHEET_ID']
    .filter(function (key) { return !PROPS.getProperty(key); });

  if (missing.length > 0) {
    throw new Error(
      'Fehlende Script Properties: ' + missing.join(', ') + '. ' +
      'Projekteinstellungen -> Skripteigenschaften ergaenzen. Siehe SETUP.md.'
    );
  }
}

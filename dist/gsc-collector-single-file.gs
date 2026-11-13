// gsc-collector - EINZELDATEI-FASSUNG (generiert 08.09.2026, Fixes R3/Brand/URL/Vokabular)
// Nicht hier editieren - Quelle der Wahrheit ist apps-script/.

/* ===================== config.gs ===================== */

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

/* ===================== gsc.gs ===================== */

/**
 * Zugriff auf die Google Search Console Search Analytics API.
 *
 * Authentifizierung laeuft ueber ScriptApp.getOAuthToken() - das Skript
 * handelt im Namen des angemeldeten Kontos. Kein OAuth-Client, kein
 * Refresh-Token, keine Drittanbieter-App.
 */

/**
 * Holt alle Rows (query x page) fuer den Zeitraum, paginiert ueber startRow.
 * @param {string} startDate yyyy-MM-dd
 * @param {string} endDate   yyyy-MM-dd
 * @return {Array<Object>} rohe API-Rows
 */
function fetchGscRows_(startDate, endDate) {
  const endpoint = 'https://www.googleapis.com/webmasters/v3/sites/' +
    encodeURIComponent(CONFIG.GSC_SITE) + '/searchAnalytics/query';

  const fetchPage = function (startRow, accumulated) {
    const payload = {
      startDate: startDate,
      endDate: endDate,
      dimensions: ['query', 'page'],
      type: 'web',
      dataState: 'final',
      rowLimit: CONFIG.GSC_PAGE_SIZE,
      startRow: startRow,
    };

    const response = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const status = response.getResponseCode();

    if (status === 403) {
      throw new Error(
        'GSC API 403 - kein Zugriff auf "' + CONFIG.GSC_SITE + '". Pruefen: ' +
        '(1) laeuft das Skript unter mschmaenk@biberna.de (zweites Konto, /u/1)? ' +
        '(2) exakter Property-String inkl. www und Trailing Slash? ' +
        'Antwort: ' + response.getContentText().slice(0, 300)
      );
    }
    if (status !== 200) {
      throw new Error(
        'GSC API antwortete ' + status + '. Antwort: ' +
        response.getContentText().slice(0, 400)
      );
    }

    const rows = JSON.parse(response.getContentText()).rows || [];
    const next = accumulated.concat(rows);

    return rows.length < CONFIG.GSC_PAGE_SIZE
      ? next
      : fetchPage(startRow + CONFIG.GSC_PAGE_SIZE, next);
  };

  return fetchPage(0, []);
}

/** Rohe API-Rows in ein flaches, benanntes und unveraenderliches Format. */
function normalizeGscRows_(rows) {
  return rows.map(function (row) {
    return Object.freeze({
      query:       String(row.keys[0]).toLowerCase().trim(),
      page:        cleanPageUrl_(row.keys[1]),
      clicks:      Number(row.clicks) || 0,
      impressions: Number(row.impressions) || 0,
      ctr:         Number(row.ctr) || 0,
      position:    Number(row.position) || 0,
    });
  });
}

/**
 * Query-Parameter und Fragment aus der Page-URL entfernen und den Host auf
 * den kanonischen setzen.
 *
 * Zwei Gruende: (1) GSC liefert teils URLs mit angehaengten UTM-Parametern -
 * eine Anzeige mit "utm_medium=product_sync" in der Final URL wuerde
 * bezahlten Traffic als kostenlosen Shopping-Eintrag verbuchen. (2) Ohne
 * Normalisierung erzeugt dieselbe Produktseite mit und ohne ?variant=
 * zwei getrennte Anzeigengruppen.
 */
function cleanPageUrl_(url) {
  const path = String(url).split('#')[0].split('?')[0]
    .replace(/^https?:\/\/[^/]+/, '');
  return CONFIG.SHOP_BASE + (path.charAt(0) === '/' ? path : '/' + path);
}

/**
 * Datumsfenster fuer den Abruf. Endet DATA_LAG_DAYS in der Vergangenheit,
 * damit ausschliesslich finale Daten einfliessen.
 */
function reportWindow_(today) {
  const end = new Date(today.getTime());
  end.setDate(end.getDate() - CONFIG.DATA_LAG_DAYS);

  const start = new Date(end.getTime());
  start.setDate(start.getDate() - CONFIG.LOOKBACK_DAYS + 1);

  const format = function (date) {
    return Utilities.formatDate(date, 'Europe/Berlin', 'yyyy-MM-dd');
  };

  return Object.freeze({ startDate: format(start), endDate: format(end) });
}

/* ===================== shopify.gs ===================== */

/**
 * Shopify-Sortimentsdaten ueber den oeffentlichen Storefront-Endpunkt
 * /products.json.
 *
 * Bewusst KEINE Admin-API: Shopify hat Custom Apps ins Dev Dashboard
 * verlagert, wo es keinen statischen Admin-API-Token mehr gibt (der dort
 * angebotene "App-Automatisierungstoken" ist ein CI/CD-Credential und
 * authentifiziert nicht gegen den Shop). /products.json braucht keinerlei
 * Authentifizierung, liefert genau die benoetigten Felder und kennt kein
 * Token, das ablaufen oder rotiert werden koennte.
 *
 * Geliefert werden nur aktive, im Onlineshop veroeffentlichte Produkte -
 * genau die Menge, fuer die wir werben wollen.
 *
 * Grenze: Der Endpunkt ist oeffentlich. Wuerde der Shop mit Passwortschutz
 * versehen, liefert er kein JSON mehr. Der Guard in fetchShopifyCatalog_()
 * bricht dann mit klarer Meldung ab statt still weiterzulaufen.
 */

/**
 * Laedt alle Produkte, paginiert ueber ?page=.
 * @return {Array<Object>} Produkte im Storefront-JSON-Format
 */
function fetchShopifyCatalog_() {
  const fetchPage = function (page, accumulated) {
    const url = CONFIG.SHOP_BASE + '/products.json?limit=' +
      CONFIG.SHOP_PAGE_SIZE + '&page=' + page;

    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true,
    });

    const status = response.getResponseCode();
    if (status !== 200) {
      throw new Error(
        'products.json antwortete ' + status + ' fuer ' + url + '. ' +
        'Moegliche Ursachen: Shop passwortgeschuetzt, Endpunkt deaktiviert ' +
        'oder falsche Basis-URL in CONFIG.SHOP_BASE.'
      );
    }

    let products;
    try {
      products = JSON.parse(response.getContentText()).products || [];
    } catch (error) {
      throw new Error(
        'products.json lieferte kein JSON (vermutlich eine HTML-Seite, ' +
        'z. B. Passwortschutz). Erste 200 Zeichen: ' +
        response.getContentText().slice(0, 200)
      );
    }

    const next = accumulated.concat(products);

    return products.length < CONFIG.SHOP_PAGE_SIZE
      ? next
      : fetchPage(page + 1, next);
  };

  const catalog = fetchPage(1, []);

  // Guard gegen stilles Leerlaufen - ohne Sortiment verwirft R6 alles.
  if (catalog.length < CONFIG.MIN_EXPECTED_PRODUCTS) {
    throw new Error(
      'Nur ' + catalog.length + ' Produkte erhalten (erwartet mindestens ' +
      CONFIG.MIN_EXPECTED_PRODUCTS + '). Ohne Sortiment wuerde der ' +
      'Relevanzfilter R6 jeden Kandidaten verwerfen.'
    );
  }

  return catalog;
}

/**
 * Menge relevanter Tokens aus Titeln, Produkttypen und Tags.
 *
 * Nur Tokens ab 4 Zeichen - kuerzere sind Fuellwoerter. Rein numerische
 * Tokens fliegen raus: die Titel enthalten Artikelnummern wie "0044486",
 * die sonst jede Suchanfrage mit einer beliebigen Zahl durch den
 * Relevanzfilter lassen wuerden.
 */
function buildVocabulary_(products) {
  const isNumeric = function (token) { return /^[0-9]+$/.test(token); };

  const tokens = products.reduce(function (acc, product) {
    // Tags sind bei biberna Schluessel-Wert-Paare wie "Qualitaet: Linon".
    // Nur der Wert ist ein Sortimentsbegriff - die Schluessel (qualitaet,
    // dessin, kategorie, marke, herkunft, kollektion) sind Meta-Woerter und
    // liessen sonst sortimentsfremde Suchanfragen durch R6.
    const tagValues = (product.tags || []).map(function (tag) {
      const separator = String(tag).indexOf(':');
      return separator === -1 ? String(tag) : String(tag).slice(separator + 1);
    });

    const text = [product.title, product.product_type]
      .concat(tagValues)
      .join(' ')
      .toLowerCase();

    const parts = text
      .split(/[^a-z0-9äöüß]+/)
      .filter(function (token) {
        return token.length >= 4 && !isNumeric(token);
      });

    return acc.concat(parts);
  }, []);

  return new Set(tokens);
}

/**
 * handle -> lieferbar (boolean).
 *
 * Lieferbar heisst: mindestens eine Variante ist kaufbar. Das Feld
 * `available` im Storefront-JSON beruecksichtigt auch die Einstellung
 * "Verkauf bei ausverkauftem Bestand fortsetzen" - fuer die Frage
 * "kann jemand das kaufen?" ist das genauer als ein reiner Bestandswert.
 */
function buildAvailabilityIndex_(products) {
  return products.reduce(function (index, product) {
    const variants = product.variants || [];
    index[product.handle] = variants.some(function (variant) {
      return variant.available === true;
    });
    return index;
  }, {});
}

/** Shopify-Handle aus einer GSC-Page-URL. null, wenn keine Produktseite. */
function handleFromUrl_(url) {
  const match = String(url).match(/\/products\/([^/?#]+)/);
  return match ? match[1] : null;
}

/* ===================== rules.gs ===================== */

/**
 * Regelwerk R1-R8. Bewertet jede GSC-Row und gibt eine Entscheidung mit
 * Begruendung zurueck - auch fuer verworfene Zeilen, damit im Sheet
 * nachvollziehbar bleibt, warum etwas NICHT angelegt wurde.
 *
 * @return {{rule:string, action:string, reason:string, score:number}}
 *         action: 'create' | 'create_low_bid' | 'flag' | 'reject'
 */
function classifyRow_(row, vocabulary, availability, blocklist) {
  const decide = function (rule, action, reason) {
    return Object.freeze({ rule: rule, action: action, reason: reason, score: 0 });
  };

  // R4 - Brand gehoert in die separate Brand-Kampagne, nicht in den Autopilot
  if (RULES.BRAND_PATTERN.test(row.query)) {
    return decide('R4', 'reject', 'Brand-Query');
  }

  const words = row.query.split(/\s+/).filter(Boolean);
  if (words.length < RULES.MIN_WORDS) {
    return decide('R6', 'reject', 'Zu breit: nur ' + words.length + ' Wort');
  }
  if (words.length > RULES.MAX_WORDS) {
    return decide('R6', 'reject', 'Longtail-Rauschen: ' + words.length + ' Woerter');
  }

  // R6 - Blocklist
  const blocked = blocklist.filter(function (term) {
    return row.query.indexOf(term) !== -1;
  })[0];
  if (blocked) {
    return decide('R6', 'reject', 'Blocklist-Treffer: ' + blocked);
  }

  // R6 - mindestens ein Token muss aus dem Shopify-Sortiment stammen
  const hasProductToken = words.some(function (word) {
    return vocabulary.has(word);
  });
  if (!hasProductToken) {
    return decide('R6', 'reject', 'Kein Token im Shopify-Vokabular');
  }

  // R7 - Landingpage muss ein lieferbares Produkt sein.
  // Kollektions- und Contentseiten haben kein handle und werden durchgelassen.
  const handle = handleFromUrl_(row.page);
  if (handle !== null && availability[handle] !== true) {
    return decide('R7', 'reject', 'Produkt ' + handle + ' inaktiv oder ausverkauft');
  }

  const ctrRatio = row.ctr / expectedCtr_(row.position);

  // R3 - organisch stark: bewusst NICHT bewerben, sonst kannibalisiert
  // bezahlter Traffic einen Platz, den wir ohnehin haben
  if (row.position <= 3
      && row.impressions >= RULES.MIN_IMPRESSIONS_R3
      && ctrRatio >= 1) {
    return decide('R3', 'flag', 'Organisch Top-3 - Kannibalisierung vermeiden');
  }

  // R1 - Striking Distance: Nachfrage vorhanden, Ranking knapp hinter Seite 1
  const inStrikingRange = row.position >= RULES.STRIKING_MIN_POS
    && row.position <= RULES.STRIKING_MAX_POS;

  if (inStrikingRange
      && row.impressions >= RULES.MIN_IMPRESSIONS_R1
      && ctrRatio >= RULES.MIN_CTR_RATIO) {
    return Object.freeze({
      rule:   'R1',
      action: 'create',
      score:  row.impressions * ctrRatio * (21 - row.position) / 13,
      reason: 'Pos ' + row.position.toFixed(1) + ', CTR ' +
              (ctrRatio * 100).toFixed(0) + '% der Erwartung',
    });
  }

  // R2 - Nachfrage ohne jedes Ranking: bebuchen, aber mit reduziertem Gebot
  if (row.position > RULES.STRIKING_MAX_POS
      && row.impressions >= RULES.MIN_IMPRESSIONS_R2
      && row.clicks < 3) {
    return Object.freeze({
      rule:   'R2',
      action: 'create_low_bid',
      score:  row.impressions * 0.3,
      reason: 'Pos ' + row.position.toFixed(1) + ' ohne organische Klicks',
    });
  }

  return decide('-', 'reject', 'Kein Regeltreffer');
}

/* ===================== Code.gs ===================== */

/**
 * GSC-Collector - Entrypoint.
 *
 * Laeuft woechentlich per zeitgesteuertem Trigger (Mo 05:00). Liest die
 * Search-Console-Daten der letzten 30 Tage, bewertet sie gegen das
 * Shopify-Sortiment und schreibt die besten Kandidaten ins Sheet.
 *
 * Schreibt NICHT nach Google Ads - das macht ads-script/ads-writer.js.
 */

const SHEET_HEADER = Object.freeze([
  'run_date', 'query', 'landing_page', 'impressions', 'clicks',
  'ctr', 'position', 'rule', 'action', 'reason', 'score', 'override',
]);

function main() {
  try {
    requireConfig_();

    const window = reportWindow_(new Date());
    Logger.log('GSC-Fenster: ' + window.startDate + ' bis ' + window.endDate);

    const gscRows = normalizeGscRows_(
      fetchGscRows_(window.startDate, window.endDate)
    );
    Logger.log('GSC-Rows: ' + gscRows.length);

    // Guard gegen stilles Leerlaufen: eine falsche Property antwortet mit
    // 200 OK und fast keinen Zeilen. Das soll auffallen.
    if (gscRows.length < CONFIG.MIN_EXPECTED_GSC_ROWS) {
      throw new Error(
        'Nur ' + gscRows.length + ' GSC-Rows erhalten (erwartet mindestens ' +
        CONFIG.MIN_EXPECTED_GSC_ROWS + '). Property "' + CONFIG.GSC_SITE +
        '" pruefen - vermutlich falscher Host oder falsches Konto.'
      );
    }

    const products = fetchShopifyCatalog_();
    const vocabulary = buildVocabulary_(products);
    const availability = buildAvailabilityIndex_(products);
    const blocklist = readBlocklist_();
    Logger.log(
      'Shopify: ' + products.length + ' aktive Produkte, ' +
      vocabulary.size + ' Vokabular-Tokens, ' +
      blocklist.length + ' Blocklist-Begriffe'
    );

    const classified = gscRows.map(function (row) {
      return Object.freeze({
        row: row,
        decision: classifyRow_(row, vocabulary, availability, blocklist),
      });
    });

    const candidates = classified
      .filter(function (entry) { return entry.decision.action !== 'reject'; })
      .sort(function (a, b) { return b.decision.score - a.decision.score; })
      .slice(0, RULES.MAX_CANDIDATES);

    writeCandidates_(candidates, window);

    Logger.log(
      'Fertig. ' + candidates.length + ' Kandidaten geschrieben, ' +
      classified.length + ' Zeilen bewertet.'
    );
  } catch (error) {
    Logger.log('ABBRUCH: ' + error.message + '\n' + error.stack);
    MailApp.sendEmail({
      to: CONFIG.REPORT_TO,
      subject: '[GSC-Autopilot] Collector fehlgeschlagen',
      body: error.message + '\n\n' + error.stack,
    });
    throw error;   // Ausfuehrungsverlauf soll rot werden
  }
}

/** Blocklist-Tab lesen. Leerer Tab ist kein Fehler. */
function readBlocklist_() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
    .getSheetByName(CONFIG.TAB_BLOCKLIST);

  if (sheet === null || sheet.getLastRow() === 0) return [];

  return sheet.getRange(1, 1, sheet.getLastRow(), 1)
    .getValues()
    .map(function (cells) { return String(cells[0]).toLowerCase().trim(); })
    .filter(Boolean);
}

/**
 * Kandidaten-Tab vollstaendig neu schreiben - ein einziges setValues,
 * damit der Lauf auch bei vielen Zeilen schnell bleibt.
 */
function writeCandidates_(candidates, window) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
    .getSheetByName(CONFIG.TAB_CANDIDATES);

  if (sheet === null) {
    throw new Error('Tab "' + CONFIG.TAB_CANDIDATES + '" fehlt im Sheet.');
  }

  const rows = candidates.map(function (entry) {
    return [
      window.endDate,
      entry.row.query,
      entry.row.page,
      entry.row.impressions,
      entry.row.clicks,
      Number(entry.row.ctr.toFixed(4)),
      Number(entry.row.position.toFixed(1)),
      entry.decision.rule,
      entry.decision.action,
      entry.decision.reason,
      Math.round(entry.decision.score),
      '',   // override: hier "skip" eintragen, um einen Kandidaten zu vetoen
    ];
  });

  const table = [SHEET_HEADER].concat(rows);

  sheet.clear();
  sheet.getRange(1, 1, table.length, SHEET_HEADER.length).setValues(table);
  sheet.setFrozenRows(1);
}

/**
 * Einmalige Hilfsfunktion fuer die Einrichtung: listet alle Properties des
 * angemeldeten Kontos mit dem exakten API-String. Nicht Teil des Ablaufs.
 */
function listGscProperties() {
  const response = UrlFetchApp.fetch(
    'https://www.googleapis.com/webmasters/v3/sites',
    {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    }
  );

  if (response.getResponseCode() !== 200) {
    throw new Error(
      'API ' + response.getResponseCode() + ': ' +
      response.getContentText().slice(0, 400)
    );
  }

  const entries = JSON.parse(response.getContentText()).siteEntry || [];
  entries.forEach(function (entry) {
    const type = entry.siteUrl.indexOf('sc-domain:') === 0 ? 'DOMAIN' : 'URL-PRAEFIX';
    Logger.log(type + '  ' + entry.siteUrl + '   (' + entry.permissionLevel + ')');
  });
}


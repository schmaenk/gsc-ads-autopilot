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

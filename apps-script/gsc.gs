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

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

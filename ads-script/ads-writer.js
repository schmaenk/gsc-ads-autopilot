/**
 * ads-writer - Google Ads Script (KEIN Apps Script).
 *
 * Liest die Kandidaten aus dem Sheet und legt sie PAUSIERT im Konto an.
 * Entzieht die angelegten Begriffe per gemeinsamer Ausschlussliste den
 * PMax-Kampagnen, damit es keinen Wettbewerb zwischen eigenen Kampagnen gibt.
 *
 * Einfuegen unter: Google Ads -> Tools -> Bulk-Aktionen -> Skripte
 * Zeitplan: woechentlich, Montag 07:00
 *
 * Grundsaetze:
 *   - Das Skript erzeugt NIE Kampagnen oder Budgets.
 *   - Alles wird pausiert angelegt. Freigabe erfolgt manuell.
 *   - Harte Obergrenzen fuer CPC, Keywords pro Lauf und Gesamtrevier.
 *
 * Hinweis zur Struktur: Google Ads Scripts erlauben nur eine Datei pro
 * Skript. Die sonst uebliche Aufteilung in kleine Module ist hier
 * plattformseitig nicht moeglich - daher klar getrennte Abschnitte.
 * Datenstrukturen nutzen einfache Objekt-Maps statt Set/Map, damit das
 * Skript unabhaengig von der Runtime-Version des Kontos laeuft.
 */

var CFG = Object.freeze({
  SHEET_URL:      'https://docs.google.com/spreadsheets/d/10gJEzsH9pCqCqCfLFnvbycK89_fjdE_2Vkq9U5VDAhc/edit',
  TAB_CANDIDATES: 'gsc_candidates',
  TAB_SEEDS:      'seed_keywords',   // manuell gepflegte Keywords (Mitbewerber-/Planer-Recherche)
  TAB_CHANGELOG:  'changelog',

  // Umgestellt 09.09.2026 auf die Struktur aus sea-autopilot/STRATEGIE.md
  // (Abschnitt 2, Stufe 1). Vorher: 'Search | GSC-Autopilot | DE'.
  //
  // WICHTIG: Die Kampagne im Konto muss denselben Namen tragen. Umbenennen
  // statt neu anlegen - eine neue Kampagne verliert Historie, Label und
  // Lernphase, und zwei Kampagnen mit denselben Exact-Match-Keywords
  // bieten gegeneinander.
  CAMPAIGN_NAME:      'Search | Generic | DE',
  LABEL:              'gsc-autopilot',
  PMAX_NEGATIVE_LIST: 'PMax Carve-Out',

  MAX_NEW_KEYWORDS_PER_RUN:      120,  // 08.10.2026: Seed-Liste in einem Lauf
  MAX_NEW_ADGROUPS_PER_RUN:      40,
  MAX_ACTIVE_AUTOPILOT_KEYWORDS: 150,   // Deckel fuer das Gesamtrevier

  MAX_CPC_CEILING: 0.80,   // EUR - harte Obergrenze, gilt immer
  FALLBACK_CPC:    0.35,   // wenn kein Konto-Durchschnitts-CPC ermittelbar
  LOW_BID_FACTOR:  0.6,    // fuer action = create_low_bid (Regel R2)

  CANONICAL_HOST: 'https://www.biberna.de',
  REPORT_TO:      'mschmaenk@biberna.de',
});

/* ======================================================================
   Hauptablauf
   ====================================================================== */

function main() {
  var isPreview = AdsApp.getExecutionInfo().isPreview();
  var log = [];
  var note = function (line) { log.push(line); Logger.log(line); };

  try {
    if (isPreview) {
      note('VORSCHAU-MODUS - es werden keine Aenderungen angewendet.');
    }

    var campaign = resolveCampaign_();
    assertCarveOutNotSelfApplied_(campaign);
    var labelReady = resolveLabelReadiness_(isPreview, note);

    var activeCount = countAutopilotKeywords_();
    if (activeCount >= CFG.MAX_ACTIVE_AUTOPILOT_KEYWORDS) {
      note(
        'Revier-Deckel erreicht: ' + activeCount + ' von ' +
        CFG.MAX_ACTIVE_AUTOPILOT_KEYWORDS + ' Autopilot-Keywords. ' +
        'Keine Neuanlage. Deckel in CFG bewusst erhoehen oder aufraeumen.'
      );
      sendReport_([], log, isPreview);
      return;
    }

    var existing  = collectExistingKeywords_();
    var negatives = collectNegatives_();
    var baseCpc   = deriveBaseCpc_();

    note(
      'Bestand: ' + countKeys_(existing) + ' Keywords, ' +
      countKeys_(negatives) + ' Negatives, Autopilot-Revier ' + activeCount +
      '/' + CFG.MAX_ACTIVE_AUTOPILOT_KEYWORDS + ', Basis-CPC ' +
      baseCpc.toFixed(2) + ' EUR'
    );

    var headroom = CFG.MAX_ACTIVE_AUTOPILOT_KEYWORDS - activeCount;
    var limit = Math.min(CFG.MAX_NEW_KEYWORDS_PER_RUN, headroom);

    var seeds = readSeeds_();
    var candidates = seeds.concat(readCandidates_());   // Seeds zuerst: manuelle Prioritaet
    var eligible = filterEligible_(candidates, existing, negatives).slice(0, limit);

    note(
      'Kandidaten: ' + candidates.length + ' gelesen (davon ' + seeds.length + ' Seeds), ' +
      eligible.length + ' zulaessig (Limit ' + limit + ')'
    );

    var created = applyCandidates_(
      campaign, eligible, baseCpc, existing, labelReady, note
    );
    syncPmaxCarveOut_(created, note);
    writeChangelog_(created, isPreview);
    sendReport_(created, log, isPreview);

    note('Fertig. ' + created.length + ' Keywords angelegt (pausiert).');
  } catch (error) {
    Logger.log('ABBRUCH: ' + error.message);
    MailApp.sendEmail(
      CFG.REPORT_TO,
      '[GSC-Autopilot] ads-writer fehlgeschlagen',
      error.message + '\n\n--- Log ---\n' + log.join('\n')
    );
    throw error;
  }
}

/* ======================================================================
   Bestandsaufnahme und Sicherheitschecks
   ====================================================================== */

/** Die Zielkampagne muss existieren. Das Skript legt bewusst keine an. */
function resolveCampaign_() {
  var iterator = AdsApp.campaigns()
    .withCondition('campaign.name = "' + CFG.CAMPAIGN_NAME + '"')
    .get();

  if (!iterator.hasNext()) {
    throw new Error(
      'Kampagne "' + CFG.CAMPAIGN_NAME + '" nicht gefunden. Sie muss manuell ' +
      'inklusive Budget angelegt werden - das Skript erzeugt niemals Budgets. ' +
      'Siehe SETUP.md, Abschnitt A.'
    );
  }
  return iterator.next();
}

/**
 * Die Carve-Out-Liste gehoert ausschliesslich an die PMax-Kampagnen.
 * Haengt sie an der Autopilot-Kampagne, wuerde diese ihre eigenen
 * Keywords ausschliessen und stillschweigend nichts ausliefern.
 */
function assertCarveOutNotSelfApplied_(campaign) {
  var lists = campaign.negativeKeywordLists().get();
  while (lists.hasNext()) {
    if (lists.next().getName() === CFG.PMAX_NEGATIVE_LIST) {
      throw new Error(
        'Liste "' + CFG.PMAX_NEGATIVE_LIST + '" ist mit der Autopilot-Kampagne ' +
        'verknuepft. Sie gehoert nur an die PMax-Kampagnen. Verknuepfung in ' +
        'der Kampagne entfernen, dann erneut ausfuehren.'
      );
    }
  }
}

/**
 * Stellt fest, ob in diesem Lauf gelabelt werden darf.
 *
 * applyLabel() erzeugt KEIN Label. Fehlt der Name im Konto, wirft Google Ads
 * einen SystemError - und der beendet das Skript, auch innerhalb von
 * try/catch. Genau daran sind die Vorschau-Laeufe am 08.09.2026 nach der
 * ersten Anzeigengruppe gestorben:
 *   SystemError: Expected one label named 'gsc-autopilot' but found 0
 *
 * Deshalb wird vorher geprueft statt hinterher aufgefangen. Im Vorschau-Modus
 * wendet Google Ads auch createLabel nicht an - dort wird das Labeln
 * uebersprungen, damit die Vorschau ihren Zweck erfuellt.
 *
 * @return {boolean} true, wenn applyLabel gefahrlos aufgerufen werden kann
 */
function resolveLabelReadiness_(isPreview, note) {
  if (labelExists_()) return true;

  if (isPreview) {
    note(
      'Label "' + CFG.LABEL + '" fehlt im Konto. In der Vorschau kann es ' +
      'nicht angelegt werden - Labels werden in diesem Lauf uebersprungen. ' +
      'Beim echten Lauf legt das Skript es selbst an.'
    );
    return false;
  }

  AdsApp.createLabel(CFG.LABEL);

  // Nach dem Anlegen erneut nachsehen: nur wenn das Label wirklich
  // auffindbar ist, darf applyLabel aufgerufen werden.
  if (labelExists_()) {
    note('Label "' + CFG.LABEL + '" im Konto angelegt.');
    return true;
  }

  note(
    'WARNUNG: Label "' + CFG.LABEL + '" wurde angelegt, ist aber in diesem ' +
    'Lauf noch nicht auffindbar. Labels werden uebersprungen. Folge: ' +
    'countAutopilotKeywords_() zaehlt den Revier-Deckel zu niedrig, bis der ' +
    'naechste Lauf nachlabelt.'
  );
  return false;
}

function labelExists_() {
  return AdsApp.labels()
    .withCondition('label.name = "' + CFG.LABEL + '"')
    .get()
    .hasNext();
}

/** Anzahl nicht entfernter Keywords mit Autopilot-Label. */
function countAutopilotKeywords_() {
  var labels = AdsApp.labels()
    .withCondition('label.name = "' + CFG.LABEL + '"')
    .get();

  if (!labels.hasNext()) return 0;

  return labels.next().keywords()
    .withCondition('ad_group_criterion.status != "REMOVED"')
    .get()
    .totalNumEntities();
}

/**
 * Alle nicht entfernten Keywords des KONTOS, normalisiert.
 * Kontoweit und inklusive pausierter Keywords - ein bewusst pausiertes
 * Keyword darf nicht in der naechsten Woche neu angelegt werden.
 */
function collectExistingKeywords_() {
  var map = {};
  var iterator = AdsApp.keywords()
    .withCondition('ad_group_criterion.status != "REMOVED"')
    .get();

  while (iterator.hasNext()) {
    map[normalize_(iterator.next().getText())] = true;
  }
  return map;
}

/**
 * Negatives aus Kampagnen und gemeinsamen Listen.
 *
 * WICHTIG: Die Carve-Out-Liste wird uebersprungen. Sie enthaelt per Design
 * genau die Autopilot-Keywords - ohne diese Ausnahme wuerde die Pipeline ab
 * dem zweiten Lauf ihre eigenen Begriffe blockieren, und zwar lautlos.
 * Der Schutz gegen Doppelanlage bleibt vollstaendig, weil
 * collectExistingKeywords_() alle positiven Keywords des Kontos prueft.
 */
function collectNegatives_() {
  var map = {};

  var campaigns = AdsApp.campaigns().get();
  while (campaigns.hasNext()) {
    var negatives = campaigns.next().negativeKeywords().get();
    while (negatives.hasNext()) {
      map[normalize_(negatives.next().getText())] = true;
    }
  }

  var lists = AdsApp.negativeKeywordLists().get();
  while (lists.hasNext()) {
    var list = lists.next();
    if (list.getName() === CFG.PMAX_NEGATIVE_LIST) continue;   // eigenes Revier

    var listNegatives = list.negativeKeywords().get();
    while (listNegatives.hasNext()) {
      map[normalize_(listNegatives.next().getText())] = true;
    }
  }
  return map;
}

/** Basis-CPC aus dem Konto-Durchschnitt der letzten 30 Tage, hart gedeckelt. */
function deriveBaseCpc_() {
  var report = AdsApp.report(
    'SELECT metrics.average_cpc FROM customer ' +
    'WHERE segments.date DURING LAST_30_DAYS'
  );

  var rows = report.rows();
  if (!rows.hasNext()) return CFG.FALLBACK_CPC;

  var micros = Number(rows.next()['metrics.average_cpc']) || 0;
  var avgCpc = micros / 1000000;
  if (avgCpc <= 0) return CFG.FALLBACK_CPC;

  return Math.min(CFG.MAX_CPC_CEILING, avgCpc * 0.8);
}

/* ======================================================================
   Filter
   ====================================================================== */

function filterEligible_(candidates, existing, negatives) {
  return candidates.filter(function (candidate) {
    if (candidate.override === 'skip') return false;   // manuelles Veto im Sheet

    if (/\/blogs\//.test(candidate.page)) return false; // Blog-Artikel sind keine Kauf-Landingpages

    var key = normalize_(candidate.query);
    if (existing[key] === true)  return false;         // R5 Dedup
    if (negatives[key] === true) return false;         // bereits ausgeschlossen

    return candidate.action === 'create' || candidate.action === 'create_low_bid';
  });
}

/* ======================================================================
   Schreiben
   ====================================================================== */

function applyCandidates_(campaign, candidates, baseCpc, existing, labelReady, note) {
  var byPage = groupByLandingPage_(candidates);
  var pages = Object.keys(byPage).slice(0, CFG.MAX_NEW_ADGROUPS_PER_RUN);
  var created = [];

  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var group = byPage[page];
    var finalUrl = canonicalizeUrl_(page);
    var adGroupName = adGroupNameFor_(page);

    var adGroup = findOrCreateAdGroup_(
      campaign, adGroupName, baseCpc, labelReady, note
    );
    if (adGroup === null) continue;

    ensureResponsiveSearchAd_(adGroup, finalUrl, group, note);

    for (var k = 0; k < group.length; k++) {
      var candidate = group[k];
      var key = normalize_(candidate.query);
      if (existing[key] === true) continue;   // Dedup auch innerhalb des Laufs

      var rawCpc = candidate.cpc > 0
        ? candidate.cpc                       // Seed mit eigenem Gebot
        : candidate.action === 'create_low_bid'
          ? baseCpc * CFG.LOW_BID_FACTOR
          : baseCpc;
      var cpc = Math.min(rawCpc, CFG.MAX_CPC_CEILING);

      var operation = adGroup.newKeywordBuilder()
        .withText('[' + candidate.query + ']')   // Exact Match = PMax-Prioritaet
        .withCpc(cpc)
        .build();

      if (!operation.isSuccessful()) {
        note('FEHLER Keyword "' + candidate.query + '": ' +
             operation.getErrors().join('; '));
        continue;
      }

      var keyword = operation.getResult();
      keyword.pause();                   // Staging - serviert nichts
      if (labelReady) keyword.applyLabel(CFG.LABEL);

      existing[key] = true;
      created.push({
        adGroup: adGroupName,
        keyword: candidate.query,
        cpc:     cpc,
        rule:    candidate.rule,
        page:    finalUrl,
      });
    }
  }
  return created;
}

/** Idempotent: sucht zuerst, legt nur an, wenn nichts gefunden wird. */
function findOrCreateAdGroup_(campaign, name, baseCpc, labelReady, note) {
  var iterator = campaign.adGroups()
    .withCondition('ad_group.name = "' + name + '"')
    .get();
  if (iterator.hasNext()) return iterator.next();

  var operation = campaign.newAdGroupBuilder()
    .withName(name)
    .withCpc(Math.min(baseCpc, CFG.MAX_CPC_CEILING))
    .build();

  if (!operation.isSuccessful()) {
    note('FEHLER Ad Group "' + name + '": ' + operation.getErrors().join('; '));
    return null;
  }

  var adGroup = operation.getResult();
  adGroup.pause();                       // Staging
  if (labelReady) adGroup.applyLabel(CFG.LABEL);
  note('Ad Group angelegt (pausiert): ' + name);
  return adGroup;
}

/**
 * Eine RSA je Ad Group. Ad Groups mit vorhandenen Anzeigen werden
 * uebersprungen - manuell optimierte Anzeigen bleiben unangetastet.
 */
function ensureResponsiveSearchAd_(adGroup, finalUrl, group, note) {
  if (adGroup.ads().get().hasNext()) return;

  var operation = adGroup.newAd().responsiveSearchAdBuilder()
    .withHeadlines(buildHeadlines_(group))
    .withDescriptions([
      'Premium-Bettwäsche direkt vom Hersteller. Seit 1932.',
      'Kauf auf Rechnung möglich. Schneller Versand aus Deutschland.',
    ])
    .withFinalUrl(finalUrl)
    .build();

  if (!operation.isSuccessful()) {
    note('FEHLER RSA in "' + adGroup.getName() + '": ' +
         operation.getErrors().join('; '));
  }
}

/**
 * Mindestens 3 Headlines, je maximal 30 Zeichen.
 *
 * Diese Texte sehen Kunden - deshalb korrekte deutsche Schreibweise mit
 * Umlauten und Grossschreibung. Laengere Queries fallen durch die
 * 30-Zeichen-Grenze und werden durch die Fallbacks ersetzt.
 */
function buildHeadlines_(group) {
  var fromQueries = group.slice(0, 3)
    .map(function (candidate) { return titleCase_(candidate.query); })
    .filter(function (text) { return text.length <= 30; });

  var fallbacks = [
    'Bettwäsche von biberna',
    'Direkt vom Hersteller',
    'Qualität seit 1932',
  ];

  var combined = fromQueries.concat(fallbacks);
  return combined.slice(0, Math.max(3, Math.min(combined.length, 5)));
}

/**
 * Carve-Out: die neu angelegten Begriffe den PMax-Kampagnen entziehen.
 *
 * Es wird nur der Listeninhalt gepflegt. Die Verknuepfung der Liste mit den
 * PMax-Kampagnen bleibt manuell, weil Ads Scripts PMax nur eingeschraenkt
 * ansprechen koennen - ein Klick, der nie wieder angefasst werden muss.
 */
function syncPmaxCarveOut_(created, note) {
  if (created.length === 0) return;

  var iterator = AdsApp.negativeKeywordLists()
    .withCondition('shared_set.name = "' + CFG.PMAX_NEGATIVE_LIST + '"')
    .get();

  if (!iterator.hasNext()) {
    throw new Error(
      'Ausschlussliste "' + CFG.PMAX_NEGATIVE_LIST + '" fehlt. Sie muss ' +
      'manuell angelegt und mit allen PMax-Kampagnen verknuepft werden. ' +
      'Siehe SETUP.md, Abschnitt A. Achtung: die Keywords sind in diesem Lauf ' +
      'bereits angelegt - Liste nachziehen, sonst entsteht Wettbewerb.'
    );
  }

  var terms = created.map(function (item) { return '[' + item.keyword + ']'; });
  iterator.next().addNegativeKeywords(terms);
  note('PMax Carve-Out: ' + terms.length + ' Begriffe ausgeschlossen');
}

/* ======================================================================
   Sheet, Report, Helfer
   ====================================================================== */

function readCandidates_() {
  var sheet = SpreadsheetApp.openByUrl(CFG.SHEET_URL)
    .getSheetByName(CFG.TAB_CANDIDATES);

  if (sheet === null) {
    throw new Error('Tab "' + CFG.TAB_CANDIDATES + '" fehlt im Sheet.');
  }
  if (sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();

  return values.map(function (row) {
    return {
      query:    String(row[1]).toLowerCase().trim(),
      page:     String(row[2]),
      rule:     String(row[7]),
      action:   String(row[8]),
      score:    Number(row[10]) || 0,
      override: String(row[11]).toLowerCase().trim(),
    };
  }).filter(function (candidate) { return candidate.query.length > 0; });
}

/**
 * Manuell gepflegte Keywords aus dem Tab seed_keywords.
 * Spalten: A keyword | B landing_page | C max_cpc (optional) | D quelle | E override
 * Jede Zeile wird wie ein GSC-Kandidat behandelt (Exact Match, pausiert,
 * Carve-Out, Label) - nur die Herkunft und das Gebot kommen aus dem Sheet.
 * override = "skip" setzt die Zeile aus, "done" markiert erledigte Zeilen.
 */
function readSeeds_() {
  var sheet = SpreadsheetApp.openByUrl(CFG.SHEET_URL)
    .getSheetByName(CFG.TAB_SEEDS);
  if (sheet === null || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

  return values.map(function (row) {
    var cpc = Number(String(row[2]).replace(',', '.')) || 0;
    return {
      query:    String(row[0]).toLowerCase().trim(),
      page:     String(row[1]).trim(),
      cpc:      Math.min(cpc, CFG.MAX_CPC_CEILING),
      rule:     'SEED',
      action:   'create',
      score:    1000,
      override: String(row[4]).toLowerCase().trim(),
    };
  }).filter(function (seed) {
    return seed.query.length > 0 &&
      /^https:\/\/www\.biberna\.de\//.test(seed.page) &&
      seed.override !== 'done';
  });
}

function writeChangelog_(created, isPreview) {
  if (created.length === 0) return;

  var sheet = SpreadsheetApp.openByUrl(CFG.SHEET_URL)
    .getSheetByName(CFG.TAB_CHANGELOG);
  if (sheet === null) return;

  var stamp = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd HH:mm');

  var rows = created.map(function (item) {
    return [
      stamp,
      isPreview ? 'PREVIEW' : 'APPLIED',
      item.adGroup,
      item.keyword,
      item.cpc.toFixed(2),
      item.rule,
      item.page,
    ];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
}

function sendReport_(created, log, isPreview) {
  var prefix = isPreview ? '[VORSCHAU] ' : '';

  var lines = created.map(function (item) {
    return '  ' + item.rule + '  [' + item.keyword + ']  ' +
           item.cpc.toFixed(2) + ' EUR  ->  ' + item.adGroup;
  });

  MailApp.sendEmail(
    CFG.REPORT_TO,
    prefix + 'GSC-Autopilot: ' + created.length + ' neue Keywords (pausiert)',
    'Alles pausiert angelegt. Freigabe manuell im Ads-Konto.\n' +
    'Die Begriffe sind den PMax-Kampagnen per Carve-Out-Liste entzogen.\n\n' +
    (lines.length > 0 ? lines.join('\n') : '  (keine Neuanlagen)') +
    '\n\n--- Log ---\n' + log.join('\n')
  );
}

/** Match-Type-Zeichen entfernen, damit Dedup ueber alle Match Types greift. */
function normalize_(text) {
  return String(text).toLowerCase()
    .replace(/[\[\]"+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Final URLs auf den kanonischen Host zwingen. biberna.de leitet per 301
 * auf www um - eine Anzeige mit non-www-Ziel wuerde jeden bezahlten Klick
 * durch eine Weiterleitung schicken.
 */
function canonicalizeUrl_(url) {
  // Query und Fragment fallen weg: eine Final URL mit utm_-Parametern wuerde
  // bezahlten Traffic in der Kanalauswertung falsch einsortieren.
  var path = String(url).split('#')[0].split('?')[0]
    .replace(/^https?:\/\/[^/]+/, '');
  if (path.length === 0) return CFG.CANONICAL_HOST + '/';
  return CFG.CANONICAL_HOST + (path.charAt(0) === '/' ? path : '/' + path);
}

function adGroupNameFor_(url) {
  var slug = String(url)
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')
    .slice(0, 60);
  return 'AG | ' + (slug.length > 0 ? slug : 'startseite');
}

function groupByLandingPage_(candidates) {
  return candidates.reduce(function (acc, candidate) {
    var key = candidate.page;
    acc[key] = (acc[key] || []).concat([candidate]);
    return acc;
  }, {});
}

function countKeys_(object) {
  return Object.keys(object).length;
}

/**
 * Jedes Wort gross schreiben. Deutsche Substantive kleingeschrieben in einer
 * Anzeige zu zeigen, wirkt nachlaessig - "lyocell bettwaesche" wird zu
 * "Lyocell Bettwaesche".
 */
function titleCase_(text) {
  return String(text).split(' ').map(function (word) {
    return word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

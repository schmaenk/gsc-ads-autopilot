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
  if (/\/blogs\//.test(row.page)) {
    return decide('R7', 'reject', 'Blog-Artikel als Landingpage');
  }
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

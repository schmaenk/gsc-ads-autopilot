"""Keyword-Planer-Exporte (UTF-16, TSV) gegen das biberna-Sortiment filtern.

python tools/filter_planner.py OUT.tsv DATEI1.csv [DATEI2.csv ...]

Regeln in dieser Reihenfolge:
 1. Informational, Blocklist, Fremdmarken raus
 2. Volumen < 100/Monat raus
 3. Schon im Konto oder in seed_keywords raus
 4. Unteres Erstseitengebot > 0,60 EUR raus (MAX_CPC_CEILING)
 5. Produkte, die biberna nicht fuehrt, raus
 6. Landingpage: Kollektion mit >= 3 Produkten, sonst raus
 7. Wortreihenfolge-Dubletten zusammenlegen (hoechstes Volumen bleibt)
"""
import sys, re, io, csv, collections

STOP = {'aus', 'fuer', 'mit', 'in', 'cm', 'und', 'der', 'die', 'das', 'von',
        'zum', 'zur', 'online', 'kaufen', 'bestellen', 'shop'}

NOT_SOLD = ['bettdecke', 'bettdecken', 'decke', 'decken', 'kissen', 'kopfkissen',
            'daune', 'daunen', 'federn', 'matratze', 'matratzen', 'topper',
            'leinen', 'halbleinen', 'seide', 'seiden', 'perkal', 'damast',
            'bambus', 'baumwollsatin', 'wasserbett', 'inkontinenz', 'boxspring',
            'nackenstuetzkissen', 'seitenschlaeferkissen', 'stillkissen',
            'krabbeldecke', 'schlafsack', 'handtuch', 'handtuecher', 'bademantel',
            'duschtuch', 'tischdecke', 'tischwaesche', 'vorhang', 'gardine',
            'teppich', 'wolldecke', 'tagesdecke', 'plaid', 'kuscheldecke',
            'sofadecke', 'bettbezug', 'bettbezuege', 'deckenbezug', 'nackenrolle',
            'kissenhuelle', 'dekokissen', 'zierkissen', 'laken', 'betttuch',
            'bettlaken', 'haustuch', 'frottee', 'frottier', 'stecklaken',
            'unterbett', 'hotel', 'camping', 'wohnwagen', 'reisemobil',
            'hundebett', 'babybett', 'beistellbett', 'wiege', 'stubenwagen',
            'kinderwagen', 'bettumrandung', 'nestchen', 'bettset', 'bettgarnitur',
            'komplett', 'set', 'sets', 'garnitur', 'paket', 'pakete', 'sparpaket',
            'biberdecke', 'wolle', 'kaschmir', 'cashmere', 'fell', 'lammfell',
            'plueschdecke', 'fleecedecke', 'decke', 'daunendecke', 'steppdecke',
            'steppbett', 'oberbett', 'ganzjahresdecke', 'sommerdecke',
            'winterdecke', 'bettwaren', 'schlafanzug', 'pyjama', 'nachthemd',
            'kinderzimmer', 'krabbel', 'wickel', 'lätzchen', 'laetzchen']

BRANDS = ['schlafgut', 'erwin', 'mueller', 'bettwarenshop', 'bettwaren',
          'traumschlaf', 'estella', 'elegante', 'janine', 'fleuresse', 'irisette',
          'bassetti', 'joop', 'essenza', 'kaeppel', 'dormisette', 'ikea', 'aldi',
          'lidl', 'tchibo', 'amazon', 'ebay', 'otto', 'daenisches', 'bettenland',
          'bettenrid', 'kneer', 'formesse', 'curt', 'bauer', 'bierbaum', 'castell',
          'biberna', 'schmaenk', 'hefel', 'billerbeck', 'ibena', 'tom', 'tailor',
          'esprit', 'marc', 'polo', 'hugo', 'boss', 'zoeppritz', 'moeve', 'cawoe',
          'vossen', 'dyckhoff', 'dormabell', 'primera', 'emma', 'bett1', 'concord',
          'xxxl', 'lutz', 'poco', 'roller', 'hoeffner', 'segmueller', 'dormando',
          'wayfair', 'home24', 'westwing', 'zalando', 'zara', 'depot', 'butlers',
          'kaufland', 'rewe', 'edeka', 'netto', 'penny', 'norma', 'action',
          'woolworth', 'tedi', 'kik', 'takko', 'ernsting', 'peek', 'douglas',
          'rossmann', 'dm', 'globus', 'real', 'obi', 'hornbach', 'bauhaus', 'toom',
          'hagebau', 'porta', 'moemax', 'ostermann', 'zurbrueggen', 'hardeck',
          'opti', 'nehl', 'jysk', 'kibek', 'musterring', 'rolf', 'benz',
          'schlaraffia', 'dunlopillo', 'tempur', 'breckle', 'frankenstolz',
          'badenia', 'malie', 'ravensberger', 'mfo', 'bettenwelt', 'bettenshop',
          'hm', 'c&a', 'ca', 'primark', 'hema', 'tk', 'maxx', 'tkmaxx', 'manor',
          'coop', 'migros', 'interio', 'kika', 'leiner', 'moebelix', 'bonprix',
          'baur', 'heine', 'witt', 'weltbild', 'klingel', 'schwab', 'neckermann',
          'quelle', 'lascana', 'sheego', 'bruno', 'banani', 'buegelfrei',
          'bügelfrei', 'my', 'home', 'mycloud', 'liebe', 'lieblings']

INFO = ['was ist', 'wie ', 'welche', 'welches', 'welcher', 'waschen', 'pflege',
        'buegeln', 'trocknen', 'wechseln', 'unterschied', 'test', 'erfahrung',
        'bedeutung', 'bedeutet', 'warum', 'wofuer', 'wann', ' oder ', ' vs',
        'vergleich', 'selber', 'naehen', 'anleitung', 'grad', 'temperatur',
        'beziehen', 'erklaerung', 'groessentabelle', 'masse', 'tipps', 'ratgeber',
        'wikipedia', 'definition', 'herstellung', 'stoff', 'meterware', 'gramm',
        'fadendichte', 'personalisiert', 'bedrucken', 'foto', 'bestickt',
        'namen', 'gestalten', 'sticken', 'druck', 'bedruckt', 'bedruckte',
        'eigenes', 'eigene', 'selbst', 'gebraucht', 'spende', 'entsorgen',
        'recycling', 'alte', 'verkaufen', 'ankauf', 'kostenlos', 'gratis',
        'gewinnspiel', 'job', 'jobs', 'stellen', 'karriere', 'ausbildung',
        'gutschein', 'code', 'retoure', 'lieferzeit', 'versand', 'filiale',
        'filialen', 'oeffnungszeiten', 'adresse', 'telefon', 'kontakt',
        'bewertung', 'bewertungen', 'seriös', 'serioes', 'login', 'konto',
        'app', 'katalog', 'prospekt', 'newsletter', 'rechnung']

BLOCK = ['guenstig', 'billig', 'sale', 'outlet', 'fabrikverkauf', 'werksverkauf',
         'lagerverkauf', 'reduziert', 'angebot', 'angebote', 'b-ware', 'restposten',
         'second', 'ausverkauf', 'rabatt', 'prozent', '%', 'schnaeppchen',
         'preiswert', 'discount', 'hamminkeln']

# Kollektion: (lieferbare Produkte, Tokens die passen muessen)
COLL = {
    'bettwasche-biber-155x220': (59, {'biber', '155x220'}),
    'bettwasche-biber-155x200': (34, {'biber', '155x200'}),
    'kinderbettwasche-biber': (13, {'biber', 'kinder'}),
    'bettwasche-biber': (86, {'biber'}),
    'bettwasche-melange-flanell': (17, {'flanell'}),
    'bettwasche-satin': (37, {'satin'}),
    'bettwasche-renforce': (42, {'renforce'}),
    'bettwasche-seersucker': (44, {'seersucker'}),
    'bettwasche-linon': (20, {'linon'}),
    'bettwasche-mikrofaser': (20, {'mikrofaser'}),
    'bettwasche-fleece': (13, {'fleece'}),
    'bettwasche-nicki': (6, {'nicki'}),
    'bettwasche-tencel': (8, {'tencel'}),
    'bettwasche-jersey': (4, {'jersey'}),
    'bettwasche-musselin': (2, {'musselin'}),
    'winter-bettwasche': (90, {'winter'}),
    'sommer-bettwasche': (241, {'sommer'}),
    'kuehlende-bettwaesche': (86, {'kuehlend', 'kuehlende', 'cooling', 'kuehl'}),
    'weihnachtsbettwaesche': (12, {'weihnachts', 'weihnachten', 'weihnacht', 'weihnachtliche', 'weihnachtlich'}),
    'allergiker-bettwaesche': (104, {'allergiker'}),
    'bettwaesche-gestreift': (63, {'gestreift', 'gestreifte', 'streifen'}),
    'bettwaesche-kariert': (23, {'kariert', 'karierte', 'karo'}),
    'bettwaesche-blumen': (43, {'blumen', 'blumig', 'gebluemt', 'gebluemte', 'floral', 'blumenmuster'}),
    'bettwaesche-uni': (15, {'uni', 'einfarbig', 'einfarbige'}),
    'bettwaesche-tiere': (15, {'tiere', 'tiermotiv', 'tiermotive', 'tier'}),
    'bettwaesche-gemustert': (48, {'gemustert', 'gemusterte', 'muster'}),
    'kinderbettwasche': (24, {'kinder'}),
    'bettwasche-135x200': (266, {'135x200'}),
    'bettwasche-155x220': (205, {'155x220'}),
    'bettwasche-155x200': (70, {'155x200'}),
    'spannbettlaken-biber': (3, {'spannbettlaken', 'biber'}),
    'spannbettlaken-jersey': (8, {'spannbettlaken', 'jersey'}),
    'spannbettlaken-kinder': (3, {'spannbettlaken', 'kinder'}),
    'spannbettlaken-90-100x200': (11, {'spannbettlaken', '90x200', '100x200'}),
    'spannbettlaken-140-160x200': (10, {'spannbettlaken', '140x200', '160x200'}),
    'spannbettlaken-180-200x200': (9, {'spannbettlaken', '180x200', '200x200'}),
    'matratzenschutz-molton': (8, {'matratzenschoner', 'molton'}),
    'matratzenschutz-wasserdicht': (6, {'matratzenschoner', 'wasserdicht', 'wasserdichter', 'wasserdichte', 'wasserundurchlaessig'}),
    'matratzenschutz-90-100x200': (11, {'matratzenschoner', '90x200', '100x200'}),
    'matratzenschutz-120x200': (5, {'matratzenschoner', '120x200'}),
    'matratzenschutz-140-160x200': (11, {'matratzenschoner', '140x200', '160x200'}),
    'matratzenschutz-180-200x200': (8, {'matratzenschoner', '180x200', '200x200'}),
    'matratzenschutz-kinder-klein': (6, {'matratzenschoner', 'kinder', '70x140', '60x120'}),
    'matratzenschutz': (14, {'matratzenschoner'}),
    'kopfkissenbezuge': (6, {'kissenbezug'}),
}
MIN_PRODUCTS = 3
PTYPE_TOKENS = {'spannbettlaken', 'matratzenschoner', 'kissenbezug'}
KNOWN_SIZES = {'135x200', '155x220', '155x200', '100x135', '90x200', '100x200',
               '120x200', '140x200', '160x200', '180x200', '200x200', '70x140',
               '60x120', '80x80', '40x80', '40x60'}
GENERIC_OK = {'baumwolle', 'baumwoll', 'hochwertig', 'hochwertige', 'schoene',
              'schoen', 'weich', 'weiche', 'warm', 'warme', 'kuschelig',
              'kuschelige', 'kuschel', 'flauschig', 'flauschige', 'dick', 'dicke',
              'edel', 'premium', 'qualitaet', 'gute', 'beste', 'modern', 'moderne',
              'elegant', 'elegante', 'doppelbett', 'einzelbett',
              'normalgroesse', 'uebergroesse', 'komfortgroesse', 'jungen', 'maedchen',
              'jugend', 'teenager', 'herbst', 'fruehling', 'ganzjahres', 'ganzjahr',
              'sommerlich', 'leicht', 'leichte', 'glatt', 'glatte', 'angeraut',
              'angeraute', 'gemuetlich', 'gemuetliche', 'extra', 'super', 'xxl',
              'gross', 'grosse', 'klein', 'kleine', 'kurz', 'lang', 'hoch', 'hohe',
              'bio', 'oeko', 'oekotex', 'nachhaltig', 'nachhaltige', 'deutschland',
              'germany', 'hersteller', 'marken', 'marke', 'markenbettwaesche',
              'reine', 'reiner', 'rein', 'prozent', 'thermo', 'kuschelflanell',
              'edelflanell', 'edelbiber', 'biberna'}


def norm(kw):
    k = kw.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    k = re.sub(r'(\d+)\s*x\s*(\d+)', r'\1x\2', k)
    k = re.sub(r'\b(\d{2,3}) (\d{2,3})\b', r'\1x\2', k)
    k = re.sub(r'\bbaumwoll\b', 'baumwolle', k)
    k = re.sub(r'bettwaesche|bettwasche|bettwaeschen|bettwäsche', 'bettwaesche', k)
    for a, b in [('spannbetttuch', 'spannbettlaken'), ('spannbettuch', 'spannbettlaken'),
                 ('spannbettlacken', 'spannbettlaken'), ('spannbetttuecher', 'spannbettlaken'),
                 ('spannbettlaeken', 'spannbettlaken'), ('spannleintuch', 'spannbettlaken'),
                 ('spannlaken', 'spannbettlaken'), ('spannbettlaken', 'spannbettlaken'),
                 ('microfaser', 'mikrofaser'), ('renforcé', 'renforce'), ('mako-satin', 'mako satin'),
                 ('makosatin', 'mako satin'), ('biberbettwaesche', 'biber bettwaesche'),
                 ('flanellbettwaesche', 'flanell bettwaesche'), ('satinbettwaesche', 'satin bettwaesche'),
                 ('kinder bettwaesche', 'kinderbettwaesche'), ('winter bettwaesche', 'winterbettwaesche'),
                 ('sommer bettwaesche', 'sommerbettwaesche'), ('matratzenauflage', 'matratzenschoner'),
                 ('matratzenauflagen', 'matratzenschoner'), ('matratzenschutz', 'matratzenschoner'),
                 ('matratzenschoner', 'matratzenschoner'), ('kopfkissenbezug', 'kissenbezug'),
                 ('kissenbezuege', 'kissenbezug'), ('kopfkissenbezuege', 'kissenbezug'),
                 ('kissenhuelle', 'kissenbezug'), ('feinbiber', 'feinbiber')]:
        k = k.replace(a, b)
    return [t for t in re.split(r'[^a-z0-9&]+', k) if t and t not in STOP]


def excluded(kw_norm):
    k = ' ' + kw_norm + ' '
    for w in INFO:
        if w in k:
            return 'informational'
    for w in BLOCK:
        if w in k:
            return 'blocklist'
    for b in BRANDS:
        if re.search(r'(^|[^a-z0-9])' + re.escape(b) + r'($|[^a-z0-9])', k):
            return 'marke'
    return None


def map_collection(toks):
    T = set(toks)
    if 'spannbettlaken' in T:
        ptype = 'spannbettlaken'
    elif 'matratzenschoner' in T or 'molton' in T:
        ptype = 'matratzenschoner'
    elif 'kissenbezug' in T:
        ptype = 'kissenbezug'
    elif T & {'bettwaesche', 'kinderbettwaesche', 'winterbettwaesche', 'sommerbettwaesche'}:
        ptype = 'bettwaesche'
    else:
        return None, 'keine produktart'
    T2 = set(T)
    for src, add in [('kinderbettwaesche', {'kinder', 'bettwaesche'}),
                     ('winterbettwaesche', {'winter', 'bettwaesche'}),
                     ('sommerbettwaesche', {'sommer', 'bettwaesche'}),
                     ('feinbiber', {'biber'}), ('edelbiber', {'biber'}),
                     ('mako', {'satin'}), ('lyocell', {'tencel'}),
                     ('baby', {'kinder'}), ('kleinkind', {'kinder'}),
                     ('molton', {'matratzenschoner'}), ('edelflanell', {'flanell'}),
                     ('kuschelflanell', {'flanell'})]:
        if src in T2:
            T2 |= add
    T2.add(ptype if ptype != 'bettwaesche' else 'bettwaesche')
    sizes = [t for t in T2 if re.match(r'^\d+x\d+$', t)]
    SIZES_BY_PTYPE = {
        'bettwaesche': {'135x200', '155x220', '155x200', '200x200', '100x135', '140x200'},
        'spannbettlaken': {'90x200', '100x200', '120x200', '140x200', '160x200', '180x200', '200x200', '70x140', '60x120'},
        'matratzenschoner': {'90x200', '100x200', '120x200', '140x200', '160x200', '180x200', '200x200', '70x140', '60x120'},
        'kissenbezug': {'80x80', '40x80', '40x60'},
    }
    if sizes and not set(sizes) <= SIZES_BY_PTYPE[ptype]:
        return None, 'groesse ' + ','.join(sizes)
    attrs = set()
    for h, (n, tk) in COLL.items():
        attrs |= tk
    attrs |= {'bettwaesche', 'kinderbettwaesche', 'winterbettwaesche',
              'sommerbettwaesche', 'spannbettlaken', 'matratzenschoner',
              'kissenbezug', 'feinbiber', 'mako', 'lyocell', 'baby', 'kleinkind',
              'molton', 'edelbiber', 'edelflanell', 'kuschelflanell'}
    unknown = [t for t in T2 if t not in attrs and t not in GENERIC_OK
               and not re.match(r'^\d+x\d+$', t) and not t.isdigit()]
    if unknown:
        return None, 'fremd ' + ','.join(unknown)
    MATERIALS = {'biber', 'flanell', 'satin', 'renforce', 'seersucker', 'linon',
                 'mikrofaser', 'fleece', 'nicki', 'tencel', 'jersey', 'musselin',
                 'molton'}
    SIZE_ALTS = {'90x200', '100x200', '140x200', '160x200', '180x200', '200x200',
                 '70x140', '60x120'}
    q_mat = T2 & MATERIALS
    q_kids = 'kinder' in T2
    best = None
    for h, (n, tk) in COLL.items():
        if n < MIN_PRODUCTS:
            continue
        need_p = tk & PTYPE_TOKENS
        if ptype == 'bettwaesche' and need_p:
            continue
        if ptype != 'bettwaesche' and ptype not in need_p:
            continue
        rest = tk - PTYPE_TOKENS
        matched = rest & T2
        if rest and not matched:
            continue
        c_mat = rest & MATERIALS
        if c_mat and not (c_mat & T2):
            continue          # Kollektion ist materialgebunden, Anfrage nicht
        if q_kids and 'kinder' not in tk:
            continue          # Kinder-Anfrage nur auf Kinder-Kollektion
        if q_mat and not (q_mat <= tk):
            # Kinder-Kollektionen fuehren Biber und Flanell, aber kein eigenes Tab
            if not (q_kids and 'kinder' in tk and q_mat <= {'biber', 'flanell'}):
                continue      # Anfrage nennt Material, Kollektion fuehrt es nicht
        # Nicht erfuellte Pflicht-Attribute (Material, Bettwaesche-Groesse,
        # Kinder) ziehen ab; Schreibvarianten innerhalb einer Gruppe nicht.
        REQUIRED = MATERIALS | {'kinder', '135x200', '155x220', '155x200'}
        unmatched = (rest - T2) & REQUIRED
        # Kinder > Saison/Muster > Material > Groesse
        def w(t):
            if re.match(r'^\d+x\d+$', t):
                return 1
            if t in MATERIALS:
                return 3
            if t == 'kinder':
                return 5
            return 4
        weight = sum(w(t) for t in matched)
        score = weight - 3 * len(unmatched) + (0.1 if rest else 0)
        if best is None or score > best[0]:
            best = (score, h)
    if best is None:
        if q_mat:
            return None, 'material ' + ','.join(sorted(q_mat))
        return None, 'keine kollektion'
    if ptype == 'bettwaesche' and best[0] < 1:
        return None, 'nur generisch'
    return best[1], ''


def read_planner(path):
    t = open(path, 'rb').read().decode('utf-16')
    tag = 'EM' if '17_04_49' in path else ('BWS' if '17_04_13' in path else 'SG')
    out = {}
    for l in t.splitlines()[3:]:
        c = l.split('\t')
        if len(c) < 13:
            continue
        kw = c[0].strip().lower()
        try:
            vol = int(c[2])
        except ValueError:
            continue

        def num(x):
            x = x.strip().strip('"').replace(',', '.')
            try:
                return float(x)
            except ValueError:
                return None
        out[kw] = dict(kw=kw, vol=vol, low=num(c[7]), high=num(c[8]),
                       inacc=c[12].strip() == 'Y', src=tag)
    return out


def main():
    out_path, files = sys.argv[1], sys.argv[2:]
    def dedupe_key(toks):
        expand = {'kinderbettwaesche': ['kinder', 'bettwaesche'],
                  'winterbettwaesche': ['winter', 'bettwaesche'],
                  'sommerbettwaesche': ['sommer', 'bettwaesche']}
        stem = {'gestreifte': 'gestreift', 'karierte': 'kariert',
                'einfarbige': 'einfarbig', 'weihnachtliche': 'weihnachten',
                'weihnachts': 'weihnachten', 'weihnacht': 'weihnachten',
                'kuehlende': 'kuehlend', 'schoene': 'schoen', 'warme': 'warm',
                'hochwertige': 'hochwertig', 'kuschelige': 'kuschelig',
                'microfaser': 'mikrofaser', 'kissenbezuege': 'kissenbezug',
                'kissenhuellen': 'kissenbezug', 'gemusterte': 'gemustert'}
        flat = []
        for t in toks:
            flat += [stem.get(x, x) for x in expand.get(t, [t])]
        return ' '.join(sorted(flat))

    seeds = set(dedupe_key(norm(l.strip().lower())) for l in io.open(
        sys.argv[0].replace('filter_planner.py', 'seeds_bestand.txt'),
        encoding='utf-8') if l.strip())
    rows = {}
    for f in files:
        for kw, r in read_planner(f).items():
            if kw in rows:
                rows[kw]['src'] += '+' + r['src']
                rows[kw]['vol'] = max(rows[kw]['vol'], r['vol'])
            else:
                rows[kw] = r
    print('eingelesen:', len(rows))

    rej = collections.Counter()
    rejex = collections.defaultdict(list)
    groups = {}
    for kw, r in rows.items():
        toks = norm(kw)
        kn = ' '.join(toks)
        why = excluded(kn)
        if why:
            rej[why] += 1
            rejex[why].append(kw)
            continue
        if r['vol'] < 300:
            rej['volumen<300'] += 1
            continue
        if r['inacc'] or dedupe_key(toks) in seeds:
            rej['schon im konto/seeds'] += 1
            continue
        if r['low'] is None:
            rej['kein gebot'] += 1
            continue
        if r['low'] > 0.60:
            rej['gebot>0,60'] += 1
            rejex['gebot>0,60'].append('%s (%.2f)' % (kw, r['low']))
            continue
        T = set(toks)
        if T & set(NOT_SOLD) and not (T & PTYPE_TOKENS):
            rej['nicht im sortiment'] += 1
            rejex['nicht im sortiment'].append(kw)
            continue
        coll, reason = map_collection(toks)
        if coll is None:
            rej['keine landingpage: ' + reason.split(' ')[0]] += 1
            rejex['keine landingpage'].append(kw + ' -> ' + reason)
            continue
        key = dedupe_key(toks)
        groups.setdefault(key, []).append(dict(r, coll=coll))

    out = []
    for key, g in groups.items():
        g.sort(key=lambda x: -x['vol'])
        best = dict(g[0])
        best['dupes'] = ', '.join(x['kw'] for x in g[1:])
        out.append(best)
    out.sort(key=lambda x: -x['vol'])
    print('abgelehnt:', dict(rej))
    print('kandidaten:', len(out))
    with io.open(out_path, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter='\t')
        w.writerow(['keyword', 'landing_page', 'max_cpc', 'quelle', 'dubletten'])
        for r in out:
            w.writerow([r['kw'], 'https://www.biberna.de/collections/' + r['coll'],
                        ('%.2f' % r['low']).replace('.', ','),
                        'Planer %s/Mon (%s)' % (format(r['vol'], ',').replace(',', '.'), r['src']),
                        r['dupes']])
    for r in out:
        print('%7d %.2f %-42s -> %-32s [%s]' % (r['vol'], r['low'], r['kw'], r['coll'], r['dupes'][:50]))
    print('--- gebot>0,60 (Top):', rejex['gebot>0,60'][:20])
    print('--- keine landingpage (Auszug):')
    for x in rejex['keine landingpage'][:60]:
        print('   ', x)


if __name__ == '__main__':
    main()

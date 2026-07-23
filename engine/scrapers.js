// scrapers.js — parsers HTML → ChordPro, uno por sitio.
//
// Funciones PURAS: reciben el HTML ya descargado y devuelven {title, artist, key?, lang?, content}.
// No hacen fetch ni tocan el DOM, así que valen igual en el Worker (src/scraper.ts)
// que en el CLI local (scripts/import-url.mjs). Un solo sitio donde arreglar cada parser.

import { convertRawToChordPro } from './raw-to-chordpro.js';

export const ALLOWED_DOMAINS = [
  'ufret.jp',
  'tabs.ultimate-guitar.com',
  'www.ultimate-guitar.com',
  'acordesweb.com',
  'www.acordesweb.com',
  'chordsworld.com',
  'www.chordsworld.com',
  'ukutabs.com',
  'www.ukutabs.com',
  'cifraclub.com',
  'www.cifraclub.com',
  'cifraclub.com.br',
  'www.cifraclub.com.br',
  'la-cuerda.net',
  'www.la-cuerda.net',
  'e-chords.com',
  'www.e-chords.com',
  'chordu.com',
  'www.chordu.com',
];

const NAMED_ENTITIES = {
  quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  mdash: '—', ndash: '–', hellip: '…', amp: '&',
};

// Una sola pasada a propósito: replace() no reescanea lo ya sustituido, así que
// "&amp;lt;" se queda en "&lt;" y no se decodifica dos veces hasta "<".
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

// === Parsers por sitio ===

function parseUfret(html) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<title>[^/]+\/\s*(.+?)\s*ギター/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const dataMatch = html.match(/var\s+ufret_chord_datas\s*=\s*(\[[\s\S]*?\]);/);
  if (!dataMatch) throw new Error('Could not find chord data on ufret page');

  let chordLines;
  try {
    chordLines = JSON.parse(dataMatch[1]);
  } catch {
    throw new Error('Failed to parse ufret chord data');
  }

  // OJO: ufret_chord_datas YA viene en ChordPro inline ("[Amaj7]　[B/A]", "果[Ab]てなき").
  // No pasarlo por convertRawToChordPro: ese conversor espera el formato "línea de
  // acordes encima de línea de letra" y, al ver "[Amaj7] [B/A]" como línea de acordes,
  // la fusionaba con la siguiente tratando el texto "Amaj7" como letra → "[[B/A][Amaj7]Ama[G#m7]j7".
  // Aquí solo hace falta normalizar: \r fuera, U+3000 (espacio ideográfico, que ufret usa
  // de relleno entre acordes) → espacio normal, y colapsar líneas en blanco de sobra.
  const content = chordLines
    .map(l => l.replace(/\r/g, '').replace(/　/g, ' ').replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, artist, lang: 'ja', content };
}

function parseUltimateGuitar(html) {
  const storeMatch = html.match(/data-content="([^"]+)"/);
  let raw = '';
  let title = '';
  let artist = '';

  if (storeMatch) {
    try {
      const data = JSON.parse(decodeEntities(storeMatch[1]));
      raw = data?.store?.page?.data?.tab_view?.wiki_tab?.content ||
            data?.store?.page?.data?.tab?.content || '';
      title = data?.store?.page?.data?.tab?.song_name || '';
      artist = data?.store?.page?.data?.tab?.artist_name || '';
    } catch { /* fallback abajo */ }
  }

  if (!raw) {
    const titleMatch = html.match(/<title>([^-]+)-\s*([^|]+)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      artist = titleMatch[2].trim().replace(/\s*Chords.*/, '');
    }
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    if (preMatch) raw = preMatch[1].replace(/<[^>]+>/g, '');
  }

  if (!raw) throw new Error('Could not extract chord content from Ultimate Guitar');

  // Decodificar ANTES de colocar acordes: UG alinea la línea de acordes contra el
  // texto ya renderizado, así que "&ldquo;" ocupa 1 columna, no 7. Si se convierte
  // después, los acordes acaban clavados dentro de la entidad ("&[A]ldquo;").
  return { title, artist, content: convertRawToChordPro(decodeEntities(raw)) };
}

function parseAcordesWeb(html) {
  const titleMatch = html.match(/<title>[^:]*:\s*\(([^)]+)\)/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistTitleMatch = html.match(/<title>[^(]*\(([^)]+)\)/i);
  const artist = artistTitleMatch ? artistTitleMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, '')).trim();
  return { title, artist, lang: 'es', content: convertRawToChordPro(raw) };
}

function parseChordsWorld(html) {
  const titleMatch = html.match(/<title>([^-]+)-\s*([^C]+)Chords/);
  const artist = titleMatch ? titleMatch[1].trim() : '';
  const title = titleMatch ? titleMatch[2].trim() : '';

  const contentMatch = html.match(/<div[^>]*class="entry-content"[^>]*>([\s\S]*?)<\/div>/);
  if (!contentMatch) throw new Error('No chord content found');

  const raw = decodeEntities(
    contentMatch[1]
      .replace(/<c-2[^>]*>([^<]*)<\/c-2>/g, '[$1]')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).trim();

  return { title, artist, lang: 'fr', content: convertRawToChordPro(raw) };
}

function parseUkuTabs(html) {
  const titleMatch = html.match(/<title>"([^"]+)"\s*Ukulele Tabs by\s*([^|]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const artist = titleMatch ? titleMatch[2].trim().replace(/\s*on UkuTabs.*/, '') : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  let raw = '';
  if (preMatch) raw = preMatch[1].replace(/<[^>]+>/g, '');
  if (!raw) throw new Error('No chord content found');

  return { title, artist, lang: 'en', content: convertRawToChordPro(raw) };
}

function parseCifraClub(html) {
  // CifraClub envuelve los chords en spans <b>…</b> y la letra en pre.cifra_cnt
  const titleMatch = html.match(/<h1[^>]*class="t1"[^>]*>([^<]+)<\/h1>/) ||
                     html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<h2[^>]*class="t3"[^>]*>(?:<a[^>]*>)?([^<]+)/) ||
                      html.match(/<h2[^>]*>(?:<a[^>]*>)?([^<]+)/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found in CifraClub page');

  const raw = decodeEntities(
    preMatch[1]
      .replace(/<b>([^<]*)<\/b>/g, '[$1]')
      .replace(/<[^>]+>/g, '')
  ).trim();

  // Detectar idioma por TLD
  const lang = /cifraclub\.com\.br/i.test(html.slice(0, 1000)) ? 'pt' : 'es';
  return { title, artist, lang, content: convertRawToChordPro(raw) };
}

function parseLaCuerda(html) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<title>[^|]*\|\s*([^|]+?)\s*[-|]/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, '')).trim();
  return { title, artist, lang: 'es', content: convertRawToChordPro(raw) };
}

function parseEChords(html) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<h2[^>]*>(?:<a[^>]*>)?([^<]+)/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*id="core"[^>]*>([\s\S]*?)<\/pre>/) ||
                   html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, '')).trim();
  return { title, artist, content: convertRawToChordPro(raw) };
}

function parseChordu(html) {
  // ChordU es una app Next.js: los acordes/letra viven en el JSON de __NEXT_DATA__.
  // chordObject = { "<beat>": "<Chord>" }; lyricsObject = { "<line>": "letra con [beat]" }.
  // Cada [beat] en la letra referencia una key de chordObject → lo sustituimos por [Chord].
  const dataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!dataMatch) throw new Error('Could not find ChordU page data');

  let pageProps;
  try {
    pageProps = JSON.parse(dataMatch[1])?.props?.pageProps;
  } catch {
    throw new Error('Failed to parse ChordU page data');
  }
  const store = pageProps?._initialStoreState;
  const chords = store?.chordObject;
  const lyrics = store?.lyricsObject;
  if (!chords || !lyrics) throw new Error('No chord/lyric data found on ChordU page');

  // Título / artista desde el <title>: "Artist - Title Chords - ChordU"
  const titleTag = (html.match(/<title>([^<]+)<\/title>/)?.[1] || '')
    .replace(/\s*Chords\s*-\s*ChordU\s*$/i, '').trim();
  const dashIdx = titleTag.indexOf(' - ');
  const artist = dashIdx > -1 ? titleTag.slice(0, dashIdx).trim() : '';
  const title = dashIdx > -1 ? titleTag.slice(dashIdx + 3).trim() : titleTag;

  // key desde el meta description: "... key of Eb with capo 0 ..."
  const key = pageProps?._metaData?.d?.match?.(/key of\s+([A-G][#b]?m?)/i)?.[1]
    || html.match(/key of\s+([A-G][#b]?m?)/i)?.[1] || undefined;

  // Reconstruir línea a línea (cada entrada de lyricsObject = una línea de la display).
  const lineKeys = Object.keys(lyrics).sort((a, b) => Number(a) - Number(b));
  const out = [];
  for (const lk of lineKeys) {
    const ln = String(lyrics[lk])
      .replace(/<br\s*\/?>/gi, ' ')                       // los <br> internos son separadores suaves
      .replace(/\[(\d+)\]/g, (_m, n) => chords[n] ? `[${chords[n]}]` : '')  // beat → acorde
      .replace(/\s*\.\.\.\s*/g, ' ')                       // beats sin letra (placeholders)
      .replace(/[ \t]+/g, ' ')
      .trim();
    out.push(ln);
  }
  const content = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { title, artist, key, content };  // lang lo elige el usuario en el editor
}

function parseGeneric(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (preMatch) {
    const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, ''));
    return { title, artist: '', content: convertRawToChordPro(raw) };
  }
  throw new Error('Could not extract chord content from this page');
}

/**
 * Elige el parser según el dominio y devuelve {title, artist, key?, lang?, content}.
 * @param {string} domain - hostname de la URL
 * @param {string} html - HTML ya descargado
 */
export function parseByDomain(domain, html) {
  if (domain.includes('ufret.jp')) return parseUfret(html);
  if (domain.includes('ultimate-guitar.com')) return parseUltimateGuitar(html);
  if (domain.includes('acordesweb.com')) return parseAcordesWeb(html);
  if (domain.includes('chordsworld.com')) return parseChordsWorld(html);
  if (domain.includes('ukutabs.com')) return parseUkuTabs(html);
  if (domain.includes('cifraclub.com')) return parseCifraClub(html);
  if (domain.includes('la-cuerda.net')) return parseLaCuerda(html);
  if (domain.includes('e-chords.com')) return parseEChords(html);
  if (domain.includes('chordu.com')) return parseChordu(html);
  return parseGeneric(html);
}

export function isAllowedDomain(domain) {
  return ALLOWED_DOMAINS.some(d => domain === d || domain === 'www.' + d);
}

/** Cabeceras de navegador — algunos sitios bloquean bots y queremos paridad. */
export function browserHeaders(cookie) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  };
  if (cookie && cookie.trim()) headers['Cookie'] = cookie.trim();
  return headers;
}

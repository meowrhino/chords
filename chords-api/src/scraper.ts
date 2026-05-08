// URL scraper for chord sites.
// Site-specific HTML extraction → shared raw-to-ChordPro converter.
// @ts-ignore — JS module, bundled at deploy.
import { convertRawToChordPro } from '../../engine/raw-to-chordpro.js';

interface ScrapeResult {
  title: string;
  artist: string;
  key?: string;
  lang?: string;
  content: string;
}

const ALLOWED_DOMAINS = [
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
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

// === Site-specific HTML → raw text ===

function parseUfret(html: string): ScrapeResult {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<title>[^/]+\/\s*(.+?)\s*ギター/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const dataMatch = html.match(/var\s+ufret_chord_datas\s*=\s*(\[[\s\S]*?\]);/);
  if (!dataMatch) throw new Error('Could not find chord data on ufret page');

  let chordLines: string[];
  try {
    chordLines = JSON.parse(dataMatch[1]);
  } catch {
    throw new Error('Failed to parse ufret chord data');
  }

  const raw = chordLines.map(l => l.replace(/\r/g, '')).join('\n');
  return { title, artist, lang: 'ja', content: convertRawToChordPro(raw) };
}

function parseUltimateGuitar(html: string): ScrapeResult {
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
    } catch { /* fallback below */ }
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
  return { title, artist, content: convertRawToChordPro(raw) };
}

function parseAcordesWeb(html: string): ScrapeResult {
  const titleMatch = html.match(/<title>[^:]*:\s*\(([^)]+)\)/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistTitleMatch = html.match(/<title>[^(]*\(([^)]+)\)/i);
  const artist = artistTitleMatch ? artistTitleMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, '')).trim();
  return { title, artist, lang: 'es', content: convertRawToChordPro(raw) };
}

function parseChordsWorld(html: string): ScrapeResult {
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

function parseUkuTabs(html: string): ScrapeResult {
  const titleMatch = html.match(/<title>"([^"]+)"\s*Ukulele Tabs by\s*([^|]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const artist = titleMatch ? titleMatch[2].trim().replace(/\s*on UkuTabs.*/, '') : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  let raw = '';
  if (preMatch) raw = preMatch[1].replace(/<[^>]+>/g, '');
  if (!raw) throw new Error('No chord content found');

  return { title, artist, lang: 'en', content: convertRawToChordPro(raw) };
}

function parseCifraClub(html: string): ScrapeResult {
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

function parseLaCuerda(html: string): ScrapeResult {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const artistMatch = html.match(/<title>[^|]*\|\s*([^|]+?)\s*[-|]/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, '')).trim();
  return { title, artist, lang: 'es', content: convertRawToChordPro(raw) };
}

function parseEChords(html: string): ScrapeResult {
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

function parseGeneric(html: string): ScrapeResult {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown';

  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (preMatch) {
    const raw = decodeEntities(preMatch[1].replace(/<[^>]+>/g, ''));
    return { title, artist: '', content: convertRawToChordPro(raw) };
  }
  throw new Error('Could not extract chord content from this page');
}

export async function scrapeUrl(url: string, cookie?: string): Promise<ScrapeResult> {
  const domain = getDomain(url);

  if (!ALLOWED_DOMAINS.some(d => domain === d || domain === 'www.' + d)) {
    throw new Error(`Domain not supported: ${domain}. Supported: ${ALLOWED_DOMAINS.join(', ')}`);
  }

  const headers: Record<string, string> = {
    // UA realista — algunos sitios bloquean bots y queremos paridad con un navegador.
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  };
  if (cookie && cookie.trim()) headers['Cookie'] = cookie.trim();

  const response = await fetch(url, { headers });

  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
  const html = await response.text();

  if (domain.includes('ufret.jp')) return parseUfret(html);
  if (domain.includes('ultimate-guitar.com')) return parseUltimateGuitar(html);
  if (domain.includes('acordesweb.com')) return parseAcordesWeb(html);
  if (domain.includes('chordsworld.com')) return parseChordsWorld(html);
  if (domain.includes('ukutabs.com')) return parseUkuTabs(html);
  if (domain.includes('cifraclub.com')) return parseCifraClub(html);
  if (domain.includes('la-cuerda.net')) return parseLaCuerda(html);
  if (domain.includes('e-chords.com')) return parseEChords(html);

  return parseGeneric(html);
}

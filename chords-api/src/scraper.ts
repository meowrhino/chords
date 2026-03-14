// URL scraper for chord sites
// Fetches a URL, parses the HTML, and returns ChordPro content

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
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Merge chord-above-lyrics format into inline ChordPro
function mergeChordLines(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

    // Check if this line is only chords (letters, #, b, /, spaces, numbers)
    const isChordLine = line.trim().length > 0 &&
      /^[\sA-Ga-g#bmajdinsus/\d\(\)°ø+\-]+$/.test(line) &&
      /[A-G]/.test(line);

    // Check if next line has actual lyrics
    const nextHasLyrics = nextLine.trim().length > 0 &&
      !/^[\sA-Ga-g#bmajdinsus/\d\(\)°ø+\-]+$/.test(nextLine);

    if (isChordLine && nextHasLyrics) {
      // Merge chord positions into lyric line
      const chords = extractChordPositions(line);
      const merged = insertChordsIntoLyrics(chords, nextLine);
      result.push(merged);
      i++; // skip the lyric line
    } else if (isChordLine && !nextHasLyrics) {
      // Chord-only line — convert to [Chord] [Chord] format
      const chords = extractChordPositions(line);
      result.push(chords.map(c => `[${c.chord}]`).join(' '));
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

function extractChordPositions(line: string): { pos: number; chord: string }[] {
  const chords: { pos: number; chord: string }[] = [];
  const regex = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13|6|2|4|\/[A-G][#b]?)*(?:\d*))/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    chords.push({ pos: match.index, chord: match[1] });
  }
  return chords;
}

function insertChordsIntoLyrics(
  chords: { pos: number; chord: string }[],
  lyrics: string
): string {
  if (chords.length === 0) return lyrics;

  // Insert chords at positions, right-to-left to preserve indices
  let result = lyrics;
  const sorted = [...chords].sort((a, b) => b.pos - a.pos);

  for (const { pos, chord } of sorted) {
    const insertPos = Math.min(pos, result.length);
    result = result.slice(0, insertPos) + `[${chord}]` + result.slice(insertPos);
  }

  return result;
}

// === Site-specific parsers ===

function parseUfret(html: string): ScrapeResult {
  // Extract title from <h1>
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract artist from title tag
  const artistMatch = html.match(/<title>[^/]+\/\s*(.+?)\s*ギター/);
  const artist = artistMatch ? artistMatch[1].trim() : '';

  // Extract chord data from ufret_chord_datas array
  const dataMatch = html.match(/var\s+ufret_chord_datas\s*=\s*(\[[\s\S]*?\]);/);
  if (!dataMatch) throw new Error('Could not find chord data on ufret page');

  let chordLines: string[];
  try {
    chordLines = JSON.parse(dataMatch[1]);
  } catch {
    throw new Error('Failed to parse ufret chord data');
  }

  const content = chordLines.map(l => l.replace(/\r/g, '')).join('\n');

  return { title, artist, lang: 'ja', content };
}

function parseUltimateGuitar(html: string): ScrapeResult {
  // Try js-store approach
  const storeMatch = html.match(/data-content="([^"]+)"/);
  let content = '';
  let title = '';
  let artist = '';

  if (storeMatch) {
    try {
      const decoded = storeMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const data = JSON.parse(decoded);
      const tab = data?.store?.page?.data?.tab_view?.wiki_tab?.content ||
                  data?.store?.page?.data?.tab?.content || '';
      content = tab.replace(/\[tab\]/g, '').replace(/\[\/tab\]/g, '')
        .replace(/\[ch\]/g, '[').replace(/\[\/ch\]/g, ']');
      title = data?.store?.page?.data?.tab?.song_name || '';
      artist = data?.store?.page?.data?.tab?.artist_name || '';
    } catch { /* fallback below */ }
  }

  if (!content) {
    // Fallback: extract from rendered page text
    const titleMatch = html.match(/<title>([^-]+)-\s*([^|]+)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      artist = titleMatch[2].trim().replace(/\s*Chords.*/, '');
    }

    // Try to find pre-formatted chord content
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    if (preMatch) {
      content = preMatch[1].replace(/<[^>]+>/g, '');
    }
  }

  // Convert section markers like [Verse 1] to ChordPro
  content = content
    .replace(/\[Intro\]/gi, '{start_of_intro}')
    .replace(/\[Verse[^\]]*\]/gi, '{start_of_verse}')
    .replace(/\[Pre-?Chorus[^\]]*\]/gi, '{start_of_verse}')
    .replace(/\[Chorus[^\]]*\]/gi, '{start_of_chorus}')
    .replace(/\[Bridge[^\]]*\]/gi, '{start_of_bridge}')
    .replace(/\[Outro[^\]]*\]/gi, '{start_of_verse}')
    .replace(/\[Instrumental[^\]]*\]/gi, '{start_of_intro}')
    .replace(/\[Post-?Chorus[^\]]*\]/gi, '{start_of_verse}');

  // Merge chord-above-lyrics format
  content = mergeChordLines(content);

  return { title, artist, content };
}

function parseAcordesWeb(html: string): ScrapeResult {
  // Title from <title>
  const titleMatch = html.match(/<title>[^:]*:\s*\(([^)]+)\)/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract from meta or title
  const artistTitleMatch = html.match(/<title>[^(]*\(([^)]+)\)/i);
  const artist = artistTitleMatch ? artistTitleMatch[1].trim() : '';

  // Content from <pre>
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) throw new Error('No chord content found');

  let content = preMatch[1].replace(/<[^>]+>/g, '').trim();
  // Remove "Primero en AcordesWeb" watermark
  content = content.replace(/Primero en #?AcordesWeb\.com\s*/gi, '');

  content = mergeChordLines(content);

  return { title, artist, lang: 'es', content };
}

function parseChordsWorld(html: string): ScrapeResult {
  // Title from page
  const titleMatch = html.match(/<title>([^-]+)-\s*([^C]+)Chords/);
  const artist = titleMatch ? titleMatch[1].trim() : '';
  const title = titleMatch ? titleMatch[2].trim() : '';

  // Extract content from entry-content
  const contentMatch = html.match(/<div[^>]*class="entry-content"[^>]*>([\s\S]*?)<\/div>/);
  if (!contentMatch) throw new Error('No chord content found');

  // Clean HTML tags but preserve chord spans
  let content = contentMatch[1]
    .replace(/<c-2[^>]*>([^<]*)<\/c-2>/g, '[$1]') // chord spans
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  return { title, artist, lang: 'fr', content };
}

function parseUkuTabs(html: string): ScrapeResult {
  const titleMatch = html.match(/<title>"([^"]+)"\s*Ukulele Tabs by\s*([^|]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const artist = titleMatch ? titleMatch[2].trim().replace(/\s*on UkuTabs.*/, '') : '';

  // Find chord content
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  let content = '';

  if (preMatch) {
    content = preMatch[1].replace(/<[^>]+>/g, '');
  } else {
    // Try finding in body text
    const bodyMatch = html.match(/Intro:[\s\S]*?(?=This arrangement|UkuTabs|$)/);
    if (bodyMatch) content = bodyMatch[0];
  }

  // Convert section markers
  content = content
    .replace(/^(Intro|Verse \d*|Pre-Chorus|Chorus|Bridge|Outro|Post-Chorus):?\s*$/gm, (_, section) => {
      const s = section.toLowerCase().replace(/\s+\d+/, '');
      if (s === 'intro') return '{start_of_intro}';
      if (s === 'chorus') return '{start_of_chorus}';
      if (s === 'bridge') return '{start_of_bridge}';
      return '{start_of_verse}';
    });

  content = mergeChordLines(content);

  return { title, artist, lang: 'en', content };
}

function parseGeneric(html: string): ScrapeResult {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown';

  // Try to find <pre> content with chords
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (preMatch) {
    let content = preMatch[1].replace(/<[^>]+>/g, '');
    content = mergeChordLines(content);
    return { title, artist: '', content };
  }

  throw new Error('Could not extract chord content from this page');
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const domain = getDomain(url);

  if (!ALLOWED_DOMAINS.some(d => domain === d || domain === 'www.' + d)) {
    throw new Error(`Domain not supported: ${domain}. Supported: ${ALLOWED_DOMAINS.join(', ')}`);
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AcordesBot/1.0)',
      'Accept': 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  if (domain.includes('ufret.jp')) return parseUfret(html);
  if (domain.includes('ultimate-guitar.com')) return parseUltimateGuitar(html);
  if (domain.includes('acordesweb.com')) return parseAcordesWeb(html);
  if (domain.includes('chordsworld.com')) return parseChordsWorld(html);
  if (domain.includes('ukutabs.com')) return parseUkuTabs(html);

  return parseGeneric(html);
}

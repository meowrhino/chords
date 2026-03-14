#!/usr/bin/env node
// Generate romaji annotations for Japanese .cho files
// Usage: node scripts/generate-romaji.js [file.cho]
//   Without args: processes all Japanese .cho files missing romaji
//   With arg: processes a specific file

const kuromoji = require('kuromoji');
const { readFileSync, writeFileSync, readdirSync } = require('fs');
const { join } = require('path');

const SONGS_DIR = join(__dirname, '..', 'songs');

// Katakana → Hiragana
function kata2hira(str) {
  return str.replace(/[\u30A1-\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// Hiragana → Romaji map
const HIRA_MAP = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','ゐ':'wi','ゑ':'we','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'di','づ':'du','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'ふぁ':'fa','ふぃ':'fi','ふぇ':'fe','ふぉ':'fo',
  'ゔぁ':'va','ゔぃ':'vi','ゔ':'vu','ゔぇ':'ve','ゔぉ':'vo',
  'てぃ':'ti','でぃ':'di',
  'っ':'tt','ー':'-',
  '　':' '
};

// Small kana that combine with previous char
const SMALL_KANA = new Set('ゃゅょぁぃぅぇぉ');

function hira2romaji(hira) {
  let result = '';
  let i = 0;
  while (i < hira.length) {
    // Try 2-char combo first (for きゃ etc)
    if (i + 1 < hira.length) {
      const two = hira.substring(i, i + 2);
      if (HIRA_MAP[two]) {
        result += HIRA_MAP[two];
        i += 2;
        continue;
      }
    }
    // っ (sokuon) - doubles next consonant
    if (hira[i] === 'っ') {
      if (i + 1 < hira.length) {
        const nextChar = hira[i + 1];
        // Try 2-char combo for next
        let nextRomaji = '';
        if (i + 2 < hira.length) {
          const two = hira.substring(i + 1, i + 3);
          if (HIRA_MAP[two]) nextRomaji = HIRA_MAP[two];
        }
        if (!nextRomaji) nextRomaji = HIRA_MAP[nextChar] || '';
        if (nextRomaji) {
          result += nextRomaji[0]; // double the consonant
        }
      }
      i++;
      continue;
    }
    const one = hira[i];
    if (HIRA_MAP[one]) {
      result += HIRA_MAP[one];
    } else {
      result += one;
    }
    i++;
  }
  return result;
}

// Convert reading to per-character romaji for a surface+reading pair
function charRomaji(surface, reading) {
  if (!reading) reading = surface;
  const hira = kata2hira(reading);
  const romaji = hira2romaji(hira);
  return romaji;
}

// Check if char is Japanese (kanji, hiragana, katakana)
function isJapanese(ch) {
  const code = ch.charCodeAt(0);
  return (code >= 0x3040 && code <= 0x309F) || // Hiragana
         (code >= 0x30A0 && code <= 0x30FF) || // Katakana
         (code >= 0x4E00 && code <= 0x9FFF) || // CJK
         (code >= 0x3400 && code <= 0x4DBF) || // CJK Ext A
         code === 0x3005 || // 々
         code === 0x3001 || code === 0x3002 || // 、。
         code === 0x300C || code === 0x300D;    // 「」
}

function isKana(ch) {
  const code = ch.charCodeAt(0);
  return (code >= 0x3040 && code <= 0x309F) || // Hiragana
         (code >= 0x30A0 && code <= 0x30FF);    // Katakana
}

function isKanji(ch) {
  const code = ch.charCodeAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) ||
         (code >= 0x3400 && code <= 0x4DBF) ||
         code === 0x3005;
}

// Process a line of lyrics (with chords) to add romaji tags
function processLine(line, tokenizer) {
  // Skip directive lines
  if (line.match(/^\{(title|artist|key|capo|lang|start_|end_)/)) return line;
  // Skip empty lines
  if (!line.trim()) return line;
  // Skip lines that already have romaji
  if (line.includes('{r:')) return line;
  // Skip lines with only chords and whitespace
  if (!line.replace(/\[.*?\]/g, '').replace(/[\s　]/g, '')) return line;

  // Split line into segments: chords [X] and text
  const segments = [];
  let remaining = line;
  const chordRegex = /\[([^\]]+)\]/;

  while (remaining) {
    const match = remaining.match(chordRegex);
    if (!match) {
      segments.push({ type: 'text', value: remaining });
      break;
    }
    if (match.index > 0) {
      segments.push({ type: 'text', value: remaining.substring(0, match.index) });
    }
    segments.push({ type: 'chord', value: match[0] });
    remaining = remaining.substring(match.index + match[0].length);
  }

  // Process each text segment
  const result = segments.map(seg => {
    if (seg.type === 'chord') return seg.value;

    const text = seg.value;
    // Tokenize Japanese text
    const tokens = tokenizer.tokenize(text);
    let output = '';

    for (const token of tokens) {
      const surface = token.surface_form;
      const reading = token.reading || token.pronunciation || surface;

      // Check if it contains Japanese chars
      const hasJapanese = [...surface].some(ch => isKana(ch) || isKanji(ch));

      if (!hasJapanese) {
        // Keep non-Japanese text as-is (spaces, punctuation, etc)
        output += surface;
        continue;
      }

      // For Japanese text, wrap each character/group
      if (surface.length === 1 && isKana(surface)) {
        // Single kana char
        const romaji = charRomaji(surface, reading);
        output += `{r:${romaji}}${surface}{/r}`;
      } else if ([...surface].every(ch => isKana(ch))) {
        // All kana - wrap each individually
        const hiraReading = kata2hira(reading);
        // Try to split reading to match surface chars
        const surfaceChars = [...surface];
        const readingHira = kata2hira(reading);

        // Simple approach: each kana char gets its own reading
        let ri = 0;
        for (let ci = 0; ci < surfaceChars.length; ci++) {
          const ch = surfaceChars[ci];
          const hCh = kata2hira(ch);
          // Check for combo (small kana follows)
          if (ci + 1 < surfaceChars.length && SMALL_KANA.has(kata2hira(surfaceChars[ci + 1]))) {
            const combo = hCh + kata2hira(surfaceChars[ci + 1]);
            const romaji = HIRA_MAP[combo] || hira2romaji(combo);
            output += `{r:${romaji}}${ch}${surfaceChars[ci + 1]}{/r}`;
            ci++; // skip the small kana
          } else {
            const romaji = HIRA_MAP[hCh] || hira2romaji(hCh);
            output += `{r:${romaji}}${ch}{/r}`;
          }
        }
      } else {
        // Mixed or kanji - wrap the whole token with its reading
        const romaji = charRomaji(surface, reading);
        output += `{r:${romaji}}${surface}{/r}`;
      }
    }
    return output;
  }).join('');

  return result;
}

// Process a .cho file
function processFile(filePath, tokenizer) {
  const content = readFileSync(filePath, 'utf-8');

  // Check if it's Japanese
  const langMatch = content.match(/\{lang:\s*ja\}/);
  if (!langMatch) {
    console.log(`  Skipping (not Japanese): ${filePath}`);
    return false;
  }

  // Check if already has romaji
  if (content.includes('{r:')) {
    console.log(`  Skipping (already has romaji): ${filePath}`);
    return false;
  }

  console.log(`  Processing: ${filePath}`);

  const lines = content.split('\n');
  const processed = lines.map(line => processLine(line, tokenizer));
  const output = processed.join('\n');

  writeFileSync(filePath, output, 'utf-8');
  console.log(`  ✓ Done: ${filePath}`);
  return true;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  console.log('Loading kuromoji tokenizer...');

  const dictPath = join(__dirname, '..', 'node_modules', 'kuromoji', 'dict');

  const tokenizer = await new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: dictPath }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });

  console.log('Tokenizer loaded.');

  if (args.length > 0) {
    // Process specific files
    for (const file of args) {
      const filePath = file.startsWith('/') ? file : join(SONGS_DIR, file);
      processFile(filePath, tokenizer);
    }
  } else {
    // Process all Japanese .cho files without romaji
    const files = readdirSync(SONGS_DIR).filter(f => f.endsWith('.cho'));
    let count = 0;
    for (const file of files) {
      const filePath = join(SONGS_DIR, file);
      if (processFile(filePath, tokenizer)) count++;
    }
    console.log(`\nProcessed ${count} files.`);
  }
}

main().catch(console.error);

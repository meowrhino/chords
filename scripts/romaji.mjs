// romaji.mjs — kana → romaji (Hepburn) y anotación de líneas ChordPro.
//
// Lógica PURA: no toca ficheros ni carga diccionarios, así se puede testear sola
// (node scripts/test-romaji.mjs) y la reusan generate-romaji.mjs e import-url.mjs.
//
// Por qué generamos el romaji en vez de bajarlo de una web de letras:
// en ChordPro los acordes van ANCLADOS DENTRO del texto ("果[Ab]てなき"). Una letra
// en romaji sacada de otra web es un texto distinto, sin relación posicional con
// esos anclajes, así que habría que realinearla a mano canción por canción y se
// rompería cada vez que se mueve un acorde. Generándolo token a token desde el
// japonés que ya tenemos, la alineación sale correcta por construcción.

import { pinyin } from 'pinyin-pro';

// === Tablas kana ===

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
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o',
  'ゃ':'ya','ゅ':'yu','ょ':'yo',
  // dígrafos
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
  'てぃ':'ti','でぃ':'di','とぅ':'tu','どぅ':'du',
  'うぃ':'wi','うぇ':'we','うぉ':'wo',
  'しぇ':'she','ちぇ':'che','じぇ':'je',
  'つぁ':'tsa','つぃ':'tsi','つぇ':'tse','つぉ':'tso',
};

/** Katakana → hiragana (para romanizar con una sola tabla). */
export function kataToHira(str) {
  return str.replace(/[ァ-ヶ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/** Lee la sílaba que empieza en `i`: prueba dígrafo (2 chars) y luego 1 char. */
function readSyllable(hira, i) {
  const two = hira.substring(i, i + 2);
  if (two.length === 2 && HIRA_MAP[two]) return { romaji: HIRA_MAP[two], len: 2 };
  const one = hira[i];
  if (HIRA_MAP[one]) return { romaji: HIRA_MAP[one], len: 1 };
  return { romaji: '', len: 1 };
}

/**
 * kana (hira o kata) → romaji Hepburn.
 * Casos que el mapeo ingenuo se come:
 *   ー  alarga la vocal previa   → コーヒー = koohii   (no "ko-hi-")
 *   っ  duplica la consonante    → いっしょ = issho
 *   っ+ch → "t" (Hepburn)        → まっちゃ = matcha  (no "maccha")
 *   ん ante vocal/y → apóstrofo  → きんえん = kin'en  (no "kinen")
 */
export function kanaToRomaji(kana) {
  const hira = kataToHira(kana);
  const parts = [];   // sílabas sueltas: hace falta mirar la siguiente al unir
  let i = 0;

  while (i < hira.length) {
    const ch = hira[i];

    if (ch === 'ー') {
      const prev = parts.length ? parts[parts.length - 1] : '';
      const lastVowel = prev.replace(/[^aiueo]/g, '').slice(-1);
      if (lastVowel) parts.push(lastVowel);
      i++;
      continue;
    }

    if (ch === 'っ') {
      const next = readSyllable(hira, i + 1);
      if (next.romaji) parts.push(next.romaji.startsWith('ch') ? 't' : next.romaji[0]);
      i++;   // っ final de palabra (corte glotal) no aporta letra
      continue;
    }

    const syl = readSyllable(hira, i);
    if (syl.romaji) {
      parts.push(syl.romaji);
      i += syl.len;
    } else {
      parts.push(ch);   // signos, latino, lo que sea: se deja tal cual
      i++;
    }
  }

  let out = '';
  for (let k = 0; k < parts.length; k++) {
    out += parts[k];
    if (parts[k] === 'n' && /^[aiueoy]/.test(parts[k + 1] || '')) out += "'";
  }
  return out;
}

/**
 * Elige qué lectura de kuromoji usar para un token.
 *
 * `reading` = lectura escrita (トウキョウ), `pronunciation` = lectura hablada (トーキョー).
 * Usamos `reading` por defecto porque da las grafías que usa el romaji de letras
 * ("toukyou", "sensei") en vez de alargamientos ("tookyoo").
 * PERO en las partículas mandan la pronunciación, que es una regla real del idioma:
 *   は → wa (no "ha"),  へ → e (no "he").
 */
function tokenKana(token) {
  const isParticle = token.pos === '助詞';
  if (isParticle && token.pronunciation) return token.pronunciation;
  return token.reading || token.pronunciation || token.surface_form;
}

// === Detección de scripts ===

const RE_KANA  = /[぀-ゟ゠-ヿ]/;
const RE_KANJI = /[一-鿿㐀-䶿々]/;
const RE_HAN   = /[一-鿿㐀-䶿]/;

/** ¿La línea es una directiva ChordPro ({title:…}, {start_of_verse}, …)? */
function isDirective(line) {
  return /^\s*\{[a-z_]+[:}]/i.test(line);
}

/** Quita anotaciones previas para poder regenerar (--force). */
export function stripAnnotations(text) {
  return text.replace(/\{[rp]:[^}]*\}/g, '').replace(/\{\/[rp]\}/g, '');
}

/**
 * Parte una línea en trozos de acorde `[X]` y trozos de texto, para anotar solo
 * el texto y no tocar jamás lo que hay dentro de los corchetes.
 */
function splitChords(line) {
  const segments = [];
  let rest = line;
  let m;
  while ((m = rest.match(/\[([^\]]+)\]/))) {
    if (m.index > 0) segments.push({ chord: false, value: rest.slice(0, m.index) });
    segments.push({ chord: true, value: m[0] });
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) segments.push({ chord: false, value: rest });
  return segments;
}

function skipLine(line, tag) {
  if (isDirective(line)) return true;
  if (!line.trim()) return true;
  if (line.includes(`{${tag}:`)) return true;          // ya anotada
  if (!line.replace(/\[.*?\]/g, '').replace(/[\s　]/g, '')) return true;  // solo acordes
  return false;
}

/**
 * Anota una línea japonesa con romaji: 夢 → {r:yume}夢{/r}
 * Un tag por token (no por carácter): "anata" encima de あなた se lee mucho
 * mejor que "a"/"na"/"ta" en tres cajitas ruby separadas.
 */
export function annotateJapaneseLine(line, tokenizer) {
  if (skipLine(line, 'r')) return line;

  return splitChords(line).map(seg => {
    if (seg.chord) return seg.value;

    let out = '';
    for (const token of tokenizer.tokenize(seg.value)) {
      const surface = token.surface_form;
      if (!RE_KANA.test(surface) && !RE_KANJI.test(surface)) {
        out += surface;      // espacios, latino, puntuación
        continue;
      }
      const romaji = kanaToRomaji(tokenKana(token));
      out += romaji ? `{r:${romaji}}${surface}{/r}` : surface;
    }
    return out;
  }).join('');
}

/** Anota una línea china con pinyin: 爱 → {p:ài}爱{/p} */
export function annotateChineseLine(line) {
  if (skipLine(line, 'p')) return line;

  return splitChords(line).map(seg => {
    if (seg.chord) return seg.value;
    return [...seg.value].map(ch => {
      if (!RE_HAN.test(ch)) return ch;
      const py = pinyin(ch, { toneType: 'symbol', type: 'array' })[0] || ch;
      return `{p:${py}}${ch}{/p}`;
    }).join('');
  }).join('');
}

/**
 * Texto japonés → romaji plano (sin tags). Para títulos y slugs de fichero:
 * generateSlug() borra todo lo no-latino, así que 終わらない世界で se quedaría en
 * nada. Romanizando antes sale "owaranai-sekai-de", que es la convención del
 * repo para los .cho japoneses (yoasobi-yoru-ni-kakeru, aimer-rokutousei-no-yoru).
 */
export function toRomajiText(text, tokenizer) {
  let out = '';
  for (const token of tokenizer.tokenize(text)) {
    const surface = token.surface_form;
    const romaji = (RE_KANA.test(surface) || RE_KANJI.test(surface))
      ? kanaToRomaji(tokenKana(token))
      : surface;
    if (!romaji) continue;

    // Auxiliares (ない) y sufijos (等星) se pegan a la palabra anterior; las
    // partículas van sueltas. Da 終わらない→"owaranai" y 六等星の夜→"rokutousei no yoru",
    // que es justo cómo están nombrados los .cho japoneses que ya hay.
    const glue = token.pos === '助動詞' || token.pos_detail_1 === '接尾';
    out += (out && !glue ? ' ' : '') + romaji;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Anota un .cho entero.
 * @param {string} content
 * @param {'ja'|'zh'} lang
 * @param {object} tokenizer - kuromoji (solo para ja)
 */
export function annotateContent(content, lang, tokenizer) {
  const lines = content.split('\n');
  const annotate = lang === 'ja'
    ? line => annotateJapaneseLine(line, tokenizer)
    : line => annotateChineseLine(line);
  return lines.map(annotate).join('\n');
}

// raw-to-chordpro.js — convierte texto crudo (chords-encima-de-letras) a ChordPro inline.
// Compartido entre frontend y Worker scraper.

import { decodeEntitiesDeep } from './entities.js';

const CHORD_TOKEN = /^[A-G](?:#|b)?(?:maj|min|sus|add|aug|dim|m)?(?:\d{1,2})?(?:[#b]?(?:sus|add|maj)?\d{1,2})*(?:\/[A-G](?:#|b)?)?$/;
const CHORD_FIND = /[A-G](?:#|b)?(?:maj|min|sus|add|aug|dim|m)?(?:\d{1,2})?(?:[#b]?(?:sus|add|maj)?\d{1,2})*(?:\/[A-G](?:#|b)?)?/g;

// Una "letra de chord" significa que la línea entera está hecha de chord tokens
// separados por whitespace, opcionalmente con corchetes ya puestos.
export function isChordOnlyLine(line) {
  const stripped = line.replace(/\[|\]/g, '').trim();
  if (!stripped) return false;
  const tokens = stripped.split(/\s+/);
  if (tokens.length === 0) return false;
  let chordTokens = 0;
  for (const t of tokens) {
    if (CHORD_TOKEN.test(t)) chordTokens++;
    else if (/^[|:]+$/.test(t)) continue;       // barras de compás
    else if (/^[xX×%\-]+$/.test(t)) continue;   // multiplicadores tipo "x4"
    else if (/^\(?[A-G][^\s]*\)?$/.test(t)) {
      // tolera (Em) o (Em7) entre paréntesis
      const inner = t.replace(/^\(|\)$/g, '');
      if (CHORD_TOKEN.test(inner)) chordTokens++;
      else return false;
    } else return false;
  }
  return chordTokens > 0;
}

// Extrae las posiciones (col en chars) de los chords de una línea.
// Soporta tanto formato "Em   C   G" como "[Em]  [C]  [G]".
export function extractChordPositions(line) {
  const out = [];
  // Si la línea ya tiene corchetes, leer los chords desde dentro pero usar
  // la posición visual (descontando corchetes previos) para alinear con la letra.
  if (/\[[^\]]+\]/.test(line)) {
    let visualPos = 0;
    let i = 0;
    while (i < line.length) {
      if (line[i] === '[') {
        const close = line.indexOf(']', i);
        if (close === -1) { i++; continue; }
        const chord = line.slice(i + 1, close).trim();
        if (CHORD_TOKEN.test(chord)) {
          out.push({ pos: visualPos, chord });
        }
        i = close + 1;
      } else {
        visualPos++;
        i++;
      }
    }
    return out;
  }
  // Formato plano: encontrar cada chord token con su índice
  let m;
  CHORD_FIND.lastIndex = 0;
  while ((m = CHORD_FIND.exec(line)) !== null) {
    const before = line[m.index - 1];
    const after = line[m.index + m[0].length];
    // Solo aceptar si está aislado por whitespace o bordes
    const beforeOk = m.index === 0 || /\s/.test(before);
    const afterOk = !after || /\s/.test(after);
    if (beforeOk && afterOk && CHORD_TOKEN.test(m[0])) {
      out.push({ pos: m.index, chord: m[0] });
    }
  }
  return out;
}

// Si hay una letra MAYÚSCULA cerca de `pos` en `lyrics`, devuelve su índice
// (convención: el transcriptor marca la sílaba que lleva el acorde
// poniéndola en mayúscula — "yo te aMo" → acorde sobre "Mo").
// Ventana ±SNAP_WINDOW; empate → más cercano, luego preferir izquierda
// (inicio de sílaba). Devuelve `pos` si no encuentra nada.
const SNAP_WINDOW = 2;
function snapToUppercase(lyrics, pos) {
  if (pos < 0 || pos >= lyrics.length) return pos;
  // Si ya estamos sobre una mayúscula, no movemos.
  const here = lyrics[pos];
  if (here >= 'A' && here <= 'Z') return pos;
  for (let d = 1; d <= SNAP_WINDOW; d++) {
    // izquierda primero (inicio de sílaba)
    const left = pos - d;
    if (left >= 0) {
      const c = lyrics[left];
      if (c >= 'A' && c <= 'Z') return left;
    }
    const right = pos + d;
    if (right < lyrics.length) {
      const c = lyrics[right];
      if (c >= 'A' && c <= 'Z') return right;
    }
  }
  return pos;
}

// Inserta los chords en sus posiciones dentro de la línea de letra.
export function insertChordsIntoLyrics(chords, lyrics) {
  if (!chords.length) return lyrics;
  // Ajustar cada posición a la mayúscula cercana (si la hay).
  const snapped = chords.map(({ pos, chord }) => ({
    pos: snapToUppercase(lyrics, pos),
    chord,
  }));
  // Ordenar de derecha a izquierda para preservar índices al insertar.
  const sorted = snapped.sort((a, b) => b.pos - a.pos);
  let result = lyrics;
  for (const { pos, chord } of sorted) {
    const insertPos = Math.max(0, Math.min(pos, result.length));
    result = result.slice(0, insertPos) + `[${chord}]` + result.slice(insertPos);
  }
  return result;
}

// Convierte cabeceras de sección (en varios idiomas) a directivas ChordPro.
//
// El corchete de apertura y el de cierre se aceptan por separado y en ambos
// sabores ([] o {}): hay transcripciones con "{Bridge]" y otras con el nombre
// del cantante detrás de dos puntos ("[Chorus: Anne-Marie]"). Si no se
// reconocen, la cabecera se queda en la pantalla como si fuera letra.
const SECTION_RULES = [
  [/Intro/, '{start_of_intro}'],
  [/Pre[\s-]?Chorus|Pre[\s-]?Estribillo|Pre[\s-]?Hook/, '{start_of_verse}'],
  [/Post[\s-]?Chorus/, '{start_of_verse}'],
  [/Verse/, '{start_of_verse}'],
  [/Chorus|Hook/, '{start_of_chorus}'],
  [/Bridge/, '{start_of_bridge}'],
  [/Outro/, '{start_of_outro}'],
  [/Instrumental|Solo|Interlude/, '{start_of_intro}'],
  // Español
  [/Estrofa/, '{start_of_verse}'],
  [/Estribillo|Coro/, '{start_of_chorus}'],
  [/Puente/, '{start_of_bridge}'],
  // Francés
  [/Couplet/, '{start_of_verse}'],
  [/Refrain/, '{start_of_chorus}'],
  [/Pont/, '{start_of_bridge}'],
];

// Dos formas, a propósito:
//   - entre corchetes, vale cualquier cosa dentro ("[Chorus: Anne-Marie]",
//     "[Bridge-Interlude]", y hasta el "{Bridge]" mal cerrado que sueltan
//     algunos transcriptores);
//   - a pelo, solo el nombre con adornos mínimos ("Verse 2", "Chorus: (x2)").
// El (?![A-Za-z]) es lo que impide que "Verseau, Verseau, je chante encore"
// se coma una letra entera creyéndose un "Verse", y que "Intro tabs can be
// found here: https://…" se lleve por delante el enlace.
function sectionRegex(name) {
  const n = '(?:' + name.source + ')(?![A-Za-z])';
  const bracketed = '[ \\t]*[\\[{][ \\t]*' + n + '[^\\]}\\n]*[\\]}][ \\t]*:?[ \\t]*';
  const bare = '[ \\t]*' + n + '[ \\t]*[0-9IVXivx]*[ \\t]*:?[ \\t]*(?:\\([^)\\n]*\\))?[ \\t]*';
  return new RegExp('^(?:' + bracketed + '|' + bare + ')$', 'gim');
}

export function normalizeSections(text) {
  let out = text;
  for (const [name, directive] of SECTION_RULES) {
    out = out.replace(sectionRegex(name), directive);
  }
  return out;
}

// Limpia ruido típico de scrape: tabs, NBSP, watermarks comunes.
export function cleanWhitespace(text) {
  // Las entidades se deshacen aquí, lo primero de todo: mergeChordLines alinea
  // por columnas, y "&rsquo;" cuenta 7 donde el transcriptor veía 1.
  return decodeEntitiesDeep(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/ /g, ' ')                    // NBSP
    .replace(/　/g, '  ')                   // ideographic space
    .replace(/[ \t]+$/gm, '')                   // trailing spaces
    .replace(/\n{3,}/g, '\n\n');                // colapsar saltos triples
}

// Quita ruido común de sitios de chords (UG, AcordesWeb, CifraClub, etc.)
export function stripBoilerplate(text) {
  return text
    .replace(/\[tab\]|\[\/tab\]/gi, '')
    .replace(/\[ch\]/gi, '[').replace(/\[\/ch\]/gi, ']')
    .replace(/Primero en #?AcordesWeb\.com/gi, '')
    .replace(/^\s*Tabbed by:[^\n]*$/gim, '')
    .replace(/^\s*E-?mail:[^\n]*$/gim, '')
    // "Capo on 3rd fret" / "Capo: 3" / "Capo 3" → directiva {capo:3}, que el
    // parser entiende y la app aplica sola al control de capo
    .replace(/^\s*Capo\s*(?:on)?\s*:?\s*(\d+)(?:st|nd|rd|th)?[^\n]*$/gim, '{capo:$1}')
    .replace(/cifraclub\.com(?:\.br)?/gi, '')
    .replace(/la-cuerda\.net/gi, '');
}

// Núcleo: para cada par (chord-line, lyric-line) consecutivo, fusiona en
// una sola línea con [Chord]lyric inline. Si la chord-line va sola (no
// hay letra debajo), la convierte a "[Em] [G] [C]".
export function mergeChordLines(text) {
  const lines = text.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Saltar directivas ChordPro tal cual
    if (/^\s*\{[^}]+\}\s*$/.test(line)) {
      result.push(line);
      continue;
    }
    if (!isChordOnlyLine(line)) {
      result.push(line);
      continue;
    }
    const chords = extractChordPositions(line);
    // Buscar la siguiente línea no-vacía que NO sea otra chord-line o directiva
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    const next = j < lines.length ? lines[j] : '';
    const nextIsLyric =
      next.trim().length > 0 &&
      !isChordOnlyLine(next) &&
      !/^\s*\{[^}]+\}\s*$/.test(next);
    if (nextIsLyric && chords.length > 0) {
      result.push(insertChordsIntoLyrics(chords, next));
      i = j; // saltar la línea de letra ya consumida
    } else {
      // Chord-line sin letra debajo: dejar como secuencia inline de chords
      result.push(chords.map(c => `[${c.chord}]`).join(' '));
    }
  }
  return result.join('\n');
}

// Entry-point principal: texto crudo → ChordPro listo para el editor.
export function convertRawToChordPro(raw) {
  let t = cleanWhitespace(raw);
  t = stripBoilerplate(t);
  t = normalizeSections(t);
  t = mergeChordLines(t);
  // Colapsar líneas vacías sobrantes que queden tras la fusión
  t = t.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return t;
}

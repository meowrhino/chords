// raw-to-chordpro.js — convierte texto crudo (chords-encima-de-letras) a ChordPro inline.
// Compartido entre frontend y Worker scraper.

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
export function normalizeSections(text) {
  return text
    // Inglés y formato corchete
    .replace(/^\s*\[?\s*Intro[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_intro}')
    .replace(/^\s*\[?\s*(Pre[\s-]?Chorus|Pre[\s-]?Estribillo)[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_verse}')
    .replace(/^\s*\[?\s*(Post[\s-]?Chorus)[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_verse}')
    .replace(/^\s*\[?\s*Verse[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_verse}')
    .replace(/^\s*\[?\s*Chorus[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_chorus}')
    .replace(/^\s*\[?\s*Bridge[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_bridge}')
    .replace(/^\s*\[?\s*Outro[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_outro}')
    .replace(/^\s*\[?\s*Instrumental[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_intro}')
    .replace(/^\s*\[?\s*Solo[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_intro}')
    .replace(/^\s*\[?\s*Interlude[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_intro}')
    // Español
    .replace(/^\s*\[?\s*Estrofa[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_verse}')
    .replace(/^\s*\[?\s*Estribillo[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_chorus}')
    .replace(/^\s*\[?\s*Coro[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_chorus}')
    .replace(/^\s*\[?\s*Puente[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_bridge}')
    // Francés
    .replace(/^\s*\[?\s*Couplet[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_verse}')
    .replace(/^\s*\[?\s*Refrain[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_chorus}')
    .replace(/^\s*\[?\s*Pont[^\]\n:]*\]?\s*:?\s*$/gim, '{start_of_bridge}');
}

// Limpia ruido típico de scrape: tabs, NBSP, watermarks comunes.
export function cleanWhitespace(text) {
  return text
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
    .replace(/^\s*Capo:?\s*\d+[^\n]*$/gim, (m) => m) // mantener info de capo
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

// transpose.js — motor de transposición de acordes

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// tonalidades que prefieren bemoles
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

/**
 * parsea un nombre de acorde en root + quality
 * @param {string} chord - e.g. "F#m7", "Bbmaj7", "C/G"
 * @returns {{ root: string, quality: string, bass?: string } | null}
 */
export function parseChord(chord) {
  if (!chord || typeof chord !== 'string') return null;

  // separar slash chord (bajo)
  let bass = null;
  let main = chord;
  const slashIdx = chord.indexOf('/');
  if (slashIdx > 0) {
    bass = chord.slice(slashIdx + 1);
    main = chord.slice(0, slashIdx);
  }

  // parsear root: letra + optional # o b
  const match = main.match(/^([A-G])(#|b)?(.*)/);
  if (!match) return null;

  const root = match[1] + (match[2] || '');
  const quality = match[3] || '';

  return { root, quality, bass };
}

/**
 * obtiene el índice semitonal de una nota (0-11)
 */
function noteIndex(note) {
  let idx = SHARP_NOTES.indexOf(note);
  if (idx === -1) idx = FLAT_NOTES.indexOf(note);
  return idx;
}

/**
 * transpone un nombre de nota por N semitonos
 * @param {string} note - e.g. "C#", "Bb"
 * @param {number} semitones - semitonos a mover (positivo = subir)
 * @param {boolean} useFlats - usar bemoles en vez de sostenidos
 * @returns {string}
 */
function transposeNote(note, semitones, useFlats = false) {
  const idx = noteIndex(note);
  if (idx === -1) return note;

  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return useFlats ? FLAT_NOTES[newIdx] : SHARP_NOTES[newIdx];
}

/**
 * transpone un acorde completo por N semitonos
 * @param {string} chord - nombre del acorde
 * @param {number} semitones - semitonos a mover
 * @param {string} [targetKey] - tonalidad destino para decidir # vs b
 * @returns {string}
 */
export function transposeChord(chord, semitones, targetKey) {
  if (semitones === 0) return chord;

  const parsed = parseChord(chord);
  if (!parsed) return chord;

  const useFlats = targetKey ? FLAT_KEYS.includes(targetKey) : parsed.root.includes('b');

  let result = transposeNote(parsed.root, semitones, useFlats) + parsed.quality;

  if (parsed.bass) {
    result += '/' + transposeNote(parsed.bass, semitones, useFlats);
  }

  return result;
}

/**
 * transpone todos los acordes de una canción parseada
 * @param {object} song - objeto parseado por chordpro.js
 * @param {number} semitones
 * @returns {object} nueva canción con acordes transpuestos
 */
export function transposeSong(song, semitones) {
  if (semitones === 0) return song;

  // calcular nueva tonalidad
  let newKey = song.meta.key;
  if (newKey) {
    newKey = transposeChord(newKey, semitones);
  }

  const newSections = song.sections.map(section => ({
    ...section,
    lines: section.lines.map(line => ({
      ...line,
      segments: line.segments.map(seg => ({
        ...seg,
        chord: seg.chord ? transposeChord(seg.chord, semitones, newKey) : null,
      })),
    })),
  }));

  return {
    ...song,
    meta: { ...song.meta, key: newKey },
    sections: newSections,
  };
}

/**
 * normaliza un nombre de acorde para lookup en la base de datos
 * convierte bemoles a sostenidos equivalentes
 */
export function normalizeChordName(chord) {
  const parsed = parseChord(chord);
  if (!parsed) return chord;

  const idx = noteIndex(parsed.root);
  if (idx === -1) return chord;

  let result = SHARP_NOTES[idx] + parsed.quality;
  if (parsed.bass) {
    const bassIdx = noteIndex(parsed.bass);
    result += '/' + (bassIdx >= 0 ? SHARP_NOTES[bassIdx] : parsed.bass);
  }
  return result;
}

export { SHARP_NOTES, FLAT_NOTES };

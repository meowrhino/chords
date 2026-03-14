// chordpro.js — parser de formato ChordPro con extensiones para romaji/pinyin

/**
 * parsea un archivo ChordPro en un objeto estructurado
 *
 * extensiones custom:
 *   {r:romaji}漢字{/r}  — romaji para japonés
 *   {p:pinyin}漢字{/p}  — pinyin para chino
 *
 * @param {string} text - contenido del archivo .cho
 * @returns {object} canción parseada
 */
export function parseChordPro(text) {
  const lines = text.split('\n');
  const song = {
    meta: {},
    sections: [],
    allChords: new Set(),
  };

  let currentSection = null;
  let inSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // línea vacía
    if (line.trim() === '') {
      if (currentSection && currentSection.lines.length > 0) {
        // añadir línea vacía como separador
        currentSection.lines.push({ segments: [], empty: true });
      }
      continue;
    }

    // directiva {key: value}
    const directiveMatch = line.match(/^\s*\{([^}]+)\}\s*$/);
    if (directiveMatch) {
      const directive = directiveMatch[1];
      processDirective(directive, song, (type) => {
        currentSection = { type, lines: [] };
        song.sections.push(currentSection);
        inSection = true;
      }, () => {
        inSection = false;
        currentSection = null;
      });
      continue;
    }

    // comentario #
    if (line.trim().startsWith('#')) continue;

    // línea de contenido (acordes + letras)
    if (!currentSection) {
      currentSection = { type: 'verse', lines: [] };
      song.sections.push(currentSection);
    }

    const parsedLine = parseLine(line, song.allChords);
    currentSection.lines.push(parsedLine);
  }

  // convertir Set a Array
  song.allChords = [...song.allChords];

  return song;
}

/**
 * procesa una directiva ChordPro
 */
function processDirective(directive, song, onStartSection, onEndSection) {
  // metadata directivas
  const metaMatch = directive.match(/^(\w+)\s*:\s*(.+)$/);
  if (metaMatch) {
    const [, key, value] = metaMatch;
    const k = key.toLowerCase();

    switch (k) {
      case 'title': case 't':
        song.meta.title = value.trim();
        break;
      case 'artist':
        song.meta.artist = value.trim();
        break;
      case 'key':
        song.meta.key = value.trim();
        break;
      case 'capo':
        song.meta.capo = parseInt(value.trim(), 10) || 0;
        break;
      case 'tempo':
        song.meta.tempo = parseInt(value.trim(), 10) || 0;
        break;
      case 'time':
        song.meta.time = value.trim();
        break;
      case 'comment': case 'c':
        // tratar como directiva inline — se ignora aquí, se maneja en las secciones
        break;
      case 'lang':
        song.meta.lang = value.trim();
        break;
      default:
        song.meta[k] = value.trim();
    }
    return;
  }

  // secciones
  const d = directive.toLowerCase().trim();
  switch (d) {
    case 'start_of_verse': case 'sov':
      onStartSection('verse');
      break;
    case 'start_of_chorus': case 'soc':
      onStartSection('chorus');
      break;
    case 'start_of_bridge': case 'sob':
      onStartSection('bridge');
      break;
    case 'start_of_intro':
      onStartSection('intro');
      break;
    case 'start_of_outro':
      onStartSection('outro');
      break;
    case 'start_of_instrumental':
      onStartSection('instrumental');
      break;
    case 'end_of_verse': case 'eov':
    case 'end_of_chorus': case 'eoc':
    case 'end_of_bridge': case 'eob':
    case 'end_of_intro':
    case 'end_of_outro':
    case 'end_of_instrumental':
      onEndSection();
      break;
  }

  // secciones con label: {start_of_verse: label}
  const sectionWithLabel = d.match(/^(start_of_\w+)\s*:\s*(.+)$/);
  if (sectionWithLabel) {
    const type = sectionWithLabel[1].replace('start_of_', '');
    onStartSection(type);
  }
}

/**
 * parsea una línea de contenido con acordes inline y anotaciones ruby
 * @param {string} line - e.g. "[Am]{r:yume}夢{/r}なら[C#]ば"
 * @param {Set} allChords - set para coleccionar todos los acordes
 * @returns {object} { segments: [...] }
 */
function parseLine(line, allChords) {
  const segments = [];
  let currentChord = null;
  let currentText = '';
  let currentReadings = []; // array de { text, reading, type }
  let i = 0;

  while (i < line.length) {
    // acorde [Chord]
    if (line[i] === '[') {
      // guardar segmento anterior si hay texto
      if (currentText || currentReadings.length > 0 || currentChord) {
        if (currentText || currentReadings.length > 0) {
          segments.push(buildSegment(currentChord, currentText, currentReadings));
        } else if (currentChord) {
          // acorde sin texto (se adjuntará al siguiente segmento)
          segments.push(buildSegment(currentChord, '', []));
        }
        currentText = '';
        currentReadings = [];
        currentChord = null;
      }

      const closeBracket = line.indexOf(']', i);
      if (closeBracket === -1) {
        currentText += line[i];
        i++;
        continue;
      }

      currentChord = line.slice(i + 1, closeBracket);
      allChords.add(currentChord);
      i = closeBracket + 1;
      continue;
    }

    // anotación ruby {r:reading}text{/r} o {p:pinyin}text{/p}
    const rubyMatch = line.slice(i).match(/^\{([rp]):([^}]*)\}/);
    if (rubyMatch) {
      const type = rubyMatch[1] === 'r' ? 'romaji' : 'pinyin';
      const reading = rubyMatch[2];
      i += rubyMatch[0].length;

      // buscar el cierre {/r} o {/p}
      const closeTag = `{/${rubyMatch[1]}}`;
      const closeIdx = line.indexOf(closeTag, i);
      if (closeIdx === -1) {
        // no hay cierre, tratar como texto normal
        currentText += rubyMatch[0];
        continue;
      }

      const rubyText = line.slice(i, closeIdx);
      currentReadings.push({ text: rubyText, reading, type });
      currentText += rubyText;
      i = closeIdx + closeTag.length;
      continue;
    }

    // texto normal
    currentText += line[i];
    i++;
  }

  // último segmento
  if (currentText || currentReadings.length > 0 || currentChord) {
    segments.push(buildSegment(currentChord, currentText, currentReadings));
  }

  return { segments };
}

function buildSegment(chord, text, readings) {
  const segment = { text: text || '' };
  if (chord) segment.chord = chord;
  if (readings.length > 0) segment.readings = readings;
  return segment;
}

/**
 * detecta si una canción tiene anotaciones CJK (romaji/pinyin)
 */
export function hasCJKReadings(song) {
  for (const section of song.sections) {
    for (const line of section.lines) {
      for (const seg of (line.segments || [])) {
        if (seg.readings && seg.readings.length > 0) return true;
      }
    }
  }
  return false;
}

/**
 * detecta el tipo de lectura predominante (romaji o pinyin)
 */
export function getReadingType(song) {
  for (const section of song.sections) {
    for (const line of section.lines) {
      for (const seg of (line.segments || [])) {
        if (seg.readings) {
          for (const r of seg.readings) {
            return r.type; // devolver el primer tipo encontrado
          }
        }
      }
    }
  }
  return null;
}

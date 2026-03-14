// chord-svg.js — generador SVG de diagramas de acordes
// soporta guitarra (6 cuerdas), ukelele (4), bajo (4) y piano

const SVG_NS = 'http://www.w3.org/2000/svg';

// configuración por defecto para instrumentos de trastes
const FRET_DEFAULTS = {
  width: 80,
  height: 100,
  numFrets: 4,
  stringSpacing: 12,
  fretSpacing: 18,
  dotRadius: 5,
  strokeColor: 'currentColor',
  dotColor: 'currentColor',
  openColor: 'currentColor',
  mutedColor: 'currentColor',
  fontSize: 9,
  titleSize: 11,
  paddingTop: 22,
  paddingBottom: 6,
  paddingX: 14,
};

// configuración para piano
const PIANO_DEFAULTS = {
  width: 120,
  height: 60,
  whiteKeyWidth: 14,
  whiteKeyHeight: 50,
  blackKeyWidth: 9,
  blackKeyHeight: 30,
  highlightColor: '#000',
  highlightColorDark: '#e0e0e0',
  paddingTop: 14,
  paddingX: 4,
  titleSize: 11,
  fontSize: 7,
};

// notas en el piano — mapeo de nombre a posición en octava
const PIANO_NOTE_MAP = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
};

// posiciones de teclas blancas y negras en una octava
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
const BLACK_KEYS = [1, 3, 6, 8, 10]; // C# D# F# G# A#
const WHITE_KEY_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

/**
 * genera un diagrama SVG para instrumento de trastes
 * @param {object} chord - { frets: number[], fingers?: number[], barres?: number[], baseFret?: number }
 * @param {object} opts - { strings: number, title?: string }
 * @returns {SVGElement}
 */
export function fretDiagram(chord, opts = {}) {
  const numStrings = opts.strings || 6;
  const cfg = { ...FRET_DEFAULTS };

  // ajustar ancho según número de cuerdas
  const totalStringWidth = (numStrings - 1) * cfg.stringSpacing;
  cfg.width = totalStringWidth + cfg.paddingX * 2;

  const totalFretHeight = cfg.numFrets * cfg.fretSpacing;
  cfg.height = cfg.paddingTop + totalFretHeight + cfg.paddingBottom + 14; // +14 para indicadores arriba

  const svg = svgEl('svg', {
    width: cfg.width,
    height: cfg.height,
    viewBox: `0 0 ${cfg.width} ${cfg.height}`,
    class: 'chord-diagram fret-diagram',
  });

  const startX = cfg.paddingX;
  const startY = cfg.paddingTop + 14; // espacio para open/muted indicators

  const baseFret = chord.baseFret || 1;
  const frets = chord.frets || [];
  const fingers = chord.fingers || [];
  const barres = chord.barres || [];

  // título del acorde
  if (opts.title) {
    const title = svgEl('text', {
      x: cfg.width / 2,
      y: 12,
      'text-anchor': 'middle',
      'font-size': cfg.titleSize,
      'font-family': "'Inknut Antiqua', serif",
      'font-weight': '600',
      fill: cfg.strokeColor,
    });
    title.textContent = opts.title;
    svg.appendChild(title);
  }

  // cejuela (nut) — línea gruesa en posición 1
  if (baseFret === 1) {
    svg.appendChild(svgEl('line', {
      x1: startX,
      y1: startY,
      x2: startX + totalStringWidth,
      y2: startY,
      stroke: cfg.strokeColor,
      'stroke-width': 3,
      'stroke-linecap': 'round',
    }));
  } else {
    // número de traste base
    const fretLabel = svgEl('text', {
      x: startX - 8,
      y: startY + cfg.fretSpacing / 2 + 3,
      'text-anchor': 'middle',
      'font-size': cfg.fontSize - 1,
      'font-family': 'monospace',
      fill: cfg.strokeColor,
    });
    fretLabel.textContent = baseFret;
    svg.appendChild(fretLabel);
  }

  // trastes (líneas horizontales)
  for (let i = 0; i <= cfg.numFrets; i++) {
    const y = startY + i * cfg.fretSpacing;
    svg.appendChild(svgEl('line', {
      x1: startX,
      y1: y,
      x2: startX + totalStringWidth,
      y2: y,
      stroke: cfg.strokeColor,
      'stroke-width': i === 0 && baseFret > 1 ? 1.5 : 1,
      'stroke-opacity': 0.4,
    }));
  }

  // cuerdas (líneas verticales)
  for (let i = 0; i < numStrings; i++) {
    const x = startX + i * cfg.stringSpacing;
    svg.appendChild(svgEl('line', {
      x1: x,
      y1: startY,
      x2: x,
      y2: startY + totalFretHeight,
      stroke: cfg.strokeColor,
      'stroke-width': 1,
      'stroke-opacity': 0.5,
    }));
  }

  // barres (cejillas)
  for (const barre of barres) {
    const barreData = typeof barre === 'number'
      ? { fret: barre, from: 0, to: numStrings - 1 }
      : barre;

    const y = startY + (barreData.fret - 0.5) * cfg.fretSpacing;
    const x1 = startX + barreData.from * cfg.stringSpacing;
    const x2 = startX + barreData.to * cfg.stringSpacing;

    svg.appendChild(svgEl('rect', {
      x: x1 - cfg.dotRadius,
      y: y - cfg.dotRadius,
      width: (x2 - x1) + cfg.dotRadius * 2,
      height: cfg.dotRadius * 2,
      rx: cfg.dotRadius,
      ry: cfg.dotRadius,
      fill: cfg.dotColor,
    }));
  }

  // posiciones de dedos y indicadores open/muted
  for (let i = 0; i < numStrings; i++) {
    const fret = frets[i];
    const x = startX + i * cfg.stringSpacing;

    if (fret === -1 || fret === 'x') {
      // muted — X arriba
      const xSize = 3.5;
      const yPos = startY - 7;
      const g = svgEl('g', { 'stroke': cfg.mutedColor, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
      g.appendChild(svgEl('line', { x1: x - xSize, y1: yPos - xSize, x2: x + xSize, y2: yPos + xSize }));
      g.appendChild(svgEl('line', { x1: x + xSize, y1: yPos - xSize, x2: x - xSize, y2: yPos + xSize }));
      svg.appendChild(g);
    } else if (fret === 0) {
      // open — O arriba
      svg.appendChild(svgEl('circle', {
        cx: x,
        cy: startY - 7,
        r: 3.5,
        fill: 'none',
        stroke: cfg.openColor,
        'stroke-width': 1.5,
      }));
    } else {
      // dedo en traste — punto negro
      const y = startY + (fret - 0.5) * cfg.fretSpacing;

      // verificar si este punto ya está cubierto por una barre
      const coveredByBarre = barres.some(b => {
        const bd = typeof b === 'number' ? { fret: b, from: 0, to: numStrings - 1 } : b;
        return bd.fret === fret && i >= bd.from && i <= bd.to;
      });

      if (!coveredByBarre) {
        svg.appendChild(svgEl('circle', {
          cx: x,
          cy: y,
          r: cfg.dotRadius,
          fill: cfg.dotColor,
        }));
      }

      // número de dedo
      const finger = fingers[i];
      if (finger && finger > 0) {
        const label = svgEl('text', {
          x: x,
          y: y + 3,
          'text-anchor': 'middle',
          'font-size': 7,
          'font-family': 'monospace',
          fill: coveredByBarre ? cfg.dotColor : (getComputedStyle ? 'var(--bg, #fff)' : '#fff'),
          'font-weight': 'bold',
        });
        label.textContent = finger;
        if (!coveredByBarre) {
          svg.appendChild(label);
        }
      }
    }
  }

  return svg;
}

/**
 * genera un diagrama SVG de piano
 * @param {object} chord - { keys: number[] } semitone offsets from root, or { notes: string[] }
 * @param {object} opts - { title?: string, root?: string }
 * @returns {SVGElement}
 */
export function pianoDiagram(chord, opts = {}) {
  const cfg = { ...PIANO_DEFAULTS };

  // calcular notas MIDI relativas a mostrar
  let highlightSemitones = [];
  if (chord.keys) {
    // keys son offsets del root
    const rootSemitone = PIANO_NOTE_MAP[opts.root || 'C'] || 0;
    highlightSemitones = chord.keys.map(k => (rootSemitone + k) % 12);
  } else if (chord.notes) {
    highlightSemitones = chord.notes.map(n => PIANO_NOTE_MAP[n]).filter(n => n !== undefined);
  }

  // dibujar 2 octavas (14 teclas blancas)
  const numWhiteKeys = 14;
  cfg.width = numWhiteKeys * cfg.whiteKeyWidth + cfg.paddingX * 2;
  cfg.height = cfg.whiteKeyHeight + cfg.paddingTop + 4;

  const svg = svgEl('svg', {
    width: cfg.width,
    height: cfg.height,
    viewBox: `0 0 ${cfg.width} ${cfg.height}`,
    class: 'chord-diagram piano-diagram',
  });

  // título
  if (opts.title) {
    const title = svgEl('text', {
      x: cfg.width / 2,
      y: 11,
      'text-anchor': 'middle',
      'font-size': cfg.titleSize,
      'font-family': "'Inknut Antiqua', serif",
      'font-weight': '600',
      fill: 'currentColor',
    });
    title.textContent = opts.title;
    svg.appendChild(title);
  }

  const startX = cfg.paddingX;
  const startY = cfg.paddingTop;

  // teclas blancas primero (fondo)
  for (let i = 0; i < numWhiteKeys; i++) {
    const semitone = WHITE_KEYS[i % 7];
    const octaveOffset = Math.floor(i / 7);
    const absoluteSemitone = (semitone + octaveOffset * 12) % 12;
    const isHighlighted = highlightSemitones.includes(absoluteSemitone);

    const x = startX + i * cfg.whiteKeyWidth;

    svg.appendChild(svgEl('rect', {
      x: x,
      y: startY,
      width: cfg.whiteKeyWidth - 1,
      height: cfg.whiteKeyHeight,
      fill: isHighlighted ? 'currentColor' : 'var(--bg, #fff)',
      stroke: 'currentColor',
      'stroke-width': 0.8,
      'stroke-opacity': 0.3,
      rx: 1,
    }));

    // nota label si highlighted
    if (isHighlighted) {
      const label = svgEl('text', {
        x: x + (cfg.whiteKeyWidth - 1) / 2,
        y: startY + cfg.whiteKeyHeight - 4,
        'text-anchor': 'middle',
        'font-size': cfg.fontSize,
        'font-family': 'monospace',
        fill: 'var(--bg, #fff)',
        'font-weight': 'bold',
      });
      label.textContent = WHITE_KEY_NAMES[i % 7];
      svg.appendChild(label);
    }
  }

  // teclas negras encima
  const blackKeyPositions = [0, 1, 3, 4, 5]; // C# D# | F# G# A# (posiciones relativas a teclas blancas)
  for (let octave = 0; octave < 2; octave++) {
    for (const pos of blackKeyPositions) {
      const whiteKeyIndex = octave * 7 + pos;
      if (whiteKeyIndex >= numWhiteKeys - 1) continue;

      const semitone = BLACK_KEYS[blackKeyPositions.indexOf(pos)];
      const absoluteSemitone = (semitone + octave * 12) % 12;
      const isHighlighted = highlightSemitones.includes(absoluteSemitone);

      const x = startX + (whiteKeyIndex + 1) * cfg.whiteKeyWidth - cfg.blackKeyWidth / 2 - 0.5;

      svg.appendChild(svgEl('rect', {
        x: x,
        y: startY,
        width: cfg.blackKeyWidth,
        height: cfg.blackKeyHeight,
        fill: isHighlighted ? 'currentColor' : 'var(--text, #000)',
        stroke: 'none',
        rx: 1,
      }));

      if (isHighlighted) {
        svg.appendChild(svgEl('circle', {
          cx: x + cfg.blackKeyWidth / 2,
          cy: startY + cfg.blackKeyHeight - 7,
          r: 3,
          fill: 'var(--bg, #fff)',
        }));
      }
    }
  }

  return svg;
}

/**
 * genera un diagrama según el instrumento
 * @param {string} chordName - nombre del acorde (e.g. "Am", "F#m7")
 * @param {object} chordData - datos del acorde desde chords-db
 * @param {string} instrument - "guitar" | "ukulele" | "bass" | "piano"
 * @returns {SVGElement|null}
 */
export function chordDiagram(chordName, chordData, instrument = 'guitar') {
  if (!chordData) return null;

  if (instrument === 'piano') {
    return pianoDiagram(chordData, { title: chordName, root: chordName.replace(/[^A-G#b].*/, '') });
  }

  const strings = instrument === 'guitar' ? 6 : 4;
  return fretDiagram(chordData, { strings, title: chordName });
}

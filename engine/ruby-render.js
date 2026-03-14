// ruby-render.js — renderizador de acordes sobre letras con <ruby>/<rt>
// soporta romaji (japonés) y pinyin (chino) como anotaciones ruby

/**
 * renderiza una canción parseada a HTML
 * @param {object} song - canción parseada por chordpro.js
 * @param {object} opts - { showChords, showReadings, instrument }
 * @returns {string} HTML
 */
export function renderSong(song, opts = {}) {
  const showChords = opts.showChords !== false;
  const showReadings = opts.showReadings || false;

  let html = '';

  for (const section of song.sections) {
    const sectionClass = `section section-${section.type}`;
    const label = sectionLabel(section.type);

    html += `<div class="${sectionClass}">`;
    if (label) {
      html += `<div class="section-label">${label}</div>`;
    }

    for (const line of section.lines) {
      if (line.empty) {
        html += '<div class="line-break"></div>';
        continue;
      }

      html += renderLine(line, showChords, showReadings);
    }

    html += '</div>';
  }

  return html;
}

/**
 * renderiza una línea de acordes + letras
 */
function renderLine(line, showChords, showReadings) {
  if (!line.segments || line.segments.length === 0) {
    return '<div class="song-line empty-line"></div>';
  }

  const hasAnyChord = line.segments.some(s => s.chord);
  const hasAnyReading = line.segments.some(s => s.readings && s.readings.length > 0);

  // si hay readings activas, usar layout de dos capas
  if (showReadings && hasAnyReading) {
    return renderTwoLayerLine(line, showChords);
  }

  // detectar si es una línea de solo acordes (sin letras significativas)
  const isChordOnlyLine = line.segments.every(s => !s.text || !s.text.trim());

  // layout estándar: ruby con acorde arriba
  let html = '<div class="song-line">';

  if (isChordOnlyLine && showChords) {
    // línea de solo acordes: mostrar como nombres separados por espacios
    const chords = line.segments.filter(s => s.chord).map(s => s.chord);
    html += chords.map(c =>
      `<span class="chord-inline" data-chord="${escapeAttr(c)}">${escapeHtml(c)}</span>`
    ).join('  ');
  } else {
    for (const seg of line.segments) {
      if (showChords && seg.chord) {
        const text = seg.text || ' ';
        html += `<span class="chord-segment">`;
        html += `<ruby>`;
        html += `<span class="lyric">${escapeHtml(text)}</span>`;
        html += `<rt class="chord-name" data-chord="${escapeAttr(seg.chord)}">${escapeHtml(seg.chord)}</rt>`;
        html += `</ruby>`;
        html += `</span>`;
      } else {
        html += `<span class="text-segment">${escapeHtml(seg.text)}</span>`;
      }
    }
  }

  html += '</div>';
  return html;
}

/**
 * renderiza una línea con dos capas: acordes arriba + texto con ruby readings abajo
 * cuando tanto acordes como readings (romaji/pinyin) están activos
 */
function renderTwoLayerLine(line, showChords) {
  let html = '<div class="song-line two-layer">';

  // capa de acordes
  if (showChords) {
    html += '<div class="chord-layer">';
    for (const seg of line.segments) {
      if (seg.chord) {
        html += `<span class="chord-inline" data-chord="${escapeAttr(seg.chord)}">${escapeHtml(seg.chord)}</span>`;
      }
      // espaciado proporcional al texto
      html += `<span class="chord-spacer">${invisibleText(seg.text)}</span>`;
    }
    html += '</div>';
  }

  // capa de texto con readings
  html += '<div class="lyric-layer">';
  for (const seg of line.segments) {
    if (seg.readings && seg.readings.length > 0) {
      html += renderWithReadings(seg.text, seg.readings);
    } else {
      html += `<span class="text-segment">${escapeHtml(seg.text)}</span>`;
    }
  }
  html += '</div>';

  html += '</div>';
  return html;
}

/**
 * renderiza texto con anotaciones ruby (romaji/pinyin)
 */
function renderWithReadings(fullText, readings) {
  let html = '';
  let pos = 0;

  for (const r of readings) {
    // texto antes de esta anotación
    const idx = fullText.indexOf(r.text, pos);
    if (idx > pos) {
      html += `<span class="text-segment">${escapeHtml(fullText.slice(pos, idx))}</span>`;
    }

    // texto con ruby
    html += `<ruby class="reading-ruby">`;
    html += escapeHtml(r.text);
    html += `<rt class="${r.type}">${escapeHtml(r.reading)}</rt>`;
    html += `</ruby>`;

    pos = idx + r.text.length;
  }

  // texto restante
  if (pos < fullText.length) {
    html += `<span class="text-segment">${escapeHtml(fullText.slice(pos))}</span>`;
  }

  return html;
}

/**
 * genera texto invisible para mantener el espaciado en la capa de acordes
 */
function invisibleText(text) {
  if (!text) return '';
  return `<span class="invisible">${escapeHtml(text)}</span>`;
}

function sectionLabel(type) {
  const labels = {
    verse: 'verso',
    chorus: 'coro',
    bridge: 'puente',
    intro: 'intro',
    outro: 'outro',
    instrumental: 'instrumental',
    prechorus: 'pre-coro',
    solo: 'solo',
  };
  return labels[type] || type;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// song.js — la vista de una canción: letra, acordes, diagramas y su panel.

import { API_BASE, profile, state } from './state.js';
import { $, els, esc } from './dom.js';
import { getMergedCatalog, setFavoriteBtn } from './catalog.js';
import { updateFollowButtons } from './social.js';
import { initComments } from './comments.js';
import { loadSongRecordings } from './recordings.js';
import { parseChordPro, hasCJKReadings, getReadingType } from '../engine/chordpro.js';
import { renderSong } from '../engine/ruby-render.js';
import { transposeSong, normalizeChordName } from '../engine/transpose.js';
import { chordDiagram } from '../engine/chord-svg.js';
import { lookupChord } from '../engine/chords-db.js';

// === CANCIÓN ===

export async function loadSong(slug) {
  try {
    // primero buscar en custom songs
    const custom = profile.customSongs();
    let text;
    if (custom[slug]) {
      text = custom[slug];
      state.isCustomSong = true;
    } else {
      const res = await fetch(`songs/${slug}.cho`);
      if (res.ok) {
        text = await res.text();
        state.isCustomSong = false;
      } else {
        // no está en el catálogo estático — buscar en la base de datos pública
        const dbRes = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(slug)}`);
        if (!dbRes.ok) throw new Error(`${res.status}`);
        const { song: dbSong } = await dbRes.json();
        text = dbSong.cho_content;
        state.isCustomSong = false;
      }
    }
    state.parsedSong = parseChordPro(text);
    state.currentSong = slug;
    state.transpose = 0;
    state.capo = state.parsedSong.meta.capo || 0;

    // aplicar instrumento default del perfil
    const prof = profile.load();
    if (prof.instrument) {
      state.instrument = prof.instrument;
    }

    // registrar en historial
    profile.addHistory(slug);

    renderSongView();
  } catch (e) {
    console.error('error cargando canción:', e);
    els.songContent.innerHTML = '<div class="no-results">canción no encontrada</div>';
  }
}

export function renderSongView() {
  const song = state.transpose !== 0
    ? transposeSong(state.parsedSong, state.transpose)
    : state.parsedSong;

  // header
  els.songTitle.textContent = song.meta.title || state.currentSong;
  const metaParts = [];
  if (song.meta.artist) metaParts.push(`<a href="#/artist/${encodeURIComponent(song.meta.artist)}" class="artist-link">${esc(song.meta.artist)}</a>`);
  if (song.meta.key) metaParts.push(`<span>tonalidad: ${esc(song.meta.key)}</span>`);
  if (state.capo > 0) metaParts.push(`<span>capo: ${state.capo}</span>`);
  if (song.meta.tempo) metaParts.push(`<span>${song.meta.tempo} bpm</span>`);
  els.songMeta.innerHTML = metaParts.join('');

  // favorito
  setFavoriteBtn(profile.isFavorite(state.currentSong));

  // botón editar (solo custom)
  els.editBtn.style.display = state.isCustomSong ? '' : 'none';

  // versiones
  renderVersionSelector(song);

  // follow buttons
  updateFollowButtons(song);

  // instrumento activo en picker
  els.instrumentPicker.querySelectorAll('.control-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.instrument === state.instrument);
  });

  // readings control
  const hasReadings = hasCJKReadings(state.parsedSong);
  if (hasReadings) {
    els.readingsControl.style.display = '';
    const readingType = getReadingType(state.parsedSong);
    els.readingsLabel.textContent = readingType === 'pinyin' ? 'pinyin' : 'romaji';
  } else {
    els.readingsControl.style.display = 'none';
  }

  // actualizar controles
  els.transposeValue.textContent = state.transpose > 0 ? `+${state.transpose}` : state.transpose;
  els.capoValue.textContent = state.capo;
  els.readingsToggle.textContent = state.showReadings ? 'on' : 'off';
  els.readingsToggle.classList.toggle('active', state.showReadings);

  // diagramas de acordes
  renderChordDiagrams(song);

  // contenido
  els.songContent.innerHTML = renderSong(song, {
    showChords: true,
    showReadings: state.showReadings,
  });

  // chord click/hover listeners
  setupChordInteraction();

  // comentarios
  initComments(state.currentSong);

  // tomas grabadas de esta canción
  loadSongRecordings(state.currentSong);
}

export async function renderVersionSelector(song) {
  const all = getMergedCatalog();
  const title = (song.meta.title || '').toLowerCase();
  const artist = (song.meta.artist || '').toLowerCase();
  const currentSlug = state.currentSong;

  const localVersions = (title && artist
    ? all.filter(s => s.title.toLowerCase() === title && s.artist.toLowerCase() === artist)
    : []
  // index.json puede traer "version_label" para que el selector diga algo útil
  // ("acordes simples") en vez de v1/v2, que no dice nada de qué las diferencia.
  ).map((v, i) => ({
    slug: v.file.replace('.cho', ''),
    label: v.custom ? 'tuya' : (v.version_label || `v${i + 1}`),
  }));

  // versiones reales en la base de datos (mismo slug, distinto contenido)
  let dbVersions = [];
  try {
    const res = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(currentSlug)}`);
    if (res.ok) {
      const { versions } = await res.json();
      dbVersions = (versions || []).map(v => ({
        slug: v.slug,
        label: v.version > 1 ? `v${v.version}` : 'original',
      }));
    }
  } catch { /* sin conexión — solo se muestran las versiones locales */ }

  // el fetch es async: si mientras tanto se navegó a otra canción, no pisar la UI
  if (state.currentSong !== currentSlug) return;

  const seen = new Set();
  const versions = [...localVersions, ...dbVersions].filter(v => {
    if (seen.has(v.slug)) return false;
    seen.add(v.slug);
    return true;
  });

  if (versions.length <= 1) { els.versionSelector.style.display = 'none'; return; }

  let html = '<span class="version-label">versión:</span>';
  for (const v of versions) {
    const cls = v.slug === currentSlug ? 'version-btn active' : 'version-btn';
    html += `<a href="#/song/${esc(v.slug)}" class="${cls}">${esc(v.label)}</a>`;
  }

  els.versionSelector.innerHTML = html;
  els.versionSelector.style.display = '';
}

export function renderChordDiagrams(song) {
  els.chordDiagrams.innerHTML = '';

  for (const chordName of song.allChords) {
    if (/^N\.?C\.?$/i.test(chordName)) continue;   // N.C. no tiene diagrama posible
    const normalized = normalizeChordName(chordName);
    const data = lookupChord(normalized, state.instrument);

    if (!data) {
      // mostrar placeholder para acordes no encontrados
      const card = document.createElement('div');
      card.className = 'chord-diagram-card';
      card.innerHTML = `<span style="font-size:0.6rem;color:var(--text-muted)">${esc(chordName)}</span>`;
      els.chordDiagrams.appendChild(card);
      continue;
    }

    const card = document.createElement('div');
    card.className = 'chord-diagram-card';

    const svg = chordDiagram(chordName, data, state.instrument);
    if (svg) card.appendChild(svg);

    els.chordDiagrams.appendChild(card);
  }
}

// "fijar" no abre otro panel con los mismos diagramas: clava el que ya hay
// arriba de la canción. Antes era un plano fijo a la derecha, lejos de los
// acordes que estabas mirando; ahora los diagramas se quedan donde estaban,
// en la misma columna, y la letra pasa por debajo.
//
// El top se mide en vez de fijarse: la barra de controles también es sticky y
// su alto cambia con el ancho de pantalla (en móvil es una fila, en escritorio
// se reparte en varias), así que un valor a pelo dejaba hueco o solapaba.
export function pinnedTop() {
  const bar = $('#controlsBar');
  return bar ? bar.getBoundingClientRect().height : 0;
}

export function syncPinnedTop() {
  if (!els.chordDiagrams.classList.contains('pinned')) return;
  els.chordDiagrams.style.setProperty('--pinned-top', `${pinnedTop()}px`);
}

export function setChordsPinned(pinned) {
  els.chordDiagrams.classList.toggle('pinned', pinned);
  els.chordPanelToggle.classList.toggle('active', pinned);
  els.chordPanelToggle.textContent = pinned ? 'soltar' : 'fijar';
  if (pinned) syncPinnedTop();
  else els.chordDiagrams.style.removeProperty('--pinned-top');
}

export function toggleChordPanel() {
  setChordsPinned(!els.chordDiagrams.classList.contains('pinned'));
}

export function setupChordInteraction() {
  // click en nombres de acordes en el contenido
  const chordEls = els.songContent.querySelectorAll('.chord-name, .chord-inline');

  for (const el of chordEls) {
    const chordName = el.dataset.chord || el.textContent;

    el.addEventListener('mouseenter', (e) => showChordPopup(chordName, e));
    el.addEventListener('mouseleave', hideChordPopup);
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showChordPopup(chordName, e);
    });
  }
}

export function showChordPopup(chordName, event) {
  const normalized = normalizeChordName(chordName);
  const data = lookupChord(normalized, state.instrument);
  if (!data) return;

  const svg = chordDiagram(chordName, data, state.instrument);
  if (!svg) return;

  els.chordPopupContent.innerHTML = '';
  els.chordPopupContent.appendChild(svg);

  const popup = els.chordPopup;
  popup.style.display = 'block';

  // posicionar cerca del cursor, encima del acorde para no tapar la letra de abajo
  const rect = event.target.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 4;

  // ajustar si sale de la pantalla
  const pw = 120;
  const ph = 140;
  if (x + pw > window.innerWidth) x = window.innerWidth - pw - 8;
  if (y - ph < 0) y = rect.bottom + 4;
  else y -= ph;

  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
}

export function hideChordPopup() {
  els.chordPopup.style.display = 'none';
}

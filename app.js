// app.js — router, estado y UI principal

import { parseChordPro, hasCJKReadings, getReadingType } from './engine/chordpro.js';
import { renderSong } from './engine/ruby-render.js';
import { transposeSong, normalizeChordName } from './engine/transpose.js';
import { chordDiagram } from './engine/chord-svg.js';
import { lookupChord } from './engine/chords-db.js';

// === PERFIL (localStorage) ===

const profile = {
  load() {
    return JSON.parse(localStorage.getItem('chords-profile') || '{"name":"","instrument":"guitar"}');
  },
  save(data) {
    localStorage.setItem('chords-profile', JSON.stringify(data));
  },
  favorites() {
    return JSON.parse(localStorage.getItem('chords-favorites') || '[]');
  },
  saveFavorites(favs) {
    localStorage.setItem('chords-favorites', JSON.stringify(favs));
  },
  toggleFavorite(slug) {
    const favs = this.favorites();
    const idx = favs.indexOf(slug);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(slug);
    this.saveFavorites(favs);
    return idx < 0; // true = ahora es favorito
  },
  isFavorite(slug) {
    return this.favorites().includes(slug);
  },
  history() {
    return JSON.parse(localStorage.getItem('chords-history') || '[]');
  },
  addHistory(slug) {
    let hist = this.history().filter(h => h.slug !== slug);
    hist.unshift({ slug, date: new Date().toISOString().slice(0, 10) });
    if (hist.length > 20) hist = hist.slice(0, 20);
    localStorage.setItem('chords-history', JSON.stringify(hist));
  },
  customSongs() {
    return JSON.parse(localStorage.getItem('chords-custom-songs') || '{}');
  },
  customIndex() {
    return JSON.parse(localStorage.getItem('chords-custom-index') || '[]');
  },
  saveCustomSong(slug, choText, meta) {
    const songs = this.customSongs();
    songs[slug] = choText;
    localStorage.setItem('chords-custom-songs', JSON.stringify(songs));

    const index = this.customIndex().filter(s => s.file !== slug + '.cho');
    index.push({
      file: slug + '.cho',
      title: meta.title || slug,
      artist: meta.artist || '',
      key: meta.key || '',
      lang: meta.lang || '',
      custom: true,
    });
    localStorage.setItem('chords-custom-index', JSON.stringify(index));
  },
  deleteCustomSong(slug) {
    const songs = this.customSongs();
    delete songs[slug];
    localStorage.setItem('chords-custom-songs', JSON.stringify(songs));
    const index = this.customIndex().filter(s => s.file !== slug + '.cho');
    localStorage.setItem('chords-custom-index', JSON.stringify(index));
  },
};

// === ESTADO ===

const state = {
  catalog: [],
  currentSong: null,
  parsedSong: null,
  instrument: 'guitar',
  transpose: 0,
  capo: 0,
  showReadings: false,
  autoScroll: false,
  scrollSpeed: 3,
  scrollInterval: null,
};

// === ELEMENTOS DOM ===

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  catalogView: $('#catalogView'),
  songView: $('#songView'),
  editorView: $('#editorView'),
  searchInput: $('#searchInput'),
  songList: $('#songList'),
  songTitle: $('#songTitle'),
  songMeta: $('#songMeta'),
  controlsBar: $('#controlsBar'),
  instrumentPicker: $('#instrumentPicker'),
  transposeValue: $('#transposeValue'),
  capoValue: $('#capoValue'),
  readingsControl: $('#readingsControl'),
  readingsLabel: $('#readingsLabel'),
  readingsToggle: $('#readingsToggle'),
  scrollToggle: $('#scrollToggle'),
  scrollSpeed: $('#scrollSpeed'),
  scrollSlower: $('#scrollSlower'),
  scrollFaster: $('#scrollFaster'),
  chordDiagrams: $('#chordDiagrams'),
  songContent: $('#songContent'),
  chordPopup: $('#chordPopup'),
  chordPopupContent: $('#chordPopupContent'),
  themeToggle: $('#themeToggle'),
  favoriteBtn: $('#favoriteBtn'),
  editBtn: $('#editBtn'),
  versionSelector: $('#versionSelector'),
  edTitle: $('#edTitle'),
  edArtist: $('#edArtist'),
  edKey: $('#edKey'),
  edCapo: $('#edCapo'),
  edLang: $('#edLang'),
  edContent: $('#edContent'),
  edPreview: $('#edPreview'),
  edSave: $('#edSave'),
  edDownload: $('#edDownload'),
  edDelete: $('#edDelete'),
  profileBtn: $('#profileBtn'),
  profileDropdown: $('#profileDropdown'),
  profileName: $('#profileName'),
  profileInstrument: $('#profileInstrument'),
};

// === CATÁLOGO ===

async function loadCatalog() {
  try {
    const res = await fetch('songs/index.json');
    state.catalog = await res.json();
  } catch (e) {
    state.catalog = [];
    console.warn('no se pudo cargar el catálogo:', e);
  }
}

function getMergedCatalog() {
  const custom = profile.customIndex();
  return [...state.catalog, ...custom];
}

function renderCatalog(filter = '') {
  const f = filter.toLowerCase();
  const all = getMergedCatalog();
  const filtered = all.filter(s =>
    !f || s.title.toLowerCase().includes(f) || s.artist.toLowerCase().includes(f)
  );

  let html = '';
  const favs = profile.favorites();
  const history = profile.history();

  // --- secciones especiales (solo sin filtro) ---
  if (!f) {
    // recientes
    if (history.length > 0) {
      const recentSongs = history
        .map(h => all.find(s => s.file === h.slug + '.cho'))
        .filter(Boolean)
        .slice(0, 5);
      if (recentSongs.length > 0) {
        html += renderSongSection('recientes', recentSongs);
      }
    }

    // favoritos
    if (favs.length > 0) {
      const favSongs = all.filter(s => favs.includes(s.file.replace('.cho', '')));
      if (favSongs.length > 0) {
        html += renderSongSection('favoritos', favSongs);
      }
    }

    // tus tablaturas
    const custom = all.filter(s => s.custom);
    if (custom.length > 0) {
      html += renderSongSection('tus tablaturas', custom);
    }
  }

  // --- todas ---
  if (filtered.length === 0 && !html) {
    els.songList.innerHTML = '<div class="no-results">sin resultados</div>';
    return;
  }

  // agrupar por artista
  const groups = {};
  for (const song of filtered) {
    const artist = song.artist || 'desconocido';
    if (!groups[artist]) groups[artist] = [];
    groups[artist].push(song);
  }

  const sortedArtists = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  html += `<div class="catalog-section-label">todas</div>`;
  for (const artist of sortedArtists) {
    html += `<div class="artist-group">`;
    html += `<div class="artist-name">${esc(artist)}</div>`;
    for (const song of groups[artist]) {
      html += songEntryHTML(song);
    }
    html += `</div>`;
  }

  // botón nueva tablatura
  html += `<div class="new-tab-btn" id="newTabBtn">+ nueva tablatura</div>`;

  els.songList.innerHTML = html;
  bindSongEntries();
  const newBtn = $('#newTabBtn');
  if (newBtn) newBtn.addEventListener('click', () => { location.hash = '#/editor'; });
}

function renderSongSection(label, songs) {
  let html = `<div class="catalog-section-label">${esc(label)}</div>`;
  for (const song of songs) {
    html += songEntryHTML(song);
  }
  return html;
}

function songEntryHTML(song) {
  let html = `<div class="song-entry" data-file="${esc(song.file)}"${song.custom ? ' data-custom="1"' : ''}>`;
  html += `<span class="song-entry-title">${esc(song.title)}`;
  if (song.custom) html += ` <span class="badge-custom">(tuya)</span>`;
  html += `</span>`;
  if (song.key) html += `<span class="song-entry-key">${esc(song.key)}</span>`;
  if (song.lang) html += `<span class="song-entry-lang">${esc(song.lang)}</span>`;
  html += `</div>`;
  return html;
}

function bindSongEntries() {
  for (const entry of els.songList.querySelectorAll('.song-entry')) {
    entry.addEventListener('click', () => {
      const file = entry.dataset.file;
      location.hash = `#/song/${file.replace('.cho', '')}`;
    });
  }
}

// === CANCIÓN ===

async function loadSong(slug) {
  try {
    // primero buscar en custom songs
    const custom = profile.customSongs();
    let text;
    if (custom[slug]) {
      text = custom[slug];
      state.isCustomSong = true;
    } else {
      const res = await fetch(`songs/${slug}.cho`);
      if (!res.ok) throw new Error(`${res.status}`);
      text = await res.text();
      state.isCustomSong = false;
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

function renderSongView() {
  const song = state.transpose !== 0
    ? transposeSong(state.parsedSong, state.transpose)
    : state.parsedSong;

  // header
  els.songTitle.textContent = song.meta.title || state.currentSong;
  const metaParts = [];
  if (song.meta.artist) metaParts.push(`<span>${esc(song.meta.artist)}</span>`);
  if (song.meta.key) metaParts.push(`<span>tonalidad: ${esc(song.meta.key)}</span>`);
  if (state.capo > 0) metaParts.push(`<span>capo: ${state.capo}</span>`);
  if (song.meta.tempo) metaParts.push(`<span>${song.meta.tempo} bpm</span>`);
  els.songMeta.innerHTML = metaParts.join('');

  // favorito
  const isFav = profile.isFavorite(state.currentSong);
  els.favoriteBtn.textContent = isFav ? '♥' : '♡';
  els.favoriteBtn.classList.toggle('active', isFav);
  els.favoriteBtn.title = isFav ? 'quitar de favoritos' : 'añadir a favoritos';

  // botón editar (solo custom)
  els.editBtn.style.display = state.isCustomSong ? '' : 'none';

  // versiones
  renderVersionSelector(song);

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
}

function renderVersionSelector(song) {
  const all = getMergedCatalog();
  const title = (song.meta.title || '').toLowerCase();
  const artist = (song.meta.artist || '').toLowerCase();
  if (!title || !artist) { els.versionSelector.style.display = 'none'; return; }

  const versions = all.filter(s =>
    s.title.toLowerCase() === title && s.artist.toLowerCase() === artist
  );

  if (versions.length <= 1) { els.versionSelector.style.display = 'none'; return; }

  const currentSlug = state.currentSong;
  let html = '<span class="version-label">versión:</span>';
  versions.forEach((v, i) => {
    const slug = v.file.replace('.cho', '');
    const label = v.custom ? 'tuya' : `v${i + 1}`;
    const cls = slug === currentSlug ? 'version-btn active' : 'version-btn';
    html += `<a href="#/song/${esc(slug)}" class="${cls}">${esc(label)}</a>`;
  });

  els.versionSelector.innerHTML = html;
  els.versionSelector.style.display = '';
}

function renderChordDiagrams(song) {
  els.chordDiagrams.innerHTML = '';

  for (const chordName of song.allChords) {
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

function setupChordInteraction() {
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

function showChordPopup(chordName, event) {
  const normalized = normalizeChordName(chordName);
  const data = lookupChord(normalized, state.instrument);
  if (!data) return;

  const svg = chordDiagram(chordName, data, state.instrument);
  if (!svg) return;

  els.chordPopupContent.innerHTML = '';
  els.chordPopupContent.appendChild(svg);

  const popup = els.chordPopup;
  popup.style.display = 'block';

  // posicionar cerca del cursor
  const rect = event.target.getBoundingClientRect();
  let x = rect.left;
  let y = rect.bottom + 4;

  // ajustar si sale de la pantalla
  const pw = 120;
  const ph = 140;
  if (x + pw > window.innerWidth) x = window.innerWidth - pw - 8;
  if (y + ph > window.innerHeight) y = rect.top - ph - 4;

  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
}

function hideChordPopup() {
  els.chordPopup.style.display = 'none';
}

// === CONTROLES ===

function initControls() {
  // instrumento
  els.instrumentPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-instrument]');
    if (!btn) return;

    state.instrument = btn.dataset.instrument;
    els.instrumentPicker.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSongView();
  });

  // transposición
  $('#transposeDown').addEventListener('click', () => {
    state.transpose = Math.max(state.transpose - 1, -6);
    renderSongView();
  });
  $('#transposeUp').addEventListener('click', () => {
    state.transpose = Math.min(state.transpose + 1, 6);
    renderSongView();
  });

  // capo
  $('#capoDown').addEventListener('click', () => {
    state.capo = Math.max(state.capo - 1, 0);
    renderSongView();
  });
  $('#capoUp').addEventListener('click', () => {
    state.capo = Math.min(state.capo + 1, 9);
    renderSongView();
  });

  // readings (romaji/pinyin)
  els.readingsToggle.addEventListener('click', () => {
    state.showReadings = !state.showReadings;
    renderSongView();
  });

  // auto-scroll
  els.scrollToggle.addEventListener('click', () => {
    state.autoScroll = !state.autoScroll;
    els.scrollToggle.textContent = state.autoScroll ? 'on' : 'off';
    els.scrollToggle.classList.toggle('active', state.autoScroll);
    els.scrollSlower.style.display = state.autoScroll ? '' : 'none';
    els.scrollSpeed.style.display = state.autoScroll ? '' : 'none';
    els.scrollFaster.style.display = state.autoScroll ? '' : 'none';

    if (state.autoScroll) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  });

  els.scrollSlower.addEventListener('click', () => {
    state.scrollSpeed = Math.max(1, state.scrollSpeed - 1);
    els.scrollSpeed.textContent = state.scrollSpeed;
    if (state.autoScroll) { stopAutoScroll(); startAutoScroll(); }
  });

  els.scrollFaster.addEventListener('click', () => {
    state.scrollSpeed = Math.min(10, state.scrollSpeed + 1);
    els.scrollSpeed.textContent = state.scrollSpeed;
    if (state.autoScroll) { stopAutoScroll(); startAutoScroll(); }
  });
}

function startAutoScroll() {
  stopAutoScroll();
  const pxPerInterval = state.scrollSpeed * 0.5;
  state.scrollInterval = setInterval(() => {
    window.scrollBy(0, pxPerInterval);
  }, 50);
}

function stopAutoScroll() {
  if (state.scrollInterval) {
    clearInterval(state.scrollInterval);
    state.scrollInterval = null;
  }
}

// === TEMA ===

function initTheme() {
  els.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('meowrhino-theme', next);
  });
}

// === EDITOR ===

function initEditor() {
  let previewTimer = null;

  els.edContent.addEventListener('input', () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updateEditorPreview, 300);
  });

  els.edSave.addEventListener('click', saveFromEditor);
  els.edDownload.addEventListener('click', downloadFromEditor);
  els.edDelete.addEventListener('click', deleteFromEditor);

  // importar archivo .cho
  const importBtn = $('#importBtn');
  const importInput = $('#importInput');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const parsed = parseChordPro(text);
        els.edTitle.value = parsed.meta.title || '';
        els.edArtist.value = parsed.meta.artist || '';
        els.edKey.value = parsed.meta.key || '';
        els.edCapo.value = parsed.meta.capo || '';
        els.edLang.value = parsed.meta.lang || '';
        els.edContent.value = stripMeta(text);
        updateEditorPreview();
      };
      reader.readAsText(file);
      importInput.value = '';
    });
  }

  // insertar snippets
  for (const btn of $$('.ed-insert')) {
    btn.addEventListener('click', () => {
      const snippet = btn.dataset.insert;
      const ta = els.edContent;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = ta.value.slice(0, start);
      const after = ta.value.slice(end);
      ta.value = before + snippet + after;
      ta.selectionStart = ta.selectionEnd = start + snippet.length;
      ta.focus();
      updateEditorPreview();
    });
  }
}

function stripMeta(text) {
  // quitar líneas de metadatos del contenido ChordPro
  return text.split('\n').filter(line => {
    const trimmed = line.trim();
    return !(
      trimmed.startsWith('{title:') ||
      trimmed.startsWith('{artist:') ||
      trimmed.startsWith('{key:') ||
      trimmed.startsWith('{capo:') ||
      trimmed.startsWith('{lang:')
    );
  }).join('\n').replace(/^\n+/, '');
}

function buildChoText() {
  let cho = '';
  if (els.edTitle.value) cho += `{title: ${els.edTitle.value}}\n`;
  if (els.edArtist.value) cho += `{artist: ${els.edArtist.value}}\n`;
  if (els.edKey.value) cho += `{key: ${els.edKey.value}}\n`;
  if (els.edCapo.value) cho += `{capo: ${els.edCapo.value}}\n`;
  if (els.edLang.value) cho += `{lang: ${els.edLang.value}}\n`;
  cho += '\n' + els.edContent.value;
  return cho;
}

function updateEditorPreview() {
  try {
    const cho = buildChoText();
    const parsed = parseChordPro(cho);
    els.edPreview.innerHTML = renderSong(parsed, { showChords: true, showReadings: false });
  } catch {
    els.edPreview.innerHTML = '<div class="no-results">error de sintaxis</div>';
  }
}

function generateSlug(title, artist) {
  const raw = `${artist}-${title}`.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return raw || 'sin-titulo';
}

function saveFromEditor() {
  const title = els.edTitle.value.trim();
  if (!title) { alert('escribe un título'); return; }
  const cho = buildChoText();
  const slug = state.editingSlug || generateSlug(title, els.edArtist.value);
  profile.saveCustomSong(slug, cho, {
    title,
    artist: els.edArtist.value.trim(),
    key: els.edKey.value.trim(),
    lang: els.edLang.value.trim(),
  });
  state.editingSlug = slug;
  els.edDelete.style.display = '';
  location.hash = `#/song/${slug}`;
}

function downloadFromEditor() {
  const cho = buildChoText();
  const title = els.edTitle.value.trim() || 'cancion';
  const slug = generateSlug(title, els.edArtist.value);
  const blob = new Blob([cho], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.cho`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function deleteFromEditor() {
  if (!state.editingSlug) return;
  if (!confirm('¿eliminar esta tablatura?')) return;
  profile.deleteCustomSong(state.editingSlug);
  location.hash = '#/';
}

function loadEditor(slug) {
  state.editingSlug = slug || null;

  if (slug) {
    const custom = profile.customSongs();
    if (custom[slug]) {
      const parsed = parseChordPro(custom[slug]);
      els.edTitle.value = parsed.meta.title || '';
      els.edArtist.value = parsed.meta.artist || '';
      els.edKey.value = parsed.meta.key || '';
      els.edCapo.value = parsed.meta.capo || '';
      els.edLang.value = parsed.meta.lang || '';
      els.edContent.value = stripMeta(custom[slug]);
      els.edDelete.style.display = '';
    }
  } else {
    els.edTitle.value = '';
    els.edArtist.value = '';
    els.edKey.value = '';
    els.edCapo.value = '';
    els.edLang.value = '';
    els.edContent.value = '{start_of_verse}\n[Am]escribe tu [C]canción aquí\n{end_of_verse}\n';
    els.edDelete.style.display = 'none';
  }
  updateEditorPreview();
}

// === PERFIL UI ===

function initProfileUI() {
  const prof = profile.load();
  els.profileName.value = prof.name || '';
  els.profileInstrument.value = prof.instrument || 'guitar';

  els.profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    els.profileDropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
      els.profileDropdown.classList.remove('open');
    }
  });

  els.profileName.addEventListener('change', () => {
    const prof = profile.load();
    prof.name = els.profileName.value.trim();
    profile.save(prof);
  });

  els.profileInstrument.addEventListener('change', () => {
    const prof = profile.load();
    prof.instrument = els.profileInstrument.value;
    profile.save(prof);
  });

  // favorito
  els.favoriteBtn.addEventListener('click', () => {
    if (!state.currentSong) return;
    const isFav = profile.toggleFavorite(state.currentSong);
    els.favoriteBtn.textContent = isFav ? '♥' : '♡';
    els.favoriteBtn.classList.toggle('active', isFav);
    els.favoriteBtn.title = isFav ? 'quitar de favoritos' : 'añadir a favoritos';
  });

  // editar canción custom
  els.editBtn.addEventListener('click', () => {
    if (state.currentSong && state.isCustomSong) {
      location.hash = `#/editor/${state.currentSong}`;
    }
  });
}

// === ROUTER ===

function route() {
  const hash = location.hash || '#/';
  stopAutoScroll();
  state.autoScroll = false;
  hideChordPopup();

  // ocultar todas las vistas
  els.catalogView.style.display = 'none';
  els.songView.style.display = 'none';
  els.editorView.style.display = 'none';

  if (hash.startsWith('#/editor')) {
    const slug = hash.length > 9 ? hash.slice(9) : null;
    els.editorView.style.display = '';
    els.editorView.style.animation = 'none';
    els.editorView.offsetHeight;
    els.editorView.style.animation = '';
    loadEditor(slug ? decodeURIComponent(slug) : null);
  } else if (hash.startsWith('#/song/')) {
    const slug = hash.slice(7);
    els.songView.style.display = '';
    els.songView.style.animation = 'none';
    els.songView.offsetHeight;
    els.songView.style.animation = '';
    loadSong(decodeURIComponent(slug));
  } else {
    els.catalogView.style.display = '';
    els.catalogView.style.animation = 'none';
    els.catalogView.offsetHeight;
    els.catalogView.style.animation = '';
    renderCatalog(els.searchInput.value);
  }
}

// === INIT ===

async function init() {
  await loadCatalog();
  initControls();
  initTheme();
  initEditor();
  initProfileUI();

  els.searchInput.addEventListener('input', () => {
    renderCatalog(els.searchInput.value);
  });

  // cerrar popup al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.chord-name, .chord-inline, .chord-popup')) {
      hideChordPopup();
    }
  });

  window.addEventListener('hashchange', route);
  route();
}

function esc(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();

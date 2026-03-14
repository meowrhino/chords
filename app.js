// app.js — router, estado y UI principal

import { parseChordPro, hasCJKReadings, getReadingType } from './engine/chordpro.js';
import { renderSong } from './engine/ruby-render.js';
import { transposeSong, normalizeChordName } from './engine/transpose.js';
import { chordDiagram } from './engine/chord-svg.js';
import { lookupChord } from './engine/chords-db.js';

const API_BASE = 'https://chords-api.meowrhino.workers.dev';

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
  followArtistBtn: $('#followArtistBtn'),
  followSongBtn: $('#followSongBtn'),
  feedView: $('#feedView'),
  feedList: $('#feedList'),
  feedLink: $('#feedLink'),
  artistView: $('#artistView'),
  artistName: $('#artistName'),
  artistMeta: $('#artistMeta'),
  artistBio: $('#artistBio'),
  artistSongs: $('#artistSongs'),
  followArtistProfileBtn: $('#followArtistProfileBtn'),
  chordPanel: $('#chordPanel'),
  chordPanelToggle: $('#chordPanelToggle'),
  chordPanelClose: $('#chordPanelClose'),
  chordPanelContent: $('#chordPanelContent'),
  commentsSection: $('#commentsSection'),
  commentForm: $('#commentForm'),
  commentUsername: $('#commentUsername'),
  commentContent: $('#commentContent'),
  commentSubmit: $('#commentSubmit'),
  commentsList: $('#commentsList'),
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
    html += `<a href="#/artist/${encodeURIComponent(artist)}" class="artist-name artist-link">${esc(artist)}</a>`;
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
  if (song.meta.artist) metaParts.push(`<a href="#/artist/${encodeURIComponent(song.meta.artist)}" class="artist-link">${esc(song.meta.artist)}</a>`);
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

function renderChordPanel(song) {
  els.chordPanelContent.innerHTML = '';
  for (const chordName of song.allChords) {
    const normalized = normalizeChordName(chordName);
    const data = lookupChord(normalized, state.instrument);
    if (!data) continue;
    const card = document.createElement('div');
    card.className = 'chord-diagram-card';
    const svg = chordDiagram(chordName, data, state.instrument);
    if (svg) card.appendChild(svg);
    els.chordPanelContent.appendChild(card);
  }
}

function toggleChordPanel() {
  const open = els.chordPanel.style.display !== 'none';
  els.chordPanel.style.display = open ? 'none' : '';
  els.chordPanelToggle.classList.toggle('active', !open);
  els.chordPanelToggle.textContent = open ? 'fijar' : 'ocultar';
  if (!open && state.parsedSong) {
    const song = state.transpose !== 0
      ? transposeSong(state.parsedSong, state.transpose)
      : state.parsedSong;
    renderChordPanel(song);
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

// === FOLLOWS + FEED ===

function getUsername() {
  return profile.load().name || '';
}

async function followTarget(targetType, target) {
  const username = getUsername();
  if (!username) { alert('configura tu nombre en el perfil primero'); return; }
  await fetch(`${API_BASE}/api/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, target_type: targetType, target }),
  });
}

async function unfollowTarget(targetType, target) {
  const username = getUsername();
  if (!username) return;
  await fetch(`${API_BASE}/api/follow`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, target_type: targetType, target }),
  });
}

function saveFollowing(list) {
  localStorage.setItem('chords-following', JSON.stringify(list));
}

function isFollowing(targetType, target) {
  const following = JSON.parse(localStorage.getItem('chords-following') || '[]');
  return following.some(f => f.target_type === targetType && f.target === target);
}

async function toggleFollow(targetType, target, btn) {
  const following = isFollowing(targetType, target);
  const list = JSON.parse(localStorage.getItem('chords-following') || '[]');

  if (following) {
    await unfollowTarget(targetType, target);
    const updated = list.filter(f => !(f.target_type === targetType && f.target === target));
    saveFollowing(updated);
    btn.textContent = targetType === 'artist' ? 'seguir artista' : 'seguir canción';
    btn.classList.remove('following');
  } else {
    await followTarget(targetType, target);
    list.push({ target_type: targetType, target });
    saveFollowing(list);
    btn.textContent = targetType === 'artist' ? 'siguiendo artista' : 'siguiendo canción';
    btn.classList.add('following');
  }
}

function updateFollowButtons(song) {
  const username = getUsername();
  const artist = song.meta.artist;
  const slug = state.currentSong;

  if (!username) {
    els.followArtistBtn.style.display = 'none';
    els.followSongBtn.style.display = 'none';
    return;
  }

  if (artist) {
    els.followArtistBtn.style.display = '';
    const followingArtist = isFollowing('artist', artist);
    els.followArtistBtn.textContent = followingArtist ? 'siguiendo artista' : 'seguir artista';
    els.followArtistBtn.classList.toggle('following', followingArtist);
  } else {
    els.followArtistBtn.style.display = 'none';
  }

  els.followSongBtn.style.display = '';
  const followingSong = isFollowing('song', slug);
  els.followSongBtn.textContent = followingSong ? 'siguiendo canción' : 'seguir canción';
  els.followSongBtn.classList.toggle('following', followingSong);
}

async function loadFeed() {
  const username = getUsername();
  if (!username) {
    els.feedList.innerHTML = '<div class="no-results">configura tu nombre en el perfil para ver tu feed</div>';
    return;
  }

  els.feedList.innerHTML = '<div class="no-results">cargando...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/feed?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const feed = data.feed || [];

    if (feed.length === 0) {
      els.feedList.innerHTML = '<div class="no-results">sin novedades — sigue artistas o canciones para ver actividad aquí</div>';
      return;
    }

    let html = '';
    for (const item of feed) {
      const date = new Date(item.created_at).toLocaleDateString('es');
      html += `<div class="feed-item">`;
      if (item.type === 'song') {
        html += `<span class="feed-type">nueva canción</span>`;
        html += `<a href="#/song/${esc(item.id)}" class="feed-title">${esc(item.title)}</a>`;
        html += `<span class="feed-artist">${esc(item.artist)}</span>`;
      } else {
        html += `<span class="feed-type">comentario</span>`;
        html += `<a href="#/song/${esc(item.id)}" class="feed-title">${esc(item.id.replace(/-/g, ' '))}</a>`;
        html += `<span class="feed-artist">${esc(item.artist)}: "${esc(item.title.slice(0, 60))}"</span>`;
      }
      html += `<span class="feed-date">${esc(date)}</span>`;
      html += `</div>`;
    }
    els.feedList.innerHTML = html;
  } catch {
    els.feedList.innerHTML = '<div class="no-results">error cargando feed</div>';
  }
}

// === ARTISTA ===

async function loadArtistProfile(artistName) {
  els.artistName.textContent = artistName;
  els.artistBio.textContent = '';
  els.artistMeta.innerHTML = '';

  // Try to load from API
  let user = null;
  try {
    const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(artistName)}`);
    if (res.ok) {
      const data = await res.json();
      user = data.user;
    }
  } catch {}

  if (user) {
    const meta = [];
    if (user.instrument) meta.push(`<span>${esc(user.instrument)}</span>`);
    if (user.is_artist) meta.push(`<span class="badge-verified">artista verificado</span>`);
    els.artistMeta.innerHTML = meta.join('');
    if (user.bio) els.artistBio.textContent = user.bio;
  }

  // Follow button
  const username = getUsername();
  if (username) {
    els.followArtistProfileBtn.style.display = '';
    const following = isFollowing('artist', artistName);
    els.followArtistProfileBtn.textContent = following ? 'siguiendo' : 'seguir';
    els.followArtistProfileBtn.classList.toggle('following', following);
    els.followArtistProfileBtn.onclick = () => toggleFollow('artist', artistName, els.followArtistProfileBtn);
  } else {
    els.followArtistProfileBtn.style.display = 'none';
  }

  // Songs by this artist from catalog
  const all = getMergedCatalog();
  const songs = all.filter(s => s.artist.toLowerCase() === artistName.toLowerCase());

  if (songs.length === 0) {
    els.artistSongs.innerHTML = '<div class="no-results">sin canciones</div>';
  } else {
    let html = `<div class="catalog-section-label">canciones (${songs.length})</div>`;
    for (const song of songs) {
      html += songEntryHTML(song);
    }
    els.artistSongs.innerHTML = html;
    // bind clicks
    for (const entry of els.artistSongs.querySelectorAll('.song-entry')) {
      entry.addEventListener('click', () => {
        const file = entry.dataset.file;
        location.hash = `#/song/${file.replace('.cho', '')}`;
      });
    }
  }
}

// === COMENTARIOS ===

async function loadComments(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(slug)}/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

async function loadReplies(commentId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/replies`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.replies || [];
  } catch {
    return [];
  }
}

async function postComment(slug, username, content, parentId) {
  const body = { username, content };
  if (parentId) body.parent_id = parentId;
  const res = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'error al comentar');
  }
}

async function reportComment(commentId) {
  try {
    await fetch(`${API_BASE}/api/comments/${commentId}/report`, { method: 'POST' });
  } catch { /* silently fail on network error */ }
}

function renderComments(comments) {
  if (comments.length === 0) {
    els.commentsList.innerHTML = '<div class="no-comments">sin comentarios aún</div>';
    return;
  }

  let html = '';
  for (const c of comments) {
    html += renderCommentHTML(c);
  }
  els.commentsList.innerHTML = html;
  bindCommentActions();
}

function renderCommentHTML(c) {
  const date = new Date(c.created_at).toLocaleDateString('es');
  let html = `<div class="comment" data-id="${c.id}">`;
  html += `<div class="comment-header">`;
  html += `<span class="comment-author">${esc(c.username)}</span>`;
  if (c.tripcode) html += `<span class="comment-tripcode">!${esc(c.tripcode)}</span>`;
  html += `<span class="comment-date">${esc(date)}</span>`;
  html += `</div>`;
  html += `<div class="comment-body">${esc(c.content)}</div>`;
  html += `<div class="comment-actions">`;
  if (c.reply_count > 0) {
    html += `<button class="comment-action" data-action="replies" data-id="${c.id}">respuestas (${c.reply_count})</button>`;
  }
  html += `<button class="comment-action" data-action="reply" data-id="${c.id}">responder</button>`;
  html += `<button class="comment-action" data-action="report" data-id="${c.id}">reportar</button>`;
  html += `</div>`;
  html += `<div class="comment-replies" id="replies-${c.id}"></div>`;
  html += `</div>`;
  return html;
}

function renderReplyHTML(c) {
  const date = new Date(c.created_at).toLocaleDateString('es');
  let html = `<div class="comment" data-id="${c.id}">`;
  html += `<div class="comment-header">`;
  html += `<span class="comment-author">${esc(c.username)}</span>`;
  if (c.tripcode) html += `<span class="comment-tripcode">!${esc(c.tripcode)}</span>`;
  html += `<span class="comment-date">${esc(date)}</span>`;
  html += `</div>`;
  html += `<div class="comment-body">${esc(c.content)}</div>`;
  html += `<div class="comment-actions">`;
  html += `<button class="comment-action" data-action="report" data-id="${c.id}">reportar</button>`;
  html += `</div>`;
  html += `</div>`;
  return html;
}

function bindCommentActions() {
  for (const btn of els.commentsList.querySelectorAll('.comment-action')) {
    btn.addEventListener('click', async (e) => {
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);

      if (action === 'replies') {
        const repliesEl = $(`#replies-${id}`);
        if (repliesEl.children.length > 0) {
          repliesEl.innerHTML = '';
          return;
        }
        const replies = await loadReplies(id);
        repliesEl.innerHTML = replies.map(renderReplyHTML).join('');
      } else if (action === 'reply') {
        const repliesEl = $(`#replies-${id}`);
        if (repliesEl.querySelector('.reply-form')) return;
        const savedName = profile.load().name || '';
        repliesEl.insertAdjacentHTML('beforeend', `
          <div class="reply-form">
            <input type="text" class="comment-input reply-username" placeholder="nombre#secreto" value="${esc(savedName)}" autocomplete="off">
            <textarea class="comment-textarea reply-content" placeholder="responder..." maxlength="1000"></textarea>
            <button class="control-btn comment-submit reply-submit">enviar</button>
          </div>
        `);
        const form = repliesEl.querySelector('.reply-form');
        const submitBtn = form.querySelector('.reply-submit');
        submitBtn.addEventListener('click', async () => {
          const username = form.querySelector('.reply-username').value.trim();
          const content = form.querySelector('.reply-content').value.trim();
          if (!username || !content) return;
          submitBtn.disabled = true;
          try {
            await postComment(state.currentSong, username, content, id);
            form.remove();
            const replies = await loadReplies(id);
            repliesEl.innerHTML = replies.map(renderReplyHTML).join('');
            const countBtn = btn.closest('.comment').querySelector('[data-action="replies"]');
            if (countBtn) countBtn.textContent = `respuestas (${replies.length})`;
          } catch (err) {
            alert(err.message);
            submitBtn.disabled = false;
          }
        });
      } else if (action === 'report') {
        if (!confirm('¿reportar este comentario?')) return;
        await reportComment(id);
        btn.textContent = 'reportado';
        btn.disabled = true;
      }
    });
  }
}

async function initComments(slug) {
  els.commentsSection.style.display = '';
  const savedName = profile.load().name || '';
  if (savedName) els.commentUsername.value = savedName;

  const comments = await loadComments(slug);
  renderComments(comments);
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

  // chord panel toggle
  els.chordPanelToggle.addEventListener('click', toggleChordPanel);
  els.chordPanelClose.addEventListener('click', toggleChordPanel);
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
  els.chordPanel.style.display = 'none';
  els.chordPanelToggle.classList.remove('active');
  els.chordPanelToggle.textContent = 'fijar';

  // ocultar todas las vistas
  els.catalogView.style.display = 'none';
  els.songView.style.display = 'none';
  els.editorView.style.display = 'none';
  els.feedView.style.display = 'none';
  els.artistView.style.display = 'none';

  if (hash.startsWith('#/artist/')) {
    const name = decodeURIComponent(hash.slice(9));
    els.artistView.style.display = '';
    els.artistView.style.animation = 'none';
    els.artistView.offsetHeight;
    els.artistView.style.animation = '';
    loadArtistProfile(name);
  } else if (hash === '#/feed') {
    els.feedView.style.display = '';
    els.feedView.style.animation = 'none';
    els.feedView.offsetHeight;
    els.feedView.style.animation = '';
    loadFeed();
  } else if (hash.startsWith('#/editor')) {
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

  // follow buttons
  els.followArtistBtn.addEventListener('click', () => {
    if (!state.parsedSong?.meta?.artist) return;
    toggleFollow('artist', state.parsedSong.meta.artist, els.followArtistBtn);
  });
  els.followSongBtn.addEventListener('click', () => {
    if (!state.currentSong) return;
    toggleFollow('song', state.currentSong, els.followSongBtn);
  });

  // comment submit
  els.commentSubmit.addEventListener('click', async () => {
    const username = els.commentUsername.value.trim();
    const content = els.commentContent.value.trim();
    if (!username || !content) return;
    if (!state.currentSong) return;
    els.commentSubmit.disabled = true;
    try {
      await postComment(state.currentSong, username, content);
      els.commentContent.value = '';
      const comments = await loadComments(state.currentSong);
      renderComments(comments);
    } catch (err) {
      alert(err.message);
    } finally {
      els.commentSubmit.disabled = false;
    }
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

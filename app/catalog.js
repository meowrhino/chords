// catalog.js — la lista de canciones: carga, filtro, favoritos.

import { API_BASE, profile, state } from './state.js';
import { $, els, esc } from './dom.js';

// === CATÁLOGO ===

export async function loadCatalog() {
  try {
    const res = await fetch('songs/index.json');
    state.catalog = await res.json();
  } catch (e) {
    state.catalog = [];
    console.warn('no se pudo cargar el catálogo:', e);
  }

  // canciones publicadas por cualquier visitante en la base de datos pública,
  // que no vinieron ya incluidas en el repo estático
  try {
    const dbRes = await fetch(`${API_BASE}/api/songs?limit=200`);
    if (dbRes.ok) {
      const { songs } = await dbRes.json();
      const staticSlugs = new Set(state.catalog.map(s => s.file.replace(/\.cho$/, '')));
      const dbEntries = (songs || [])
        .filter(s => !s.parent_slug && !staticSlugs.has(s.slug))
        .map(s => ({
          file: `${s.slug}.cho`,
          title: s.title,
          artist: s.artist,
          key: s.key_signature || '',
          lang: s.lang || '',
        }));
      state.catalog = [...state.catalog, ...dbEntries];
    }
  } catch (e) {
    console.warn('no se pudo cargar el catálogo de la base de datos:', e);
  }

  profile.seedFavorites(state.catalog);
}

export function getMergedCatalog() {
  const custom = profile.customIndex();
  return [...state.catalog, ...custom];
}

export function renderCatalog(filter = '') {
  const f = filter.toLowerCase();
  const all = getMergedCatalog();
  // También busca en s.file: los .cho japoneses llevan el título en romaji en el
  // nombre, así que "owaranai" encuentra 終わらない世界で aunque no sepas escribirlo.
  const filtered = all.filter(s =>
    !f || s.title.toLowerCase().includes(f) || s.artist.toLowerCase().includes(f) ||
    s.file.toLowerCase().includes(f)
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

export function renderSongSection(label, songs) {
  let html = `<div class="catalog-section-label">${esc(label)}</div>`;
  for (const song of songs) {
    html += songEntryHTML(song);
  }
  return html;
}

export function setFavoriteBtn(isFav) {
  els.favoriteBtn.textContent = isFav ? '★' : '☆';
  els.favoriteBtn.classList.toggle('active', isFav);
  els.favoriteBtn.title = isFav ? 'quitar de favoritos' : 'añadir a favoritos';
}

export function songEntryHTML(song) {
  const isFav = profile.isFavorite(song.file.replace(/\.cho$/, ''));
  let html = `<div class="song-entry" data-file="${esc(song.file)}"${song.custom ? ' data-custom="1"' : ''}>`;
  html += `<span class="song-entry-title">`;
  if (isFav) html += `<span class="star-fav" title="favorita">★</span> `;
  html += esc(song.title);
  if (song.custom) html += ` <span class="badge-custom">(tuya)</span>`;
  html += `</span>`;
  if (song.key) html += `<span class="song-entry-key">${esc(song.key)}</span>`;
  if (song.lang) html += `<span class="song-entry-lang">${esc(song.lang)}</span>`;
  html += `</div>`;
  return html;
}

export function bindSongEntries() {
  for (const entry of els.songList.querySelectorAll('.song-entry')) {
    entry.addEventListener('click', () => {
      const file = entry.dataset.file;
      location.hash = `#/song/${file.replace('.cho', '')}`;
    });
  }
}

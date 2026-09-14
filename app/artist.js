// artist.js — la ficha de un artista.

import { API_BASE } from './state.js';
import { els, esc } from './dom.js';
import { getMergedCatalog, songEntryHTML } from './catalog.js';
import { getUsername, isFollowing, toggleFollow } from './social.js';

// === ARTISTA ===

export async function loadArtistProfile(artistName) {
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

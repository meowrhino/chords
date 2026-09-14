// social.js — identidad, seguir artistas y canciones, y el feed.

import { API_BASE, profile, state } from './state.js';
import { els, esc } from './dom.js';

// === FOLLOWS + FEED ===

export function getUsername() {
  return profile.load().name || '';
}

export async function followTarget(targetType, target) {
  const username = getUsername();
  if (!username) { alert('configura tu nombre en el perfil primero'); return; }
  await fetch(`${API_BASE}/api/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, target_type: targetType, target }),
  });
}

export async function unfollowTarget(targetType, target) {
  const username = getUsername();
  if (!username) return;
  await fetch(`${API_BASE}/api/follow`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, target_type: targetType, target }),
  });
}

export function saveFollowing(list) {
  localStorage.setItem('chords-following', JSON.stringify(list));
}

export function isFollowing(targetType, target) {
  const following = JSON.parse(localStorage.getItem('chords-following') || '[]');
  return following.some(f => f.target_type === targetType && f.target === target);
}

export async function toggleFollow(targetType, target, btn) {
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

export function updateFollowButtons(song) {
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

export async function loadFeed() {
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

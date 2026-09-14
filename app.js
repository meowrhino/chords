// app.js — arranque: el router y el cableado inicial.
//
// Lo demás vive en app/: cada vista y cada trozo de estado en su módulo. El
// orden de imports va de la hoja (state, dom) hacia arriba, que es también el
// orden de dependencias — ningún módulo de app/ importa a este.

import { state } from './app/state.js';
import { els } from './app/dom.js';
import { loadCatalog, renderCatalog } from './app/catalog.js';
import { loadSong, hideChordPopup, setChordsPinned } from './app/song.js';
import { loadFeed, toggleFollow } from './app/social.js';
import { loadArtistProfile } from './app/artist.js';
import { loadComments, postComment, renderComments } from './app/comments.js';
import { initControls, stopAutoScroll } from './app/controls.js';
import { initTheme } from './app/theme.js';
import { initEditor, loadEditor } from './app/editor.js';
import { initProfileUI } from './app/profile-ui.js';
import { initRecorder, loadDiary, cancelRecordingIfAny } from './app/recordings.js';
import { openInventory } from './app/inventory.js';
import { openTuner, closeTuner } from './app/tuner-view.js';

// === ROUTER ===

function route() {
  const hash = location.hash || '#/';
  stopAutoScroll();
  state.autoScroll = false;
  hideChordPopup();
  setChordsPinned(false);

  // ocultar todas las vistas
  els.catalogView.style.display = 'none';
  els.songView.style.display = 'none';
  els.editorView.style.display = 'none';
  els.feedView.style.display = 'none';
  els.artistView.style.display = 'none';
  els.tunerView.style.display = 'none';
  els.inventoryView.style.display = 'none';
  els.diaryView.style.display = 'none';
  if (hash !== '#/afinador') closeTuner();
  cancelRecordingIfAny();

  if (hash === '#/diario') {
    els.diaryView.style.display = '';
    els.diaryView.style.animation = 'none';
    els.diaryView.offsetHeight;
    els.diaryView.style.animation = '';
    loadDiary();
  } else if (hash === '#/inventario') {
    els.inventoryView.style.display = '';
    els.inventoryView.style.animation = 'none';
    els.inventoryView.offsetHeight;
    els.inventoryView.style.animation = '';
    openInventory();
  } else if (hash === '#/afinador') {
    els.tunerView.style.display = '';
    els.tunerView.style.animation = 'none';
    els.tunerView.offsetHeight;
    els.tunerView.style.animation = '';
    openTuner();
  } else if (hash.startsWith('#/artist/')) {
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
  initRecorder();

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

init();

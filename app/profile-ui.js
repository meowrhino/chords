// profile-ui.js — el desplegable de perfil de la cabecera.

import { profile, state } from './state.js';
import { els } from './dom.js';
import { setFavoriteBtn } from './catalog.js';

// === PERFIL UI ===

export function initProfileUI() {
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
    setFavoriteBtn(profile.toggleFavorite(state.currentSong));
  });

  // editar canción custom
  els.editBtn.addEventListener('click', () => {
    if (state.currentSong && state.isCustomSong) {
      location.hash = `#/editor/${state.currentSong}`;
    }
  });
}

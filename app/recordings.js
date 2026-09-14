// recordings.js — grabar tomas cantando, listarlas y el diario.

import { state } from './state.js';
import { els, esc } from './dom.js';
import { getMergedCatalog } from './catalog.js';
import { getUsername } from './social.js';
import { createRecorder, isSupported as canRecord, uploadRecording } from '../engine/recorder.js';

// === GRABACIONES ===

let recorder = null;

export function fmtTime(seconds) {
  const s = Math.floor(seconds || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

// El título de la canción casi nunca viene del servidor: las canciones viven
// en songs/*.cho y solo llegan a la tabla chords_songs las que alguien sube por
// la web, así que el LEFT JOIN devuelve null para la mayoría. El catálogo ya
// está cargado en memoria, así que se resuelve aquí.
export function songTitleFor(slug) {
  if (!slug) return null;
  const hit = getMergedCatalog().find(s => s.file.replace(/\.cho$/, '') === slug);
  return hit ? hit.title : slug;
}

export function recordingCardHTML(rec, { showSong = false } = {}) {
  const when = (rec.created_at || '').replace('T', ' ').slice(0, 16);
  const parts = [when];
  if (rec.seconds) parts.push(fmtTime(rec.seconds));
  parts.push(fmtSize(rec.bytes));

  const title = rec.song_title || songTitleFor(rec.song_slug);
  const song = showSong && rec.song_slug
    ? `<a class="rec-song" href="#/song/${esc(rec.song_slug)}">${esc(title)}</a>`
    : (showSong ? '<span class="rec-who">toma suelta</span>' : '');

  return `<div class="rec-item" data-id="${rec.id}">
      <div class="rec-item-top">
        ${song || `<span class="rec-who">${esc(rec.username)}</span>`}
        <span class="rec-meta">${esc(parts.join(' · '))}</span>
        <button class="rec-del" data-id="${rec.id}" title="borrar">&times;</button>
      </div>
      ${rec.note ? `<div class="rec-item-note">${esc(rec.note)}</div>` : ''}
      <audio controls preload="none" src="/api/recordings/${rec.id}/audio"></audio>
    </div>`;
}

export function bindRecordingDeletes(container, onDone) {
  for (const btn of container.querySelectorAll('.rec-del')) {
    btn.addEventListener('click', async () => {
      const username = getUsername();
      if (!username.includes('#')) {
        alert('para borrar tus tomas tienes que poner "nombre#secreto" en el perfil');
        return;
      }
      if (!confirm('¿borrar esta grabación? no se puede deshacer')) return;
      const res = await fetch(
        `/api/recordings/${btn.dataset.id}?username=${encodeURIComponent(username)}`,
        { method: 'DELETE' },
      );
      if (res.ok) onDone();
      else alert('no se ha podido borrar: no es tuya o no coincide el secreto');
    });
  }
}

export async function loadSongRecordings(slug) {
  try {
    const res = await fetch(`/api/songs/${encodeURIComponent(slug)}/recordings`);
    const data = await res.json();
    const list = data.recordings || [];
    els.recList.innerHTML = list.map(r => recordingCardHTML(r)).join('');
    bindRecordingDeletes(els.recList, () => loadSongRecordings(slug));
  } catch {
    els.recList.innerHTML = '';
  }
}

export function setRecStatus(text) {
  els.recStatus.textContent = text || '';
}

export function initRecorder() {
  if (!canRecord()) {
    els.recSection.style.display = 'none';
    return;
  }

  recorder = createRecorder(({ recording, seconds }) => {
    els.recTime.textContent = recording ? fmtTime(seconds) : '';
    els.recBtn.classList.toggle('recording', recording);
    els.recBtnText.textContent = recording ? 'parar' : 'grabar';
  });

  els.recBtn.addEventListener('click', async () => {
    const username = getUsername();
    if (!username) {
      setRecStatus('ponte un nombre en el perfil para guardar tomas');
      return;
    }

    if (!recorder.isRecording()) {
      try {
        setRecStatus('');
        await recorder.start();
      } catch (err) {
        setRecStatus(err.name === 'NotAllowedError'
          ? 'no has dado permiso de micrófono'
          : 'no se ha podido abrir el micrófono');
      }
      return;
    }

    setRecStatus('guardando...');
    try {
      const take = await recorder.stop();
      await uploadRecording({
        ...take,
        username,
        slug: state.currentSong,
        note: els.recNote.value.trim(),
      });
      els.recNote.value = '';
      setRecStatus('');
      loadSongRecordings(state.currentSong);
    } catch (err) {
      setRecStatus(err.message || 'no se ha podido guardar');
    }
  });
}

export async function loadDiary() {
  const username = getUsername();
  if (!username) {
    els.diaryMeta.textContent = '';
    els.diaryList.innerHTML = '<div class="no-results">ponte un nombre en el perfil para tener diario</div>';
    return;
  }
  // El nombre a secas: el secreto es para escribir y borrar, no para listar.
  const name = username.split('#')[0];
  els.diaryMeta.textContent = name;
  els.diaryList.innerHTML = '<div class="no-results">cargando...</div>';
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(name)}/recordings`);
    const data = await res.json();
    const list = data.recordings || [];
    els.diaryList.innerHTML = list.length
      ? list.map(r => recordingCardHTML(r, { showSong: true })).join('')
      : '<div class="no-results">aún no has grabado nada</div>';
    bindRecordingDeletes(els.diaryList, loadDiary);
  } catch {
    els.diaryList.innerHTML = '<div class="no-results">error cargando el diario</div>';
  }
}

/** Corta una grabación a medias (al cambiar de vista). Se tira la toma: si te
 *  vas de la canción mientras grabas, no hay dónde guardarla. */
export function cancelRecordingIfAny() {
  if (recorder && recorder.isRecording()) recorder.cancel();
}

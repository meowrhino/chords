// controls.js — la barra de controles de la canción y el auto-scroll.

import { state } from './state.js';
import { $, els } from './dom.js';
import { renderSongView, syncPinnedTop, toggleChordPanel } from './song.js';
import { renderInventory } from './inventory.js';
import { setTunerInstrument } from './tuner-view.js';

// === CONTROLES ===

export function initControls() {
  // instrumento
  els.instrumentPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-instrument]');
    if (!btn) return;

    state.instrument = btn.dataset.instrument;
    els.instrumentPicker.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSongView();
  });

  // instrumento del afinador: el mismo state, así que cambiarlo aquí también
  // cambia los diagramas de las canciones. Es lo que se espera: es "tu"
  // instrumento, no un ajuste por pantalla.
  els.inventoryInstrumentPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-instrument]');
    if (!btn) return;
    state.instrument = btn.dataset.instrument;
    els.inventoryInstrumentPicker.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderInventory();
  });
  els.inventorySearch.addEventListener('input', renderInventory);

  els.tunerInstrumentPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-instrument]');
    if (!btn) return;
    state.instrument = btn.dataset.instrument;
    els.tunerInstrumentPicker.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setTunerInstrument(state.instrument);
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
  window.addEventListener('resize', syncPinnedTop);
}

export function startAutoScroll() {
  stopAutoScroll();
  const pxPerInterval = state.scrollSpeed * 0.5;
  state.scrollInterval = setInterval(() => {
    window.scrollBy(0, pxPerInterval);
  }, 50);
}

export function stopAutoScroll() {
  if (state.scrollInterval) {
    clearInterval(state.scrollInterval);
    state.scrollInterval = null;
  }
}

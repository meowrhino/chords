// tuner-view.js — monta y desmonta el afinador en su vista.

import { state } from './state.js';
import { els } from './dom.js';
import { createTuner } from '../engine/tuner.js';

// === AFINADOR ===

// Una instancia viva como mucho. Se crea al entrar en #/afinador y se destruye
// al salir: destroy() corta el micro, y si no, el navegador deja el indicador
// de grabación encendido mientras navegas por el resto de la app.
let tuner = null;

export function openTuner() {
  if (tuner) tuner.destroy();
  tuner = createTuner(els.tunerMount, { instrument: state.instrument });
  for (const btn of els.tunerInstrumentPicker.querySelectorAll('.control-btn')) {
    btn.classList.toggle('active', btn.dataset.instrument === state.instrument);
  }
}

export function closeTuner() {
  if (!tuner) return;
  tuner.destroy();
  tuner = null;
}

/** Cambia la afinación si el afinador está montado. La instancia no sale del
 *  módulo a propósito: nadie de fuera tiene por qué saber si existe o no. */
export function setTunerInstrument(name) {
  if (tuner) tuner.setInstrument(name);
}

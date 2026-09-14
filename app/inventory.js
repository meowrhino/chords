// inventory.js — el inventario de acordes.

import { state } from './state.js';
import { els } from './dom.js';
import { chordDiagram } from '../engine/chord-svg.js';
import { lookupChord, listChords, chordRoot } from '../engine/chords-db.js';

// === INVENTARIO DE ACORDES ===

// Dibujar 391 diagramas de golpe congela la pestaña medio segundo, así que se
// pintan por tandas con requestAnimationFrame. renderToken corta la tanda en
// curso cuando cambias de instrumento o escribes en el buscador: sin él, dos
// renders solapados van metiendo tarjetas en la misma rejilla.
export let inventoryToken = 0;

export function renderInventory() {
  const token = ++inventoryToken;
  const query = els.inventorySearch.value.trim().toLowerCase();
  const names = listChords(state.instrument)
    .filter(n => !query || n.toLowerCase().includes(query));

  els.inventoryGrid.innerHTML = '';
  els.inventoryCount.textContent = names.length
    ? `${names.length} acordes`
    : 'ningún acorde con ese nombre';

  // Agrupar por fundamental, en el orden cromático que ya trae listChords.
  const groups = [];
  for (const name of names) {
    const root = chordRoot(name);
    if (!groups.length || groups[groups.length - 1].root !== root) {
      groups.push({ root, names: [] });
    }
    groups[groups.length - 1].names.push(name);
  }

  let i = 0;
  function paintBatch() {
    if (token !== inventoryToken) return;
    const deadline = performance.now() + 12;   // ~un frame
    while (i < groups.length && performance.now() < deadline) {
      els.inventoryGrid.appendChild(inventoryGroupEl(groups[i]));
      i++;
    }
    if (i < groups.length) requestAnimationFrame(paintBatch);
  }
  paintBatch();
}

export function inventoryGroupEl({ root, names }) {
  const section = document.createElement('section');
  section.className = 'inventory-group';
  const label = document.createElement('div');
  label.className = 'catalog-section-label';
  label.textContent = root;
  section.appendChild(label);

  const grid = document.createElement('div');
  // El teclado de piano es apaisado: en columnas pensadas para un diagrama de
  // trastes las teclas salen del ancho de un pelo y las notas no se leen.
  grid.className = `inventory-cards${state.instrument === 'piano' ? ' inventory-cards-wide' : ''}`;
  for (const name of names) {
    const data = lookupChord(name, state.instrument);
    if (!data) continue;
    const card = document.createElement('div');
    card.className = 'chord-diagram-card inventory-card';
    const svg = chordDiagram(name, data, state.instrument);
    if (svg) card.appendChild(svg);
    grid.appendChild(card);
  }
  section.appendChild(grid);
  return section;
}

export function openInventory() {
  for (const btn of els.inventoryInstrumentPicker.querySelectorAll('.control-btn')) {
    btn.classList.toggle('active', btn.dataset.instrument === state.instrument);
  }
  renderInventory();
}

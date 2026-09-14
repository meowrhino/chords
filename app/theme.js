// theme.js — claro/oscuro.

import { els } from './dom.js';

// === TEMA ===

export function initTheme() {
  els.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('meowrhino-theme', next);
  });
}

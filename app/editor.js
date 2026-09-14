// editor.js — escribir y publicar tablaturas.

import { API_BASE, profile, state } from './state.js';
import { $, $$, els } from './dom.js';
import { getUsername } from './social.js';
import { parseChordPro } from '../engine/chordpro.js';
import { renderSong } from '../engine/ruby-render.js';
import { convertRawToChordPro } from '../engine/raw-to-chordpro.js';

// === EDITOR ===

export function initEditor() {
  let previewTimer = null;

  els.edContent.addEventListener('input', () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updateEditorPreview, 300);
  });

  els.edSave.addEventListener('click', saveFromEditor);
  els.edDownload.addEventListener('click', downloadFromEditor);
  els.edDelete.addEventListener('click', deleteFromEditor);

  // importar archivo .cho
  const importBtn = $('#importBtn');
  const importInput = $('#importInput');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const parsed = parseChordPro(text);
        els.edTitle.value = parsed.meta.title || '';
        els.edArtist.value = parsed.meta.artist || '';
        els.edKey.value = parsed.meta.key || '';
        els.edCapo.value = parsed.meta.capo || '';
        els.edLang.value = parsed.meta.lang || '';
        els.edContent.value = stripMeta(text);
        updateEditorPreview();
      };
      reader.readAsText(file);
      importInput.value = '';
    });
  }

  // importar desde URL
  const importUrlBtn = $('#importUrlBtn');
  const importUrlInput = $('#importUrlInput');
  const importCookieInput = $('#importCookieInput');
  // Restaurar cookie guardada en localStorage
  if (importCookieInput) {
    const saved = localStorage.getItem('chords-scrape-cookie');
    if (saved) importCookieInput.value = saved;
    importCookieInput.addEventListener('input', () => {
      localStorage.setItem('chords-scrape-cookie', importCookieInput.value);
    });
  }
  if (importUrlBtn && importUrlInput) {
    importUrlBtn.addEventListener('click', async () => {
      const url = importUrlInput.value.trim();
      if (!url) return;
      const cookie = importCookieInput ? importCookieInput.value.trim() : '';
      importUrlBtn.textContent = 'importando...';
      importUrlBtn.disabled = true;
      try {
        const res = await fetch(`${API_BASE}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, cookie: cookie || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'error al importar');
        els.edTitle.value = data.title || '';
        els.edArtist.value = data.artist || '';
        els.edKey.value = data.key || '';
        els.edLang.value = data.lang || '';
        els.edContent.value = data.content || '';
        updateEditorPreview();
        importUrlInput.value = '';
      } catch (e) {
        alert('Error: ' + e.message);
      } finally {
        importUrlBtn.textContent = 'importar URL';
        importUrlBtn.disabled = false;
      }
    });
  }

  // pegar texto crudo (paid sites, copia manual)
  const importRawBtn = $('#importRawBtn');
  const importRawInput = $('#importRawInput');
  if (importRawBtn && importRawInput) {
    importRawBtn.addEventListener('click', () => {
      const raw = importRawInput.value;
      if (!raw.trim()) return;
      try {
        const converted = convertRawToChordPro(raw);
        // Si el editor ya tiene contenido, anexar; si no, reemplazar
        if (els.edContent.value.trim()) {
          els.edContent.value = els.edContent.value.replace(/\n*$/, '\n\n') + converted;
        } else {
          els.edContent.value = converted;
        }
        importRawInput.value = '';
        updateEditorPreview();
      } catch (e) {
        alert('Error al convertir: ' + (e.message || e));
      }
    });
  }

  // insertar snippets
  for (const btn of $$('.ed-insert')) {
    btn.addEventListener('click', () => {
      const snippet = btn.dataset.insert;
      const ta = els.edContent;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = ta.value.slice(0, start);
      const after = ta.value.slice(end);
      ta.value = before + snippet + after;
      ta.selectionStart = ta.selectionEnd = start + snippet.length;
      ta.focus();
      updateEditorPreview();
    });
  }
}

export function stripMeta(text) {
  // quitar líneas de metadatos del contenido ChordPro
  return text.split('\n').filter(line => {
    const trimmed = line.trim();
    return !(
      trimmed.startsWith('{title:') ||
      trimmed.startsWith('{artist:') ||
      trimmed.startsWith('{key:') ||
      trimmed.startsWith('{capo:') ||
      trimmed.startsWith('{lang:')
    );
  }).join('\n').replace(/^\n+/, '');
}

export function buildChoText() {
  let cho = '';
  if (els.edTitle.value) cho += `{title: ${els.edTitle.value}}\n`;
  if (els.edArtist.value) cho += `{artist: ${els.edArtist.value}}\n`;
  if (els.edKey.value) cho += `{key: ${els.edKey.value}}\n`;
  if (els.edCapo.value) cho += `{capo: ${els.edCapo.value}}\n`;
  if (els.edLang.value) cho += `{lang: ${els.edLang.value}}\n`;
  cho += '\n' + els.edContent.value;
  return cho;
}

export function updateEditorPreview() {
  try {
    const cho = buildChoText();
    const parsed = parseChordPro(cho);
    els.edPreview.innerHTML = renderSong(parsed, { showChords: true, showReadings: false });
  } catch {
    els.edPreview.innerHTML = '<div class="no-results">error de sintaxis</div>';
  }
}

export function generateSlug(title, artist) {
  const raw = `${artist}-${title}`.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return raw || 'sin-titulo';
}

export async function saveFromEditor() {
  const title = els.edTitle.value.trim();
  if (!title) { alert('escribe un título'); return; }
  const artist = els.edArtist.value.trim();
  const key = els.edKey.value.trim();
  const lang = els.edLang.value.trim();
  const cho = buildChoText();
  const slug = state.editingSlug || generateSlug(title, artist);

  // caché local inmediata (borrador / respaldo sin conexión)
  profile.saveCustomSong(slug, cho, { title, artist, key, lang });
  state.editingSlug = slug;
  els.edDelete.style.display = '';

  const originalLabel = els.edSave.textContent;
  els.edSave.textContent = 'publicando...';
  els.edSave.disabled = true;
  try {
    const result = await publishSong(slug, { title, artist, key, lang }, cho);
    if (result.isNew) alert('canción publicada en la base de datos pública.');
    else if (!result.unchanged) alert('publicada como nueva versión de esta canción.');
  } catch (e) {
    alert('se guardó en tu navegador, pero no se pudo publicar en la base de datos: ' + e.message);
  } finally {
    els.edSave.textContent = originalLabel;
    els.edSave.disabled = false;
  }

  location.hash = `#/song/${slug}`;
}

// publica en la base de datos compartida (D1): crea la canción si no existe,
// o añade una nueva versión si el slug ya existe con contenido distinto
export async function publishSong(slug, meta, choContent) {
  const username = getUsername() || undefined;

  const createRes = await fetch(`${API_BASE}/api/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: meta.title, artist: meta.artist, cho_content: choContent,
      key: meta.key || undefined, lang: meta.lang || undefined, username,
    }),
  });

  if (createRes.status === 201) return { isNew: true };

  if (createRes.status === 409) {
    const existing = await createRes.json().catch(() => ({}));
    const existingSlug = existing.slug || slug;

    const getRes = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(existingSlug)}`);
    if (getRes.ok) {
      const { song } = await getRes.json();
      if (song.cho_content === choContent) return { isNew: false, unchanged: true };
    }

    const versionRes = await fetch(`${API_BASE}/api/songs/${encodeURIComponent(existingSlug)}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cho_content: choContent, key: meta.key || undefined, lang: meta.lang || undefined, username,
      }),
    });
    if (!versionRes.ok) {
      const err = await versionRes.json().catch(() => ({}));
      throw new Error(err.error || `error ${versionRes.status} al publicar la versión`);
    }
    return { isNew: false };
  }

  const err = await createRes.json().catch(() => ({}));
  throw new Error(err.error || `error ${createRes.status} al publicar`);
}

export function downloadFromEditor() {
  const cho = buildChoText();
  const title = els.edTitle.value.trim() || 'cancion';
  const slug = generateSlug(title, els.edArtist.value);
  const blob = new Blob([cho], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.cho`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function deleteFromEditor() {
  if (!state.editingSlug) return;
  if (!confirm('¿eliminar esta tablatura?')) return;
  profile.deleteCustomSong(state.editingSlug);
  location.hash = '#/';
}

export function loadEditor(slug) {
  state.editingSlug = slug || null;

  if (slug) {
    const custom = profile.customSongs();
    if (custom[slug]) {
      const parsed = parseChordPro(custom[slug]);
      els.edTitle.value = parsed.meta.title || '';
      els.edArtist.value = parsed.meta.artist || '';
      els.edKey.value = parsed.meta.key || '';
      els.edCapo.value = parsed.meta.capo || '';
      els.edLang.value = parsed.meta.lang || '';
      els.edContent.value = stripMeta(custom[slug]);
      els.edDelete.style.display = '';
    }
  } else {
    els.edTitle.value = '';
    els.edArtist.value = '';
    els.edKey.value = '';
    els.edCapo.value = '';
    els.edLang.value = '';
    els.edContent.value = '{start_of_verse}\n[Am]escribe tu [C]canción aquí\n{end_of_verse}\n';
    els.edDelete.style.display = 'none';
  }
  updateEditorPreview();
}

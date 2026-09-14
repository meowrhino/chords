// state.js — el estado vivo de la app y el perfil guardado en el navegador.

export const API_BASE = '';

// === PERFIL (localStorage) ===

export const profile = {
  load() {
    return JSON.parse(localStorage.getItem('chords-profile') || '{"name":"","instrument":"guitar"}');
  },
  save(data) {
    localStorage.setItem('chords-profile', JSON.stringify(data));
  },
  favorites() {
    return JSON.parse(localStorage.getItem('chords-favorites') || '[]');
  },
  saveFavorites(favs) {
    localStorage.setItem('chords-favorites', JSON.stringify(favs));
  },
  toggleFavorite(slug) {
    const favs = this.favorites();
    const idx = favs.indexOf(slug);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(slug);
    this.saveFavorites(favs);
    return idx < 0; // true = ahora es favorito
  },
  isFavorite(slug) {
    return this.favorites().includes(slug);
  },
  // Los favoritos viven en localStorage (son tuyos, por dispositivo), pero
  // songs/index.json puede traer algunos marcados con "fav": true como semilla.
  //
  // Se guarda QUÉ semillas se han aplicado, no un simple "ya sembré". Con un
  // booleano, una canción marcada fav más tarde no llegaba nunca a un navegador
  // ya sembrado. Así cada semilla se aplica exactamente una vez: las nuevas
  // entran, y una que hayas quitado a mano no vuelve.
  seedFavorites(catalog) {
    const KEY = 'chords-favorites-seeded';
    const raw = localStorage.getItem(KEY);
    let applied;
    try {
      applied = new Set(JSON.parse(raw) || []);
    } catch {
      // migración desde el booleano '1': damos por aplicadas las que ya son
      // favoritas, para no resucitar las que el usuario hubiera quitado.
      applied = new Set(raw ? this.favorites() : []);
    }

    const seeds = catalog.filter(s => s.fav).map(s => s.file.replace(/\.cho$/, ''));
    const fresh = seeds.filter(slug => !applied.has(slug));
    if (fresh.length) {
      this.saveFavorites([...new Set([...this.favorites(), ...fresh])]);
    }
    localStorage.setItem(KEY, JSON.stringify([...new Set([...applied, ...seeds])]));
  },
  history() {
    return JSON.parse(localStorage.getItem('chords-history') || '[]');
  },
  addHistory(slug) {
    let hist = this.history().filter(h => h.slug !== slug);
    hist.unshift({ slug, date: new Date().toISOString().slice(0, 10) });
    if (hist.length > 20) hist = hist.slice(0, 20);
    localStorage.setItem('chords-history', JSON.stringify(hist));
  },
  customSongs() {
    return JSON.parse(localStorage.getItem('chords-custom-songs') || '{}');
  },
  customIndex() {
    return JSON.parse(localStorage.getItem('chords-custom-index') || '[]');
  },
  saveCustomSong(slug, choText, meta) {
    const songs = this.customSongs();
    songs[slug] = choText;
    localStorage.setItem('chords-custom-songs', JSON.stringify(songs));

    const index = this.customIndex().filter(s => s.file !== slug + '.cho');
    index.push({
      file: slug + '.cho',
      title: meta.title || slug,
      artist: meta.artist || '',
      key: meta.key || '',
      lang: meta.lang || '',
      custom: true,
    });
    localStorage.setItem('chords-custom-index', JSON.stringify(index));
  },
  deleteCustomSong(slug) {
    const songs = this.customSongs();
    delete songs[slug];
    localStorage.setItem('chords-custom-songs', JSON.stringify(songs));
    const index = this.customIndex().filter(s => s.file !== slug + '.cho');
    localStorage.setItem('chords-custom-index', JSON.stringify(index));
  },
};

// === ESTADO ===

export const state = {
  catalog: [],
  currentSong: null,
  parsedSong: null,
  instrument: 'guitar',
  transpose: 0,
  capo: 0,
  // Arranca en on: con readings, renderLine usa el layout de dos capas
  // (acordes en su propia línea, alineados por columna) en vez del ruby, y
  // los acordes respiran mucho mejor. Solo cambia algo en canciones con
  // romaji/pinyin; en el resto no hay readings que enseñar.
  showReadings: true,
  autoScroll: false,
  scrollSpeed: 3,
  scrollInterval: null,
};

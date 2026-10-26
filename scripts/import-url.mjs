#!/usr/bin/env node
// Importa una canción desde una URL a songs/ en un solo comando.
//
//   node scripts/import-url.mjs <url> [--fav] [--key Eb] [--lang ja] [--slug foo]
//                                     [--title "RPG"] [--artist "…"] [--dry]
//
// Hace: fetch → parser del sitio → .cho con cabecera → entrada en index.json →
//       anotación romaji/pinyin si es ja/zh.
//
// Usa EXACTAMENTE los mismos parsers que el botón "importar URL" de la web
// (engine/scrapers.js), así que si un sitio se arregla aquí, se arregla en los dos.

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseByDomain, isAllowedDomain, browserHeaders } from '../engine/scrapers.js';
import { toRomajiText, annotateContent } from './romaji.mjs';
import { loadTokenizer } from './generate-romaji.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SONGS_DIR = join(ROOT, 'songs');
const INDEX_PATH = join(SONGS_DIR, 'index.json');

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function parseArgs(argv) {
  const out = { flags: new Set(), opts: {}, url: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fav' || a === '--dry') out.flags.add(a);
    else if (a.startsWith('--')) out.opts[a.slice(2)] = argv[++i];
    else out.url = a;
  }
  return out;
}

/**
 * Núcleo reutilizable: importa una URL a songs/ + index.json.
 * @param {string} url
 * @param {object} opts - { slug, title, artist, key, lang, fav, dry, tokenizer, quiet }
 *   tokenizer: pásalo para lotes (cargar kuromoji una vez, no por canción).
 * @returns {Promise<object>} { slug, file, title, artist, key, lang, chords, lines, entry }
 */
export async function importFromUrl(url, opts = {}) {
  const say = (...a) => { if (!opts.quiet) console.log(...a); };
  const domain = new URL(url).hostname;
  if (!isAllowedDomain(domain)) throw new Error(`dominio no soportado: ${domain}`);

  say(`↓ ${url}`);
  const res = await fetch(url, { headers: browserHeaders() });
  if (!res.ok) throw new Error(`fetch falló: ${res.status}`);

  const song = parseByDomain(domain, await res.text());
  // Overrides: algunos sitios devuelven el título mal capitalizado (UG da "Rpg")
  if (opts.title) song.title = opts.title;
  if (opts.artist) song.artist = opts.artist;
  const lang = opts.lang || song.lang || '';
  const key = opts.key || song.key || '';
  say(`  título: ${song.title}\n  artista: ${song.artist}\n  idioma: ${lang || '—'}  key: ${key || '—'}`);

  // El tokenizer hace falta para el slug romaji y/o para anotar
  const needsJa = lang === 'ja';
  const tokenizer = needsJa ? (opts.tokenizer || await loadTokenizer()) : null;

  // Slug: título japonés → romaji antes de slugificar (ver toRomajiText)
  const titleForSlug = needsJa ? toRomajiText(song.title, tokenizer) : song.title;
  const slug = opts.slug || slugify(`${song.artist}-${titleForSlug}`);
  const file = `${slug}.cho`;
  const filePath = join(SONGS_DIR, file);
  say(`  slug: ${slug}`);

  if (existsSync(filePath) && !opts.dry) throw new Error(`ya existe: songs/${file}`);

  // Cabecera ChordPro, mismo formato que el resto de songs/
  let cho = `{title:${song.title}}\n{artist:${song.artist}}\n`;
  if (key) cho += `{key:${key}}\n`;
  if (lang) cho += `{lang:${lang}}\n`;
  cho += `\n${song.content}\n`;

  if (lang === 'ja' || lang === 'zh') {
    cho = annotateContent(cho, lang, tokenizer);
    say(`  ✓ anotado (${lang === 'ja' ? 'romaji' : 'pinyin'})`);
  }

  const entry = { file, title: song.title, artist: song.artist };
  if (key) entry.key = key;
  if (lang) entry.lang = lang;
  if (opts.fav) entry.fav = true;
  entry.added = new Date().toISOString().slice(0, 10);

  const result = {
    slug, file, title: song.title, artist: song.artist, key, lang, entry,
    lines: cho.split('\n').length,
    chords: (cho.match(/\[[^\]]+\]/g) || []).length,
  };

  if (opts.dry) {
    say('\n--dry: no se escribe nada.\n');
    say('entrada index.json:', JSON.stringify(entry, null, 2));
    say(`cho: ${result.lines} líneas, ${result.chords} acordes`);
    return result;
  }

  writeFileSync(filePath, cho, 'utf-8');
  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
  index.push(entry);
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n', 'utf-8');

  say(`\n✓ songs/${file}  (+ entrada en index.json${entry.fav ? ', favorita' : ''})`);
  return result;
}

async function main() {
  const { flags, opts, url } = parseArgs(process.argv.slice(2));
  if (!url) {
    console.error('uso: node scripts/import-url.mjs <url> [--fav] [--key X] [--lang ja] [--slug s] [--dry]');
    process.exit(1);
  }
  await importFromUrl(url, {
    ...opts,
    fav: flags.has('--fav'),
    dry: flags.has('--dry'),
  });
}

// Solo corre como CLI, no al importarlo desde un lote
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(e => { console.error('\n✗', e.message); process.exit(1); });
}

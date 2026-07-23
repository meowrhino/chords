#!/usr/bin/env node
// Genera anotaciones romaji (ja) / pinyin (zh) en los .cho.
//
// Uso:
//   node scripts/generate-romaji.mjs                 → todos los ja/zh sin anotar
//   node scripts/generate-romaji.mjs foo.cho bar.cho → ficheros concretos
//   node scripts/generate-romaji.mjs --force         → reanota también los ya anotados
//
// La lógica de romanización vive en scripts/romaji.mjs; esto es solo I/O.

import kuromoji from 'kuromoji';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { annotateContent, stripAnnotations } from './romaji.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SONGS_DIR = join(ROOT, 'songs');
const DICT_PATH = join(ROOT, 'node_modules', 'kuromoji', 'dict');

export function loadTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: DICT_PATH }).build((err, tokenizer) => {
      if (err) reject(err); else resolve(tokenizer);
    });
  });
}

/**
 * Anota un .cho en disco. Devuelve true si lo ha escrito.
 * @param {string} filePath
 * @param {object} tokenizer
 * @param {{force?: boolean, quiet?: boolean}} opts
 */
export function annotateFile(filePath, tokenizer, opts = {}) {
  const { force = false, quiet = false } = opts;
  const say = (...a) => { if (!quiet) console.log(...a); };

  let content = readFileSync(filePath, 'utf-8');
  const lang = /\{lang:\s*ja\s*\}/.test(content) ? 'ja'
             : /\{lang:\s*zh\s*\}/.test(content) ? 'zh'
             : null;

  if (!lang) return false;   // no es ja/zh: ni lo mencionamos, son la mayoría

  const tag = lang === 'ja' ? 'r' : 'p';
  const annotated = content.includes(`{${tag}:`);
  if (annotated && !force) {
    say(`  = ya anotado (usa --force para rehacer): ${filePath}`);
    return false;
  }
  if (annotated) content = stripAnnotations(content);

  writeFileSync(filePath, annotateContent(content, lang, tokenizer), 'utf-8');
  say(`  ✓ ${lang}: ${filePath}`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const files = args.filter(a => !a.startsWith('--'));

  console.log('cargando diccionario kuromoji…');
  const tokenizer = await loadTokenizer();

  const targets = files.length
    ? files.map(f => (isAbsolute(f) ? f : join(SONGS_DIR, f)))
    : readdirSync(SONGS_DIR).filter(f => f.endsWith('.cho')).map(f => join(SONGS_DIR, f));

  let count = 0;
  for (const filePath of targets) {
    if (annotateFile(filePath, tokenizer, { force })) count++;
  }
  console.log(`\n${count} fichero(s) anotado(s).`);
}

// Solo corre como CLI, no al importarlo desde import-url.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(e => { console.error(e); process.exit(1); });
}

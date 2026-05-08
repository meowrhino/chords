#!/usr/bin/env node
// Re-fusiona chord-lines no-mergeadas en todos los .cho de songs/.
// Sólo aplica mergeChordLines (no toca metadata, comentarios, ni boilerplate).
//
// Uso:
//   node scripts/reprocess-chords.mjs           # dry-run, lista archivos modificados
//   node scripts/reprocess-chords.mjs --write   # escribe los cambios
//   node scripts/reprocess-chords.mjs --write songs/aimer-brave-shine.cho   # solo uno
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mergeChordLines } from '../engine/raw-to-chordpro.js';

const ROOT = new URL('../songs/', import.meta.url).pathname;
const args = process.argv.slice(2);
const write = args.includes('--write');
const targets = args.filter(a => a.endsWith('.cho'));

async function listSongs() {
  if (targets.length) return targets;
  const files = await readdir(ROOT);
  return files.filter(f => f.endsWith('.cho')).map(f => join(ROOT, f));
}

let changed = 0;
let unchanged = 0;
const samples = [];

for (const file of await listSongs()) {
  const original = await readFile(file, 'utf8');
  // Sólo fusionar; preservar todo lo demás.
  const merged = mergeChordLines(original);
  if (merged !== original) {
    changed++;
    if (samples.length < 3) samples.push(file);
    if (write) await writeFile(file, merged, 'utf8');
  } else {
    unchanged++;
  }
}

console.log(`changed: ${changed}`);
console.log(`unchanged: ${unchanged}`);
if (samples.length) console.log(`sample changed:`, samples);
if (!write) console.log('\n(dry-run — usa --write para aplicar)');

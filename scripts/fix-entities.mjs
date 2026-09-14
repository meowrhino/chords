#!/usr/bin/env node
// fix-entities.mjs — repara canciones ya importadas que guardaron entidades HTML.
//
// Dos daños, siempre juntos:
//   1. "&rsquo;" se lee tal cual en pantalla en vez de "’".
//   2. Peor: el acorde quedó CLAVADO dentro de la entidad ("you&rsq[F#m]uo;re"),
//      porque el conversor contaba 7 columnas donde el transcriptor veía 1.
//
// Por eso no vale un replace a secas: hay que sacar los acordes, decodificar
// llevando un mapa de posiciones viejas → nuevas, y volver a meterlos. Un acorde
// que cayera dentro de una entidad aterriza sobre el carácter que la sustituye.
//
// Uso: node scripts/fix-entities.mjs [--dry]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { decodeEntitiesDeep } from '../engine/entities.js';
import { normalizeSections } from '../engine/raw-to-chordpro.js';

const SONGS_DIR = new URL('../songs/', import.meta.url).pathname;
const dry = process.argv.includes('--dry');

const ENTITY = /&(?:#\d+|#x[0-9a-f]+|[a-zA-Z]+);/gi;

// Separa "[A]ho[G]la" en { text: 'hola', chords: [{pos:0,chord:'A'},{pos:2,chord:'G'}] }
function stripChords(line) {
  const chords = [];
  let text = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] === '[') {
      const close = line.indexOf(']', i);
      if (close !== -1) {
        chords.push({ pos: text.length, chord: line.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }
    text += line[i];
    i++;
  }
  return { text, chords };
}

// Decodifica y devuelve además el mapa de índices. Las posiciones interiores de
// una entidad colapsan a su inicio: es donde queda el carácter que la sustituye.
function decodeWithMap(text) {
  let out = '';
  const map = new Array(text.length + 1);
  let last = 0;
  ENTITY.lastIndex = 0;
  let m;
  while ((m = ENTITY.exec(text)) !== null) {
    for (let i = last; i < m.index; i++) map[i] = out.length + (i - last);
    out += text.slice(last, m.index);
    const decoded = decodeEntitiesDeep(m[0]);
    const at = out.length;
    for (let i = m.index; i < m.index + m[0].length; i++) map[i] = at;
    out += decoded;
    last = m.index + m[0].length;
  }
  for (let i = last; i <= text.length; i++) map[i] = out.length + (i - last);
  out += text.slice(last);
  return { text: out, map };
}

function insertChords(text, chords) {
  let result = text;
  for (const { pos, chord } of [...chords].sort((a, b) => b.pos - a.pos)) {
    const at = Math.max(0, Math.min(pos, result.length));
    result = result.slice(0, at) + `[${chord}]` + result.slice(at);
  }
  return result;
}

function fixLine(line) {
  // Directivas ({title:…}) no llevan acordes: decodificar y ya.
  if (/^\s*\{[^}]*\}\s*$/.test(line)) return decodeEntitiesDeep(line);
  const { text, chords } = stripChords(line);
  // El test va sobre el texto YA sin acordes: la entidad puede venir partida
  // en dos ("you&rsquo[F#m];re"), que es justo el caso que hay que arreglar.
  // También dentro del corchete: no todo lo que va entre [] es un acorde
  // ("[A&iuml;e a&iuml;e ing]" es una anotación del transcriptor).
  ENTITY.lastIndex = 0;
  const dirty = ENTITY.test(text) || chords.some(c => { ENTITY.lastIndex = 0; return ENTITY.test(c.chord); });
  ENTITY.lastIndex = 0;
  if (!dirty) return line;
  const { text: decoded, map } = decodeWithMap(text);
  return insertChords(decoded, chords.map(c => ({ pos: map[c.pos], chord: decodeEntitiesDeep(c.chord) })));
}

let changed = 0;
for (const file of readdirSync(SONGS_DIR).filter(f => f.endsWith('.cho'))) {
  const path = join(SONGS_DIR, file);
  const before = readFileSync(path, 'utf8');
  const after = normalizeSections(before).split('\n').map(fixLine).join('\n');
  if (after === before) continue;
  changed++;
  if (dry) {
    console.log(`--- ${file}`);
    const a = before.split('\n'), b = after.split('\n');
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) console.log(`  - ${a[i]}\n  + ${b[i]}`);
    }
  } else {
    writeFileSync(path, after);
  }
}
console.log(`${changed} canciones ${dry ? 'a arreglar' : 'arregladas'}`);

#!/usr/bin/env node
// Le pone el kanji a un .cho que solo tiene la letra en romaji, tomándolo de una
// página de ufret de la misma canción y CONSERVANDO los acordes del fichero local.
//
//   node scripts/merge-kanji.mjs songs/foo.cho <url-ufret> [--out songs/bar.cho] [--dry]
//
// Por qué hace falta: el kanji no se puede deducir del romaji (romaji→kana ya es
// ambiguo, y kana→kanji es conversión IME sin garantías). Pero si tenemos la misma
// canción en kanji en otra fuente, sí se puede trasplantar el texto y quedarnos con
// el arreglo local.
//
// La parte delicada es dónde cae cada acorde. NO se usan offsets de carácter en
// bruto: las dos romanizaciones difieren ("wo"/"o", espaciado), así que se alinean
// las dos letras con LCS y el mapeo absorbe esas inserciones/borrados. Cada acorde
// acaba en la frontera de token más cercana, que es donde ChordPro lo admite sin
// partir una palabra.
//
// Si la letra no alinea bien, ABORTA en vez de escribir un cifrado descolocado.

import { readFileSync, writeFileSync } from 'fs';
import { parseByDomain, browserHeaders } from '../engine/scrapers.js';
import { annotateContent } from './romaji.mjs';
import { loadTokenizer } from './generate-romaji.mjs';

// mínimos para fiarse del trasplante
const MIN_SIM = 0.55;   // similitud por línea por debajo de la cual se considera descolocada
const MAX_BAD = 0.25;   // fracción de líneas flojas tolerada

const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');

/** Dice sobre bigramas: 1 = idénticas, 0 = nada en común. */
function similarity(a, b) {
  if (!a || !b) return 0;
  const bg = s => { const o = new Set(); for (let i = 0; i < s.length - 1; i++) o.add(s.slice(i, i + 2)); return o; };
  const A = bg(a), B = bg(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit++;
  return (2 * hit) / (A.size + B.size);
}

/** Pares [iA,iB] alineados por subsecuencia común más larga. */
function lcsPairs(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pairs = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** Normaliza a solo letras guardando de dónde venía cada carácter. */
function normWithMap(s) {
  let n = '', map = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i].toLowerCase();
    if (c >= 'a' && c <= 'z') { n += c; map.push(i); }
  }
  return { norm: n, map };
}

/** Trocea una línea anotada en tokens {text (el tag entero), romaji}. */
function tokenize(line) {
  const toks = [];
  const re = /\{r:([^}]*)\}(.*?)\{\/r\}/g;
  let last = 0, m;
  while ((m = re.exec(line))) {
    if (m.index > last) { const t = line.slice(last, m.index); toks.push({ text: t, romaji: t }); }
    toks.push({ text: m[0], romaji: m[1] });
    last = m.index + m[0].length;
  }
  if (last < line.length) { const t = line.slice(last); toks.push({ text: t, romaji: t }); }
  return toks;
}

const isLyric = l => !/^\s*\{/.test(l) && l.replace(/\[[^\]]*\]/g, '').replace(/[^a-z]/gi, '').length > 4;

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const outIdx = args.indexOf('--out');
  // ojo: sin --out, outIdx es -1 y outIdx+1 vale 0 → descartaría el primer argumento
  const skip = outIdx > -1 ? outIdx + 1 : -1;
  const rest = args.filter((a, i) => !a.startsWith('--') && i !== skip);
  const [localPath, url] = rest;
  const outPath = outIdx > -1 ? args[outIdx + 1] : localPath;

  if (!localPath || !url) {
    console.error('uso: node scripts/merge-kanji.mjs <fichero.cho> <url-ufret> [--out f] [--dry]');
    process.exit(1);
  }

  const local = readFileSync(localPath, 'utf-8');
  const localLines = local.split('\n');
  const localIdx = localLines.map((l, i) => [l, i]).filter(([l]) => isLyric(l)).map(([, i]) => i);

  console.log(`↓ ${url}`);
  const html = await (await fetch(url, { headers: browserHeaders() })).text();
  const src = parseByDomain(new URL(url).hostname, html);
  const tokenizer = await loadTokenizer();
  const annotated = annotateContent(src.content, 'ja', tokenizer);
  const srcLines = annotated.split('\n');
  const srcIdx = srcLines.map((l, i) => [l, i]).filter(([l]) => /\{r:/.test(l)).map(([, i]) => i);

  console.log(`  líneas de letra — local: ${localIdx.length}, ufret: ${srcIdx.length}`);
  if (localIdx.length !== srcIdx.length) {
    console.error(`\n✗ no cuadran las líneas (${localIdx.length} vs ${srcIdx.length}). Abortando: el`);
    console.error('  trasplante colocaría la letra en la línea equivocada.');
    process.exit(1);
  }

  // control de calidad antes de tocar nada
  const sims = localIdx.map((li, k) => {
    const a = norm(localLines[li].replace(/\[[^\]]*\]/g, ''));
    const b = norm((srcLines[srcIdx[k]].match(/\{r:([^}]*)\}/g) || []).map(m => m.slice(3, -1)).join(''));
    return similarity(a, b);
  });
  const bad = sims.filter(s => s < MIN_SIM).length;
  const avg = sims.reduce((a, b) => a + b, 0) / sims.length;
  console.log(`  similitud media ${avg.toFixed(2)} | líneas flojas (<${MIN_SIM}): ${bad}/${sims.length}`);
  if (bad / sims.length > MAX_BAD) {
    console.error(`\n✗ demasiadas líneas no se parecen: probablemente no es la misma versión de la letra.`);
    console.error('  Abortando para no escribir un cifrado descolocado.');
    process.exit(1);
  }

  // trasplante
  let placed = 0, total = 0, offsets = [];
  const out = [...localLines];

  for (let k = 0; k < localIdx.length; k++) {
    const localLine = localLines[localIdx[k]];
    const toks = tokenize(srcLines[srcIdx[k]].replace(/\[[^\]]*\]/g, ''));   // los acordes de ufret sobran

    // acordes locales con su offset dentro del texto sin acordes
    const chords = [];
    let plain = '', restLine = localLine, m;
    while ((m = restLine.match(/\[([^\]]+)\]/))) {
      plain += restLine.slice(0, m.index);
      chords.push({ chord: m[0], at: plain.length });
      restLine = restLine.slice(m.index + m[0].length);
    }
    plain += restLine;
    total += chords.length;

    let srcRomaji = '', charTok = [];
    toks.forEach((t, ti) => { for (let i = 0; i < t.romaji.length; i++) charTok.push(ti); srcRomaji += t.romaji; });

    const A = normWithMap(plain), B = normWithMap(srcRomaji);
    const pairs = lcsPairs(A.norm, B.norm);

    const insertAt = new Map();
    for (const c of chords) {
      let jA = A.map.findIndex(o => o >= c.at);
      if (jA === -1) jA = A.norm.length - 1;
      let best = null, bestD = Infinity;
      for (const [pa, pb] of pairs) { const d = Math.abs(pa - jA); if (d < bestD) { bestD = d; best = pb; } }
      if (best === null) continue;
      offsets.push(bestD);
      const ti = charTok[B.map[best]] ?? 0;
      if (!insertAt.has(ti)) insertAt.set(ti, []);
      insertAt.get(ti).push(c.chord);
      placed++;
    }

    out[localIdx[k]] = toks.map((t, ti) => (insertAt.get(ti) || []).join('') + t.text).join('');
  }

  // asegurar {lang:ja} en la cabecera para que salga el toggle de romaji
  let result = out.join('\n');
  if (!/\{lang:/.test(result)) {
    result = result.replace(/(\{artist:[^}]*\}\n)/, `$1{lang:ja}\n`);
  }

  const avgOff = offsets.length ? offsets.reduce((a, b) => a + b, 0) / offsets.length : 0;
  console.log(`  acordes colocados: ${placed}/${total}`);
  console.log(`  desvío de alineación: media ${avgOff.toFixed(2)} caracteres, máx ${offsets.length ? Math.max(...offsets) : 0}`);

  if (dry) { console.log('\n--dry: no se escribe nada.'); return; }
  writeFileSync(outPath, result, 'utf-8');
  console.log(`\n✓ ${outPath}`);
}

main().catch(e => { console.error('\n✗', e.message); process.exit(1); });

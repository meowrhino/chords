#!/usr/bin/env node
// Tests del romanizador. node scripts/test-romaji.mjs
import { kanaToRomaji, annotateJapaneseLine } from './romaji.mjs';
import { loadTokenizer } from './generate-romaji.mjs';

let fail = 0;
const eq = (got, want, label) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${label}  →  ${got}${ok ? '' : `   (esperado: ${want})`}`);
};

console.log('— kana → romaji —');
// básicos
eq(kanaToRomaji('ワタシ'), 'watashi', 'ワタシ');
eq(kanaToRomaji('きょう'), 'kyou', 'きょう (dígrafo)');
// ー alarga la vocal previa, no es un guion
eq(kanaToRomaji('コーヒー'), 'koohii', 'コーヒー (chōonpu)');
eq(kanaToRomaji('ルール'), 'ruuru', 'ルール (chōonpu)');
// っ duplica consonante; ante ch- se vuelve "t"
eq(kanaToRomaji('イッショ'), 'issho', 'イッショ (sokuon)');
eq(kanaToRomaji('マッチャ'), 'matcha', 'マッチャ (sokuon + ch)');
eq(kanaToRomaji('ガッコウ'), 'gakkou', 'ガッコウ (sokuon)');
// ん ante vocal necesita apóstrofo para no leerse como otra sílaba
eq(kanaToRomaji('キンエン'), "kin'en", 'キンエン (n + vocal)');
eq(kanaToRomaji('キネン'), 'kinen', 'キネン (sin apóstrofo)');
eq(kanaToRomaji('シンヤ'), "shin'ya", 'シンヤ (n + y)');
// dígrafos modernos
eq(kanaToRomaji('チェック'), 'chekku', 'チェック');
eq(kanaToRomaji('ジェット'), 'jetto', 'ジェット');

console.log('\n— partículas (は/へ usan pronunciación, no lectura) —');
const tokenizer = await loadTokenizer();
const ann = l => annotateJapaneseLine(l, tokenizer);

eq(ann('私は'), '{r:watashi}私{/r}{r:wa}は{/r}', 'は partícula → wa');
eq(ann('海へ'), '{r:umi}海{/r}{r:e}へ{/r}', 'へ partícula → e');
// は dentro de palabra sigue siendo "ha"
eq(ann('花'), '{r:hana}花{/r}', '花 → hana');

console.log('\n— los acordes no se tocan —');
eq(ann('[Am]私は[C]'), '[Am]{r:watashi}私{/r}{r:wa}は{/r}[C]', 'acordes intactos');
eq(ann('[Am] [C]'), '[Am] [C]', 'línea de solo acordes');
eq(ann('{title:テスト}'), '{title:テスト}', 'directiva intacta');
eq(ann('hello world'), 'hello world', 'texto latino intacto');

console.log(fail === 0 ? '\nTodo OK.' : `\n${fail} fallo(s).`);
process.exit(fail === 0 ? 0 : 1);

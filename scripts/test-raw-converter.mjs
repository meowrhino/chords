// Quick smoke test of raw-to-chordpro converter using synthetic input.
import { convertRawToChordPro } from '../engine/raw-to-chordpro.js';

const cases = [
  {
    name: 'Plain chord-above-lyric (English)',
    input: `[Verse 1]
C            G            Am
The quick brown fox jumps over
F          C
the lazy dog tonight

[Chorus]
G          C
oh oh oh oh
F          Am  G
running through fields`,
  },
  {
    name: 'Spanish with Estrofa/Estribillo',
    input: `Estrofa 1
Am          F           C        G
hola mundo bonito amigo letra
Estribillo
F          G          Am
y la cancion sigue rodando`,
  },
  {
    name: 'Already bracketed chord line',
    input: `[Em]   [G]      [C]    [D]
mary had a little lamb tonight`,
  },
  {
    name: 'Chord-only line without lyrics',
    input: `Intro
G  D  Em  C
G  D  Em  C`,
  },
  {
    name: 'Mixed slash chords and extensions',
    input: `Cmaj7        Am7    Dsus4   G/B
walking in the rain alone`,
  },
];

let pass = 0;
let fail = 0;
for (const c of cases) {
  try {
    const out = convertRawToChordPro(c.input);
    console.log(`\n=== ${c.name} ===`);
    console.log(out);
    pass++;
  } catch (e) {
    console.error(`\n!!! ${c.name} FAILED: ${e.message}`);
    fail++;
  }
}
console.log(`\n${pass} ok, ${fail} fail`);

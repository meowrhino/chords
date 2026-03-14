// =============================================================================
// Comprehensive Chord Voicing Database
// Guitar, Ukulele, Bass, and Piano
// =============================================================================

// ---------------------------------------------------------------------------
// GUITAR — 6 strings, standard tuning E-A-D-G-B-E (index 0 = low E)
// ---------------------------------------------------------------------------

export const GUITAR = {
  // ---- C chords ----
  'C':      { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barres: [], baseFret: 1 },
  'Cm':     { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 3 },
  'C7':     { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], barres: [], baseFret: 1 },
  'Cm7':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 3 },
  'Cmaj7':  { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
  'Csus2':  { frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 2, 0, 0, 1, 3], barres: [], baseFret: 1 },
  'Csus4':  { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], barres: [{ fret: 1, from: 4, to: 5 }], baseFret: 1 },
  'Cdim':   { frets: [-1, 3, 4, 2, 1, -1], fingers: [0, 2, 3, 1, 1, 0], barres: [], baseFret: 1 },
  'Caug':   { frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], barres: [], baseFret: 1 },
  'Cadd9':  { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], barres: [], baseFret: 1 },
  'C5':     { frets: [-1, 3, 5, 5, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  'C6':     { frets: [-1, 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0], barres: [], baseFret: 1 },
  'Cm6':    { frets: [-1, 3, 1, 2, 1, 3], fingers: [0, 3, 1, 2, 1, 4], barres: [{ fret: 1, from: 2, to: 4 }], baseFret: 1 },
  'C9':     { frets: [-1, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 4], barres: [{ fret: 3, from: 3, to: 5 }], baseFret: 1 },
  'Cm9':    { frets: [-1, 3, 1, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 4], barres: [{ fret: 3, from: 3, to: 5 }], baseFret: 1 },
  'Cmaj9':  { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
  'Cdim7':  { frets: [-1, 3, 4, 2, 4, 2], fingers: [0, 2, 3, 1, 4, 1], barres: [], baseFret: 1 },
  'Cm7b5':  { frets: [-1, 3, 4, 3, 4, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'C7sus4': { frets: [-1, 3, 3, 3, 1, 1], fingers: [0, 2, 3, 4, 1, 1], barres: [{ fret: 1, from: 4, to: 5 }], baseFret: 1 },
  'C7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 3 },
  'Cmadd9': { frets: [-1, 3, 1, 0, 1, 0], fingers: [0, 4, 2, 0, 1, 0], barres: [], baseFret: 1 },
  'C11':    { frets: [-1, 3, 3, 3, 3, 3], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 3, from: 1, to: 5 }], baseFret: 1 },
  'Cm11':   { frets: [-1, 3, 1, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 4], barres: [{ fret: 3, from: 3, to: 5 }], baseFret: 1 },

  // ---- C# / Db chords ----
  'C#':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#m':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#m7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#maj7': { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 2, 4, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'C#sus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'C#sus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#dim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 4 },
  'C#aug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 4 },
  'C#add9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'C#5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 4 },
  'C#6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#m6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 4 },
  'C#m9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 4 },
  'C#maj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'C#dim7':  { frets: [-1, 4, 5, 3, 5, 3], fingers: [0, 2, 3, 1, 4, 1], barres: [], baseFret: 1 },
  'C#m7b5':  { frets: [-1, 4, 5, 4, 5, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'C#7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'C#7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 4 },
  'C#madd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'C#11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'C#m11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 4 },

  'Db':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Dbm':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Db7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Dbm7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Dbmaj7': { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 2, 4, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Dbsus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'Dbsus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Dbdim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 4 },
  'Dbaug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 4 },
  'Dbadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'Db5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 4 },
  'Db6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Dbm6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Db9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 4 },
  'Dbm9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 4 },
  'Dbmaj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'Dbdim7':  { frets: [-1, 4, 5, 3, 5, 3], fingers: [0, 2, 3, 1, 4, 1], barres: [], baseFret: 1 },
  'Dbm7b5':  { frets: [-1, 4, 5, 4, 5, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'Db7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 4 },
  'Db7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 4 },
  'Dbmadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'Db11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 4 },
  'Dbm11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 4 },

  // ---- D chords ----
  'D':      { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], barres: [], baseFret: 1 },
  'Dm':     { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], barres: [], baseFret: 1 },
  'D7':     { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], barres: [], baseFret: 1 },
  'Dm7':    { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [{ fret: 1, from: 4, to: 5 }], baseFret: 1 },
  'Dmaj7':  { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], barres: [], baseFret: 1 },
  'Dsus2':  { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [], baseFret: 1 },
  'Dsus4':  { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], barres: [], baseFret: 1 },
  'Ddim':   { frets: [-1, -1, 0, 1, 3, 1], fingers: [0, 0, 0, 1, 3, 2], barres: [], baseFret: 1 },
  'Daug':   { frets: [-1, -1, 0, 3, 3, 2], fingers: [0, 0, 0, 2, 3, 1], barres: [], baseFret: 1 },
  'Dadd9':  { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [], baseFret: 1 },
  'D5':     { frets: [-1, -1, 0, 2, 3, -1], fingers: [0, 0, 0, 1, 2, 0], barres: [], baseFret: 1 },
  'D6':     { frets: [-1, -1, 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2], barres: [], baseFret: 1 },
  'Dm6':    { frets: [-1, -1, 0, 2, 0, 1], fingers: [0, 0, 0, 2, 0, 1], barres: [], baseFret: 1 },
  'D9':     { frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 3, 1, 0], barres: [], baseFret: 1 },
  'Dm9':    { frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0], barres: [], baseFret: 1 },
  'Dmaj9':  { frets: [-1, -1, 0, 2, 2, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [], baseFret: 1 },
  'Ddim7':  { frets: [-1, -1, 0, 1, 0, 1], fingers: [0, 0, 0, 1, 0, 2], barres: [], baseFret: 1 },
  'Dm7b5':  { frets: [-1, -1, 0, 1, 1, 1], fingers: [0, 0, 0, 1, 1, 1], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 1 },
  'D7sus4': { frets: [-1, -1, 0, 2, 1, 3], fingers: [0, 0, 0, 2, 1, 3], barres: [], baseFret: 1 },
  'D7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 5 },
  'Dmadd9': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], baseFret: 1, barres: [] },
  'D11':    { frets: [-1, -1, 0, 0, 1, 0], fingers: [0, 0, 0, 0, 1, 0], barres: [], baseFret: 1 },
  'Dm11':   { frets: [-1, -1, 0, 0, 1, 1], fingers: [0, 0, 0, 0, 1, 2], barres: [], baseFret: 1 },

  // ---- D# / Eb chords ----
  'D#':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#m':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#m7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#maj7': { frets: [-1, 1, 1, 3, 3, 3], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#sus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'D#sus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#dim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 6 },
  'D#aug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 6 },
  'D#add9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'D#5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 6 },
  'D#6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#m6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 6 },
  'D#m9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 6 },
  'D#maj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'D#dim7':  { frets: [-1, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 6 },
  'D#m7b5':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 6 },
  'D#7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'D#7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 6 },
  'D#madd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'D#11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'D#m11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 6 },

  'Eb':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebm':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Eb7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebm7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebmaj7': { frets: [-1, 1, 1, 3, 3, 3], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebsus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'Ebsus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebdim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 6 },
  'Ebaug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 6 },
  'Ebadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'Eb5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 6 },
  'Eb6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Ebm6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Eb9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 6 },
  'Ebm9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 6 },
  'Ebmaj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'Ebdim7':  { frets: [-1, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 6 },
  'Ebm7b5':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 6 },
  'Eb7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 6 },
  'Eb7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 6 },
  'Ebmadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'Eb11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 6 },
  'Ebm11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 6 },

  // ---- E chords ----
  'E':      { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], barres: [], baseFret: 1 },
  'Em':     { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], barres: [], baseFret: 1 },
  'E7':     { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], barres: [], baseFret: 1 },
  'Em7':    { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0], barres: [], baseFret: 1 },
  'Emaj7':  { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], barres: [], baseFret: 1 },
  'Esus2':  { frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  'Esus4':  { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0], barres: [], baseFret: 1 },
  'Edim':   { frets: [0, 1, 2, 0, -1, -1], fingers: [0, 1, 2, 0, 0, 0], barres: [], baseFret: 1 },
  'Eaug':   { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], barres: [], baseFret: 1 },
  'Eadd9':  { frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4], barres: [], baseFret: 1 },
  'E5':     { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0], barres: [], baseFret: 1 },
  'E6':     { frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0], barres: [], baseFret: 1 },
  'Em6':    { frets: [0, 2, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 1 },
  'E9':     { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3], barres: [], baseFret: 1 },
  'Em9':    { frets: [0, 2, 0, 0, 0, 2], fingers: [0, 1, 0, 0, 0, 2], barres: [], baseFret: 1 },
  'Emaj9':  { frets: [0, 2, 1, 1, 0, 2], fingers: [0, 2, 1, 1, 0, 3], barres: [{ fret: 1, from: 2, to: 3 }], baseFret: 1 },
  'Edim7':  { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 1 },
  'Em7b5':  { frets: [0, 1, 0, 0, 3, 0], fingers: [0, 1, 0, 0, 3, 0], barres: [], baseFret: 1 },
  'E7sus4': { frets: [0, 2, 0, 2, 0, 0], fingers: [0, 1, 0, 2, 0, 0], barres: [], baseFret: 1 },
  'E7#9':   { frets: [0, 2, 1, 2, 3, 3], fingers: [0, 2, 1, 3, 4, 4], barres: [{ fret: 3, from: 4, to: 5 }], baseFret: 1 },
  'Emadd9': { frets: [0, 2, 2, 0, 0, 2], fingers: [0, 2, 3, 0, 0, 4], barres: [], baseFret: 1 },
  'E11':    { frets: [0, 0, 0, 1, 0, 0], fingers: [0, 0, 0, 1, 0, 0], barres: [], baseFret: 1 },
  'Em11':   { frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0], barres: [], baseFret: 1 },

  // ---- F chords ----
  'F':      { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm':     { frets: [1, 1, 1, 3, 4, 3], fingers: [1, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'F7':     { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm7':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fmaj7':  { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], barres: [], baseFret: 1 },
  'Fsus2':  { frets: [-1, -1, 3, 0, 1, 1], fingers: [0, 0, 3, 0, 1, 1], barres: [{ fret: 1, from: 4, to: 5 }], baseFret: 1 },
  'Fsus4':  { frets: [1, 1, 3, 3, 1, 1], fingers: [1, 1, 3, 4, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fdim':   { frets: [-1, -1, 3, 1, 0, 1], fingers: [0, 0, 4, 1, 0, 2], barres: [], baseFret: 1 },
  'Faug':   { frets: [-1, -1, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1], barres: [], baseFret: 1 },
  'Fadd9':  { frets: [-1, -1, 3, 2, 1, 3], fingers: [0, 0, 3, 2, 1, 4], barres: [], baseFret: 1 },
  'F5':     { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 1 },
  'F6':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm6':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'F9':     { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 1 },
  'Fmaj9':  { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 4, 3, 1, 0], barres: [], baseFret: 1 },
  'Fdim7':  { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm7b5':  { frets: [1, 2, 1, 1, -1, -1], fingers: [1, 4, 2, 3, 0, 0], barres: [], baseFret: 1 },
  'F7sus4': { frets: [1, 1, 1, 3, 1, 1], fingers: [1, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'F7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 1 },
  'Fmadd9': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'F11':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },
  'Fm11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 1 },

  // ---- F# / Gb chords ----
  'F#':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m':    { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#7':    { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m7':   { frets: [1, 1, 2, 1, 2, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#maj7': { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#sus2': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#sus4': { frets: [1, 1, 3, 3, 1, 1], fingers: [1, 1, 3, 4, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#dim':  { frets: [-1, -1, 4, 2, 1, 2], fingers: [0, 0, 4, 2, 1, 3], barres: [], baseFret: 1 },
  'F#aug':  { frets: [-1, -1, 4, 3, 3, 2], fingers: [0, 0, 4, 2, 3, 1], barres: [], baseFret: 1 },
  'F#add9': { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#5':     { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 2 },
  'F#6':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m6':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 2 },
  'F#9':     { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 2 },
  'F#maj9':  { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#dim7':  { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m7b5':  { frets: [1, 2, 1, 1, -1, -1], fingers: [1, 4, 2, 3, 0, 0], barres: [], baseFret: 2 },
  'F#7sus4': { frets: [1, 1, 1, 3, 1, 1], fingers: [1, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 2 },
  'F#madd9': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#11':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'F#m11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },

  'Gb':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm':    { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gb7':    { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm7':   { frets: [1, 1, 2, 1, 2, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbmaj7': { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbsus2': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbsus4': { frets: [1, 1, 3, 3, 1, 1], fingers: [1, 1, 3, 4, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbdim':  { frets: [-1, -1, 4, 2, 1, 2], fingers: [0, 0, 4, 2, 1, 3], barres: [], baseFret: 1 },
  'Gbaug':  { frets: [-1, -1, 4, 3, 3, 2], fingers: [0, 0, 4, 2, 3, 1], barres: [], baseFret: 1 },
  'Gbadd9': { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gb5':     { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 2 },
  'Gb6':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm6':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 2 },
  'Gb9':     { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 2 },
  'Gbmaj9':  { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbdim7':  { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm7b5':  { frets: [1, 2, 1, 1, -1, -1], fingers: [1, 4, 2, 3, 0, 0], barres: [], baseFret: 2 },
  'Gb7sus4': { frets: [1, 1, 1, 3, 1, 1], fingers: [1, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gb7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 2 },
  'Gbmadd9': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gb11':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },
  'Gbm11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 2 },

  // ---- G chords ----
  'G':      { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barres: [], baseFret: 1 },
  'Gm':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 3 },
  'G7':     { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], barres: [], baseFret: 1 },
  'Gm7':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 3 },
  'Gmaj7':  { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2], barres: [], baseFret: 1 },
  'Gsus2':  { frets: [3, 0, 0, 0, 3, 3], fingers: [1, 0, 0, 0, 2, 3], barres: [], baseFret: 1 },
  'Gsus4':  { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], barres: [], baseFret: 1 },
  'Gdim':   { frets: [3, 1, 0, 3, -1, -1], fingers: [2, 1, 0, 3, 0, 0], barres: [], baseFret: 1 },
  'Gaug':   { frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4], barres: [], baseFret: 1 },
  'Gadd9':  { frets: [3, 0, 0, 0, 0, 3], fingers: [1, 0, 0, 0, 0, 2], barres: [], baseFret: 1 },
  'G5':     { frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 1 },
  'G6':     { frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0], barres: [], baseFret: 1 },
  'Gm6':    { frets: [3, 1, 0, 0, 3, 0], fingers: [2, 1, 0, 0, 3, 0], barres: [], baseFret: 1 },
  'G9':     { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], barres: [], baseFret: 1 },
  'Gm9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 3 },
  'Gmaj9':  { frets: [3, 0, 0, 0, 0, 2], fingers: [2, 0, 0, 0, 0, 1], barres: [], baseFret: 1 },
  'Gdim7':  { frets: [3, 1, 2, 0, 2, 0], fingers: [3, 1, 2, 0, 4, 0], barres: [], baseFret: 1 },
  'Gm7b5':  { frets: [3, 1, 0, 3, -1, -1], fingers: [2, 1, 0, 3, 0, 0], barres: [], baseFret: 1 },
  'G7sus4': { frets: [3, 3, 0, 0, 1, 1], fingers: [3, 4, 0, 0, 1, 1], barres: [{ fret: 1, from: 4, to: 5 }], baseFret: 1 },
  'G7#9':   { frets: [3, 2, 0, 1, 0, 1], fingers: [4, 3, 0, 1, 0, 2], barres: [], baseFret: 1 },
  'Gmadd9': { frets: [3, 1, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barres: [], baseFret: 1 },
  'G11':    { frets: [3, 3, 0, 0, 1, 1], fingers: [3, 4, 0, 0, 1, 2], barres: [], baseFret: 1 },
  'Gm11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 3 },

  // ---- G# / Ab chords ----
  'G#':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#m':    { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#7':    { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#m7':   { frets: [1, 1, 2, 1, 2, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#maj7': { frets: [1, 1, 2, 2, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#sus2': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#sus4': { frets: [1, 1, 3, 3, 1, 1], fingers: [1, 1, 3, 4, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#dim':  { frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], barres: [], baseFret: 4 },
  'G#aug':  { frets: [-1, -1, 2, 1, 1, 0], fingers: [0, 0, 3, 1, 2, 0], barres: [], baseFret: 4 },
  'G#add9': { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#5':     { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 4 },
  'G#6':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#m6':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 4 },
  'G#9':     { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#m9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 4 },
  'G#maj9':  { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#dim7':  { frets: [-1, 0, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], barres: [], baseFret: 1 },
  'G#m7b5':  { frets: [1, 2, 1, 1, -1, -1], fingers: [1, 4, 2, 3, 0, 0], barres: [], baseFret: 4 },
  'G#7sus4': { frets: [1, 1, 1, 3, 1, 1], fingers: [1, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 4 },
  'G#madd9': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#11':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'G#m11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },

  'Ab':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abm':    { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Ab7':    { frets: [1, 1, 2, 1, 3, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abm7':   { frets: [1, 1, 2, 1, 2, 1], fingers: [1, 1, 2, 1, 3, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abmaj7': { frets: [1, 1, 2, 2, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Absus2': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Absus4': { frets: [1, 1, 3, 3, 1, 1], fingers: [1, 1, 3, 4, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abdim':  { frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], barres: [], baseFret: 4 },
  'Abaug':  { frets: [-1, -1, 2, 1, 1, 0], fingers: [0, 0, 3, 1, 2, 0], barres: [], baseFret: 4 },
  'Abadd9': { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Ab5':     { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 4 },
  'Ab6':     { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abm6':    { frets: [1, 1, 1, 3, 2, 3], fingers: [1, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 4 },
  'Ab9':     { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abm9':    { frets: [1, 1, 0, 1, 0, 1], fingers: [1, 1, 0, 2, 0, 3], barres: [{ fret: 1, from: 0, to: 1 }], baseFret: 4 },
  'Abmaj9':  { frets: [1, 1, 2, 3, 1, 1], fingers: [1, 1, 2, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abdim7':  { frets: [-1, 0, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], barres: [], baseFret: 1 },
  'Abm7b5':  { frets: [1, 2, 1, 1, -1, -1], fingers: [1, 4, 2, 3, 0, 0], barres: [], baseFret: 4 },
  'Ab7sus4': { frets: [1, 1, 1, 3, 1, 1], fingers: [1, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Ab7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 4 },
  'Abmadd9': { frets: [1, 1, 1, 3, 4, 1], fingers: [1, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Ab11':    { frets: [1, 1, 1, 1, 1, 1], fingers: [1, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },
  'Abm11':   { frets: [1, 1, 0, 1, 1, 1], fingers: [1, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 0, to: 5 }], baseFret: 4 },

  // ---- A chords ----
  'A':      { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [], baseFret: 1 },
  'Am':     { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], barres: [], baseFret: 1 },
  'A7':     { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], barres: [], baseFret: 1 },
  'Am7':    { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], barres: [], baseFret: 1 },
  'Amaj7':  { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], barres: [], baseFret: 1 },
  'Asus2':  { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], barres: [], baseFret: 1 },
  'Asus4':  { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [], baseFret: 1 },
  'Adim':   { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0], barres: [], baseFret: 1 },
  'Aaug':   { frets: [-1, 0, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1], barres: [], baseFret: 1 },
  'Aadd9':  { frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 2, 3, 4], barres: [], baseFret: 1 },
  'A5':     { frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 2, 0, 0], barres: [], baseFret: 1 },
  'A6':     { frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], barres: [{ fret: 2, from: 2, to: 5 }], baseFret: 1 },
  'Am6':    { frets: [-1, 0, 2, 2, 1, 2], fingers: [0, 0, 2, 3, 1, 4], barres: [], baseFret: 1 },
  'A9':     { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], barres: [], baseFret: 1 },
  'Am9':    { frets: [-1, 0, 2, 1, 1, 0], fingers: [0, 0, 3, 1, 2, 0], barres: [], baseFret: 1 },
  'Amaj9':  { frets: [-1, 0, 2, 1, 2, 2], fingers: [0, 0, 2, 1, 3, 4], barres: [], baseFret: 1 },
  'Adim7':  { frets: [-1, 0, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], barres: [], baseFret: 1 },
  'Am7b5':  { frets: [-1, 0, 1, 2, 1, 3], fingers: [0, 0, 1, 2, 1, 4], barres: [{ fret: 1, from: 2, to: 4 }], baseFret: 1 },
  'A7sus4': { frets: [-1, 0, 2, 0, 3, 0], fingers: [0, 0, 1, 0, 3, 0], barres: [], baseFret: 1 },
  'A7#9':   { frets: [-1, 0, 2, 0, 2, 3], fingers: [0, 0, 1, 0, 2, 3], barres: [], baseFret: 1 },
  'Amadd9': { frets: [-1, 0, 2, 1, 1, 0], fingers: [0, 0, 3, 2, 1, 0], barres: [], baseFret: 1 },
  'A11':    { frets: [-1, 0, 0, 0, 2, 0], fingers: [0, 0, 0, 0, 1, 0], barres: [], baseFret: 1 },
  'Am11':   { frets: [-1, 0, 0, 0, 1, 0], fingers: [0, 0, 0, 0, 1, 0], barres: [], baseFret: 1 },

  // ---- A# / Bb chords ----
  'A#':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#m':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#m7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#maj7': { frets: [-1, 1, 1, 3, 3, 3], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#sus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'A#sus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#dim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 1 },
  'A#aug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'A#add9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'A#5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  'A#6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#m6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 1 },
  'A#m9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 1 },
  'A#maj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'A#dim7':  { frets: [-1, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 1 },
  'A#m7b5':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'A#7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'A#7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 1 },
  'A#madd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'A#11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'A#m11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 1 },

  'Bb':     { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbm':    { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bb7':    { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbm7':   { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbmaj7': { frets: [-1, 1, 1, 3, 3, 3], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbsus2': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'Bbsus4': { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbdim':  { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 1 },
  'Bbaug':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'Bbadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'Bb5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  'Bb6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bbm6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bb9':     { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 1 },
  'Bbm9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 1 },
  'Bbmaj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'Bbdim7':  { frets: [-1, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [], baseFret: 1 },
  'Bbm7b5':  { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'Bb7sus4': { frets: [-1, 1, 1, 3, 2, 2], fingers: [0, 1, 1, 4, 2, 3], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },
  'Bb7#9':   { frets: [-1, 1, 0, 1, 2, 2], fingers: [0, 1, 0, 2, 3, 4], barres: [], baseFret: 1 },
  'Bbmadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'Bb11':    { frets: [-1, 1, 1, 1, 1, 1], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 1 },
  'Bbm11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 1 },

  // ---- B chords ----
  'B':      { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'Bm':     { frets: [-1, 1, 1, 3, 4, 3], fingers: [0, 1, 1, 3, 4, 2], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'B7':     { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], barres: [], baseFret: 1 },
  'Bm7':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'Bmaj7':  { frets: [-1, 1, 1, 3, 3, 3], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'Bsus2':  { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 2 },
  'Bsus4':  { frets: [-1, 1, 1, 3, 4, 4], fingers: [0, 1, 1, 2, 3, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'Bdim':   { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [], baseFret: 2 },
  'Baug':   { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 2 },
  'Badd9':  { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 2 },
  'B5':     { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 2 },
  'B6':     { frets: [-1, 1, 1, 3, 2, 4], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'Bm6':    { frets: [-1, 1, 1, 3, 2, 3], fingers: [0, 1, 1, 3, 2, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 2 },
  'B9':     { frets: [-1, 2, 1, 2, 2, 2], fingers: [0, 2, 1, 3, 3, 4], barres: [{ fret: 2, from: 3, to: 5 }], baseFret: 1 },
  'Bm9':    { frets: [-1, 1, 0, 1, 0, 1], fingers: [0, 1, 0, 2, 0, 3], barres: [], baseFret: 2 },
  'Bmaj9':  { frets: [-1, 1, 1, 3, 1, 1], fingers: [0, 1, 1, 3, 1, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 2 },
  'Bdim7':  { frets: [-1, 2, 3, 1, 3, 1], fingers: [0, 2, 3, 1, 4, 1], barres: [], baseFret: 1 },
  'Bm7b5':  { frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0], barres: [], baseFret: 1 },
  'B7sus4': { frets: [-1, 2, 2, 2, 0, 2], fingers: [0, 1, 1, 1, 0, 2], barres: [{ fret: 2, from: 1, to: 3 }], baseFret: 1 },
  'B7#9':   { frets: [-1, 2, 1, 2, 3, 3], fingers: [0, 2, 1, 3, 4, 4], barres: [{ fret: 3, from: 4, to: 5 }], baseFret: 1 },
  'Bmadd9': { frets: [-1, 1, 1, 3, 4, 1], fingers: [0, 1, 1, 3, 4, 1], barres: [{ fret: 1, from: 1, to: 5 }], baseFret: 2 },
  'B11':    { frets: [-1, 2, 2, 2, 2, 2], fingers: [0, 1, 1, 1, 1, 1], barres: [{ fret: 2, from: 1, to: 5 }], baseFret: 1 },
  'Bm11':   { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 2, 2], barres: [{ fret: 1, from: 3, to: 5 }], baseFret: 2 },
};

// ---------------------------------------------------------------------------
// UKULELE — 4 strings, standard tuning G-C-E-A (index 0 = G4)
// ---------------------------------------------------------------------------

export const UKULELE = {
  // ---- C chords ----
  'C':      { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], barres: [], baseFret: 1 },
  'Cm':     { frets: [0, 3, 3, 3], fingers: [0, 1, 2, 3], barres: [], baseFret: 1 },
  'C7':     { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1], barres: [], baseFret: 1 },
  'Cm7':    { frets: [3, 3, 3, 3], fingers: [1, 1, 1, 1], barres: [{ fret: 3, from: 0, to: 3 }], baseFret: 1 },
  'Cmaj7':  { frets: [0, 0, 0, 2], fingers: [0, 0, 0, 1], barres: [], baseFret: 1 },
  'Cdim':   { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Caug':   { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 3], barres: [], baseFret: 1 },

  // ---- C# / Db chords ----
  'C#':     { frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'C#m':    { frets: [1, 4, 4, 4], fingers: [1, 2, 3, 4], barres: [], baseFret: 1 },
  'C#7':    { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'C#m7':   { frets: [4, 4, 4, 4], fingers: [1, 1, 1, 1], barres: [{ fret: 4, from: 0, to: 3 }], baseFret: 1 },
  'C#maj7': { frets: [1, 1, 1, 3], fingers: [1, 1, 1, 3], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'C#dim':  { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2], barres: [], baseFret: 1 },
  'C#aug':  { frets: [2, 1, 1, 4], fingers: [2, 1, 1, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },

  'Db':     { frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'Dbm':    { frets: [1, 4, 4, 4], fingers: [1, 2, 3, 4], barres: [], baseFret: 1 },
  'Db7':    { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'Dbm7':   { frets: [4, 4, 4, 4], fingers: [1, 1, 1, 1], barres: [{ fret: 4, from: 0, to: 3 }], baseFret: 1 },
  'Dbmaj7': { frets: [1, 1, 1, 3], fingers: [1, 1, 1, 3], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },
  'Dbdim':  { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2], barres: [], baseFret: 1 },
  'Dbaug':  { frets: [2, 1, 1, 4], fingers: [2, 1, 1, 4], barres: [{ fret: 1, from: 1, to: 2 }], baseFret: 1 },

  // ---- D chords ----
  'D':      { frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0], barres: [], baseFret: 1 },
  'Dm':     { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], barres: [], baseFret: 1 },
  'D7':     { frets: [2, 2, 2, 3], fingers: [1, 1, 1, 2], barres: [{ fret: 2, from: 0, to: 2 }], baseFret: 1 },
  'Dm7':    { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4], barres: [], baseFret: 1 },
  'Dmaj7':  { frets: [2, 2, 2, 4], fingers: [1, 1, 1, 4], barres: [{ fret: 2, from: 0, to: 2 }], baseFret: 1 },
  'Ddim':   { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Daug':   { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1], barres: [], baseFret: 1 },

  // ---- D# / Eb chords ----
  'D#':     { frets: [3, 3, 3, 1], fingers: [2, 3, 4, 1], barres: [], baseFret: 1 },
  'D#m':    { frets: [3, 3, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'D#7':    { frets: [3, 3, 3, 4], fingers: [1, 1, 1, 2], barres: [{ fret: 3, from: 0, to: 2 }], baseFret: 1 },
  'D#m7':   { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4], barres: [], baseFret: 1 },
  'D#maj7': { frets: [3, 3, 3, 5], fingers: [1, 1, 1, 4], barres: [{ fret: 3, from: 0, to: 2 }], baseFret: 1 },
  'D#dim':  { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'D#aug':  { frets: [0, 3, 3, 2], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },

  'Eb':     { frets: [3, 3, 3, 1], fingers: [2, 3, 4, 1], barres: [], baseFret: 1 },
  'Ebm':    { frets: [3, 3, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'Eb7':    { frets: [3, 3, 3, 4], fingers: [1, 1, 1, 2], barres: [{ fret: 3, from: 0, to: 2 }], baseFret: 1 },
  'Ebm7':   { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4], barres: [], baseFret: 1 },
  'Ebmaj7': { frets: [3, 3, 3, 5], fingers: [1, 1, 1, 4], barres: [{ fret: 3, from: 0, to: 2 }], baseFret: 1 },
  'Ebdim':  { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Ebaug':  { frets: [0, 3, 3, 2], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },

  // ---- E chords ----
  'E':      { frets: [4, 4, 4, 2], fingers: [2, 3, 4, 1], barres: [], baseFret: 1 },
  'Em':     { frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], barres: [], baseFret: 1 },
  'E7':     { frets: [1, 2, 0, 2], fingers: [1, 2, 0, 3], barres: [], baseFret: 1 },
  'Em7':    { frets: [0, 2, 0, 2], fingers: [0, 1, 0, 2], barres: [], baseFret: 1 },
  'Emaj7':  { frets: [1, 3, 0, 2], fingers: [1, 3, 0, 2], barres: [], baseFret: 1 },
  'Edim':   { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2], barres: [], baseFret: 3 },
  'Eaug':   { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4], barres: [], baseFret: 1 },

  // ---- F chords ----
  'F':      { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], barres: [], baseFret: 1 },
  'Fm':     { frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4], barres: [], baseFret: 1 },
  'F7':     { frets: [2, 3, 1, 0], fingers: [2, 3, 1, 0], barres: [], baseFret: 1 },
  'Fm7':    { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Fmaj7':  { frets: [2, 4, 1, 0], fingers: [2, 4, 1, 0], barres: [], baseFret: 1 },
  'Fdim':   { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Faug':   { frets: [2, 1, 1, 0], fingers: [3, 1, 2, 0], barres: [], baseFret: 1 },

  // ---- F# / Gb chords ----
  'F#':     { frets: [3, 1, 2, 1], fingers: [3, 1, 2, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },
  'F#m':    { frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0], barres: [], baseFret: 1 },
  'F#7':    { frets: [3, 4, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'F#m7':   { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'F#maj7': { frets: [3, 5, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'F#dim':  { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'F#aug':  { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1], barres: [], baseFret: 1 },

  'Gb':     { frets: [3, 1, 2, 1], fingers: [3, 1, 2, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },
  'Gbm':    { frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0], barres: [], baseFret: 1 },
  'Gb7':    { frets: [3, 4, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'Gbm7':   { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Gbmaj7': { frets: [3, 5, 2, 1], fingers: [3, 4, 2, 1], barres: [], baseFret: 1 },
  'Gbdim':  { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Gbaug':  { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1], barres: [], baseFret: 1 },

  // ---- G chords ----
  'G':      { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], barres: [], baseFret: 1 },
  'Gm':     { frets: [0, 2, 3, 1], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },
  'G7':     { frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], barres: [], baseFret: 1 },
  'Gm7':    { frets: [0, 2, 1, 1], fingers: [0, 2, 1, 1], barres: [{ fret: 1, from: 2, to: 3 }], baseFret: 1 },
  'Gmaj7':  { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3], barres: [], baseFret: 1 },
  'Gdim':   { frets: [0, 1, 3, 1], fingers: [0, 1, 3, 2], barres: [], baseFret: 1 },
  'Gaug':   { frets: [0, 3, 3, 2], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },

  // ---- G# / Ab chords ----
  'G#':     { frets: [1, 3, 4, 3], fingers: [1, 2, 4, 3], barres: [], baseFret: 1 },
  'G#m':    { frets: [1, 3, 4, 2], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'G#7':    { frets: [1, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'G#m7':   { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3], barres: [], baseFret: 1 },
  'G#maj7': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4], barres: [], baseFret: 1 },
  'G#dim':  { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'G#aug':  { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4], barres: [], baseFret: 1 },

  'Ab':     { frets: [1, 3, 4, 3], fingers: [1, 2, 4, 3], barres: [], baseFret: 1 },
  'Abm':    { frets: [1, 3, 4, 2], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'Ab7':    { frets: [1, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Abm7':   { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3], barres: [], baseFret: 1 },
  'Abmaj7': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4], barres: [], baseFret: 1 },
  'Abdim':  { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Abaug':  { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4], barres: [], baseFret: 1 },

  // ---- A chords ----
  'A':      { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0], barres: [], baseFret: 1 },
  'Am':     { frets: [2, 0, 0, 0], fingers: [1, 0, 0, 0], barres: [], baseFret: 1 },
  'A7':     { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0], barres: [], baseFret: 1 },
  'Am7':    { frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0], barres: [], baseFret: 1 },
  'Amaj7':  { frets: [1, 1, 0, 0], fingers: [1, 2, 0, 0], barres: [], baseFret: 1 },
  'Adim':   { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Aaug':   { frets: [2, 1, 1, 0], fingers: [3, 1, 2, 0], barres: [], baseFret: 1 },

  // ---- A# / Bb chords ----
  'A#':     { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], barres: [{ fret: 1, from: 2, to: 3 }], baseFret: 1 },
  'A#m':    { frets: [3, 1, 1, 1], fingers: [3, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },
  'A#7':    { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 1], barres: [{ fret: 1, from: 0, to: 3 }], baseFret: 1 },
  'A#m7':   { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 3 }], baseFret: 1 },
  'A#maj7': { frets: [3, 2, 1, 0], fingers: [3, 2, 1, 0], barres: [], baseFret: 1 },
  'A#dim':  { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'A#aug':  { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1], barres: [], baseFret: 1 },

  'Bb':     { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], barres: [{ fret: 1, from: 2, to: 3 }], baseFret: 1 },
  'Bbm':    { frets: [3, 1, 1, 1], fingers: [3, 1, 1, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },
  'Bb7':    { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 1], barres: [{ fret: 1, from: 0, to: 3 }], baseFret: 1 },
  'Bbm7':   { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1], barres: [{ fret: 1, from: 0, to: 3 }], baseFret: 1 },
  'Bbmaj7': { frets: [3, 2, 1, 0], fingers: [3, 2, 1, 0], barres: [], baseFret: 1 },
  'Bbdim':  { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], barres: [], baseFret: 1 },
  'Bbaug':  { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1], barres: [], baseFret: 1 },

  // ---- B chords ----
  'B':      { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 1], barres: [{ fret: 2, from: 2, to: 3 }], baseFret: 1 },
  'Bm':     { frets: [4, 2, 2, 2], fingers: [4, 1, 1, 1], barres: [{ fret: 2, from: 1, to: 3 }], baseFret: 1 },
  'B7':     { frets: [2, 3, 2, 2], fingers: [1, 2, 1, 1], barres: [{ fret: 2, from: 0, to: 3 }], baseFret: 1 },
  'Bm7':    { frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1], barres: [{ fret: 2, from: 0, to: 3 }], baseFret: 1 },
  'Bmaj7':  { frets: [4, 3, 2, 1], fingers: [4, 3, 2, 1], barres: [], baseFret: 1 },
  'Bdim':   { frets: [4, 2, 1, 2], fingers: [4, 2, 1, 3], barres: [], baseFret: 1 },
  'Baug':   { frets: [0, 3, 3, 2], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },
};

// ---------------------------------------------------------------------------
// BASS — 4 strings, standard tuning E-A-D-G (index 0 = low E)
// ---------------------------------------------------------------------------

export const BASS = {
  // ---- C chords ----
  'C':      { frets: [-1, 3, 2, 0], fingers: [0, 3, 2, 0], barres: [], baseFret: 1 },
  'Cm':     { frets: [-1, 3, 1, 0], fingers: [0, 3, 1, 0], barres: [], baseFret: 1 },
  'C7':     { frets: [-1, 3, 2, 3], fingers: [0, 2, 1, 3], barres: [], baseFret: 1 },

  // ---- C# / Db chords ----
  'C#':     { frets: [-1, 4, 3, 1], fingers: [0, 3, 2, 1], barres: [], baseFret: 1 },
  'C#m':    { frets: [-1, 4, 2, 1], fingers: [0, 4, 2, 1], barres: [], baseFret: 1 },
  'C#7':    { frets: [-1, 4, 3, 4], fingers: [0, 2, 1, 3], barres: [], baseFret: 1 },
  'Db':     { frets: [-1, 4, 3, 1], fingers: [0, 3, 2, 1], barres: [], baseFret: 1 },
  'Dbm':    { frets: [-1, 4, 2, 1], fingers: [0, 4, 2, 1], barres: [], baseFret: 1 },
  'Db7':    { frets: [-1, 4, 3, 4], fingers: [0, 2, 1, 3], barres: [], baseFret: 1 },

  // ---- D chords ----
  'D':      { frets: [-1, -1, 0, 2], fingers: [0, 0, 0, 2], barres: [], baseFret: 1 },
  'Dm':     { frets: [-1, -1, 0, 1], fingers: [0, 0, 0, 1], barres: [], baseFret: 1 },
  'D7':     { frets: [-1, -1, 0, 5], fingers: [0, 0, 0, 4], barres: [], baseFret: 1 },

  // ---- D# / Eb chords ----
  'D#':     { frets: [-1, -1, 1, 3], fingers: [0, 0, 1, 3], barres: [], baseFret: 1 },
  'D#m':    { frets: [-1, -1, 1, 2], fingers: [0, 0, 1, 2], barres: [], baseFret: 1 },
  'D#7':    { frets: [-1, -1, 1, 0], fingers: [0, 0, 1, 0], barres: [], baseFret: 1 },
  'Eb':     { frets: [-1, -1, 1, 3], fingers: [0, 0, 1, 3], barres: [], baseFret: 1 },
  'Ebm':    { frets: [-1, -1, 1, 2], fingers: [0, 0, 1, 2], barres: [], baseFret: 1 },
  'Eb7':    { frets: [-1, -1, 1, 0], fingers: [0, 0, 1, 0], barres: [], baseFret: 1 },

  // ---- E chords ----
  'E':      { frets: [0, 2, 2, 1], fingers: [0, 2, 3, 1], barres: [], baseFret: 1 },
  'Em':     { frets: [0, 2, 2, 0], fingers: [0, 1, 2, 0], barres: [], baseFret: 1 },
  'E7':     { frets: [0, 2, 0, 1], fingers: [0, 2, 0, 1], barres: [], baseFret: 1 },

  // ---- F chords ----
  'F':      { frets: [1, 3, 3, 2], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'Fm':     { frets: [1, 3, 3, 1], fingers: [1, 3, 4, 1], barres: [{ fret: 1, from: 0, to: 3 }], baseFret: 1 },
  'F7':     { frets: [1, 3, 1, 2], fingers: [1, 4, 1, 2], barres: [{ fret: 1, from: 0, to: 2 }], baseFret: 1 },

  // ---- F# / Gb chords ----
  'F#':     { frets: [2, 4, 4, 3], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'F#m':    { frets: [2, 4, 4, 2], fingers: [1, 3, 4, 1], barres: [{ fret: 2, from: 0, to: 3 }], baseFret: 1 },
  'F#7':    { frets: [2, 4, 2, 3], fingers: [1, 4, 1, 2], barres: [{ fret: 2, from: 0, to: 2 }], baseFret: 1 },
  'Gb':     { frets: [2, 4, 4, 3], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'Gbm':    { frets: [2, 4, 4, 2], fingers: [1, 3, 4, 1], barres: [{ fret: 2, from: 0, to: 3 }], baseFret: 1 },
  'Gb7':    { frets: [2, 4, 2, 3], fingers: [1, 4, 1, 2], barres: [{ fret: 2, from: 0, to: 2 }], baseFret: 1 },

  // ---- G chords ----
  'G':      { frets: [3, 5, 5, 4], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'Gm':     { frets: [3, 5, 5, 3], fingers: [1, 3, 4, 1], barres: [{ fret: 3, from: 0, to: 3 }], baseFret: 1 },
  'G7':     { frets: [3, 5, 3, 4], fingers: [1, 4, 1, 2], barres: [{ fret: 3, from: 0, to: 2 }], baseFret: 1 },

  // ---- G# / Ab chords ----
  'G#':     { frets: [4, 6, 6, 5], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'G#m':    { frets: [4, 6, 6, 4], fingers: [1, 3, 4, 1], barres: [{ fret: 4, from: 0, to: 3 }], baseFret: 1 },
  'G#7':    { frets: [4, 6, 4, 5], fingers: [1, 4, 1, 2], barres: [{ fret: 4, from: 0, to: 2 }], baseFret: 1 },
  'Ab':     { frets: [4, 6, 6, 5], fingers: [1, 3, 4, 2], barres: [], baseFret: 1 },
  'Abm':    { frets: [4, 6, 6, 4], fingers: [1, 3, 4, 1], barres: [{ fret: 4, from: 0, to: 3 }], baseFret: 1 },
  'Ab7':    { frets: [4, 6, 4, 5], fingers: [1, 4, 1, 2], barres: [{ fret: 4, from: 0, to: 2 }], baseFret: 1 },

  // ---- A chords ----
  'A':      { frets: [-1, 0, 2, 2], fingers: [0, 0, 1, 2], barres: [], baseFret: 1 },
  'Am':     { frets: [-1, 0, 2, 1], fingers: [0, 0, 2, 1], barres: [], baseFret: 1 },
  'A7':     { frets: [-1, 0, 2, 0], fingers: [0, 0, 1, 0], barres: [], baseFret: 1 },

  // ---- A# / Bb chords ----
  'A#':     { frets: [-1, 1, 3, 3], fingers: [0, 1, 3, 4], barres: [], baseFret: 1 },
  'A#m':    { frets: [-1, 1, 3, 2], fingers: [0, 1, 3, 2], barres: [], baseFret: 1 },
  'A#7':    { frets: [-1, 1, 3, 1], fingers: [0, 1, 3, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },
  'Bb':     { frets: [-1, 1, 3, 3], fingers: [0, 1, 3, 4], barres: [], baseFret: 1 },
  'Bbm':    { frets: [-1, 1, 3, 2], fingers: [0, 1, 3, 2], barres: [], baseFret: 1 },
  'Bb7':    { frets: [-1, 1, 3, 1], fingers: [0, 1, 3, 1], barres: [{ fret: 1, from: 1, to: 3 }], baseFret: 1 },

  // ---- B chords ----
  'B':      { frets: [-1, 2, 4, 4], fingers: [0, 1, 3, 4], barres: [], baseFret: 1 },
  'Bm':     { frets: [-1, 2, 4, 3], fingers: [0, 1, 3, 2], barres: [], baseFret: 1 },
  'B7':     { frets: [-1, 2, 4, 2], fingers: [0, 1, 3, 1], barres: [{ fret: 2, from: 1, to: 3 }], baseFret: 1 },
};

// ---------------------------------------------------------------------------
// PIANO — semitone offsets from root (instrument-agnostic intervals)
// ---------------------------------------------------------------------------

export const PIANO = {
  'major':  { keys: [0, 4, 7] },
  'minor':  { keys: [0, 3, 7] },
  '7':      { keys: [0, 4, 7, 10] },
  'm7':     { keys: [0, 3, 7, 10] },
  'maj7':   { keys: [0, 4, 7, 11] },
  'dim':    { keys: [0, 3, 6] },
  'aug':    { keys: [0, 4, 8] },
  'sus2':   { keys: [0, 2, 7] },
  'sus4':   { keys: [0, 5, 7] },
  'add9':   { keys: [0, 4, 7, 14] },
  '5':      { keys: [0, 7] },
  '6':      { keys: [0, 4, 7, 9] },
  'm6':     { keys: [0, 3, 7, 9] },
  '9':      { keys: [0, 4, 7, 10, 14] },
  'm9':     { keys: [0, 3, 7, 10, 14] },
  'maj9':   { keys: [0, 4, 7, 11, 14] },
  'dim7':   { keys: [0, 3, 6, 9] },
  'm7b5':   { keys: [0, 3, 6, 10] },
  '7sus4':  { keys: [0, 5, 7, 10] },
  '7#9':    { keys: [0, 4, 7, 10, 15] },
  'madd9':  { keys: [0, 3, 7, 14] },
  '11':     { keys: [0, 4, 7, 10, 14, 17] },
  'm11':    { keys: [0, 3, 7, 10, 14, 17] },
};

// ---------------------------------------------------------------------------
// INSTRUMENTS meta-index
// ---------------------------------------------------------------------------

export const INSTRUMENTS = {
  guitar:  { data: GUITAR,  strings: 6, name: 'guitarra' },
  ukulele: { data: UKULELE, strings: 4, name: 'ukelele' },
  bass:    { data: BASS,    strings: 4, name: 'bajo' },
  piano:   { data: PIANO,   strings: 0, name: 'piano' },
};

// ---------------------------------------------------------------------------
// lookupChord — universal chord lookup across instruments
// ---------------------------------------------------------------------------

const ENHARMONIC_MAP = {
  'Db': 'C#', 'C#': 'Db',
  'Eb': 'D#', 'D#': 'Eb',
  'Gb': 'F#', 'F#': 'Gb',
  'Ab': 'G#', 'G#': 'Ab',
  'Bb': 'A#', 'A#': 'Bb',
};

const PIANO_QUALITY_ALIASES = {
  '': 'major',
  'm': 'minor',
  'min': 'minor',
  '7': '7',
  'm7': 'm7',
  'min7': 'm7',
  'maj7': 'maj7',
  'dim': 'dim',
  'aug': 'aug',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  '5': '5',
  '6': '6',
  'm6': 'm6',
  'min6': 'm6',
  '9': '9',
  'm9': 'm9',
  'min9': 'm9',
  'maj9': 'maj9',
  'dim7': 'dim7',
  'm7b5': 'm7b5',
  '7sus4': '7sus4',
  '7#9': '7#9',
  'madd9': 'madd9',
  '11': '11',
  'm11': 'm11',
  'min11': 'm11',
};

/**
 * Parse a chord name into root and quality.
 * Examples: "C" -> ["C",""], "C#m7" -> ["C#","m7"], "Bbmaj7" -> ["Bb","maj7"]
 */
function parseChordName(name) {
  const match = name.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return [null, null];
  return [match[1], match[2]];
}

/**
 * Look up a chord by name for a given instrument.
 *
 * @param {string} chordName  e.g. "Am7", "F#", "Bbdim"
 * @param {string} instrument "guitar" | "ukulele" | "bass" | "piano"
 * @returns {object|null} chord data or null if not found
 */
export function lookupChord(chordName, instrument = 'guitar') {
  if (!chordName) return null;

  // --- Piano: return interval template keyed by quality ---
  if (instrument === 'piano') {
    const [root, quality] = parseChordName(chordName);
    if (!root) return null;
    const q = PIANO_QUALITY_ALIASES[quality];
    if (q && PIANO[q]) return PIANO[q];
    if (PIANO[quality]) return PIANO[quality];
    return null;
  }

  // --- Fretted instruments ---
  const inst = INSTRUMENTS[instrument];
  if (!inst) return null;
  const db = inst.data;

  // Exact match
  if (db[chordName]) return db[chordName];

  // Try enharmonic equivalent (swap root, keep quality)
  const [root, quality] = parseChordName(chordName);
  if (root && ENHARMONIC_MAP[root]) {
    const alt = ENHARMONIC_MAP[root] + quality;
    if (db[alt]) return db[alt];
  }

  return null;
}

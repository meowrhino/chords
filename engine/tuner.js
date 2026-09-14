// tuner.js — afinador por micrófono. Port de meowrhino/ukulele.
//
// Aquel era un HTML suelto con todo en globales (audioCtx, analyser,
// selectedString…) y los nodos cogidos con getElementById al cargar. Aquí la
// app es una SPA: se entra y se sale de la vista muchas veces, así que todo
// vive en un closure y `destroy()` suelta el micro y el AudioContext. Dejarlos
// abiertos mantiene el punto rojo de grabación encendido en el navegador.
//
// La detección de tono (AMDF + interpolación parabólica) es la misma: funciona.
// Lo que cambia es el envoltorio y que la afinación sale del instrumento.

// Afinaciones estándar, de cuerda 1 (la más aguda) hacia abajo.
export const TUNINGS = {
  guitar: [
    { note: 'E', freq: 329.63, string: 1 },
    { note: 'B', freq: 246.94, string: 2 },
    { note: 'G', freq: 196.00, string: 3 },
    { note: 'D', freq: 146.83, string: 4 },
    { note: 'A', freq: 110.00, string: 5 },
    { note: 'E', freq: 82.41, string: 6 },
  ],
  ukulele: [
    { note: 'A', freq: 440.00, string: 1 },
    { note: 'E', freq: 329.63, string: 2 },
    { note: 'C', freq: 261.63, string: 3 },
    { note: 'G', freq: 392.00, string: 4 },   // sol agudo: la 4ª suena por encima de la 3ª
  ],
  bass: [
    { note: 'G', freq: 98.00, string: 1 },
    { note: 'D', freq: 73.42, string: 2 },
    { note: 'A', freq: 55.00, string: 3 },
    { note: 'E', freq: 41.20, string: 4 },
  ],
  // El piano no se afina a oído desde el navegador: solo modo libre.
  piano: [],
};

const ALL_NOTES = [
  { note: 'C', freq: 261.63 }, { note: 'C#', freq: 277.18 },
  { note: 'D', freq: 293.66 }, { note: 'D#', freq: 311.13 },
  { note: 'E', freq: 329.63 }, { note: 'F', freq: 349.23 },
  { note: 'F#', freq: 369.99 }, { note: 'G', freq: 392.00 },
  { note: 'G#', freq: 415.30 }, { note: 'A', freq: 440.00 },
  { note: 'A#', freq: 466.16 }, { note: 'B', freq: 493.88 },
];

const cents = (freq, ref) => 1200 * Math.log2(freq / ref);

function closestNote(freq) {
  let best = null, minDist = Infinity;
  for (let oct = 1; oct <= 6; oct++) {
    const mult = Math.pow(2, oct - 4);
    for (const n of ALL_NOTES) {
      const f = n.freq * mult;
      const d = Math.abs(cents(freq, f));
      if (d < minDist) { minDist = d; best = { note: n.note, freq: f }; }
    }
  }
  return best;
}

// AMDF: para cada desplazamiento mide cuánto se parece la onda a sí misma.
// El pico da el periodo. La interpolación parabólica sobre los tres valores
// alrededor del pico afina el resultado entre muestras — sin ella el afinador
// salta de golpe varios cents en las cuerdas graves.
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  const MAX = Math.floor(SIZE / 2);
  const correlations = new Float32Array(MAX);
  let bestOffset = -1, bestCorrelation = 0, found = false, last = 1;

  for (let offset = 1; offset < MAX; offset++) {
    let c = 0;
    for (let i = 0; i < MAX; i++) c += Math.abs(buf[i] - buf[i + offset]);
    c = 1 - c / MAX;
    correlations[offset] = c;

    if (c > 0.9 && c > last) {
      found = true;
      if (c > bestCorrelation) { bestCorrelation = c; bestOffset = offset; }
    } else if (found) {
      if (bestOffset > 1 && bestOffset < MAX - 1) {
        const a = correlations[bestOffset - 1];
        const b = correlations[bestOffset];
        const d = correlations[bestOffset + 1];
        const denom = a - 2 * b + d;
        const shift = denom !== 0 ? (a - d) / (2 * denom) : 0;
        return sampleRate / (bestOffset + shift);
      }
      return sampleRate / bestOffset;
    }
    last = c;
  }
  if (bestCorrelation > 0.5 && bestOffset > 0) return sampleRate / bestOffset;
  return -1;
}

/**
 * Monta el afinador dentro de `container`.
 * @returns {{destroy: () => void, setInstrument: (name: string) => void}}
 */
export function createTuner(container, { instrument = 'guitar' } = {}) {
  let audioCtx = null, analyser = null, micStream = null, buffer = null;
  let listening = false, animFrame = null;
  let refCtx = null, refOsc = null, refGain = null;
  let selected = null;
  let strings = TUNINGS[instrument] || [];
  let lastStatus = '';

  container.innerHTML = `
    <div class="tuner">
      <div class="tuner-readout">
        <div class="tuner-note" data-el="note">—</div>
        <div class="tuner-freq" data-el="freq">micrófono apagado</div>
      </div>
      <div class="tuner-meter">
        <div class="tuner-meter-center"></div>
        <div class="tuner-meter-needle" data-el="needle"></div>
      </div>
      <div class="tuner-cents" data-el="cents">—</div>
      <div class="tuner-status" data-el="status">pulsa escuchar y toca una cuerda</div>
      <div class="tuner-strings" data-el="strings"></div>
      <div class="tuner-actions">
        <button class="control-btn" data-el="mic">escuchar</button>
        <button class="control-btn" data-el="ref">tono de referencia</button>
      </div>
    </div>`;

  const $ = (name) => container.querySelector(`[data-el="${name}"]`);
  const els = {
    note: $('note'), freq: $('freq'), needle: $('needle'), cents: $('cents'),
    status: $('status'), strings: $('strings'), mic: $('mic'), ref: $('ref'),
  };

  function setStatus(text) {
    if (text === lastStatus) return;   // el bucle corre a 60fps: sin esto repinta sin parar
    els.status.textContent = text;
    lastStatus = text;
  }

  function renderStrings() {
    if (!strings.length) {
      els.strings.innerHTML = '<span class="tuner-hint">modo libre: detecta la nota más cercana</span>';
      els.ref.style.display = 'none';
      return;
    }
    els.ref.style.display = '';
    els.strings.innerHTML = strings.map(s =>
      `<button class="control-btn tuner-string${selected?.string === s.string ? ' active' : ''}"
               data-string="${s.string}">${s.note}<small>${s.string}</small></button>`
    ).join('');
    for (const btn of els.strings.querySelectorAll('.tuner-string')) {
      btn.addEventListener('click', () => {
        const n = Number(btn.dataset.string);
        selected = selected?.string === n ? null : strings.find(s => s.string === n);
        stopRefTone();
        renderStrings();
        setStatus(selected ? `cuerda ${selected.string} — ${selected.note}` : 'modo libre');
      });
    }
  }

  function resetReadout() {
    els.note.textContent = '—';
    els.cents.textContent = '—';
    els.needle.style.left = '50%';
    els.needle.className = 'tuner-meter-needle';
  }

  function update(freq) {
    const target = selected || closestNote(freq);
    const c = cents(freq, target.freq);

    els.note.textContent = target.note;
    els.freq.textContent = `${freq.toFixed(1)} Hz`;
    els.needle.style.left = `${Math.max(-50, Math.min(50, c)) + 50}%`;
    els.cents.textContent = `${c >= 0 ? '+' : ''}${c.toFixed(0)} cents`;

    const abs = Math.abs(c);
    els.needle.className = 'tuner-meter-needle';
    if (abs <= 3) {
      els.needle.classList.add('in-tune');
      setStatus('afinado');
    } else if (abs <= 15) {
      els.needle.classList.add('close');
      setStatus(c > 0 ? 'un poco alto ♯' : 'un poco bajo ♭');
    } else {
      els.needle.classList.add('out-tune');
      setStatus(c > 0 ? 'muy alto ♯' : 'muy bajo ♭');
    }
  }

  function detect() {
    if (!listening || !analyser || !audioCtx) return;
    analyser.getFloatTimeDomainData(buffer);
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / buffer.length);
    // Umbral de silencio: sin él la correlación se dispara con el ruido de sala
    // y la aguja baila sola.
    if (rms >= 0.01) {
      const pitch = autoCorrelate(buffer, audioCtx.sampleRate);
      if (pitch > 0) update(pitch);
    }
    animFrame = requestAnimationFrame(detect);
  }

  async function startListening() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      await audioCtx.resume();
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      buffer = new Float32Array(analyser.fftSize);
      listening = true;
      els.mic.textContent = 'parar';
      els.mic.classList.add('active');
      setStatus(selected ? `cuerda ${selected.string} — ${selected.note}` : 'escuchando');
      detect();
    } catch (err) {
      setStatus(err.name === 'NotAllowedError'
        ? 'no has dado permiso de micrófono'
        : 'no hay micrófono disponible');
    }
  }

  function stopListening() {
    listening = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    analyser = null;
    buffer = null;
    els.mic.textContent = 'escuchar';
    els.mic.classList.remove('active');
    els.freq.textContent = 'micrófono apagado';
    resetReadout();
    setStatus('pulsa escuchar y toca una cuerda');
  }

  function stopRefTone() {
    if (refOsc) { try { refOsc.stop(); } catch { /* ya parado */ } refOsc = null; }
    els.ref.classList.remove('active');
  }

  function playRefTone() {
    if (!selected) { setStatus('elige una cuerda primero'); return; }
    stopRefTone();
    if (!refCtx || refCtx.state === 'closed') {
      refCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    refOsc = refCtx.createOscillator();
    refGain = refCtx.createGain();
    refOsc.type = 'sine';
    refOsc.frequency.value = selected.freq;
    // Rampa de entrada y salida: un seno que arranca y para en seco hace clic.
    refGain.gain.setValueAtTime(0, refCtx.currentTime);
    refGain.gain.linearRampToValueAtTime(0.2, refCtx.currentTime + 0.05);
    refGain.gain.setValueAtTime(0.2, refCtx.currentTime + 2.5);
    refGain.gain.linearRampToValueAtTime(0, refCtx.currentTime + 3);
    refOsc.connect(refGain).connect(refCtx.destination);
    refOsc.start();
    refOsc.stop(refCtx.currentTime + 3);
    refOsc.onended = () => { refOsc = null; els.ref.classList.remove('active'); };
    els.ref.classList.add('active');
  }

  els.mic.addEventListener('click', () => {
    if (listening) stopListening();
    else startListening();
  });
  els.ref.addEventListener('click', () => {
    if (refOsc) stopRefTone();
    else playRefTone();
  });

  renderStrings();

  return {
    setInstrument(name) {
      strings = TUNINGS[name] || [];
      selected = null;
      stopRefTone();
      renderStrings();
    },
    destroy() {
      stopListening();
      stopRefTone();
      if (refCtx && refCtx.state !== 'closed') refCtx.close();
      refCtx = null;
      container.innerHTML = '';
    },
  };
}

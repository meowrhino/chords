// recorder.js — grabar una toma cantando y subirla.
//
// El diarioDeAbordo grababa con `new MediaRecorder(stream)` a secas y una toma
// suelta pesaba 4,3 MB: el bitrate por defecto es altísimo. En un Worker no se
// puede transcodificar (no hay ffmpeg), pero tampoco hace falta — se arregla al
// capturar. Opus a 48 kbps mono son ~360 KB por minuto y para voz y guitarra
// suena igual.

// En orden de preferencia. Safari y iOS no hacen webm y caen en mp4/aac, que
// pesa más pero es lo único que tienen. Se guarda el mime real porque <audio>
// necesita saber qué le estás dando.
const FORMATS = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

const AUDIO_BITS = 48000;

export function pickFormat() {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const mime of FORMATS) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

export function isSupported() {
  return !!(navigator.mediaDevices?.getUserMedia && pickFormat());
}

/**
 * Graba del micrófono. Una toma por instancia de `start()`.
 *
 * @param {(state: {recording: boolean, seconds: number}) => void} onTick
 * @returns {{start: () => Promise<void>, stop: () => Promise<{blob: Blob, mime: string, seconds: number}>, cancel: () => void, isRecording: () => boolean}}
 */
export function createRecorder(onTick = () => {}) {
  let recorder = null, stream = null, chunks = [], startedAt = 0, timer = null;

  function tick() {
    onTick({ recording: true, seconds: (Date.now() - startedAt) / 1000 });
  }

  function cleanup() {
    if (timer) { clearInterval(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    recorder = null;
  }

  return {
    isRecording: () => !!recorder && recorder.state === 'recording',

    async start() {
      const mime = pickFormat();
      if (!mime) throw new Error('este navegador no sabe grabar audio');
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: AUDIO_BITS });
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      recorder.start();
      startedAt = Date.now();
      timer = setInterval(tick, 200);
      tick();
    },

    stop() {
      return new Promise((resolve, reject) => {
        if (!recorder || recorder.state === 'inactive') {
          cleanup();
          reject(new Error('no se estaba grabando'));
          return;
        }
        const mime = recorder.mimeType;
        const seconds = (Date.now() - startedAt) / 1000;
        recorder.onstop = () => {
          // El tipo del Blob manda sobre el del MediaRecorder: en algún
          // navegador el mimeType trae parámetros (";codecs=opus") que el
          // servidor no acepta en la whitelist.
          const blob = new Blob(chunks, { type: mime.split(';')[0] });
          cleanup();
          onTick({ recording: false, seconds });
          resolve({ blob, mime: blob.type, seconds });
        };
        recorder.stop();
      });
    },

    cancel() {
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        try { recorder.stop(); } catch { /* ya parado */ }
      }
      chunks = [];
      cleanup();
      onTick({ recording: false, seconds: 0 });
    },
  };
}

/** Sube una toma. `username` va como "nombre#secreto" para poder borrarla luego. */
export async function uploadRecording({ blob, mime, seconds, username, slug, note }) {
  const params = new URLSearchParams({ username, seconds: seconds.toFixed(1) });
  if (slug) params.set('slug', slug);
  if (note) params.set('note', note);

  const res = await fetch(`/api/recordings?${params}`, {
    method: 'POST',
    headers: { 'content-type': mime },
    body: blob,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'no se pudo guardar');
  return data.recording;
}

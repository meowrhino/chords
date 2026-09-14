import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getSongs, getSong, getSongVersions, createSong, createSongVersion,
  getComments, getReplies, createComment, reportComment,
  getUser, registerUser,
  follow, unfollow, getFollowing, getFeed,
  getSongRecordings, getUserRecordings, getRecording, createRecording, deleteRecording,
} from './db';
import {
  checkRateLimit, sanitizeText, generateTripcode,
  parseUsername, generateSlug,
} from './middleware';
import { scrapeUrl } from './scraper';

type Bindings = { DB: D1Database; STORAGE: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

// === SONGS ===

app.get('/api/songs', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const search = c.req.query('q');
  const { results } = await getSongs(c.env.DB, page, limit, search);
  return c.json({ songs: results, page, limit });
});

app.get('/api/songs/:slug', async (c) => {
  const song = await getSong(c.env.DB, c.req.param('slug'));
  if (!song) return c.json({ error: 'not found' }, 404);
  const { results } = await getSongVersions(c.env.DB, song.slug);
  return c.json({ song, versions: results });
});

app.post('/api/songs', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return c.json({ error: 'rate limited', retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{
    title: string; artist: string; cho_content: string;
    key?: string; lang?: string; username?: string;
  }>();

  if (!body.title || !body.artist || !body.cho_content) {
    return c.json({ error: 'title, artist, and cho_content are required' }, 400);
  }
  if (body.cho_content.length > 50000) {
    return c.json({ error: 'content too large' }, 400);
  }

  let username: string | undefined;
  let tripcode: string | undefined;
  if (body.username) {
    const parsed = parseUsername(body.username);
    username = sanitizeText(parsed.username);
    if (parsed.secret) tripcode = await generateTripcode(parsed.secret);
  }

  const slug = generateSlug(body.artist, body.title);
  const existing = await getSong(c.env.DB, slug);
  if (existing) {
    return c.json({ error: 'song already exists', slug: existing.slug }, 409);
  }

  await createSong(c.env.DB, {
    slug,
    title: sanitizeText(body.title),
    artist: sanitizeText(body.artist),
    key_signature: body.key ? sanitizeText(body.key) : undefined,
    lang: body.lang,
    cho_content: body.cho_content,
    uploaded_by: username,
    tripcode,
  });

  return c.json({ slug }, 201);
});

app.post('/api/songs/:slug/version', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return c.json({ error: 'rate limited', retryAfter: rl.retryAfter }, 429);

  const parentSlug = c.req.param('slug');
  const body = await c.req.json<{
    cho_content: string; key?: string; lang?: string; username?: string; label?: string;
  }>();

  if (!body.cho_content) return c.json({ error: 'cho_content required' }, 400);

  const parent = await getSong(c.env.DB, parentSlug);
  if (!parent) return c.json({ error: 'song not found' }, 404);

  let username: string | undefined;
  let tripcode: string | undefined;
  if (body.username) {
    const parsed = parseUsername(body.username);
    username = sanitizeText(parsed.username);
    if (parsed.secret) tripcode = await generateTripcode(parsed.secret);
  }

  const label = body.label || (username || 'anon');
  const versionSlug = `${parentSlug}-${label}`.replace(/[^a-z0-9-]/g, '-').substring(0, 80);

  await createSongVersion(c.env.DB, parentSlug, {
    slug: versionSlug,
    title: parent.title,
    artist: parent.artist,
    key_signature: body.key ? sanitizeText(body.key) : parent.key_signature ?? undefined,
    lang: body.lang || (parent.lang ?? undefined),
    cho_content: body.cho_content,
    uploaded_by: username,
    tripcode,
  });

  return c.json({ slug: versionSlug }, 201);
});

// No DELETE for songs — content is immutable

// === COMMENTS ===

app.get('/api/songs/:slug/comments', async (c) => {
  const comments = await getComments(c.env.DB, c.req.param('slug'));
  return c.json({ comments });
});

app.get('/api/comments/:id/replies', async (c) => {
  const replies = await getReplies(c.env.DB, parseInt(c.req.param('id')));
  return c.json({ replies });
});

app.post('/api/songs/:slug/comments', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return c.json({ error: 'rate limited', retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{
    username: string; content: string; parent_id?: number;
  }>();

  if (!body.username || !body.content) {
    return c.json({ error: 'username and content required' }, 400);
  }
  if (body.content.length > 1000) {
    return c.json({ error: 'content too long' }, 400);
  }

  const parsed = parseUsername(body.username);
  const username = sanitizeText(parsed.username);
  const tripcode = parsed.secret ? await generateTripcode(parsed.secret) : undefined;

  await createComment(c.env.DB, {
    song_slug: c.req.param('slug'),
    username,
    tripcode,
    content: sanitizeText(body.content),
    parent_id: body.parent_id,
  });

  return c.json({ ok: true }, 201);
});

app.post('/api/comments/:id/report', async (c) => {
  await reportComment(c.env.DB, parseInt(c.req.param('id')));
  return c.json({ ok: true });
});

// === USERS ===

app.post('/api/users/register', async (c) => {
  const body = await c.req.json<{
    username: string; color?: string; instrument?: string; bio?: string;
  }>();

  if (!body.username) return c.json({ error: 'username required' }, 400);

  const parsed = parseUsername(body.username);
  const username = sanitizeText(parsed.username);
  const tripcode = parsed.secret ? await generateTripcode(parsed.secret) : undefined;

  await registerUser(c.env.DB, {
    username,
    tripcode,
    color: body.color,
    instrument: body.instrument,
    bio: body.bio ? sanitizeText(body.bio) : undefined,
  });

  return c.json({ username, tripcode: tripcode || null });
});

app.get('/api/users/:username', async (c) => {
  const user = await getUser(c.env.DB, c.req.param('username'));
  if (!user) return c.json({ error: 'not found' }, 404);
  return c.json({ user });
});

// === FOLLOWS & FEED ===

app.post('/api/follow', async (c) => {
  const body = await c.req.json<{
    username: string; target_type: string; target: string;
  }>();

  if (!body.username || !body.target_type || !body.target) {
    return c.json({ error: 'username, target_type, target required' }, 400);
  }
  if (!['artist', 'song'].includes(body.target_type)) {
    return c.json({ error: 'target_type must be artist or song' }, 400);
  }

  const parsed = parseUsername(body.username);
  await follow(c.env.DB, parsed.username, body.target_type, body.target);
  return c.json({ ok: true });
});

app.delete('/api/follow', async (c) => {
  const body = await c.req.json<{
    username: string; target_type: string; target: string;
  }>();

  const parsed = parseUsername(body.username);
  await unfollow(c.env.DB, parsed.username, body.target_type, body.target);
  return c.json({ ok: true });
});

app.get('/api/feed', async (c) => {
  const username = c.req.query('username');
  if (!username) return c.json({ error: 'username required' }, 400);
  const feed = await getFeed(c.env.DB, username);
  return c.json({ feed });
});

// === SCRAPER ===

app.post('/api/scrape', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return c.json({ error: 'rate limited', retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{ url: string; cookie?: string }>();
  if (!body.url) return c.json({ error: 'url required' }, 400);

  try {
    const result = await scrapeUrl(body.url, body.cookie);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message || 'scrape failed' }, 400);
  }
});

// === ADMIN ===

app.post('/api/admin/verify-artist', async (c) => {
  const adminKey = c.req.header('x-admin-key');
  if (!adminKey || adminKey !== 'meowrhino-admin') {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const body = await c.req.json<{ username: string }>();
  await c.env.DB.prepare('UPDATE chords_users SET is_artist = 1 WHERE username = ?')
    .bind(body.username).run();
  return c.json({ ok: true });
});


// === GRABACIONES ===
//
// El audio va a R2 y en D1 solo queda la ficha. Ver el comentario de
// chords_recordings en schema.sql para el porqué.

// MediaRecorder da webm/opus en casi todo; Safari e iOS dan mp4/aac. Se guarda
// el mime real porque <audio> necesita saber qué le estás dando.
const ALLOWED_AUDIO: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
};

// 20 MB. Grabando en opus a 48 kbps mono son ~360 KB/minuto, así que da para
// casi una hora; el tope está para el aac de Safari, que pesa bastante más.
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

// Solo claves que haya escrito esta app: el bucket es compartido con twoitter
// y sin esto un id manipulado podría sacar cualquier objeto suyo.
const OUR_KEY_RE = /^chords\/recordings\/\d{2}\/\d{2}\/[0-9a-f]{24}\.[a-z0-9]{1,5}$/;

function recordingKey(ext: string): string {
  const d = new Date();
  const yy = String(d.getFullYear() % 100).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
  return `chords/recordings/${yy}/${mm}/${rand}.${ext}`;
}

app.get('/api/songs/:slug/recordings', async (c) => {
  const results = await getSongRecordings(c.env.DB, c.req.param('slug'));
  return c.json({ recordings: results });
});

app.get('/api/users/:username/recordings', async (c) => {
  const results = await getUserRecordings(c.env.DB, c.req.param('username'));
  return c.json({ recordings: results });
});

app.post('/api/recordings', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return c.json({ error: 'rate limited', retryAfter: rl.retryAfter }, 429);

  const ct = (c.req.header('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = ALLOWED_AUDIO[ct];
  if (!ext) return c.json({ error: `formato de audio no soportado: ${ct}` }, 415);

  const rawUser = c.req.query('username') || '';
  if (!rawUser) return c.json({ error: 'hace falta un nombre' }, 400);
  const parsed = parseUsername(rawUser);
  const username = sanitizeText(parsed.username);
  if (!username) return c.json({ error: 'hace falta un nombre' }, 400);
  const tripcode = parsed.secret ? await generateTripcode(parsed.secret) : null;

  const body = await c.req.arrayBuffer();
  if (!body.byteLength) return c.json({ error: 'grabación vacía' }, 400);
  if (body.byteLength > MAX_AUDIO_BYTES) {
    return c.json({ error: `demasiado larga (máx ${MAX_AUDIO_BYTES / 1024 / 1024} MB)` }, 413);
  }

  const key = recordingKey(ext);
  await c.env.STORAGE.put(key, body, { httpMetadata: { contentType: ct } });

  const seconds = Number(c.req.query('seconds'));
  const note = c.req.query('note');
  const rec = await createRecording(c.env.DB, {
    song_slug: c.req.query('slug') || null,
    username,
    tripcode,
    r2_key: key,
    mime: ct,
    bytes: body.byteLength,
    seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : null,
    note: note ? sanitizeText(note).slice(0, 500) : null,
  });

  return c.json({ ok: true, recording: rec }, 201);
});

// Stream con Range: sin esto el <audio> no deja mover la cabecera de
// reproducción en una toma larga, solo escucharla de principio a fin.
app.get('/api/recordings/:id/audio', async (c) => {
  const rec = await getRecording(c.env.DB, parseInt(c.req.param('id')));
  if (!rec || !OUR_KEY_RE.test(rec.r2_key)) return c.notFound();

  const rangeHeader = c.req.header('range');
  const obj = await c.env.STORAGE.get(
    rec.r2_key,
    rangeHeader ? { range: c.req.raw.headers } : undefined,
  );
  if (!obj) return c.notFound();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'private, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('accept-ranges', 'bytes');

  if (rangeHeader && obj.range) {
    const r = obj.range as { offset?: number; length?: number; suffix?: number };
    const offset = r.suffix != null ? obj.size - r.suffix : r.offset ?? 0;
    const length = r.suffix != null ? r.suffix : r.length ?? obj.size - offset;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { headers });
});

// Borrar solo lo tuyo. Sin secreto no se borra nada: una toma sin tripcode es
// de un nombre que cualquiera puede escribir, así que no hay dueño que valga.
app.delete('/api/recordings/:id', async (c) => {
  const rec = await getRecording(c.env.DB, parseInt(c.req.param('id')));
  if (!rec) return c.json({ error: 'no existe' }, 404);

  const parsed = parseUsername(c.req.query('username') || '');
  const username = sanitizeText(parsed.username);
  const tripcode = parsed.secret ? await generateTripcode(parsed.secret) : null;
  if (!rec.tripcode || rec.username !== username || rec.tripcode !== tripcode) {
    return c.json({ error: 'no es tuya' }, 403);
  }

  await c.env.STORAGE.delete(rec.r2_key);
  await deleteRecording(c.env.DB, rec.id);
  return c.json({ ok: true });
});

export default app;

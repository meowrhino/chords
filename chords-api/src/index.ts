import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getSongs, getSong, getSongVersions, createSong, createSongVersion,
  getComments, getReplies, createComment, reportComment,
  getUser, registerUser,
  follow, unfollow, getFollowing, getFeed,
} from './db';
import {
  checkRateLimit, sanitizeText, generateTripcode,
  parseUsername, generateSlug,
} from './middleware';

type Bindings = { DB: D1Database };
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

// === ADMIN ===

app.post('/api/admin/verify-artist', async (c) => {
  const adminKey = c.req.header('x-admin-key');
  if (!adminKey || adminKey !== 'meowrhino-admin') {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const body = await c.req.json<{ username: string }>();
  await c.env.DB.prepare('UPDATE users SET is_artist = 1 WHERE username = ?')
    .bind(body.username).run();
  return c.json({ ok: true });
});

export default app;

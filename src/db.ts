// Database functions for chords-api

export interface Song {
  id: number;
  slug: string;
  title: string;
  artist: string;
  key_signature: string | null;
  lang: string | null;
  cho_content: string;
  uploaded_by: string | null;
  tripcode: string | null;
  version: number;
  parent_slug: string | null;
  created_at: string;
}

export interface Comment {
  id: number;
  song_slug: string;
  username: string;
  tripcode: string | null;
  content: string;
  parent_id: number | null;
  created_at: string;
  reports: number;
  hidden: number;
  reply_count?: number;
}

export interface User {
  username: string;
  tripcode: string | null;
  color: string | null;
  instrument: string;
  bio: string | null;
  is_artist: number;
  created_at: string;
}

// --- Songs ---

export async function getSongs(db: D1Database, page = 1, limit = 50, search?: string) {
  const offset = (page - 1) * limit;
  if (search) {
    const q = `%${search}%`;
    return db.prepare(
      `SELECT id, slug, title, artist, key_signature, lang, uploaded_by, version, parent_slug, created_at
       FROM songs WHERE title LIKE ? OR artist LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(q, q, limit, offset).all<Omit<Song, 'cho_content'>>();
  }
  return db.prepare(
    `SELECT id, slug, title, artist, key_signature, lang, uploaded_by, version, parent_slug, created_at
     FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(limit, offset).all<Omit<Song, 'cho_content'>>();
}

export async function getSong(db: D1Database, slug: string) {
  return db.prepare('SELECT * FROM songs WHERE slug = ?').bind(slug).first<Song>();
}

export async function getSongVersions(db: D1Database, slug: string) {
  const song = await getSong(db, slug);
  if (!song) return { results: [] as Omit<Song, 'cho_content'>[] };
  const parentSlug = song.parent_slug || slug;
  return db.prepare(
    `SELECT id, slug, title, artist, version, uploaded_by, created_at
     FROM songs WHERE slug = ? OR parent_slug = ? ORDER BY version`
  ).bind(parentSlug, parentSlug).all<Omit<Song, 'cho_content'>>();
}

export async function createSong(db: D1Database, song: {
  slug: string; title: string; artist: string; key_signature?: string;
  lang?: string; cho_content: string; uploaded_by?: string; tripcode?: string;
}) {
  return db.prepare(
    `INSERT INTO songs (slug, title, artist, key_signature, lang, cho_content, uploaded_by, tripcode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(song.slug, song.title, song.artist, song.key_signature || null,
    song.lang || null, song.cho_content, song.uploaded_by || null, song.tripcode || null
  ).run();
}

export async function createSongVersion(db: D1Database, parentSlug: string, song: {
  slug: string; title: string; artist: string; key_signature?: string;
  lang?: string; cho_content: string; uploaded_by?: string; tripcode?: string;
}) {
  const parent = await getSong(db, parentSlug);
  if (!parent) throw new Error('parent not found');
  const maxVer = await db.prepare(
    `SELECT MAX(version) as v FROM songs WHERE slug = ? OR parent_slug = ?`
  ).bind(parentSlug, parentSlug).first<{ v: number }>();
  const version = (maxVer?.v || 1) + 1;

  return db.prepare(
    `INSERT INTO songs (slug, title, artist, key_signature, lang, cho_content, uploaded_by, tripcode, version, parent_slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(song.slug, song.title, song.artist, song.key_signature || null,
    song.lang || null, song.cho_content, song.uploaded_by || null,
    song.tripcode || null, version, parentSlug
  ).run();
}

// --- Comments ---

export async function getComments(db: D1Database, songSlug: string) {
  const { results } = await db.prepare(
    `SELECT c.*, (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id AND r.hidden = 0) as reply_count
     FROM comments c WHERE c.song_slug = ? AND c.parent_id IS NULL AND c.hidden = 0
     ORDER BY c.created_at DESC`
  ).bind(songSlug).all<Comment>();
  return results;
}

export async function getReplies(db: D1Database, parentId: number) {
  const { results } = await db.prepare(
    'SELECT * FROM comments WHERE parent_id = ? AND hidden = 0 ORDER BY created_at'
  ).bind(parentId).all<Comment>();
  return results;
}

export async function createComment(db: D1Database, comment: {
  song_slug: string; username: string; tripcode?: string; content: string; parent_id?: number;
}) {
  return db.prepare(
    `INSERT INTO comments (song_slug, username, tripcode, content, parent_id)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(comment.song_slug, comment.username, comment.tripcode || null,
    comment.content, comment.parent_id || null
  ).run();
}

export async function reportComment(db: D1Database, id: number) {
  await db.prepare('UPDATE comments SET reports = reports + 1 WHERE id = ?').bind(id).run();
  await db.prepare('UPDATE comments SET hidden = 1 WHERE id = ? AND reports >= 5').bind(id).run();
}

// --- Users ---

export async function getUser(db: D1Database, username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first<User>();
}

export async function registerUser(db: D1Database, user: {
  username: string; tripcode?: string; color?: string; instrument?: string; bio?: string;
}) {
  return db.prepare(
    `INSERT INTO users (username, tripcode, color, instrument, bio)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET
       color = excluded.color, instrument = excluded.instrument, bio = excluded.bio`
  ).bind(user.username, user.tripcode || null, user.color || null,
    user.instrument || 'guitar', user.bio || null
  ).run();
}

// --- Follows ---

export async function follow(db: D1Database, username: string, targetType: string, target: string) {
  return db.prepare(
    'INSERT OR IGNORE INTO follows (username, target_type, target) VALUES (?, ?, ?)'
  ).bind(username, targetType, target).run();
}

export async function unfollow(db: D1Database, username: string, targetType: string, target: string) {
  return db.prepare(
    'DELETE FROM follows WHERE username = ? AND target_type = ? AND target = ?'
  ).bind(username, targetType, target).run();
}

export async function getFollowing(db: D1Database, username: string) {
  const { results } = await db.prepare(
    'SELECT target_type, target FROM follows WHERE username = ?'
  ).bind(username).all<{ target_type: string; target: string }>();
  return results;
}

export async function getFeed(db: D1Database, username: string, limit = 50) {
  // Songs from followed artists + comments on followed songs
  const { results } = await db.prepare(`
    SELECT 'song' as type, s.slug as id, s.title, s.artist, s.created_at
    FROM songs s
    INNER JOIN follows f ON f.username = ? AND f.target_type = 'artist' AND f.target = s.artist
    UNION ALL
    SELECT 'comment' as type, c.song_slug as id,
      c.content as title, c.username as artist, c.created_at
    FROM comments c
    INNER JOIN follows f ON f.username = ? AND f.target_type = 'song' AND f.target = c.song_slug
    WHERE c.hidden = 0
    ORDER BY created_at DESC LIMIT ?
  `).bind(username, username, limit).all<{
    type: string; id: string; title: string; artist: string; created_at: string;
  }>();
  return results;
}

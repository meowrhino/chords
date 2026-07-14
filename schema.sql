-- Esquema de chords. Vive en twoitter-db (BD compartida): TODAS las tablas van
-- prefijadas con chords_ para no chocar nunca con las de twoitter.
-- Aplicar con: npm run db:migrate (remoto) / npm run db:migrate:local (dev).

-- Songs: immutable chord tablaturas
CREATE TABLE IF NOT EXISTS chords_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    key_signature TEXT,
    lang TEXT,
    cho_content TEXT NOT NULL,
    uploaded_by TEXT,
    tripcode TEXT,
    version INTEGER DEFAULT 1,
    parent_slug TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chords_songs_artist ON chords_songs(artist);
CREATE INDEX IF NOT EXISTS idx_chords_songs_slug ON chords_songs(slug);
CREATE INDEX IF NOT EXISTS idx_chords_songs_parent ON chords_songs(parent_slug);

-- Comments on songs (2-level hierarchy)
CREATE TABLE IF NOT EXISTS chords_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_slug TEXT NOT NULL,
    username TEXT NOT NULL,
    tripcode TEXT,
    content TEXT NOT NULL,
    parent_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    reports INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES chords_comments(id)
);

CREATE INDEX IF NOT EXISTS idx_chords_comments_song ON chords_comments(song_slug);
CREATE INDEX IF NOT EXISTS idx_chords_comments_parent ON chords_comments(parent_id);

-- Users (optional registration)
CREATE TABLE IF NOT EXISTS chords_users (
    username TEXT PRIMARY KEY,
    tripcode TEXT,
    color TEXT,
    instrument TEXT DEFAULT 'guitar',
    bio TEXT,
    is_artist INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Follows (artists or songs)
CREATE TABLE IF NOT EXISTS chords_follows (
    username TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('artist', 'song')),
    target TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (username, target_type, target)
);

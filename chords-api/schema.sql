-- Songs: immutable chord tablaturas
CREATE TABLE IF NOT EXISTS songs (
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

CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_parent ON songs(parent_slug);

-- Comments on songs (2-level hierarchy)
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_slug TEXT NOT NULL,
    username TEXT NOT NULL,
    tripcode TEXT,
    content TEXT NOT NULL,
    parent_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    reports INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_slug);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Users (optional registration)
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    tripcode TEXT,
    color TEXT,
    instrument TEXT DEFAULT 'guitar',
    bio TEXT,
    is_artist INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Follows (artists or songs)
CREATE TABLE IF NOT EXISTS follows (
    username TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('artist', 'song')),
    target TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (username, target_type, target)
);

import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

await client.execute(`
  CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#10b981',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

await client.execute(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '제목 없음',
    content TEXT NOT NULL DEFAULT '',
    notebook_id TEXT REFERENCES notebooks(id) ON DELETE SET NULL,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

await client.execute(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  )
`)

await client.execute(`
  CREATE TABLE IF NOT EXISTS notes_to_tags (
    note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
  )
`)

console.log('✅ Turso 마이그레이션 완료')
client.close()

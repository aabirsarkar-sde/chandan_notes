import { neon } from "@neondatabase/serverless";
import type { KeepNote } from "@/lib/types";

type DbNoteRow = {
  id: string;
  title: string | null;
  text: string | null;
  deleted: boolean;
  updated_at: string;
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(databaseUrl);
}

export async function ensureNotesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS note_overrides (
      id TEXT PRIMARY KEY,
      title TEXT,
      text TEXT,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function listOverrides() {
  const sql = getSql();
  const rows = await sql<DbNoteRow[]>`
    SELECT id, title, text, deleted, updated_at
    FROM note_overrides
  `;
  return rows;
}

export async function upsertNoteEdit(note: Pick<KeepNote, "id" | "title" | "text">) {
  const sql = getSql();
  await sql`
    INSERT INTO note_overrides (id, title, text, deleted, updated_at)
    VALUES (${note.id}, ${note.title}, ${note.text}, FALSE, NOW())
    ON CONFLICT (id) DO UPDATE
    SET
      title = EXCLUDED.title,
      text = EXCLUDED.text,
      deleted = FALSE,
      updated_at = NOW()
  `;
}

export async function markNoteDeleted(id: string) {
  const sql = getSql();
  await sql`
    INSERT INTO note_overrides (id, deleted, updated_at)
    VALUES (${id}, TRUE, NOW())
    ON CONFLICT (id) DO UPDATE
    SET
      deleted = TRUE,
      updated_at = NOW()
  `;
}

import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { notes, notebooks, tags, notesToTags } from '../../../lib/schema'
import { eq, like, or, and, inArray, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const notebookId = searchParams.get('notebookId')
  const tagId = searchParams.get('tagId')
  const search = searchParams.get('search')

  let noteIds: string[] | null = null
  if (tagId) {
    const rows = await db
      .select({ noteId: notesToTags.noteId })
      .from(notesToTags)
      .where(eq(notesToTags.tagId, tagId))
    noteIds = rows.map((r) => r.noteId)
    if (noteIds.length === 0) return NextResponse.json([])
  }

  const result = await db.query.notes.findMany({
    with: {
      notesToTags: { with: { tag: true } },
      notebook: { columns: { name: true, color: true } },
    },
    where: and(
      notebookId ? eq(notes.notebookId, notebookId) : undefined,
      noteIds ? inArray(notes.id, noteIds) : undefined,
      search ? or(like(notes.title, `%${search}%`), like(notes.content, `%${search}%`)) : undefined
    ),
    orderBy: [desc(notes.isPinned), desc(notes.updatedAt)],
  })

  return NextResponse.json(
    result.map((n) => ({ ...n, tags: n.notesToTags.map((nt) => nt.tag) }))
  )
}

export async function POST(req: Request) {
  const { notebookId } = await req.json()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await db.insert(notes).values({
    id,
    notebookId: notebookId ?? null,
    createdAt: now,
    updatedAt: now,
  })

  const note = await db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: {
      notesToTags: { with: { tag: true } },
      notebook: { columns: { name: true, color: true } },
    },
  })

  return NextResponse.json(
    { ...note, tags: note?.notesToTags.map((nt) => nt.tag) ?? [] },
    { status: 201 }
  )
}

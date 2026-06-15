import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notes, tags, notesToTags } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const note = await db.query.notes.findFirst({
    where: eq(notes.id, params.id),
    with: { notesToTags: { with: { tag: true } }, notebook: true },
  })
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...note, tags: note.notesToTags.map((nt) => nt.tag) })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content, notebookId, isPinned, tagNames } = await req.json()
  const now = new Date().toISOString()

  const patch: Record<string, unknown> = { updatedAt: now }
  if (title !== undefined) patch.title = title
  if (content !== undefined) patch.content = content
  if (notebookId !== undefined) patch.notebookId = notebookId
  if (isPinned !== undefined) patch.isPinned = isPinned

  await db.update(notes).set(patch).where(eq(notes.id, params.id))

  if (tagNames !== undefined) {
    await db.delete(notesToTags).where(eq(notesToTags.noteId, params.id))

    if ((tagNames as string[]).length > 0) {
      const tagRows = await Promise.all(
        (tagNames as string[]).map(async (name) => {
          const existing = await db.query.tags.findFirst({ where: eq(tags.name, name) })
          if (existing) return existing
          const id = crypto.randomUUID()
          const [created] = await db.insert(tags).values({ id, name }).returning()
          return created
        })
      )
      await db.insert(notesToTags).values(
        tagRows.map((t) => ({ noteId: params.id, tagId: t.id }))
      )
    }
  }

  const updated = await db.query.notes.findFirst({
    where: eq(notes.id, params.id),
    with: { notesToTags: { with: { tag: true } }, notebook: { columns: { name: true, color: true } } },
  })

  return NextResponse.json({ ...updated, tags: updated?.notesToTags.map((nt) => nt.tag) ?? [] })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.delete(notes).where(eq(notes.id, params.id))
  return NextResponse.json({ ok: true })
}

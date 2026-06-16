import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { notes, tags, notesToTags } from '../../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const result = await db.select().from(notes).where(eq(notes.id, params.id)).limit(1)
  const note = result[0]

  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ...note, tags: [] })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content, notebookId, isPinned, tagNames } = await req.json()
  const now = new Date().toISOString()

  const patch: Partial<typeof notes.$inferInsert> = {
    updatedAt: now,
  }

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
          const existingResult = await db.select().from(tags).where(eq(tags.name, name)).limit(1)
          const existing = existingResult[0]

          if (existing) return existing

          const id = crypto.randomUUID()
          const createdResult = await db.insert(tags).values({ id, name }).returning()

          return createdResult[0]
        })
      )

      await db.insert(notesToTags).values(
        tagRows.map((t) => ({
          noteId: params.id,
          tagId: t.id,
        }))
      )
    }
  }

  const updatedResult = await db.select().from(notes).where(eq(notes.id, params.id)).limit(1)
  const updated = updatedResult[0]

  return NextResponse.json({ ...updated, tags: [] })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.delete(notes).where(eq(notes.id, params.id))
  return NextResponse.json({ ok: true })
}

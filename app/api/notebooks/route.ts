import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { notebooks, notes } from '../../../lib/schema'
import { count } from 'drizzle-orm'

export async function GET() {
  const all = await db.select().from(notebooks).orderBy(notebooks.createdAt)

  const counts = await db
    .select({ notebookId: notes.notebookId, count: count() })
    .from(notes)
    .groupBy(notes.notebookId)

  const countMap = Object.fromEntries(counts.map((c) => [c.notebookId, c.count]))

  return NextResponse.json(
    all.map((nb) => ({
      ...nb,
      _count: { notes: countMap[nb.id] ?? 0 },
    }))
  )
}

export async function POST(req: Request) {
  const { name, color } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: '이름을 입력하세요' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const [nb] = await db
    .insert(notebooks)
    .values({
      id,
      name: name.trim(),
      color: color ?? '#10b981',
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return NextResponse.json({ ...nb, _count: { notes: 0 } }, { status: 201 })
}
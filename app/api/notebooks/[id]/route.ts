import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notebooks } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, color } = await req.json()
  const now = new Date().toISOString()
  const [nb] = await db
    .update(notebooks)
    .set({ name, color, updatedAt: now })
    .where(eq(notebooks.id, params.id))
    .returning()
  return NextResponse.json(nb)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.delete(notebooks).where(eq(notebooks.id, params.id))
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const notebookId = searchParams.get('notebookId')
  const tagId = searchParams.get('tagId')
  const search = searchParams.get('search')

  const notes = await prisma.note.findMany({
    where: {
      ...(notebookId ? { notebookId } : {}),
      ...(tagId ? { tags: { some: { id: tagId } } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    include: { tags: true, notebook: { select: { name: true, color: true } } },
  })
  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const { notebookId } = await req.json()
  const note = await prisma.note.create({
    data: { notebookId: notebookId ?? null },
    include: { tags: true, notebook: { select: { name: true, color: true } } },
  })
  return NextResponse.json(note, { status: 201 })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: { tags: true, notebook: true },
  })
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(note)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content, notebookId, isPinned, tagNames } = await req.json()

  const tags = tagNames
    ? await Promise.all(
        (tagNames as string[]).map((name) =>
          prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
        )
      )
    : undefined

  const note = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(notebookId !== undefined ? { notebookId } : {}),
      ...(isPinned !== undefined ? { isPinned } : {}),
      ...(tags ? { tags: { set: tags.map((t) => ({ id: t.id })) } } : {}),
    },
    include: { tags: true, notebook: { select: { name: true, color: true } } },
  })
  return NextResponse.json(note)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.note.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

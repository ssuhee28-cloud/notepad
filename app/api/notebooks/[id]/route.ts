import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, color } = await req.json()
  const notebook = await prisma.notebook.update({
    where: { id: params.id },
    data: { name, color },
  })
  return NextResponse.json(notebook)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.notebook.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

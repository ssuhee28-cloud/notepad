import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const notebooks = await prisma.notebook.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { notes: true } } },
  })
  return NextResponse.json(notebooks)
}

export async function POST(req: Request) {
  const { name, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: '이름을 입력하세요' }, { status: 400 })
  const notebook = await prisma.notebook.create({ data: { name: name.trim(), color: color ?? '#10b981' } })
  return NextResponse.json(notebook, { status: 201 })
}

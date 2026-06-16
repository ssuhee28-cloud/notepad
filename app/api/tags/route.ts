export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { tags, notesToTags } from '../../../lib/schema'
import { count } from 'drizzle-orm'

export async function GET() {
  const all = await db.select().from(tags).orderBy(tags.name)

  const counts = await db
    .select({ tagId: notesToTags.tagId, count: count() })
    .from(notesToTags)
    .groupBy(notesToTags.tagId)

  const countMap = Object.fromEntries(counts.map((c) => [c.tagId, c.count]))

  return NextResponse.json(
    all.map((t) => ({ ...t, _count: { notes: countMap[t.id] ?? 0 } }))
  )
}

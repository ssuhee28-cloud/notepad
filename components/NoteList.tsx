'use client'

type Note = {
  id: string
  title: string
  content: string
  isPinned: boolean
  updatedAt: string
  tags: { id: string; name: string }[]
  notebook: { name: string; color: string } | null
}

interface Props {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  search: string
  onSearch: (q: string) => void
}

function excerpt(html: string) {
  return html.replace(/<[^>]*>/g, '').slice(0, 80) || '내용 없음'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return `${diffDays}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function NoteList({ notes, selectedId, onSelect, onNew, search, onSearch }: Props) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* 검색 + 새 노트 */}
      <div className="p-3 border-b border-gray-100 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-2 text-gray-400 text-sm">🔍</span>
            <input
              className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400"
              placeholder="검색..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <button
            onClick={onNew}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >+ 새 노트</button>
        </div>
        <p className="text-xs text-gray-400">{notes.length}개의 노트</p>
      </div>

      {/* 노트 목록 */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {notes.length === 0 && (
          <li className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
            <span className="text-3xl">📝</span>
            <span>노트가 없습니다</span>
          </li>
        )}
        {notes.map((note) => (
          <li key={note.id}>
            <button
              onClick={() => onSelect(note.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedId === note.id ? 'bg-green-50 border-l-2 border-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-medium text-sm text-gray-900 truncate flex-1 flex items-center gap-1">
                  {note.isPinned && <span className="text-yellow-500 text-xs">📌</span>}
                  {note.title || '제목 없음'}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(note.updatedAt)}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{excerpt(note.content)}</p>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {note.notebook && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: note.notebook.color }}
                  >{note.notebook.name}</span>
                )}
                {note.tags.slice(0, 2).map((t) => (
                  <span key={t.id} className="text-xs text-gray-400">#{t.name}</span>
                ))}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

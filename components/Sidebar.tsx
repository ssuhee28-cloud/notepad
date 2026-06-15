'use client'
import { useState } from 'react'

type Notebook = { id: string; name: string; color: string; _count: { notes: number } }
type Tag = { id: string; name: string; _count: { notes: number } }

interface Props {
  notebooks: Notebook[]
  tags: Tag[]
  selectedNotebook: string | null
  selectedTag: string | null
  onSelectNotebook: (id: string | null) => void
  onSelectTag: (id: string | null) => void
  onCreateNotebook: (name: string) => void
  onDeleteNotebook: (id: string) => void
  totalNotes: number
}

export default function Sidebar({
  notebooks, tags, selectedNotebook, selectedTag,
  onSelectNotebook, onSelectTag, onCreateNotebook, onDeleteNotebook, totalNotes,
}: Props) {
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreateNotebook(newName.trim())
    setNewName('')
    setShowInput(false)
  }

  return (
    <aside
      className="w-56 bg-gray-900 text-gray-200 flex flex-col h-full select-none flex-shrink-0"
      onClick={() => setContextMenu(null)}
    >
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-green-400">📓 내 메모장</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {/* 전체 노트 */}
        <button
          onClick={() => { onSelectNotebook(null); onSelectTag(null) }}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
            !selectedNotebook && !selectedTag ? 'bg-gray-800 text-green-400 font-medium' : ''
          }`}
        >
          <span>📄</span>
          <span className="flex-1 text-left">모든 노트</span>
          <span className="text-xs text-gray-500">{totalNotes}</span>
        </button>

        {/* 노트북 섹션 */}
        <div className="mt-3">
          <div className="flex items-center justify-between px-4 pb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">노트북</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowInput(true) }}
              className="text-gray-500 hover:text-green-400 text-lg leading-none"
              title="노트북 추가"
            >+</button>
          </div>

          {showInput && (
            <div className="px-3 py-1 flex gap-1">
              <input
                autoFocus
                className="flex-1 bg-gray-800 text-white text-sm px-2 py-1 rounded outline-none border border-gray-600 focus:border-green-500"
                placeholder="노트북 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowInput(false); setNewName('') } }}
              />
              <button onClick={handleCreate} className="text-green-400 text-sm px-1">✓</button>
            </div>
          )}

          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => { onSelectNotebook(nb.id); onSelectTag(null) }}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ id: nb.id, x: e.clientX, y: e.clientY }) }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 transition-colors group ${
                selectedNotebook === nb.id ? 'bg-gray-800 text-green-400 font-medium' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: nb.color }} />
              <span className="flex-1 text-left truncate">{nb.name}</span>
              <span className="text-xs text-gray-500">{nb._count.notes}</span>
            </button>
          ))}
        </div>

        {/* 태그 섹션 */}
        {tags.length > 0 && (
          <div className="mt-4">
            <div className="px-4 pb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">태그</span>
            </div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => { onSelectTag(tag.id); onSelectNotebook(null) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                  selectedTag === tag.id ? 'bg-gray-800 text-green-400 font-medium' : ''
                }`}
              >
                <span className="text-gray-500">#</span>
                <span className="flex-1 text-left truncate">{tag.name}</span>
                <span className="text-xs text-gray-500">{tag._count.notes}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 text-left"
            onClick={() => { onDeleteNotebook(contextMenu.id); setContextMenu(null) }}
          >노트북 삭제</button>
        </div>
      )}
    </aside>
  )
}

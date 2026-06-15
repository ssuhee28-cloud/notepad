'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect, useState, useCallback, useRef } from 'react'

type Note = {
  id: string
  title: string
  content: string
  isPinned: boolean
  notebookId: string | null
  tags: { id: string; name: string }[]
}

type Notebook = { id: string; name: string; color: string }

interface Props {
  note: Note | null
  notebooks: Notebook[]
  onUpdate: (id: string, data: Partial<Note & { tagNames: string[] }>) => void
  onDelete: (id: string) => void
}

function ToolbarBtn({ active, onClick, children, title }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-600'
      }`}
    >{children}</button>
  )
}

export default function NoteEditor({ note, notebooks, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [notebookId, setNotebookId] = useState<string | null>(null)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    editorProps: {
      attributes: { class: 'ProseMirror focus:outline-none p-6 min-h-full' },
    },
    onUpdate({ editor }) {
      scheduleSave({ content: editor.getHTML() })
    },
  })

  const scheduleSave = useCallback((patch: Record<string, unknown>) => {
    if (!note) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onUpdate(note.id, patch as Partial<Note>)
    }, 800)
  }, [note, onUpdate])

  useEffect(() => {
    if (!note) return
    setTitle(note.title)
    setTags(note.tags.map((t) => t.name))
    setNotebookId(note.notebookId)
    editor?.commands.setContent(note.content || '', false)
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
        <span className="text-6xl">📝</span>
        <p className="text-lg font-medium">노트를 선택하거나 새로 만드세요</p>
      </div>
    )
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    scheduleSave({ title: val })
  }

  const handleNotebookChange = (val: string) => {
    const nb = val === '' ? null : val
    setNotebookId(nb)
    if (note) onUpdate(note.id, { notebookId: nb })
  }

  const addTag = (raw: string) => {
    const name = raw.trim().toLowerCase()
    if (!name || tags.includes(name)) return
    const next = [...tags, name]
    setTags(next)
    onUpdate(note.id, { tagNames: next })
    setTagInput('')
  }

  const removeTag = (name: string) => {
    const next = tags.filter((t) => t !== name)
    setTags(next)
    onUpdate(note.id, { tagNames: next })
  }

  const togglePin = () => onUpdate(note.id, { isPinned: !note.isPinned })

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 px-6 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <input
            className="flex-1 text-2xl font-bold text-gray-900 outline-none placeholder-gray-300"
            placeholder="제목 없음"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={togglePin}
              title={note.isPinned ? '고정 해제' : '노트 고정'}
              className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${note.isPinned ? 'text-yellow-500' : 'text-gray-400'}`}
            >📌</button>
            <button
              onClick={() => { if (confirm('이 노트를 삭제할까요?')) onDelete(note.id) }}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="삭제"
            >🗑️</button>
          </div>
        </div>

        {/* 메타 */}
        <div className="flex items-center gap-4 text-sm">
          <select
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-green-400"
            value={notebookId ?? ''}
            onChange={(e) => handleNotebookChange(e.target.value)}
          >
            <option value="">노트북 없음</option>
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>{nb.name}</option>
            ))}
          </select>

          {/* 태그 */}
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-0.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                #{t}
                <button onClick={() => removeTag(t)} className="hover:text-red-500 ml-0.5">×</button>
              </span>
            ))}
            <input
              className="text-sm outline-none placeholder-gray-300 w-24"
              placeholder="태그 추가..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
              }}
            />
          </div>
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolbarBtn title="굵게" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="기울임" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="밑줄" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </ToolbarBtn>
        <ToolbarBtn title="취소선" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </ToolbarBtn>
        <ToolbarBtn title="하이라이트" active={editor?.isActive('highlight')} onClick={() => editor?.chain().focus().toggleHighlight().run()}>
          🖊
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn title="제목1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </ToolbarBtn>
        <ToolbarBtn title="제목2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title="제목3" active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn title="불릿 목록" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn title="번호 목록" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1≡
        </ToolbarBtn>
        <ToolbarBtn title="체크리스트" active={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
          ☑
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn title="인용구" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarBtn>
        <ToolbarBtn title="코드" active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}>
          {'</>'}
        </ToolbarBtn>
        <ToolbarBtn title="코드 블록" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          ▣
        </ToolbarBtn>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn title="구분선" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarBtn>
      </div>

      {/* 에디터 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

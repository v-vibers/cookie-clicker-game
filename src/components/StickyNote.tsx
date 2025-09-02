import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'
import './StickyNote.css'

export interface StickyNoteData {
  id: string
  content: string
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface StickyNoteProps {
  note: StickyNoteData
  onUpdate: (note: StickyNoteData) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: () => void
}

export function StickyNote({ note, onUpdate, onDelete, isSelected, onSelect }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const noteRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    
    setIsDragging(true)
    onSelect()
    const rect = noteRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !noteRef.current) return
      
      const whiteboardRect = noteRef.current.parentElement?.getBoundingClientRect()
      if (!whiteboardRect) return

      const newX = e.clientX - whiteboardRect.left - dragOffset.x
      const newY = e.clientY - whiteboardRect.top - dragOffset.y

      onUpdate({
        ...note,
        x: Math.max(0, Math.min(newX, whiteboardRect.width - note.width)),
        y: Math.max(0, Math.min(newY, whiteboardRect.height - note.height))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, note, onUpdate])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditContent(note.content)
  }

  const handleSave = () => {
    onUpdate({ ...note, content: editContent })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(note.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleDelete = () => {
    onDelete(note.id)
  }

  const getMarkdownHtml = () => {
    try {
      return marked.parse(note.content)
    } catch {
      return note.content
    }
  }

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="sticky-note-header">
        <button 
          className="delete-button" 
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete note"
        >
          ×
        </button>
      </div>
      
      {isEditing ? (
        <div className="sticky-note-editor">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your markdown here..."
            className="note-textarea"
          />
          <div className="editor-buttons">
            <button onClick={handleSave} className="save-button">Save</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
          <div className="editor-hint">
            Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div 
          className="sticky-note-content"
          dangerouslySetInnerHTML={{ __html: getMarkdownHtml() }}
        />
      )}
    </div>
  )
}
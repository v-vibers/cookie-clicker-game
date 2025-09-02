import { useState, useRef, useCallback } from 'react'
import { StickyNote, type StickyNoteData } from './StickyNote'
import './Whiteboard.css'

const STICKY_COLORS = [
  '#ffffbb', // yellow
  '#ffb6c1', // light pink
  '#add8e6', // light blue
  '#90ee90', // light green
  '#dda0dd', // plum
]

export function Whiteboard() {
  const [notes, setNotes] = useState<StickyNoteData[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [nextColorIndex, setNextColorIndex] = useState(0)
  const whiteboardRef = useRef<HTMLDivElement>(null)

  const generateId = () => {
    return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const createNewNote = useCallback((x: number, y: number) => {
    const newNote: StickyNoteData = {
      id: generateId(),
      content: '# New Note\n\nDouble-click to edit!\n\n- Use **markdown** for formatting\n- Create lists\n- Add `code`\n\n> Or write whatever you want!',
      x: Math.max(0, x - 100),
      y: Math.max(0, y - 75),
      width: 200,
      height: 150,
      color: STICKY_COLORS[nextColorIndex],
    }

    setNotes(prev => [...prev, newNote])
    setSelectedNoteId(newNote.id)
    setNextColorIndex((prev) => (prev + 1) % STICKY_COLORS.length)
  }, [nextColorIndex])

  const handleWhiteboardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === whiteboardRef.current) {
      const rect = whiteboardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createNewNote(x, y)
    }
  }

  const handleNoteUpdate = useCallback((updatedNote: StickyNoteData) => {
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ))
  }, [])

  const handleNoteDelete = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }
  }, [selectedNoteId])

  const handleNoteSelect = useCallback((noteId: string) => {
    setSelectedNoteId(noteId)
  }, [])

  const clearAllNotes = () => {
    setNotes([])
    setSelectedNoteId(null)
  }

  const addNoteAtCenter = () => {
    const rect = whiteboardRef.current?.getBoundingClientRect()
    if (rect) {
      createNewNote(rect.width / 2, rect.height / 2)
    }
  }

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <h1>📝 Whiteboard</h1>
        <div className="toolbar-buttons">
          <button onClick={addNoteAtCenter} className="add-note-button">
            ➕ Add Note
          </button>
          <button 
            onClick={clearAllNotes} 
            className="clear-button"
            disabled={notes.length === 0}
          >
            🗑️ Clear All
          </button>
          <div className="notes-count">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div 
        ref={whiteboardRef}
        className="whiteboard"
        onClick={handleWhiteboardClick}
      >
        <div className="whiteboard-hint">
          {notes.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to your Whiteboard!</h2>
              <p>Click anywhere to create a sticky note</p>
              <p>Double-click notes to edit with Markdown support</p>
              <p>Drag notes around to organize them</p>
            </div>
          )}
        </div>

        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={handleNoteUpdate}
            onDelete={handleNoteDelete}
            isSelected={selectedNoteId === note.id}
            onSelect={() => handleNoteSelect(note.id)}
          />
        ))}
      </div>
    </div>
  )
}
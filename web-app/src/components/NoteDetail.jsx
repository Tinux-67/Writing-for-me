import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';

/**
 * Note Detail Component
 * Displays a single note with its content
 */
const NoteDetail = ({ currentNoteId, onNoteSelect }) => {
  const { notes, isLoading, error } = useNotes();
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);

  // Get note from context or params
  useEffect(() => {
    const noteId = id || currentNoteId;
    if (noteId) {
      const foundNote = notes.find(n => n.id === noteId);
      setNote(foundNote);
    }
  }, [id, currentNoteId, notes]);

  // Handle note selection
  const handleNoteSelect = (noteId) => {
    onNoteSelect(noteId);
    navigate(`/note/${noteId}`);
  };

  // Navigate to note if not matching current
  useEffect(() => {
    if (id && id !== currentNoteId) {
      onNoteSelect(id);
    }
  }, [id, currentNoteId, onNoteSelect]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!note) {
    return <div className="no-note">Note not found</div>;
  }

  return (
    <div className="note-detail">
      <div className="note-header">
        <h1 className="note-title">{note.title}</h1>
        <div className="note-meta">
          <span className="note-date">
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </span>
          <span className="note-date">
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="note-tags">
        {note.tags && note.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="note-content">
        <pre>{note.content}</pre>
      </div>
    </div>
  );
};

export default NoteDetail;

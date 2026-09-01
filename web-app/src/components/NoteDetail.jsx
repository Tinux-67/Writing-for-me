import { useMemo } from 'react';
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

  const noteId = id || currentNoteId;

  const note = useMemo(() => {
    if (!noteId) return null;
    return notes.find(n => n.id === noteId);
  }, [noteId, notes]);

  // Navigate to note if not matching current
  const _handleNoteSelect = (selectedId) => {
    onNoteSelect(selectedId);
    navigate(`/note/${selectedId}`);
  };

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

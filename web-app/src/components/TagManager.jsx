import { useState } from 'react';
import { useNotes } from '../context/NotesContext';

const TagManager = ({ onClose }) => {
  const { tags, handleRenameTag, handleDeleteTag } = useNotes();
  const [editingTag, setEditingTag] = useState(null); // tag being renamed
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // tag pending delete confirm

  const startEdit = (tag) => {
    setEditingTag(tag);
    setEditValue(tag);
    setConfirmDelete(null);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  const commitRename = async () => {
    if (editValue.trim() && editValue.trim() !== editingTag) {
      await handleRenameTag(editingTag, editValue.trim());
    }
    cancelEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') cancelEdit();
  };

  const commitDelete = async (tag) => {
    await handleDeleteTag(tag);
    setConfirmDelete(null);
  };

  return (
    <div className="tag-manager-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tag-manager-modal">
        <div className="tag-manager-header">
          <h3>Manage Tags</h3>
          <button className="tag-manager-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {tags.length === 0 ? (
          <p className="tag-manager-empty">No tags yet. Add tags to your notes to see them here.</p>
        ) : (
          <ul className="tag-manager-list">
            {tags.map(tag => (
              <li key={tag} className="tag-manager-item">
                {editingTag === tag ? (
                  <div className="tag-manager-edit-row">
                    <input
                      className="tag-manager-input"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <button className="tag-manager-btn save" onClick={commitRename} title="Save">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button className="tag-manager-btn cancel" onClick={cancelEdit} title="Cancel">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : confirmDelete === tag ? (
                  <div className="tag-manager-confirm-row">
                    <span className="tag-manager-confirm-text">Delete <strong>#{tag}</strong> from all notes?</span>
                    <button className="tag-manager-btn danger" onClick={() => commitDelete(tag)} title="Confirm delete">Yes</button>
                    <button className="tag-manager-btn cancel" onClick={() => setConfirmDelete(null)} title="Cancel">No</button>
                  </div>
                ) : (
                  <div className="tag-manager-tag-row">
                    <span className="tag-manager-tag-name">#{tag}</span>
                    <div className="tag-manager-actions">
                      <button className="tag-manager-btn edit" onClick={() => startEdit(tag)} title="Rename tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="tag-manager-btn delete" onClick={() => setConfirmDelete(tag)} title="Delete tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagManager;

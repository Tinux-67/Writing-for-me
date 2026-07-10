import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from './Editor';
import { 
  getNote, 
  updateNote, 
  deleteNote as deleteNoteFromStorage,
  exportNote 
} from '../utils/storage';
import { decryptContent } from '../utils/security';
import { saveAs } from 'file-saver';

/**
 * Note Detail Component
 * Displays and edits a single note
 */
const NoteDetail = ({ 
  notes, 
  onNoteUpdated, 
  onNoteDeleted,
  theme 
}) => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load note
  const loadNote = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedNote = await getNote(id);
      
      if (!storedNote) {
        navigate('/');
        return;
      }
      
      setNote(storedNote);
      setTitle(storedNote.title || 'Untitled Note');
      setIsEncrypted(storedNote.isEncrypted || false);
      
      // If note is encrypted, show password prompt
      if (storedNote.isEncrypted) {
        setShowPasswordPrompt(true);
        setContent('');
      } else {
        setContent(storedNote.content || '');
        setShowPasswordPrompt(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [navigate]);
  
  // Load note on mount or when noteId changes
  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
    }
  }, [noteId, loadNote]);
  
  // Handle decryption
  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    try {
      if (!note) return;
      
      const decryptedContent = await decryptContent(
        note.content,
        password,
        note.salt,
        note.iv
      );
      
      setContent(decryptedContent);
      setShowPasswordPrompt(false);
      setError(null);
    } catch (err) {
      setError('Wrong password. Please try again.');
    }
  };
  
  // Save note
  const handleSave = async () => {
    if (!note || !title) return;
    
    try {
      const updatedNote = await updateNote(note.id, {
        title,
        content
      });
      
      setNote(updatedNote);
      setIsEditing(false);
      
      if (onNoteUpdated) {
        onNoteUpdated(updatedNote);
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Delete note
  const handleDelete = async () => {
    if (!note) return;
    
    try {
      await deleteNoteFromStorage(note.id);
      setShowDeleteConfirm(false);
      
      if (onNoteDeleted) {
        onNoteDeleted(note.id);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Export note
  const handleExport = async (format) => {
    if (!note) return;
    
    try {
      let exportPassword = null;
      
      // If note is encrypted, we need the password
      if (note.isEncrypted) {
        exportPassword = password;
      }
      
      const blob = await exportNote(note, format, exportPassword);
      saveAs(blob, `${note.title || 'untitled'}.${format}`);
      setShowExportMenu(false);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Toggle edit mode
  const toggleEdit = () => {
    if (isEncrypted && !content) {
      setShowPasswordPrompt(true);
      return;
    }
    setIsEditing(!isEditing);
  };
  
  // Update title
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  // Update content
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(null);
  };
  
  // Handle password key down
  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleDecrypt();
    }
  };
  
  // Get note date
  const getNoteDate = () => {
    if (!note) return '';
    
    const created = new Date(note.createdAt);
    const updated = new Date(note.updatedAt);
    
    const createdStr = created.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    const updatedStr = updated.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return createdStr + (created !== updated ? ` (Updated: ${updatedStr})` : '');
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="note-detail loading">
        <div className="loading-spinner" />
        <p>Loading note...</p>
      </div>
    );
  }
  
  // If no note found
  if (!note) {
    return (
      <div className="note-detail empty">
        <h2>Note Not Found</h2>
        <p>The note you're looking for doesn't exist or has been deleted.</p>
        <button 
          type="button" 
          className="button button-primary"
          onClick={() => navigate('/')}
        >
          Back to Notes
        </button>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="note-detail error">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          type="button" 
          className="button button-secondary"
          onClick={() => navigate('/')}
        >
          Back to Notes
        </button>
      </div>
    );
  }
  
  return (
    <div className="note-detail">
      {/* Note Header */}
      <div className="note-header">
        <div className="note-header-left">
          <button 
            type="button" 
            className="button button-ghost button-icon back-button"
            onClick={() => navigate('/')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
          
          {isEditing ? (
            <input
              type="text"
              className="input note-title-input"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note title..."
            />
          ) : (
            <h1 className="note-title">
              {isEncrypted && (
                <svg className="encrypted-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {title || 'Untitled Note'}
            </h1>
          )}
        </div>
        
        <div className="note-header-right">
          <span className="note-date text-muted text-sm">
            {getNoteDate()}
          </span>
          
          <div className="note-actions">
            <button 
              type="button" 
              className="button button-ghost button-icon"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
            </button>
            
            {showExportMenu && (
              <div className="export-menu">
                <button 
                  type="button" 
                  className="button button-ghost button-sm export-item"
                  onClick={() => handleExport('markdown')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  Export as Markdown
                </button>
                <button 
                  type="button" 
                  className="button button-ghost button-sm export-item"
                  onClick={() => handleExport('html')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v12" />
                    <path d="M12 9l4 4-4 4-4-4 4-4z" />
                  </svg>
                  Export as HTML
                </button>
                <button 
                  type="button" 
                  className="button button-ghost button-sm export-item"
                  onClick={() => handleExport('txt')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6" />
                    <path d="M9 15h6" />
                  </svg>
                  Export as Text
                </button>
                <button 
                  type="button" 
                  className="button button-ghost button-sm export-item"
                  onClick={() => handleExport('pdf')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    <path d="M17 2v12" />
                    <path d="M21 6H12" />
                    <path d="M21 10H12" />
                    <path d="M12 14H21" />
                  </svg>
                  Export as PDF
                </button>
              </div>
            )}
            
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  className="button button-secondary button-sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="button button-primary button-sm"
                  onClick={handleSave}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  className="button button-secondary button-sm"
                  onClick={toggleEdit}
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  className="button button-danger button-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Password Prompt */}
      {showPasswordPrompt && (
        <div className="password-prompt">
          <div className="password-prompt-content">
            <h3>This note is encrypted</h3>
            <p>Please enter the password to view and edit this note.</p>
            <div className="password-input-group">
              <input
                type="password"
                className="input"
                placeholder="Enter password..."
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handlePasswordKeyDown}
              />
              <button 
                type="button" 
                className="button button-primary"
                onClick={handleDecrypt}
              >
                Unlock
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}
      
      {/* Note Content */}
      {!showPasswordPrompt && (
        <div className="note-content">
          <Editor
            value={content}
            onChange={handleContentChange}
            theme={theme}
            readOnly={!isEditing}
            showStats={!isEditing}
            showToolbar={isEditing}
          />
        </div>
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Note</h3>
              <button 
                type="button" 
                className="button button-ghost button-icon"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{title || 'this note'}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="button button-danger"
                onClick={handleDelete}
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(NoteDetail);

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { getAllTemplates } from '../utils/templates';
import TagManager from './TagManager';

/**
 * Sidebar Component
 * Provides navigation, note list, and app controls
 */
const Sidebar = ({
  isCollapsed,
  onToggle,
  searchQuery,
  onSearch,
  currentTag,
  onTagSelect,
  onExport,
  theme,
  onThemeToggle,
  currentNoteId,
  onNoteSelect
}) => {
  const navigate = useNavigate();
  const _location = useLocation();
  const { tags, filteredNotes, handleCreateNote, handleDeleteNote } = useNotes();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [_showTagsDropdown, _setShowTagsDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const searchInputRef = useRef(null);

  // Load templates on mount
  useEffect(() => {
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Escape to blur search
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNewNoteModal(false);
        _setShowTagsDropdown(false);
        setShowTemplateDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle note selection
  const handleSelectNote = (noteId) => {
    onNoteSelect(noteId);
    navigate(`/note/${noteId}`);
  };

  // Handle new note creation
  const handleCreateNewNote = async () => {
    try {
      const newNote = await handleCreateNote(newNoteTitle || 'Untitled Note');
      setShowNewNoteModal(false);
      setNewNoteTitle('');
      handleSelectNote(newNote.id);
    } catch (_err) {
      // Error handled
    }
  };

  // Handle note deletion
  const handleDeleteNoteClick = async (noteId, e) => {
    e.stopPropagation();
    try {
      await handleDeleteNote(noteId);
    } catch (_err) {
      // Error handled
    }
  };

  // Filter notes based on current search and tag
  const displayNotes = filteredNotes(searchQuery, currentTag);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);
    setNewNoteTitle(template.name);
  };

  // Handle tag selection
  const handleTagClick = (tag) => {
    onTagSelect(tag === currentTag ? null : tag);
  };

  // Handle search
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="menu-toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {!isCollapsed && (
          <>
            <span className="app-title">✍️ Notes</span>
            <div className="sidebar-actions">
              <button className="icon-btn" onClick={onThemeToggle} title="Toggle theme">
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <button className="icon-btn" onClick={onExport} title="Export notes">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button className="icon-btn new-note-icon-btn" onClick={() => setShowNewNoteModal(true)} title="New note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notes... (Ctrl+K)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={isSearchFocused ? 'focused' : ''}
            />
            {isSearchFocused && searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => onSearch('')}
              >
                ×
              </button>
            )}
          </div>

          {tags.length > 0 && (
            <div className="tags-section">
              <div className="tags-section-header">
                <span className="tags-section-label">Tags</span>
                <button
                  className="tags-manage-btn"
                  onClick={() => setShowTagManager(true)}
                  title="Manage tags"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
              <div className="tags-pills">
                <button
                  className={`tag-pill ${!currentTag ? 'active' : ''}`}
                  onClick={() => onTagSelect(null)}
                >All</button>
                {tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-pill ${currentTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >#{tag}</button>
                ))}
              </div>
            </div>
          )}
          {showTagManager && (
            <TagManager onClose={() => setShowTagManager(false)} />
          )}

          <div className="notes-list">
            <div className="notes-header">
              <span>Notes ({displayNotes.length})</span>
            </div>
            {displayNotes.length === 0 ? (
              <div className="empty-notes">No notes found</div>
            ) : (
              displayNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-item ${currentNoteId === note.id ? 'active' : ''}`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div className="note-item-header">
                    <span className="note-title">{note.title || 'Untitled'}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteNoteClick(note.id, e)}
                      aria-label="Delete note"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6 M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                  <div className="note-preview-text">
                    {note.content ? note.content.replace(/[#*`_\[\]]/g, '').slice(0, 60) : 'Empty note'}
                  </div>
                  <div className="note-date">{new Date(note.updatedAt).toLocaleDateString('nl-NL', {day:'numeric', month:'short'})}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNewNoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Note</h3>
            <div className="template-selector">
              <button 
                className="template-toggle" 
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              >
                {selectedTemplate ? selectedTemplate.name : 'Select Template'}
              </button>
              {showTemplateDropdown && (
                <div className="template-dropdown">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      className="template-item"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Note title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowNewNoteModal(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={handleCreateNewNote}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;


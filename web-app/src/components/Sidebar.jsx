{ useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { getAllTemplates } from '../utils/templates';

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
  const location = useLocation();
  const { notes, tags, filteredNotes, handleCreateNote, handleDeleteNote } = useNotes();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templates, setTemplates] = useState([]);
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
        setShowTagsDropdown(false);
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {!isCollapsed && (
          <>
            <h1 className="app-title">Markdown Notes</h1>
            <div className="sidebar-actions">
              <button 
                className="theme-toggle" 
                onClick={onThemeToggle}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button 
                className="export-btn" 
                onClick={onExport}
                aria-label="Export notes"
              >
                📥
              </button>
              <button 
                className="new-note-btn" 
                onClick={() => setShowNewNoteModal(true)}
                aria-label="New note"
              >
                ➕
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

          <div className="tags-section">
            <div className="tags-header">
              <span>Tags</span>
              <button 
                className="tags-toggle" 
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              >
                {showTagsDropdown ? '▲' : '▼'}
              </button>
            </div>
            {showTagsDropdown && (
              <div className="tags-dropdown">
                {tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-btn ${currentTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  <div className="note-title">{note.title}</div>
                  <div className="note-meta">
                    <span className="note-date">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="delete-btn" 
                      onClick={(e) => handleDeleteNoteClick(note.id, e)}
                      aria-label="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
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

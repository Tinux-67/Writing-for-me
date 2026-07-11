import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllTemplates, generateCustomBookTemplate } from '../utils/templates';

/**
 * Sidebar Component
 * Provides navigation, note list, and app controls
 */
const Sidebar = ({ 
  notes, 
  currentNoteId, 
  onCreateNote, 
  onSelectNote, 
  onDeleteNote, 
  onSearch, 
  searchQuery, 
  tags,
  onSelectTag,
  currentTag,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme
}) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      
      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle search input focus
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchFocused]);
  
  // Create new note
  const handleCreateNote = () => {
    if (onCreateNote) {
      // If a template is selected, create note with template content
      if (selectedTemplate) {
        const template = templates.find(t => t.name === selectedTemplate);
        if (template) {
          onCreateNote(newNoteTitle || template.name, template.content);
        } else {
          onCreateNote(newNoteTitle || 'Untitled Note');
        }
      } else {
        onCreateNote(newNoteTitle || 'Untitled Note');
      }
      setNewNoteTitle('');
      setSelectedTemplate(null);
      setShowNewNoteModal(false);
    }
  };
  
  // Create note with specific template
  const handleCreateNoteWithTemplate = (templateName) => {
    const template = templates.find(t => t.name === templateName);
    if (template && onCreateNote) {
      onCreateNote(template.name, template.content);
      setNewNoteTitle('');
      setSelectedTemplate(null);
      setShowNewNoteModal(false);
    }
  };
  
  // Select note
  const handleSelectNote = (noteId) => {
    if (onSelectNote) {
      onSelectNote(noteId);
      navigate(`/note/${noteId}`);
    }
  };
  
  // Delete note with confirmation
  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDeleteNote(noteId);
    }
  };
  
  // Select tag
  const handleSelectTag = (tag) => {
    if (onSelectTag) {
      onSelectTag(tag === currentTag ? null : tag);
      setShowTagsDropdown(false);
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    if (onSearch) {
      onSearch('');
    }
  };
  
  // Get note title preview
  const getNotePreview = (note) => {
    const title = note.title || 'Untitled Note';
    const content = note.content || '';
    
    // Get first line of content if no title
    const preview = content.split('\n')[0] || '';
    
    return {
      title: title.substring(0, 30),
      preview: preview.substring(0, 50)
    };
  };
  
  // Get note date
  const getNoteDate = (note) => {
    const date = new Date(note.updatedAt || note.createdAt);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Check if note is encrypted
  const isNoteEncrypted = (note) => {
    return note.isEncrypted;
  };
  
  // Toggle template dropdown
  const toggleTemplateDropdown = () => {
    setShowTemplateDropdown(!showTemplateDropdown);
  };

  // Select template
  const selectTemplate = (templateName) => {
    setSelectedTemplate(templateName);
    setShowTemplateDropdown(false);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${theme}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="brand-name">
              <span>Markdown</span>
              <span>Notes</span>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button 
          type="button" 
          className="button button-ghost button-icon sidebar-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
              <path d="M13 2L3 12h9l-1 8 10-6-1-8z" />
            ) : (
              <path d="M21 12H3" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Search */}
      <div className="sidebar-section search-section">
        <div className="search-container">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="input search-input"
            placeholder={isCollapsed ? '' : 'Search notes...'}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery && !isCollapsed && (
            <button 
              type="button" 
              className="button button-ghost button-icon search-clear"
              onClick={handleClearSearch}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Keyboard shortcut hint */}
        {!isCollapsed && !isSearchFocused && (
          <div className="keyboard-hint text-xs text-muted">
            Ctrl+K to search
          </div>
        )}
      </div>
      
      {/* Create Note Button */}
      <div className="sidebar-section">
        <button 
          type="button" 
          className="button button-primary create-note-button"
          onClick={() => setShowNewNoteModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          {!isCollapsed && <span>New Note</span>}
        </button>
      </div>
      
      {/* Template Quick Access Buttons */}
      {!isCollapsed && templates.length > 0 && (
        <div className="sidebar-section template-quick-access">
          <div className="quick-template-buttons">
            {templates.slice(0, 3).map(template => (
              <button
                key={template.name}
                type="button"
                className="button button-ghost button-sm template-quick-button"
                onClick={() => handleCreateNoteWithTemplate(template.name)}
                title={`Create ${template.name}`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Tags Filter */}
      {tags && tags.length > 0 && !isCollapsed && (
        <div className="sidebar-section tags-section">
          <div className="tags-header">
            <span className="section-title">Tags</span>
            <button 
              type="button" 
              className="button button-ghost button-sm"
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
            >
              {currentTag ? `#${currentTag}` : 'All'}
            </button>
          </div>
          
          {showTagsDropdown && (
            <div className="tags-dropdown">
              <button 
                type="button" 
                className={`button button-ghost button-sm tag-item ${!currentTag ? 'active' : ''}`}
                onClick={() => handleSelectTag(null)}
              >
                All Notes
              </button>
              {tags.map(tag => (
                <button 
                  key={tag}
                  type="button" 
                  className={`button button-ghost button-sm tag-item ${currentTag === tag ? 'active' : ''}`}
                  onClick={() => handleSelectTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Notes List */}
      <div className="sidebar-section notes-section">
        <div className="notes-header">
          {!isCollapsed && (
            <span className="section-title">
              {currentTag ? `#${currentTag}` : 'All Notes'}
            </span>
          )}
          {!isCollapsed && notes && (
            <span className="notes-count text-muted text-sm">
              {notes.length}
            </span>
          )}
        </div>
        
        <nav className="notes-nav">
          {notes && notes.length > 0 ? (
            notes.map(note => {
              const { title, preview } = getNotePreview(note);
              const date = getNoteDate(note);
              const isEncrypted = isNoteEncrypted(note);
              const isActive = currentNoteId === note.id;
              
              return (
                <div 
                  key={note.id}
                  className={`note-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  {!isCollapsed && (
                    <>
                      <div className="note-header">
                        <span className="note-title">
                          {isEncrypted && (
                            <svg className="encrypted-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                          {title || 'Untitled Note'}
                        </span>
                        <span className="note-date text-muted text-xs">{date}</span>
                      </div>
                      <div className="note-preview text-muted text-xs">{preview}</div>
                    </>
                  )}
                  {isCollapsed && (
                    <div className="note-icon" title={title || 'Untitled Note'}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-notes text-muted text-sm">
              {!isCollapsed && 'No notes found'}
            </div>
          )}
        </nav>
      </div>
      
      {/* New Note Modal */}
      {showNewNoteModal && !isCollapsed && (
        <div className="modal-overlay" onClick={() => setShowNewNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Note</h3>
              <button 
                type="button" 
                className="button button-ghost button-icon"
                onClick={() => setShowNewNoteModal(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <label className="input-label">Note Title</label>
              <input
                type="text"
                className="input"
                placeholder="Untitled Note"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNote();
                  }
                }}
              />
              
              {/* Template Selection */}
              <div className="template-selection">
                <label className="input-label">Template (Optional)</label>
                <div className="template-dropdown-container">
                  <button 
                    type="button" 
                    className="button button-secondary template-dropdown-button"
                    onClick={toggleTemplateDropdown}
                  >
                    {selectedTemplate || 'No Template'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showTemplateDropdown && (
                    <div className="template-dropdown">
                      <button 
                        type="button" 
                        className="button button-ghost template-item"
                        onClick={() => selectTemplate(null)}
                      >
                        No Template
                      </button>
                      {templates.map(template => (
                        <button 
                          key={template.name}
                          type="button" 
                          className="button button-ghost template-item"
                          onClick={() => selectTemplate(template.name)}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTemplate && (
                  <div className="template-info">
                    <small className="text-muted">
                      {templates.find(t => t.name === selectedTemplate)?.description}
                    </small>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setShowNewNoteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="button button-primary"
                onClick={handleCreateNote}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default React.memo(Sidebar);

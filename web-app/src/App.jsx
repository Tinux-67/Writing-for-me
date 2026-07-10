import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NoteDetail from './components/NoteDetail';
import Editor from './components/Editor';
import {
  createNote,
  getAllNotes,
  deleteNote,
  searchNotes,
  getNotesByTag,
  getAllTags,
  exportAllNotes
} from './utils/storage';
import { saveAs } from 'file-saver';
import './styles/app.css';

/**
 * Main App Component
 * Manages state and routing for the Markdown Notes web app
 */
const App = () => {
  // State
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTag, setCurrentTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load theme preference
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Load notes
      const allNotes = await getAllNotes();
      setNotes(allNotes);
      
      // Load tags
      const allTags = await getAllTags();
      setTags(allTags);
      
      // Set first note as current if available
      if (allNotes.length > 0 && !currentNoteId) {
        setCurrentNoteId(allNotes[0].id);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [currentNoteId]);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Filter notes based on search and tag
  const filteredNotes = useCallback(() => {
    let result = [...notes];
    
    // Filter by tag
    if (currentTag) {
      result = result.filter(note => note.tags && note.tags.includes(currentTag));
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    return result;
  }, [notes, currentTag, searchQuery]);
  
  // Create new note
  const handleCreateNote = async (title = 'Untitled Note') => {
    try {
      const newNote = await createNote(title, '');
      setNotes(prev => [newNote, ...prev]);
      setCurrentNoteId(newNote.id);
      return newNote;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };
  
  // Select note
  const handleSelectNote = (noteId) => {
    setCurrentNoteId(noteId);
  };
  
  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      if (currentNoteId === noteId) {
        // Select the first note or navigate to home
        const remainingNotes = notes.filter(note => note.id !== noteId);
        if (remainingNotes.length > 0) {
          setCurrentNoteId(remainingNotes[0].id);
        } else {
          setCurrentNoteId(null);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Update note
  const handleNoteUpdated = (updatedNote) => {
    setNotes(prev => 
      prev.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  };
  
  // Search notes
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  // Select tag
  const handleSelectTag = (tag) => {
    setCurrentTag(tag);
  };
  
  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Export all notes
  const handleExportAll = async () => {
    try {
      const blob = await exportAllNotes();
      saveAs(blob, `markdown-notes-export-${new Date().toISOString().split('T')[0]}.zip`);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save (handled by Editor component)
      // Ctrl/Cmd + E to export all
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportAll();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // If loading
  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner" />
        <p>Loading notes...</p>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="app error">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          type="button" 
          className="button button-primary"
          onClick={loadData}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <Router>
      <div className={`app ${theme} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar */}
        <Sidebar
          notes={filteredNotes()}
          currentNoteId={currentNoteId}
          onCreateNote={handleCreateNote}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          tags={tags}
          onSelectTag={handleSelectTag}
          currentTag={currentTag}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        
        {/* Main Content */}
        <main className="main-content">
          <Routes>
            {/* Home - Note List */}
            <Route
              path="/"
              element={
                filteredNotes().length > 0 ? (
                  <Navigate to={`/note/${filteredNotes()[0].id}`} replace />
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                      </svg>
                    </div>
                    <h2>No Notes Yet</h2>
                    <p>Create your first markdown note to get started.</p>
                    <button 
                      type="button" 
                      className="button button-primary button-lg"
                      onClick={() => handleCreateNote()}
                    >
                      Create First Note
                    </button>
                  </div>
                )
              }
            />
            
            {/* Note Detail */}
            <Route
              path="/note/:noteId"
              element={
                <NoteDetail
                  notes={notes}
                  onNoteUpdated={handleNoteUpdated}
                  onNoteDeleted={handleDeleteNote}
                  theme={theme}
                />
              }
            />
            
            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h2>Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <button 
                    type="button" 
                    className="button button-primary"
                    onClick={() => navigate('/')}
                  >
                    Back to Notes
                  </button>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
  getAllNotes,
  getAllTags,
  createNote,
  deleteNote,
  searchNotes,
  getNotesByTag,
} from '../utils/storage';

/**
 * Notes Context for state management
 */
const NotesContext = createContext();

/**
 * Notes Provider Component
 */
export const NotesProvider = ({ children }) => {
  // State
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load notes
      const allNotes = await getAllNotes();
      setNotes(allNotes);
      
      // Load tags
      const allTags = await getAllTags();
      setTags(allTags);
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Filter notes based on search and tag
  const filteredNotes = useCallback((searchQuery, currentTag) => {
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
  }, [notes]);

  // Create new note
  const handleCreateNote = async (title = 'Untitled Note', content = '') => {
    try {
      const newNote = await createNote(title, content);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Search notes
  const handleSearchNotes = async (query) => {
    try {
      return await searchNotes(query);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Get notes by tag
  const handleGetNotesByTag = async (tag) => {
    try {
      return await getNotesByTag(tag);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const value = {
    notes,
    tags,
    isLoading,
    error,
    loadData,
    filteredNotes,
    handleCreateNote,
    handleDeleteNote,
    handleSearchNotes,
    handleGetNotesByTag,
    setNotes,
    setTags,
    setIsLoading,
    setError,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

/**
 * Custom hook to use Notes Context
 */
export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export default NotesContext;

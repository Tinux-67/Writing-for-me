import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import {
  getAllNotes,
  getAllTags,
  createNote,
  deleteNote,
  updateNote,
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

  // Load data on mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [allNotes, allTags] = await Promise.all([getAllNotes(), getAllTags()]);

        if (!mounted) return;
        setNotes(allNotes);
        setTags(allTags);
      } catch (_err) {
        if (!mounted) return;
        setError(_err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Create new note
  const handleCreateNote = async (title = 'Untitled Note', content = '') => {
    try {
      const newNote = await createNote(title, content);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (_err) {
      setError(_err.message);
      throw _err;
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (_err) {
      setError(_err.message);
      throw _err;
    }
  };

  // Update note
  const handleUpdateNote = async (noteId, updates) => {
    try {
      const updated = await updateNote(noteId, updates);
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      // Refresh tags list whenever tags are changed
      if (updates.tags !== undefined) {
        const allTags = await getAllTags();
        setTags(allTags);
      }
      return updated;
    } catch (_err) {
      setError(_err.message);
      throw _err;
    }
  };

  // Rename tag across all notes
  const handleRenameTag = async (oldTag, newTag) => {
    try {
      const affected = notes.filter(n => n.tags && n.tags.includes(oldTag));
      await Promise.all(affected.map(n =>
        updateNote(n.id, { tags: n.tags.map(t => t === oldTag ? newTag : t) })
      ));
      setNotes(prev => prev.map(n => ({
        ...n,
        tags: n.tags ? n.tags.map(t => t === oldTag ? newTag : t) : []
      })));
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (_err) {
      setError(_err.message);
    }
  };

  // Delete tag from all notes
  const handleDeleteTag = async (tag) => {
    try {
      const affected = notes.filter(n => n.tags && n.tags.includes(tag));
      await Promise.all(affected.map(n =>
        updateNote(n.id, { tags: n.tags.filter(t => t !== tag) })
      ));
      setNotes(prev => prev.map(n => ({
        ...n,
        tags: n.tags ? n.tags.filter(t => t !== tag) : []
      })));
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (_err) {
      setError(_err.message);
    }
  };

  const value = {
    notes,
    tags,
    isLoading,
    error,
    filteredNotes,
    handleCreateNote,
    handleDeleteNote,
    handleUpdateNote,
    handleRenameTag,
    handleDeleteTag,
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

export { NotesContext };

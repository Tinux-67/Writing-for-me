import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotesProvider } from './context/NotesContext';
import { useTheme } from './hooks/useTheme';
import { useSidebar } from './hooks/useSidebar';
import Sidebar from './components/Sidebar';
import NoteDetail from './components/NoteDetail';
import Editor from './components/Editor';
import { saveAs } from 'file-saver';
import { exportAllNotes } from './utils/storage';
import './styles/app.css';

/**
 * Main App Component
 * Manages routing and layout for the Markdown Notes web app
 */
const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTag, setCurrentTag] = useState(null);

  // Export all notes
  const handleExportNotes = async () => {
    try {
      const notes = await exportAllNotes();
      const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
      saveAs(blob, 'notes-export.json');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', err);
      // TODO: surface a toast/snackbar notification to the user
      alert('Export failed. Please try again.');
    }
  };

  return (
    <NotesProvider>
      <Router basename="/">
        <div className="app" data-theme={theme}>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            currentTag={currentTag}
            onTagSelect={setCurrentTag}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onExport={handleExportNotes}
            onThemeToggle={toggleTheme}
            theme={theme}
            currentNoteId={currentNoteId}
            onNoteSelect={setCurrentNoteId}
          />
          
          <div className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <Routes>
              <Route
                path="/"
                element={
                  <Editor
                    currentNoteId={currentNoteId}
                    onNoteSelect={setCurrentNoteId}
                    searchQuery={searchQuery}
                    currentTag={currentTag}
                  />
                }
              />
              <Route
                path="/note/:id"
                element={
                  <NoteDetail
                    currentNoteId={currentNoteId}
                    onNoteSelect={setCurrentNoteId}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </NotesProvider>
  );
};

export default App;

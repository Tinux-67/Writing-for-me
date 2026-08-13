import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  wrapSelection,
  createList,
  insertLink,
  insertImage,
  getWordCount,
  getCharacterCount,
  getReadingTime
} from '../utils/markdown';
import { insertTemplateAtCursor } from '../utils/templates';
import { useNotes } from '../context/NotesContext';
import TemplateSelector from './TemplateSelector';

/**
 * Simple debounce utility — delays fn until after `delay` ms of inactivity.
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Markdown Editor Component
 * Provides a split-pane editor with live preview
 */
const Editor = ({
  currentNoteId,
  onNoteSelect,
  searchQuery,
  currentTag,
  showToolbar = true,
  showStats = true
}) => {
  const { notes, handleCreateNote, handleUpdateNote } = useNotes();
  const [activeTab, setActiveTab] = useState('edit');
  const [, setCursorPosition] = useState(0);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // Get current note
  const currentNote = notes.find(note => note.id === currentNoteId);

  // Local content for responsive typing (controlled textarea + no-op onChange = snap-back)
  const [localContent, setLocalContent] = useState(currentNote?.content ?? '');

  // Sync local content when the current note changes
  useEffect(() => {
    setLocalContent(currentNote?.content ?? '');
  }, [currentNoteId, currentNote?.content]);

  // Debounced save to context / storage (400 ms after last keystroke)
  const debouncedSave = useCallback(
    debounce(async (content) => {
      if (currentNoteId) {
        await handleUpdateNote(currentNoteId, { content });
      }
    }, 400),
    [currentNoteId, handleUpdateNote]
  );

  // Handle text changes — update local state instantly, debounce the persist
  const handleChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    debouncedSave(newContent);
  };

  // Sync scroll between editor and preview
  const handleScroll = useCallback((e) => {
    if (previewRef.current && activeTab === 'split') {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  }, [activeTab]);

  // Handle cursor position changes
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  // Format text
  const formatText = (formatter) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const newText = formatter(selectedText, textarea.value, start, end);
      
      textarea.value = newText;
      textarea.selectionStart = start + newText.length - selectedText.length;
      textarea.selectionEnd = textarea.selectionStart;
      
      // Trigger onChange
      const event = new Event('change');
      textarea.dispatchEvent(event);
    }
  };

  // Get syntax highlighter style based on theme
  const getSyntaxStyle = (theme) => {
    return theme === 'dark' ? atomDark : oneLight;
  };

  // Calculate stats (use localContent for live counts)
  const wordCount = currentNote ? getWordCount(localContent) : 0;
  const charCount = currentNote ? getCharacterCount(localContent) : 0;
  const readingTime = currentNote ? getReadingTime(localContent) : 0;

  // Filter notes for selection (used by template/note-picker UI if rendered)
  const _filteredNotes = notes.filter(note => {
    if (currentTag) {
      if (!note.tags || !note.tags.includes(currentTag)) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!note.title.toLowerCase().includes(query) && 
          !note.content.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  // Handle template insertion
  const handleInsertTemplate = (template) => {
    if (textareaRef.current) {
      insertTemplateAtCursor(textareaRef.current, template.content);
      setShowTemplateSelector(false);
    }
  };

  // Handle new note creation
  const handleNewNote = async () => {
    try {
      const newNote = await handleCreateNote('Untitled Note', '');
      onNoteSelect(newNote.id);
    } catch (_err) {
      // Error handled
    }
  };

  if (!currentNote) {
    return (
      <div className="editor-container">
        <div className="no-note-selected">
          <p>No note selected</p>
          <button onClick={handleNewNote}>Create New Note</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {showToolbar && (
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button 
              onClick={() => formatText(wrapSelection('**', '**'))} 
              title="Bold"
            >
              <b>B</b>
            </button>
            <button 
              onClick={() => formatText(wrapSelection('_', '_'))} 
              title="Italic"
            >
              <i>I</i>
            </button>
            <button 
              onClick={() => formatText(wrapSelection('`', '`'))} 
              title="Code"
            >
              `</button>
            <button 
              onClick={() => formatText(createList('- '))} 
              title="Bullet List"
            >
              • List
            </button>
            <button 
              onClick={() => formatText(createList('1. '))} 
              title="Numbered List"
            >
              1. List
            </button>
            <button 
              onClick={() => formatText(insertLink)} 
              title="Insert Link"
            >
              🔗
            </button>
            <button 
              onClick={() => formatText(insertImage)} 
              title="Insert Image"
            >
              🖼️
            </button>
            <button 
              onClick={() => setShowTemplateSelector(true)} 
              title="Insert Template"
            >
              📄
            </button>
          </div>
          <div className="toolbar-group">
            <button 
              onClick={() => setActiveTab('edit')} 
              className={activeTab === 'edit' ? 'active' : ''}
            >
              Edit
            </button>
            <button 
              onClick={() => setActiveTab('preview')} 
              className={activeTab === 'preview' ? 'active' : ''}
            >
              Preview
            </button>
            <button 
              onClick={() => setActiveTab('split')} 
              className={activeTab === 'split' ? 'active' : ''}
            >
              Split
            </button>
          </div>
        </div>
      )}

      <div className={`editor-content ${activeTab}`}>
        {activeTab !== 'preview' && (
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            onScroll={handleScroll}
            onSelect={handleCursorChange}
            className="editor-textarea"
            placeholder="Start writing..."
          />
        )}

        {activeTab !== 'edit' && (
          <div 
            ref={previewRef} 
            className="editor-preview"
            onScroll={handleScroll}
          >
            <ReactMarkdown
              children={localContent}
              components={{
                code({ node: _node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, '')}
                      style={getSyntaxStyle('dark')}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            />
          </div>
        )}
      </div>

      {showStats && (
        <div className="editor-stats">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
          <span>Reading Time: {readingTime} min</span>
        </div>
      )}

      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleInsertTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};

export default Editor;

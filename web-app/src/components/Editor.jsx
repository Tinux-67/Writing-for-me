import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  const currentNote = notes.find(note => note.id === currentNoteId);
  const [localContent, setLocalContent] = useState(currentNote?.content ?? '');
  const [title, setTitle] = useState(currentNote?.title ?? '');
  const [tagInput, setTagInput] = useState('');

  const { id: urlNoteId } = useParams();

  // Sync currentNoteId from URL param (handles direct navigation to /note/:id)
  useEffect(() => {
    if (urlNoteId && urlNoteId !== currentNoteId) {
      onNoteSelect(urlNoteId);
    }
  }, [urlNoteId]);

  // Tag handlers
  const handleAddTag = async () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmed || !currentNote) return;
    const existing = currentNote.tags || [];
    if (existing.includes(trimmed)) { setTagInput(''); return; }
    await handleUpdateNote(currentNoteId, { tags: [...existing, trimmed] });
    setTagInput('');
  };

  const handleRemoveTag = async (tag) => {
    if (!currentNote) return;
    const existing = currentNote.tags || [];
    await handleUpdateNote(currentNoteId, { tags: existing.filter(t => t !== tag) });
  };

  useEffect(() => {
    setLocalContent(currentNote?.content ?? '');
  }, [currentNoteId, currentNote?.content]);

  useEffect(() => {
    setTitle(currentNote?.title ?? '');
  }, [currentNoteId, currentNote?.title]);

  const debouncedSave = useCallback(
    debounce(async (content) => {
      if (currentNoteId) {
        await handleUpdateNote(currentNoteId, { content });
      }
    }, 400),
    [currentNoteId, handleUpdateNote]
  );

  const debouncedTitleSave = useCallback(
    debounce(async (newTitle) => {
      if (currentNoteId && newTitle.trim()) {
        await handleUpdateNote(currentNoteId, { title: newTitle.trim() });
      }
    }, 600),
    [currentNoteId, handleUpdateNote]
  );

  const handleChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    debouncedSave(newContent);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (newTitle.trim()) {
      debouncedTitleSave(newTitle);
    }
  };

  const handleScroll = useCallback((e) => {
    if (previewRef.current && activeTab === 'split') {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  }, [activeTab]);

  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  // FIXED: handles { text, newCursorPos } return objects from markdown utils
  const formatText = (formatter) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      const result = formatter(selectedText, textarea.value, start, end);

      if (typeof result === 'string') {
        textarea.value = result;
      } else if (result && typeof result.text === 'string') {
        textarea.value = result.text;
        textarea.selectionStart = result.newCursorPos;
        textarea.selectionEnd = result.newCursorPos;
      }

      // Sync React state via native setter + input event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      ).set;
      nativeInputValueSetter.call(textarea, textarea.value);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      setLocalContent(textarea.value);
      debouncedSave(textarea.value);
      textarea.focus();
    }
  };

  // Sync textarea value directly (bypassing React's controlled input)
  const syncTextarea = useCallback((textarea, newText, newPos) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    nativeSetter.call(textarea, newText);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;
    setLocalContent(newText);
    debouncedSave(newText);
  }, [debouncedSave]);

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Enter') return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const text = textarea.value;

    // Find the current line bounds
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = text.indexOf('\n', pos);
    const currentLine = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

    // Match bullet or numbered list prefix
    const bulletMatch = currentLine.match(/^(- )(.*)/);
    const numberMatch = currentLine.match(/^(\d+)\. (.*)/);

    if (!bulletMatch && !numberMatch) return; // Normal Enter behaviour

    const content = bulletMatch ? bulletMatch[2] : numberMatch[2];

    // Double-Enter on empty list item → exit the list
    if (content.trim() === '') {
      e.preventDefault();
      const prefixLen = bulletMatch ? 2 : numberMatch[1].length + 2;
      const newText = text.substring(0, lineStart) + text.substring(lineStart + prefixLen);
      syncTextarea(textarea, newText, lineStart);
      return;
    }

    // Single Enter on a list item → continue the list
    e.preventDefault();
    const insertPos = lineEnd === -1 ? text.length : lineEnd;
    const newPrefix = bulletMatch
      ? '\n- '
      : `\n${parseInt(numberMatch[1]) + 1}. `;
    const newText = text.substring(0, insertPos) + newPrefix + text.substring(insertPos);
    syncTextarea(textarea, newText, insertPos + newPrefix.length);
  }, [syncTextarea]);

  const getSyntaxStyle = (theme) => {
    return theme === 'dark' ? atomDark : oneLight;
  };

  const wordCount = currentNote ? getWordCount(localContent) : 0;
  const charCount = currentNote ? getCharacterCount(localContent) : 0;
  const readingTime = currentNote ? getReadingTime(localContent) : 0;

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

  // FIXED: receives templateContent string, passes correct args to insertTemplateAtCursor
  const handleInsertTemplate = (templateContent) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const pos = textarea.selectionStart;
      const result = insertTemplateAtCursor(textarea.value, templateContent, pos);
      textarea.value = result.content;
      textarea.selectionStart = result.cursorPosition;
      textarea.selectionEnd = result.cursorPosition;

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      ).set;
      nativeInputValueSetter.call(textarea, textarea.value);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      setLocalContent(result.content);
      debouncedSave(result.content);
      setShowTemplateSelector(false);
      textarea.focus();
    }
  };

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
            {/* FIXED: callbacks pass (sel, text, start, end) matching util signatures */}
            <button
              onClick={() => formatText((sel, text, start, end) => wrapSelection(text, start, end, 'bold'))}
              title="Bold"
            >
              <b>B</b>
            </button>
            <button
              onClick={() => formatText((sel, text, start, end) => wrapSelection(text, start, end, 'italic'))}
              title="Italic"
            >
              <i>I</i>
            </button>
            <button
              onClick={() => formatText((sel, text, start, end) => wrapSelection(text, start, end, 'code'))}
              title="Code"
            >
              `</button>
            <button
              onClick={() => formatText((sel, text, start, end) => createList(text, start, end, 'bullet'))}
              title="Bullet List"
            >
              • List
            </button>
            <button
              onClick={() => formatText((sel, text, start, end) => createList(text, start, end, 'number'))}
              title="Numbered List"
            >
              1. List
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) formatText((sel, text, start, end) => insertLink(text, start, end, url));
              }}
              title="Insert Link"
            >
              🔗
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) {
                  const alt = prompt('Enter alt text (optional):', 'image');
                  formatText((sel, text, start, end) => insertImage(text, start, end, url, alt || 'image'));
                }
              }}
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

      {/* NEW: editable title bar */}
      <div className="editor-title-bar">
        <input
          type="text"
          className="editor-title-input"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          aria-label="Note title"
        />
      </div>

      {/* Tag bar */}
      <div className="editor-tags-bar">
        <div className="editor-tags-list">
          {(currentNote.tags || []).map(tag => (
            <span key={tag} className="editor-tag-badge">
              #{tag}
              <button
                className="editor-tag-remove"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="editor-tag-input"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
            if (e.key === ',' ) { e.preventDefault(); handleAddTag(); }
          }}
          placeholder="Add tag (Enter or comma)..."
          aria-label="Add tag"
        />
      </div>

      <div className={`editor-content ${activeTab}`}>
        {activeTab !== 'preview' && (
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
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
          onInsertTemplate={handleInsertTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};

export default Editor;

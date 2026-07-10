import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, atomLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  wrapSelection, 
  createList, 
  insertLink, 
  insertImage,
  getWordCount,
  getCharacterCount,
  getReadingTime 
} from '../utils/markdown';

/**
 * Markdown Editor Component
 * Provides a split-pane editor with live preview
 */
const Editor = ({ 
  value, 
  onChange, 
  theme = 'dark',
  readOnly = false,
  showStats = true,
  showToolbar = true 
}) => {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'split'
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  
  // Sync scroll between editor and preview
  const handleScroll = useCallback((e) => {
    if (previewRef.current && activeTab === 'split') {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  }, [activeTab]);
  
  // Handle text changes
  const handleChange = (e) => {
    if (readOnly) return;
    onChange(e.target.value);
  };
  
  // Handle cursor position changes
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart);
  };
  
  // Format text with markdown
  const formatText = (format) => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;
    
    let result;
    switch (format) {
      case 'bold':
        result = wrapSelection(text, start, end, 'bold');
        break;
      case 'italic':
        result = wrapSelection(text, start, end, 'italic');
        break;
      case 'code':
        result = wrapSelection(text, start, end, 'code');
        break;
      case 'strikethrough':
        result = wrapSelection(text, start, end, 'strikethrough');
        break;
      case 'heading1':
        result = wrapSelection(text, start, end, 'heading1');
        break;
      case 'heading2':
        result = wrapSelection(text, start, end, 'heading2');
        break;
      case 'heading3':
        result = wrapSelection(text, start, end, 'heading3');
        break;
      case 'bullet-list':
        result = createList(text, start, end, 'bullet');
        break;
      case 'number-list':
        result = createList(text, start, end, 'number');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          result = insertLink(text, start, end, url);
        }
        break;
      case 'image':
        const imageUrl = prompt('Enter image URL:');
        if (imageUrl) {
          result = insertImage(text, start, end, imageUrl);
        }
        break;
      default:
        return;
    }
    
    onChange(result.text);
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = result.newCursorPos;
        textareaRef.current.selectionEnd = result.newCursorPos;
      }
    }, 0);
  };
  
  // Insert horizontal rule
  const insertHorizontalRule = () => {
    if (readOnly) return;
    const newValue = value.substring(0, cursorPosition) + '\n---\n' + value.substring(cursorPosition);
    onChange(newValue);
  };
  
  // Insert code block
  const insertCodeBlock = () => {
    if (readOnly) return;
    const language = prompt('Enter language (optional):');
    const codeBlock = language ? `\n\`\`\`${language}\n\n\`\`\`\n` : '\n\`\`\`\n\n\`\`\`\n';
    const newValue = value.substring(0, cursorPosition) + codeBlock + value.substring(cursorPosition);
    onChange(newValue);
  };
  
  // Insert table
  const insertTable = () => {
    if (readOnly) return;
    const table = `\n| Header 1 | Header 2 |\n|---------|---------|\n| Cell 1  | Cell 2  |\n\n`;
    const newValue = value.substring(0, cursorPosition) + table + value.substring(cursorPosition);
    onChange(newValue);
  };
  
  // Calculate stats
  const wordCount = getWordCount(value);
  const charCount = getCharacterCount(value);
  const readingTime = getReadingTime(value);
  
  // Get syntax highlighter style based on theme
  const codeStyle = theme === 'light' ? atomLight : atomDark;
  
  return (
    <div className="editor-container">
      {/* Toolbar */}
      {showToolbar && (
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('heading1')}
              title="Heading 1"
              disabled={readOnly}
            >
              <span className="toolbar-icon">H1</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('heading2')}
              title="Heading 2"
              disabled={readOnly}
            >
              <span className="toolbar-icon">H2</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('heading3')}
              title="Heading 3"
              disabled={readOnly}
            >
              <span className="toolbar-icon">H3</span>
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('bold')}
              title="Bold"
              disabled={readOnly}
            >
              <span className="toolbar-icon">**B**</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('italic')}
              title="Italic"
              disabled={readOnly}
            >
              <span className="toolbar-icon">*I*</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('strikethrough')}
              title="Strikethrough"
              disabled={readOnly}
            >
              <span className="toolbar-icon">~~S~~</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('code')}
              title="Inline Code"
              disabled={readOnly}
            >
              <span className="toolbar-icon">`Code`</span>
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('bullet-list')}
              title="Bullet List"
              disabled={readOnly}
            >
              <span className="toolbar-icon">• List</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('number-list')}
              title="Numbered List"
              disabled={readOnly}
            >
              <span className="toolbar-icon">1. List</span>
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={insertCodeBlock}
              title="Code Block"
              disabled={readOnly}
            >
              <span className="toolbar-icon">{'{}'}</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('link')}
              title="Insert Link"
              disabled={readOnly}
            >
              <span className="toolbar-icon">🔗</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={() => formatText('image')}
              title="Insert Image"
              disabled={readOnly}
            >
              <span className="toolbar-icon">🖼️</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={insertTable}
              title="Insert Table"
              disabled={readOnly}
            >
              <span className="toolbar-icon">□</span>
            </button>
            <button 
              type="button" 
              className="button button-ghost button-sm" 
              onClick={insertHorizontalRule}
              title="Horizontal Rule"
              disabled={readOnly}
            >
              <span className="toolbar-icon">—</span>
            </button>
          </div>
        </div>
      )}
      
      {/* View tabs */}
      <div className="editor-tabs">
        <button 
          type="button" 
          className={`button button-ghost button-sm ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit
        </button>
        <button 
          type="button" 
          className={`button button-ghost button-sm ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button 
          type="button" 
          className={`button button-ghost button-sm ${activeTab === 'split' ? 'active' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          Split
        </button>
      </div>
      
      {/* Editor and Preview */}
      <div className={`editor-content ${activeTab}`}>
        {/* Edit Panel */}
        <div 
          className={`editor-panel edit-panel ${activeTab === 'split' ? 'split-view' : ''}`}
          onScroll={handleScroll}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onSelect={handleCursorChange}
            className="editor-textarea"
            placeholder="Start writing your markdown note..."
            readOnly={readOnly}
            spellCheck="true"
          />
        </div>
        
        {/* Preview Panel */}
        <div 
          ref={previewRef}
          className={`editor-panel preview-panel ${activeTab === 'split' ? 'split-view' : ''}`}
        >
          <div className="markdown-preview">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={codeStyle}
                      language={match[1]}
                      PreTag="div"
                      children={String(children).replace(/\n$/, '')}
                      {...props}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                table({ node, children, ...props }) {
                  return (
                    <table className="markdown-table" {...props}>
                      {children}
                    </table>
                  );
                },
                th({ node, children, ...props }) {
                  return (
                    <th className="markdown-th" {...props}>
                      {children}
                    </th>
                  );
                },
                td({ node, children, ...props }) {
                  return (
                    <td className="markdown-td" {...props}>
                      {children}
                    </td>
                  );
                }
              }}
            >
              {value || 'Nothing to preview'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      {showStats && (
        <div className="editor-stats">
          <span className="stat-item">
            <span className="stat-label">Words:</span> {wordCount}
          </span>
          <span className="stat-item">
            <span className="stat-label">Characters:</span> {charCount}
          </span>
          <span className="stat-item">
            <span className="stat-label">Reading Time:</span> {readingTime} min
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(Editor);

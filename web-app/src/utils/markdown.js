/**
 * Markdown utilities for the Markdown Notes web app
 * Handles markdown parsing, rendering, and syntax highlighting
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Configure marked (v11+ API — only breaks and gfm are valid options here;
// syntax highlighting is handled by react-syntax-highlighter in JSX components)
marked.use({
  breaks: true,
  gfm: true,
});

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'code', 'pre',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'span', 'div', 'del', 'sub', 'sup'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id', 'target',
      'rel', 'style', 'lang', 'dir'
    ],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input']
  });
}

/**
 * Parse markdown to HTML with XSS protection
 * @param {string} markdown - Markdown content
 * @returns {string} Sanitized HTML content
 */
export function parseMarkdown(markdown) {
  if (!markdown) return '';
  const html = marked.parse(markdown);
  return sanitizeHtml(html);
}

/**
 * Parse markdown to plain text (without HTML)
 * @param {string} markdown - Markdown content
 * @returns {string} Plain text content
 */
export function markdownToText(markdown) {
  if (!markdown) return '';
  
  // Remove markdown formatting
  return markdown
    .replace(/^[#]+\s+/gm, '') // Remove headers
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\n\n+/g, '\n\n') // Normalize newlines
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/!\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/---+/g, '') // Remove horizontal rules
    .trim();
}

/**
 * Get word count from markdown
 * @param {string} markdown - Markdown content
 * @returns {number} Word count
 */
export function getWordCount(markdown) {
  if (!markdown) return 0;
  const text = markdownToText(markdown);
  const words = text.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Get character count from markdown
 * @param {string} markdown - Markdown content
 * @returns {number} Character count (excluding spaces)
 */
export function getCharacterCount(markdown) {
  if (!markdown) return 0;
  const text = markdownToText(markdown);
  return text.replace(/\s+/g, '').length;
}

/**
 * Get reading time in minutes
 * @param {string} markdown - Markdown content
 * @returns {number} Reading time in minutes
 */
export function getReadingTime(markdown) {
  const wordCount = getWordCount(markdown);
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract headings from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<{level: number, text: string, id: string}>} Array of headings
 */
export function extractHeadings(markdown) {
  if (!markdown) return [];
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    headings.push({
      level,
      text,
      id: `note-${id}`
    });
  }
  
  return headings;
}

/**
 * Generate a table of contents from markdown
 * @param {string} markdown - Markdown content
 * @returns {string} HTML table of contents
 */
export function generateTableOfContents(markdown) {
  const headings = extractHeadings(markdown);
  
  if (headings.length === 0) return '';
  
  let html = '<nav class="table-of-contents"><ul>';
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    html += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>`;
  });
  
  html += '</ul></nav>';
  return sanitizeHtml(html);
}

/**
 * Check if markdown contains code blocks
 * @param {string} markdown - Markdown content
 * @returns {boolean} Whether markdown contains code blocks
 */
export function hasCodeBlocks(markdown) {
  if (!markdown) return false;
  return /```[\s\S]*?```/.test(markdown) || /`[^`]+`/.test(markdown);
}

/**
 * Extract code blocks from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<{language: string, code: string}>} Array of code blocks
 */
export function extractCodeBlocks(markdown) {
  if (!markdown) return [];
  
  const codeBlocks = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return codeBlocks;
}

/**
 * Get syntax highlighter style
 * @param {string} theme - Theme name
 * @returns {Object} Syntax highlighter style
 */
export function getSyntaxHighlighterStyle(theme = 'dark') {
  const styles = {
    dark: atomDark,
    light: {
      'code[class*="language-"]': {
        color: '#333',
        background: 'none',
        fontFamily: 'monospace',
        fontSize: '1em',
        textAlign: 'left',
        whiteSpace: 'pre',
        wordSpacing: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        lineHeight: '1.5',
        tabSize: '4',
        hyphens: 'none',
      },
      'pre[class*="language-"]': {
        color: '#333',
        background: '#f5f5f5',
        borderRadius: '4px',
        padding: '1em',
        overflow: 'auto',
      },
    }
  };
  
  return styles[theme] || styles.dark;
}

/**
 * Get available languages for syntax highlighting
 * @returns {string[]} Array of language names
 */
export function getAvailableLanguages() {
  return [
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala',
    'html', 'css', 'scss', 'sass', 'less',
    'sql', 'graphql', 'json', 'xml', 'yaml', 'toml',
    'bash', 'powershell', 'dockerfile',
    'markdown', 'text'
  ];
}

/**
 * Format markdown with proper indentation
 * @param {string} markdown - Markdown content
 * @returns {string} Formatted markdown
 */
export function formatMarkdown(markdown) {
  if (!markdown) return '';
  
  const lines = markdown.split('\n');
  const formattedLines = [];
  
  lines.forEach(line => {
    if (line.trim() === '') {
      formattedLines.push('');
    } else if (line.startsWith('#')) {
      // Headers
      formattedLines.push(line);
      formattedLines.push('');
    } else if (line.startsWith('>')) {
      // Blockquotes
      formattedLines.push(line);
    } else if (line.startsWith('```')) {
      // Code blocks
      formattedLines.push(line);
    } else if (line.startsWith('---') || line.startsWith('***') || line.startsWith('___')) {
      // Horizontal rules
      formattedLines.push(line);
      formattedLines.push('');
    } else if (/^\d+\./.test(line) || /^[-*+]/.test(line)) {
      // Lists
      formattedLines.push(line);
    } else {
      // Regular text
      formattedLines.push(line);
    }
  });
  
  return formattedLines.join('\n').replace(/\n\n\n+/g, '\n\n');
}

/**
 * Insert markdown formatting at cursor position
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} prefix - Text to insert before selection
 * @param {string} suffix - Text to insert after selection
 * @returns {{text: string, newCursorPos: number}} Updated text and cursor position
 */
export function insertFormatting(text, start, end, prefix, suffix = '') {
  const before = text.substring(0, start);
  const selected = text.substring(start, end);
  const after = text.substring(end);
  
  const newText = before + prefix + selected + suffix + after;
  // No selection: place cursor BETWEEN markers so user types inside them (_|_)
  // With selection: place cursor AFTER closing marker (_text_|)
  const newCursorPos = selected.length === 0
    ? start + prefix.length
    : start + prefix.length + selected.length + suffix.length;
  
  return { text: newText, newCursorPos };
}

/**
 * Wrap selected text with markdown formatting
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} format - Format type ('bold', 'italic', 'code', 'strikethrough')
 * @returns {{text: string, newCursorPos: number}} Updated text and cursor position
 */
export function wrapSelection(text, start, end, format) {
  const formats = {
    bold: { prefix: '**', suffix: '**' },
    italic: { prefix: '*', suffix: '*' },
    code: { prefix: '`', suffix: '`' },
    strikethrough: { prefix: '~~', suffix: '~~' },
    heading1: { prefix: '# ', suffix: '' },
    heading2: { prefix: '## ', suffix: '' },
    heading3: { prefix: '### ', suffix: '' },
    link: { prefix: '[', suffix: '](url)' },
    image: { prefix: '![', suffix: '](url)' }
  };
  
  const { prefix, suffix } = formats[format] || { prefix: '', suffix: '' };
  return insertFormatting(text, start, end, prefix, suffix);
}

/**
 * Create a markdown list item
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} type - List type ('bullet', 'number')
 * @returns {{text: string, newCursorPos: number}} Updated text and cursor position
 */
export function createList(text, start, end, type = 'bullet') {
  // Helper: find the next list number by scanning lines around the cursor
  const getNextNumber = (text, lineStart, currentLine) => {
    // If the current line is already a numbered item, continue from it
    const currMatch = currentLine.match(/^(\d+)\. /);
    if (currMatch) return parseInt(currMatch[1]) + 1;

    // Otherwise scan backwards for the last numbered list item
    const textBefore = text.substring(0, lineStart);
    const prevLines = textBefore.split('\n');
    for (let i = prevLines.length - 1; i >= 0; i--) {
      const m = prevLines[i].match(/^(\d+)\. /);
      if (m) return parseInt(m[1]) + 1;
      if (prevLines[i].trim() !== '') break; // non-list non-empty line — stop
    }
    return 1;
  };

  // No selection: insert a new list item at/after the current line
  if (start === end) {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', start);
    const currentLine = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

    const prefix = type === 'bullet' ? '- ' : `${getNextNumber(text, lineStart, currentLine)}. `;

    if (currentLine.trim() === '') {
      const before = text.substring(0, lineStart);
      const after = text.substring(lineEnd === -1 ? text.length : lineEnd);
      return { text: before + prefix + after, newCursorPos: lineStart + prefix.length };
    } else {
      const insertPos = lineEnd === -1 ? text.length : lineEnd;
      const newText = text.substring(0, insertPos) + '\n' + prefix + text.substring(insertPos);
      return { text: newText, newCursorPos: insertPos + 1 + prefix.length };
    }
  }

  // Selection: convert each selected line, numbering sequentially from context
  const before = text.substring(0, start);
  const selected = text.substring(start, end);
  const after = text.substring(end);

  // Determine starting number from context above the selection
  let counter = 1;
  if (type === 'number') {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const prevLines = text.substring(0, lineStart).split('\n');
    for (let i = prevLines.length - 1; i >= 0; i--) {
      const m = prevLines[i].match(/^(\d+)\. /);
      if (m) { counter = parseInt(m[1]) + 1; break; }
      if (prevLines[i].trim() !== '') break;
    }
  }

  const convertedLines = selected.split('\n').map(line => {
    if (type === 'bullet' && /^- /.test(line)) return line;
    if (type === 'number' && /^\d+\. /.test(line)) {
      // Re-number existing items to keep sequence correct
      return line.replace(/^\d+\. /, `${counter++}. `);
    }
    const prefix = type === 'bullet' ? '- ' : `${counter++}. `;
    return prefix + line;
  });

  const newSelected = convertedLines.join('\n');
  return { text: before + newSelected + after, newCursorPos: start + newSelected.length };
}

/**
 * Insert a markdown link
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} url - URL for the link
 * @returns {{text: string, newCursorPos: number}} Updated text and cursor position
 */
export function insertLink(text, start, end, url) {
  const selected = text.substring(start, end);
  const linkText = selected || 'link text';
  
  return insertFormatting(text, start, end, `[${linkText}]`, `(${url})`);
}

/**
 * Insert a markdown image
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} url - Image URL
 * @param {string} alt - Alt text
 * @returns {{text: string, newCursorPos: number}} Updated text and cursor position
 */
export function insertImage(text, start, end, url, alt = '') {
  const altText = alt || 'image';
  return insertFormatting(text, start, end, `![${altText}]`, `(${url})`);
}

export default {
  parseMarkdown,
  sanitizeHtml,
  markdownToText,
  getWordCount,
  getCharacterCount,
  getReadingTime,
  extractHeadings,
  generateTableOfContents,
  hasCodeBlocks,
  extractCodeBlocks,
  getSyntaxHighlighterStyle,
  getAvailableLanguages,
  formatMarkdown,
  insertFormatting,
  wrapSelection,
  createList,
  insertLink,
  insertImage
};

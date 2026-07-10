/**
 * Markdown utilities for the Markdown Notes web app
 * Handles markdown parsing, rendering, and syntax highlighting
 */

import { marked } from 'marked';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  headerPrefix: 'note-',
  highlight: function(code, lang) {
    if (lang && Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
  langPrefix: 'language-',
  mangle: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
  xhtml: false
});

/**
 * Parse markdown to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export function parseMarkdown(markdown) {
  if (!markdown) return '';
  return marked.parse(markdown);
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
  return html;
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
  const newCursorPos = start + prefix.length + selected.length + suffix.length;
  
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
  const lines = text.split('\n');
  const newLines = [];
  let newCursorPos = 0;
  let cursorSet = false;
  
  lines.forEach((line, index) => {
    const lineStart = newLines.join('\n').length + (index === 0 ? 0 : 1);
    const lineEnd = lineStart + line.length;
    
    // Check if this line contains the selection
    const isSelected = start <= lineEnd && end >= lineStart;
    
    if (isSelected && !cursorSet) {
      const prefix = type === 'bullet' ? '- ' : `${newLines.length + 1}. `;
      newLines.push(prefix + line);
      newCursorPos = lineStart + prefix.length + (end - start);
      cursorSet = true;
    } else if (isSelected) {
      const prefix = type === 'bullet' ? '- ' : `${newLines.length + 1}. `;
      newLines.push(prefix + line);
    } else {
      newLines.push(line);
    }
  });
  
  return {
    text: newLines.join('\n'),
    newCursorPos: cursorSet ? newCursorPos : start
  };
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

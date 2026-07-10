/**
 * Storage utilities for the Markdown Notes web app
 * Handles local storage, IndexedDB, and file operations
 */

import localForage from 'localforage';
import { encryptContent, decryptContent, generateId, sanitizeFilename, validateTitle, validateContent } from './security';

// Storage configuration
const STORAGE_CONFIG = {
  driver: [
    localForage.INDEXEDDB,
    localForage.LOCALSTORAGE,
    localForage.WEBSQL
  ],
  name: 'MarkdownNotesDB',
  version: 1.0,
  storeName: 'notes',
  description: 'Secure markdown notes storage'
};

// Initialize storage
const notesStore = localForage.createInstance(STORAGE_CONFIG);

/**
 * Note object structure
 * @typedef {Object} Note
 * @property {string} id - Unique identifier
 * @property {string} title - Note title
 * @property {string} content - Note content (markdown)
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} [passwordHint] - Optional password hint
 * @property {boolean} [isEncrypted] - Whether the note is encrypted
 * @property {string} [salt] - Salt for encryption
 * @property {string} [iv] - Initialization vector for encryption
 * @property {string[]} [tags] - Note tags
 */

/**
 * Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {string} [password] - Optional encryption password
 * @returns {Promise<Note>} Created note
 */
export async function createNote(title, content, password = null) {
  try {
    const now = new Date().toISOString();
    const id = generateId();
    
    let processedContent = validateContent(content);
    let isEncrypted = false;
    let salt = null;
    let iv = null;
    
    // Encrypt content if password is provided
    if (password) {
      const encryptionResult = await encryptContent(processedContent, password);
      processedContent = encryptionResult.encrypted;
      isEncrypted = true;
      salt = encryptionResult.salt;
      iv = encryptionResult.iv;
    }
    
    const note = {
      id,
      title: validateTitle(title),
      content: processedContent,
      createdAt: now,
      updatedAt: now,
      isEncrypted,
      salt,
      iv,
      tags: []
    };
    
    await notesStore.setItem(id, note);
    return note;
  } catch (error) {
    console.error('Failed to create note:', error);
    throw new Error('Failed to create note');
  }
}

/**
 * Update an existing note
 * @param {string} id - Note ID
 * @param {Object} updates - Updates to apply
 * @param {string} [updates.title] - New title
 * @param {string} [updates.content] - New content
 * @param {string} [updates.password] - New encryption password
 * @param {string} [oldPassword] - Old password for decryption (if changing password)
 * @returns {Promise<Note>} Updated note
 */
export async function updateNote(id, updates, oldPassword = null) {
  try {
    const existingNote = await getNote(id);
    if (!existingNote) {
      throw new Error('Note not found');
    }
    
    const now = new Date().toISOString();
    let content = updates.content !== undefined ? validateContent(updates.content) : existingNote.content;
    let isEncrypted = existingNote.isEncrypted;
    let salt = existingNote.salt;
    let iv = existingNote.iv;
    
    // Handle encryption changes
    if (updates.password) {
      // If note was encrypted, decrypt first
      if (existingNote.isEncrypted && !oldPassword) {
        throw new Error('Old password required to change encryption');
      }
      
      if (existingNote.isEncrypted && oldPassword) {
        try {
          content = await decryptContent(
            existingNote.content,
            oldPassword,
            existingNote.salt,
            existingNote.iv
          );
        } catch (error) {
          throw new Error('Failed to decrypt with old password');
        }
      }
      
      // Encrypt with new password
      if (updates.content !== undefined) {
        content = validateContent(updates.content);
      }
      
      const encryptionResult = await encryptContent(content, updates.password);
      content = encryptionResult.encrypted;
      isEncrypted = true;
      salt = encryptionResult.salt;
      iv = encryptionResult.iv;
    } else if (existingNote.isEncrypted && updates.content !== undefined) {
      // Re-encrypt with same password
      if (!oldPassword) {
        throw new Error('Password required to update encrypted note');
      }
      
      const decrypted = await decryptContent(
        existingNote.content,
        oldPassword,
        existingNote.salt,
        existingNote.iv
      );
      
      const newContent = validateContent(updates.content);
      const encryptionResult = await encryptContent(newContent, oldPassword);
      content = encryptionResult.encrypted;
      salt = encryptionResult.salt;
      iv = encryptionResult.iv;
    }
    
    const updatedNote = {
      ...existingNote,
      title: updates.title !== undefined ? validateTitle(updates.title) : existingNote.title,
      content,
      updatedAt: now,
      isEncrypted,
      salt,
      iv,
      tags: updates.tags !== undefined ? updates.tags : existingNote.tags
    };
    
    await notesStore.setItem(id, updatedNote);
    return updatedNote;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
}

/**
 * Get a note by ID
 * @param {string} id - Note ID
 * @param {string} [password] - Password for decryption (if encrypted)
 * @returns {Promise<Note|null>} Note or null if not found
 */
export async function getNote(id, password = null) {
  try {
    const note = await notesStore.getItem(id);
    
    if (!note) {
      return null;
    }
    
    // Decrypt if encrypted and password provided
    if (note.isEncrypted && password) {
      try {
        const decryptedContent = await decryptContent(
          note.content,
          password,
          note.salt,
          note.iv
        );
        return { ...note, content: decryptedContent };
      } catch (error) {
        console.error('Failed to decrypt note:', error);
        throw new Error('Failed to decrypt note. Wrong password or corrupted data.');
      }
    }
    
    return note;
  } catch (error) {
    console.error('Failed to get note:', error);
    throw error;
  }
}

/**
 * Get all notes
 * @returns {Promise<Note[]>} Array of all notes
 */
export async function getAllNotes() {
  try {
    const notes = [];
    await notesStore.iterate((value, key) => {
      notes.push(value);
    });
    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    console.error('Failed to get all notes:', error);
    throw new Error('Failed to get all notes');
  }
}

/**
 * Delete a note
 * @param {string} id - Note ID
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  try {
    await notesStore.removeItem(id);
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw new Error('Failed to delete note');
  }
}

/**
 * Delete all notes
 * @returns {Promise<void>}
 */
export async function deleteAllNotes() {
  try {
    await notesStore.clear();
  } catch (error) {
    console.error('Failed to delete all notes:', error);
    throw new Error('Failed to delete all notes');
  }
}

/**
 * Search notes by title or content
 * @param {string} query - Search query
 * @returns {Promise<Note[]>} Matching notes
 */
export async function searchNotes(query) {
  try {
    if (!query || query.trim() === '') {
      return await getAllNotes();
    }
    
    const lowerQuery = query.toLowerCase();
    const allNotes = await getAllNotes();
    
    return allNotes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const contentMatch = note.content.toLowerCase().includes(lowerQuery);
      const tagMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      return titleMatch || contentMatch || tagMatch;
    });
  } catch (error) {
    console.error('Failed to search notes:', error);
    throw new Error('Failed to search notes');
  }
}

/**
 * Get notes by tag
 * @param {string} tag - Tag to filter by
 * @returns {Promise<Note[]>} Notes with the specified tag
 */
export async function getNotesByTag(tag) {
  try {
    const allNotes = await getAllNotes();
    return allNotes.filter(note => note.tags && note.tags.includes(tag));
  } catch (error) {
    console.error('Failed to get notes by tag:', error);
    throw new Error('Failed to get notes by tag');
  }
}

/**
 * Get all unique tags
 * @returns {Promise<string[]>} Array of unique tags
 */
export async function getAllTags() {
  try {
    const allNotes = await getAllNotes();
    const tagsSet = new Set();
    
    allNotes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Failed to get all tags:', error);
    throw new Error('Failed to get all tags');
  }
}

/**
 * Export note to file
 * @param {Note} note - Note to export
 * @param {string} format - Export format ('markdown', 'html', 'txt', 'pdf')
 * @param {string} [password] - Password for encrypted notes
 * @returns {Promise<Blob>} File blob
 */
export async function exportNote(note, format, password = null) {
  try {
    let content = note.content;
    let filename = sanitizeFilename(note.title) || 'untitled';
    let mimeType = '';
    
    // Decrypt if encrypted
    if (note.isEncrypted && password) {
      content = await decryptContent(content, password, note.salt, note.iv);
    } else if (note.isEncrypted) {
      throw new Error('Password required to export encrypted note');
    }
    
    switch (format.toLowerCase()) {
      case 'markdown':
      case 'md':
        mimeType = 'text/markdown';
        filename += '.md';
        break;
        
      case 'html':
        mimeType = 'text/html';
        filename += '.html';
        content = generateHTMLContent(note.title, content);
        break;
        
      case 'txt':
      case 'text':
        mimeType = 'text/plain';
        filename += '.txt';
        break;
        
      case 'pdf':
        mimeType = 'application/pdf';
        filename += '.pdf';
        content = await generatePDFContent(note.title, content);
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    return new Blob([content], { type: mimeType, name: filename });
  } catch (error) {
    console.error('Failed to export note:', error);
    throw error;
  }
}

/**
 * Generate HTML content for export
 * @param {string} title - Note title
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
function generateHTMLContent(title, markdown) {
  // Simple markdown to HTML conversion for export
  // In production, you might want to use a proper markdown library
  const html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 { color: #2d3748; }
        code { background: #f1f5f9; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f1f5f9; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 3px solid #6366f1; padding-left: 15px; margin-left: 0; color: #666; }
        a { color: #6366f1; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p>${html}</p>
</body>
</html>`;
}

/**
 * Generate PDF content for export
 * @param {string} title - Note title
 * @param {string} markdown - Markdown content
 * @returns {Promise<Uint8Array>} PDF content
 */
async function generatePDFContent(title, markdown) {
  // For PDF generation, we'll use a simple approach
  // In production, consider using pdf-lib or a dedicated PDF generation library
  
  const { PDFDocument, rgb } = await import('pdf-lib');
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  
  const { height } = page.getSize();
  let y = height - 50;
  
  // Draw title
  page.drawText(title, {
    x: 50,
    y,
    size: 24,
    color: rgb(0.1, 0.1, 0.1),
  });
  
  y -= 40;
  
  // Draw content
  const lines = markdown.split('\n');
  lines.forEach(line => {
    if (y < 50) {
      // Add new page if we run out of space
      page = pdfDoc.addPage([600, 800]);
      y = height - 50;
    }
    
    page.drawText(line, {
      x: 50,
      y,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    y -= 20;
  });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Import note from file
 * @param {File} file - File to import
 * @param {string} [password] - Password for encrypted import
 * @returns {Promise<Note>} Imported note
 */
export async function importNote(file, password = null) {
  try {
    const content = await file.text();
    const filename = file.name;
    const extension = filename.split('.').pop().toLowerCase();
    
    let processedContent = content;
    
    // Handle different file types
    switch (extension) {
      case 'html':
        // Extract content from HTML
        const temp = document.createElement('div');
        temp.innerHTML = content;
        processedContent = temp.textContent || temp.innerText || content;
        break;
        
      case 'txt':
      case 'text':
        // Plain text, use as is
        break;
        
      case 'md':
      case 'markdown':
        // Markdown, use as is
        break;
        
      default:
        // Try to handle as markdown or text
        break;
    }
    
    // Extract title from filename or content
    let title = filename.replace(/\.[^.]+$/, ''); // Remove extension
    title = sanitizeFilename(title);
    
    // If content starts with a title, use it
    const titleMatch = processedContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      // Remove the title line from content
      processedContent = processedContent.replace(/^#\s+.+$/m, '').trim();
    }
    
    return createNote(title, processedContent, password);
  } catch (error) {
    console.error('Failed to import note:', error);
    throw new Error('Failed to import note');
  }
}

/**
 * Export all notes as a ZIP archive
 * @param {string} [password] - Password for encrypted notes
 * @returns {Promise<Blob>} ZIP file blob
 */
export async function exportAllNotes(password = null) {
  try {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    
    const notes = await getAllNotes();
    
    for (const note of notes) {
      let content = note.content;
      
      // Decrypt if encrypted
      if (note.isEncrypted && password) {
        content = await decryptContent(content, password, note.salt, note.iv);
      } else if (note.isEncrypted) {
        // Skip encrypted notes without password
        continue;
      }
      
      const filename = sanitizeFilename(note.title) || 'untitled';
      zip.file(`${filename}.md`, content);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } catch (error) {
    console.error('Failed to export all notes:', error);
    throw new Error('Failed to export all notes');
  }
}

/**
 * Get storage statistics
 * @returns {Promise<{total: number, encrypted: number, tags: number}>} Storage stats
 */
export async function getStorageStats() {
  try {
    const notes = await getAllNotes();
    const tags = await getAllTags();
    
    const encryptedCount = notes.filter(note => note.isEncrypted).length;
    
    return {
      total: notes.length,
      encrypted: encryptedCount,
      tags: tags.length
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    throw new Error('Failed to get storage stats');
  }
}

export default {
  createNote,
  updateNote,
  getNote,
  getAllNotes,
  deleteNote,
  deleteAllNotes,
  searchNotes,
  getNotesByTag,
  getAllTags,
  exportNote,
  importNote,
  exportAllNotes,
  getStorageStats
};

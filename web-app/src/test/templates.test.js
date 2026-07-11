/**
 * Tests for the Templates plugin
 */

import {
  getAllTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getAllCategories,
  createNoteWithTemplate,
  insertTemplateAtCursor,
  generateCustomBookTemplate,
  TEMPLATES,
  BOOK_NOTE_TEMPLATE,
  EXPANDED_BOOK_NOTE_TEMPLATE
} from '../utils/templates';

describe('Templates Plugin', () => {
  describe('getAllTemplates', () => {
    it('should return an array of all templates', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return templates with required properties', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('content');
        expect(template).toHaveProperty('category');
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', () => {
      const template = getTemplateById('book-note');
      expect(template).not.toBeNull();
      expect(template.name).toBe('Book Note');
    });

    it('should return null for non-existent template ID', () => {
      const template = getTemplateById('non-existent');
      expect(template).toBeNull();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates filtered by category', () => {
      const readingTemplates = getTemplatesByCategory('Reading');
      expect(Array.isArray(readingTemplates)).toBe(true);
      readingTemplates.forEach(template => {
        expect(template.category).toBe('Reading');
      });
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('NonExistent');
      expect(templates).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    it('should return an array of unique categories', () => {
      const categories = getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that categories are unique
      const uniqueCategories = [...new Set(categories)];
      expect(uniqueCategories.length).toBe(categories.length);
    });
  });

  describe('createNoteWithTemplate', () => {
    it('should create a note with template content', () => {
      const note = createNoteWithTemplate('book-note', 'My Book Note');
      expect(note).toHaveProperty('title');
      expect(note).toHaveProperty('content');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');
      expect(note.title).toBe('My Book Note');
      expect(note.content).toContain('# Book Note');
    });

    it('should use template name as title if no title provided', () => {
      const note = createNoteWithTemplate('book-note');
      expect(note.title).toBe('Book Note');
    });

    it('should throw error for non-existent template', () => {
      expect(() => {
        createNoteWithTemplate('non-existent');
      }).toThrow('Template not found: non-existent');
    });
  });

  describe('insertTemplateAtCursor', () => {
    it('should insert template content at cursor position', () => {
      const currentContent = 'Hello World';
      const templateContent = '\n\n---\n\n';
      const cursorPosition = 5;
      
      const result = insertTemplateAtCursor(currentContent, templateContent, cursorPosition);
      
      expect(result.content).toBe('Hello---\n\n World');
      expect(result.cursorPosition).toBe(5 + templateContent.length);
    });

    it('should handle insertion at beginning', () => {
      const currentContent = 'Hello World';
      const templateContent = '# Title\n\n';
      const cursorPosition = 0;
      
      const result = insertTemplateAtCursor(currentContent, templateContent, cursorPosition);
      
      expect(result.content).toBe('# Title\n\nHello World');
      expect(result.cursorPosition).toBe(templateContent.length);
    });

    it('should handle insertion at end', () => {
      const currentContent = 'Hello World';
      const templateContent = '\n\n---\n';
      const cursorPosition = currentContent.length;
      
      const result = insertTemplateAtCursor(currentContent, templateContent, cursorPosition);
      
      expect(result.content).toBe('Hello World\n\n---\n');
      expect(result.cursorPosition).toBe(currentContent.length + templateContent.length);
    });
  });

  describe('generateCustomBookTemplate', () => {
    it('should generate a custom book template', () => {
      const template = generateCustomBookTemplate();
      expect(typeof template).toBe('string');
      expect(template).toContain('## Metadata');
      expect(template).toContain('## Samenvatting');
      expect(template).toContain('## Belangrijke thema\'s');
      expect(template).toContain('## Quotes');
      expect(template).toContain('## Literatuurlijst');
    });
  });

  describe('Template Constants', () => {
    it('should have BOOK_NOTE_TEMPLATE defined', () => {
      expect(BOOK_NOTE_TEMPLATE).toBeDefined();
      expect(typeof BOOK_NOTE_TEMPLATE).toBe('string');
      expect(BOOK_NOTE_TEMPLATE).toContain('# Book Note');
    });

    it('should have EXPANDED_BOOK_NOTE_TEMPLATE defined', () => {
      expect(EXPANDED_BOOK_NOTE_TEMPLATE).toBeDefined();
      expect(typeof EXPANDED_BOOK_NOTE_TEMPLATE).toBe('string');
      expect(EXPANDED_BOOK_NOTE_TEMPLATE).toContain('<details');
    });

    it('should have TEMPLATES object with multiple templates', () => {
      expect(TEMPLATES).toBeDefined();
      expect(typeof TEMPLATES).toBe('object');
      expect(Object.keys(TEMPLATES).length).toBeGreaterThan(0);
    });
  });
});

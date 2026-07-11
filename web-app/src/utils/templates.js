/**
 * Template utilities for the Markdown Notes web app
 * Provides pre-defined note templates for consistent note structure
 */

/**
 * Book Note Template based on the provided JSON structure
 * This creates a comprehensive template for book notes with metadata, summary, themes, quotes, and literature
 */
export const BOOK_NOTE_TEMPLATE = `# Book Note

## Metadata

- **Medium:** 
- **Title:** 
- **Author:** 
- **Language:** 
- **Description:** 
- **Tags:** []
- **Status:** 
- **Rating:** 

## Summary

[Write your summary here]

### Key Points

1. 
2. 
3. 

[Additional summary content]

## Important Themes

- 
- 
- 

### Central Message

[Main takeaway from the book]

## Quotes

> 

> 

## Literature List

### Influences and References

1. 
2. 
3. 

### Related Works

- 
- 
`;

/**
 * Expanded Book Note Template with collapsible sections (similar to the JSON structure)
 * Uses markdown with collapsible sections for better organization
 */
export const EXPANDED_BOOK_NOTE_TEMPLATE = `<details open>
<summary><h2>Metadata</h2></summary>

- **Medium:** 
- **Title:** 
- **Author:** 
- **Language:** 
- **Description:** 
- **Tags:** []
- **Status:** 
- **Rating:** ⭐⭐⭐⭐⭐

</details>

<details open>
<summary><h2>Summary</h2></summary>

[Write your comprehensive summary here]

### Key Concepts

1. 
2. 
3. 

[Detailed analysis and main points]

</details>

<details open>
<summary><h2>Important Themes</h2></summary>

- 
- 
- 

### Central Message

[The main message or thesis of the book]

</details>

<details open>
<summary><h2>Quotes</h2></summary>

> 

> 

</details>

<details open>
<summary><h2>Literature List</h2></summary>

### Influences and References

1. 
2. 
3. 

### Related Works

- 
- 

</details>
`;

/**
 * Simple Meeting Notes Template
 */
export const MEETING_NOTE_TEMPLATE = `# Meeting Notes

## Metadata

- **Date:** 
- **Time:** 
- **Location:** 
- **Attendees:** 
- **Meeting Type:** 

## Agenda

1. 
2. 
3. 

## Discussion Points

### 

### 

## Action Items

- [ ] 
- [ ] 
- [ ] 

## Follow-up

- 
`;

/**
 * Project Notes Template
 */
export const PROJECT_NOTE_TEMPLATE = `# Project Notes

## Overview

- **Project Name:** 
- **Start Date:** 
- **End Date:** 
- **Status:** 
- **Priority:** 

## Goals

1. 
2. 
3. 

## Tasks

- [ ] 
- [ ] 
- [ ] 

## Resources

- 
- 

## Notes

`;

/**
 * Daily Journal Template
 */
export const DAILY_JOURNAL_TEMPLATE = `# Daily Journal

## Date: ${new Date().toLocaleDateString()}

## Morning

- **Mood:** 
- **Goals for today:**
  - 
  - 
  - 

## During the Day

### Highlights

- 

### Challenges

- 

## Evening

- **Accomplishments:**
  - 
  - 
- **Reflections:**
- **Tomorrow's Goals:**
  - 
  - 
`;

/**
 * Research Notes Template
 */
export const RESEARCH_NOTE_TEMPLATE = `# Research Notes

## Topic: 

## Research Question: 

## Sources

1. 
2. 
3. 

## Key Findings

- 
- 
- 

## Analysis

[Detailed analysis of findings]

## Conclusion

[Summary and next steps]

## References

- 
- 
`;

/**
 * Available templates with their metadata
 */
export const TEMPLATES = {
  'book-note': {
    name: 'Book Note',
    description: 'Comprehensive template for book notes with metadata, summary, themes, quotes, and literature',
    content: BOOK_NOTE_TEMPLATE,
    category: 'Reading'
  },
  'expanded-book-note': {
    name: 'Expanded Book Note',
    description: 'Book note template with collapsible sections for better organization',
    content: EXPANDED_BOOK_NOTE_TEMPLATE,
    category: 'Reading'
  },
  'meeting-notes': {
    name: 'Meeting Notes',
    description: 'Template for meeting minutes and action items',
    content: MEETING_NOTE_TEMPLATE,
    category: 'Work'
  },
  'project-notes': {
    name: 'Project Notes',
    description: 'Template for project planning and tracking',
    content: PROJECT_NOTE_TEMPLATE,
    category: 'Work'
  },
  'daily-journal': {
    name: 'Daily Journal',
    description: 'Template for daily reflections and planning',
    content: DAILY_JOURNAL_TEMPLATE,
    category: 'Personal'
  },
  'research-notes': {
    name: 'Research Notes',
    description: 'Template for organizing research findings and sources',
    content: RESEARCH_NOTE_TEMPLATE,
    category: 'Academic'
  }
};

/**
 * Get all available templates
 * @returns {Array} Array of template objects
 */
export function getAllTemplates() {
  return Object.values(TEMPLATES);
}

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template object or null if not found
 */
export function getTemplateById(id) {
  return TEMPLATES[id] || null;
}

/**
 * Get templates by category
 * @param {string} category - Category name
 * @returns {Array} Array of template objects in the category
 */
export function getTemplatesByCategory(category) {
  return Object.values(TEMPLATES).filter(template => template.category === category);
}

/**
 * Get all available categories
 * @returns {Array} Array of unique category names
 */
export function getAllCategories() {
  const categories = Object.values(TEMPLATES).map(template => template.category);
  return [...new Set(categories)];
}

/**
 * Create a note with a specific template
 * @param {string} templateId - ID of the template to use
 * @param {string} title - Note title (optional)
 * @returns {Object} Note object with template content
 */
export function createNoteWithTemplate(templateId, title = '') {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  const noteTitle = title || template.name;
  const now = new Date().toISOString();
  
  return {
    title: noteTitle,
    content: template.content,
    createdAt: now,
    updatedAt: now,
    tags: [template.category.toLowerCase()],
    isEncrypted: false
  };
}

/**
 * Insert template content at cursor position
 * @param {string} currentContent - Current note content
 * @param {string} templateContent - Template content to insert
 * @param {number} cursorPosition - Current cursor position
 * @returns {Object} Updated content and new cursor position
 */
export function insertTemplateAtCursor(currentContent, templateContent, cursorPosition) {
  const beforeCursor = currentContent.substring(0, cursorPosition);
  const afterCursor = currentContent.substring(cursorPosition);
  
  const newContent = beforeCursor + templateContent + afterCursor;
  const newCursorPosition = cursorPosition + templateContent.length;
  
  return {
    content: newContent,
    cursorPosition: newCursorPosition
  };
}

/**
 * Generate a custom book note template based on the provided JSON structure
 * This creates a template that matches the exact structure from the user's JSON
 */
export function generateCustomBookTemplate() {
  return `## Metadata

- **Medium:** 
- **Title:** 
- **Author:** 
- **Language:** 
- **Description:** 
- **Tags:** []
- **Status:** 
- **Sterren:** 

## Samenvatting

[Schrijf hier je samenvatting]

### Belangrijke punten

1. 
2. 
3. 

## Belangrijke thema's

- 
- 
- 

### Centrale boodschap:

[Hoofdboodschap van het boek]

## Quotes

> 

> 

## Literatuurlijst

### Lijst van schrijvers en denkers:

1. 
2. 
3. 

### Literatuurlijst:

1. 
2. 
`;
}

export default {
  TEMPLATES,
  getAllTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getAllCategories,
  createNoteWithTemplate,
  insertTemplateAtCursor,
  generateCustomBookTemplate,
  BOOK_NOTE_TEMPLATE,
  EXPANDED_BOOK_NOTE_TEMPLATE
};

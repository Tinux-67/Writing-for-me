# Templates Plugin for Markdown Notes

This plugin provides pre-defined note templates for consistent note structure in the Markdown Notes web application.

## Features

- **Multiple Template Types**: Book notes, meeting notes, project notes, daily journals, and research notes
- **Quick Access**: Template buttons in the sidebar for one-click note creation
- **Template Selection**: Choose from available templates when creating new notes
- **Customizable**: Easy to add new templates or modify existing ones

## Available Templates

### 1. Book Note Template
- **Purpose**: Comprehensive template for book notes
- **Sections**: Metadata, Summary, Important Themes, Quotes, Literature List
- **Fields**: Medium, Title, Author, Language, Description, Tags, Status, Rating

### 2. Expanded Book Note Template
- **Purpose**: Book note template with collapsible sections
- **Features**: Uses HTML details/summary elements for collapsible sections
- **Sections**: Same as Book Note but with collapsible UI

### 3. Meeting Notes Template
- **Purpose**: Template for meeting minutes and action items
- **Sections**: Metadata, Agenda, Discussion Points, Action Items, Follow-up

### 4. Project Notes Template
- **Purpose**: Template for project planning and tracking
- **Sections**: Overview, Goals, Tasks, Resources, Notes

### 5. Daily Journal Template
- **Purpose**: Template for daily reflections and planning
- **Sections**: Date, Morning, During the Day, Evening

### 6. Research Notes Template
- **Purpose**: Template for organizing research findings
- **Sections**: Topic, Research Question, Sources, Key Findings, Analysis, Conclusion, References

## Usage

### Method 1: Quick Template Buttons
1. Look for the template quick access buttons in the sidebar
2. Click on a template button to create a new note with that template
3. The note will be created with the template content pre-filled

### Method 2: Template Selection in New Note Modal
1. Click the "New Note" button in the sidebar
2. In the modal, select a template from the dropdown
3. Optionally, provide a custom title
4. Click "Create Note" to create the note with the selected template

### Method 3: Template Insertion in Editor
1. Open an existing note or create a new one
2. Click the "Templates" button in the editor toolbar
3. Select a template from the template selector modal
4. The template content will be inserted at the current cursor position

## Adding New Templates

To add a new template:

1. Open `/src/utils/templates.js`
2. Add a new template constant with your markdown content
3. Add the template to the `TEMPLATES` object with metadata

Example:

```javascript
export const MY_NEW_TEMPLATE = `# My Template

## Section 1

Content here

## Section 2

More content
`;

// Add to TEMPLATES object
export const TEMPLATES = {
  // ... existing templates
  'my-new-template': {
    name: 'My Template',
    description: 'Description of my template',
    content: MY_NEW_TEMPLATE,
    category: 'Custom'
  }
};
```

## Template Structure

Each template should follow this structure:

```javascript
{
  name: 'Template Name',      // Display name
  description: 'Description',  // Help text
  content: 'markdown...',     // Template content
  category: 'Category'        // Grouping category
}
```

## Custom Book Template

The plugin includes a special function `generateCustomBookTemplate()` that creates a template matching the exact structure from the original JSON data provided. This template includes:

- **Metadata section** with all the fields from the JSON (Medium, Title, Author, etc.)
- **Summary section** with key points
- **Important Themes section** with bullet points
- **Quotes section** for important quotes
- **Literature List section** for references

## API Functions

The following functions are available from the templates module:

### `getAllTemplates()`
Returns an array of all available template objects.

### `getTemplateById(id)`
Returns a specific template by its ID.

### `getTemplatesByCategory(category)`
Returns all templates in a specific category.

### `getAllCategories()`
Returns an array of all unique category names.

### `createNoteWithTemplate(templateId, title)`
Creates a note object with the specified template and title.

### `insertTemplateAtCursor(currentContent, templateContent, cursorPosition)`
Inserts template content at the specified cursor position.

### `generateCustomBookTemplate()`
Generates a custom book note template based on the original JSON structure.

## Styling

The template selector and related UI elements are styled using CSS variables defined in the main stylesheet. The styles include:

- Modal overlay and content styling
- Template card layout and hover effects
- Category filter buttons
- Search functionality
- Responsive design for different screen sizes

## Browser Compatibility

The template plugin uses modern JavaScript features and should work in all modern browsers. For best results, use:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This plugin is part of the Markdown Notes application and is licensed under the MIT License.

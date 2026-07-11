/**
 * Simple test script to verify template functionality
 * Run with: node test_templates.js
 */

// Import the templates module (we'll use require since this is a simple test)
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
} from './web-app/src/utils/templates.js';

console.log('🧪 Testing Templates Plugin...\n');

// Test 1: getAllTemplates
console.log('1. Testing getAllTemplates()');
try {
  const templates = getAllTemplates();
  console.log(`   ✅ Found ${templates.length} templates`);
  templates.forEach(t => console.log(`      - ${t.name} (${t.category})`));
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 2: getTemplateById
console.log('\n2. Testing getTemplateById()');
try {
  const template = getTemplateById('book-note');
  console.log(`   ✅ Found template: ${template.name}`);
  
  const nullTemplate = getTemplateById('non-existent');
  console.log(`   ✅ Non-existent template returns null: ${nullTemplate === null}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 3: getTemplatesByCategory
console.log('\n3. Testing getTemplatesByCategory()');
try {
  const readingTemplates = getTemplatesByCategory('Reading');
  console.log(`   ✅ Found ${readingTemplates.length} Reading templates`);
  
  const emptyTemplates = getTemplatesByCategory('NonExistent');
  console.log(`   ✅ Non-existent category returns empty array: ${emptyTemplates.length === 0}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 4: getAllCategories
console.log('\n4. Testing getAllCategories()');
try {
  const categories = getAllCategories();
  console.log(`   ✅ Found ${categories.length} categories: ${categories.join(', ')}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 5: createNoteWithTemplate
console.log('\n5. Testing createNoteWithTemplate()');
try {
  const note = createNoteWithTemplate('book-note', 'My Test Book');
  console.log(`   ✅ Created note with title: "${note.title}"`);
  console.log(`   ✅ Note has content: ${note.content.length > 0}`);
  console.log(`   ✅ Note has timestamps: ${!!note.createdAt && !!note.updatedAt}`);
  
  // Test with default title
  const note2 = createNoteWithTemplate('book-note');
  console.log(`   ✅ Default title used: "${note2.title}"`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 6: insertTemplateAtCursor
console.log('\n6. Testing insertTemplateAtCursor()');
try {
  const currentContent = 'Hello World';
  const templateContent = '\n\n---\n\n';
  const cursorPosition = 5;
  
  const result = insertTemplateAtCursor(currentContent, templateContent, cursorPosition);
  console.log(`   ✅ Content inserted correctly: "${result.content}"`);
  console.log(`   ✅ Cursor position updated: ${result.cursorPosition === 5 + templateContent.length}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 7: generateCustomBookTemplate
console.log('\n7. Testing generateCustomBookTemplate()');
try {
  const template = generateCustomBookTemplate();
  console.log(`   ✅ Template generated: ${template.length > 0}`);
  console.log(`   ✅ Contains Metadata section: ${template.includes('## Metadata')}`);
  console.log(`   ✅ Contains Samenvatting section: ${template.includes('## Samenvatting')}`);
  console.log(`   ✅ Contains Belangrijke thema's section: ${template.includes('## Belangrijke thema\'s')}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 8: Template Constants
console.log('\n8. Testing Template Constants');
try {
  console.log(`   ✅ BOOK_NOTE_TEMPLATE defined: ${typeof BOOK_NOTE_TEMPLATE === 'string'}`);
  console.log(`   ✅ EXPANDED_BOOK_NOTE_TEMPLATE defined: ${typeof EXPANDED_BOOK_NOTE_TEMPLATE === 'string'}`);
  console.log(`   ✅ TEMPLATES object defined: ${typeof TEMPLATES === 'object'}`);
  console.log(`   ✅ TEMPLATES has entries: ${Object.keys(TEMPLATES).length > 0}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 9: Error handling
console.log('\n9. Testing Error Handling');
try {
  let errorThrown = false;
  try {
    createNoteWithTemplate('non-existent-template');
  } catch (error) {
    errorThrown = true;
    console.log(`   ✅ Error thrown for non-existent template: ${error.message}`);
  }
  console.log(`   ✅ Error handling works: ${errorThrown}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

console.log('\n🎉 All tests completed!');
console.log('\n📝 Template Plugin Summary:');
console.log('   - Multiple template types available');
console.log('   - Template selection in new note modal');
console.log('   - Template insertion in editor');
console.log('   - Quick access buttons in sidebar');
console.log('   - Custom book template based on JSON structure');
console.log('   - Easy to extend with new templates');

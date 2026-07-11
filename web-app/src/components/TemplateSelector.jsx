import React, { useState, useEffect, useRef } from 'react';
import {
  getAllTemplates,
  getTemplatesByCategory,
  getAllCategories,
  insertTemplateAtCursor
} from '../utils/templates';
import './../styles/template-selector.css';

/**
 * TemplateSelector Component
 * Provides a modal dialog for selecting and inserting note templates
 */
const TemplateSelector = ({ 
  onInsertTemplate, 
  onClose, 
  theme = 'dark',
  cursorPosition = 0 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const modalRef = useRef(null);

  // Load templates and categories on mount
  useEffect(() => {
    const allTemplates = getAllTemplates();
    const allCategories = getAllCategories();
    
    setTemplates(allTemplates);
    setCategories(['all', ...allCategories]);
    setSelectedCategory('all');
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // Filter templates based on selected category and search query
  const filteredTemplates = () => {
    let result = [...templates];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(template => template.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  };

  // Handle template selection
  const handleSelectTemplate = (template) => {
    if (onInsertTemplate) {
      onInsertTemplate(template.content, cursorPosition);
    }
    onClose();
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle modal click (close when clicking outside)
  const handleModalClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle key down (close with Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className={`template-selector-modal ${theme}`}
      onClick={handleModalClick}
      onKeyDown={handleKeyDown}
      tabIndex="-1"
      data-testid="template-selector-modal"
    >
      <div className="template-selector-content">
        <div className="template-selector-header">
          <h2>Select a Template</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search bar */}
        <div className="template-search">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`search-input ${theme}`}
          />
        </div>

        {/* Category filter */}
        <div className="template-categories">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''} ${theme}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="templates-grid">
          {filteredTemplates().length > 0 ? (
            filteredTemplates().map(template => (
              <div 
                key={template.name}
                className={`template-card ${theme}`}
                onClick={() => handleSelectTemplate(template)}
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectTemplate(template);
                  }
                }}
              >
                <div className="template-card-header">
                  <h3>{template.name}</h3>
                  <span className="template-category-badge">{template.category}</span>
                </div>
                <p className="template-description">{template.description}</p>
                <div className="template-preview">
                  <pre>{template.content.substring(0, 100)}{template.content.length > 100 ? '...' : ''}</pre>
                </div>
              </div>
            ))
          ) : (
            <div className="no-templates">
              <p>No templates found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Quick insert buttons for common templates */}
        <div className="quick-insert">
          <h4>Quick Insert</h4>
          <div className="quick-buttons">
            {templates.slice(0, 3).map(template => (
              <button
                key={template.name}
                className={`quick-button ${theme}`}
                onClick={() => handleSelectTemplate(template)}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;

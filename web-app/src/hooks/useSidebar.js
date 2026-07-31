import { useState } from 'react';

/**
 * Custom hook for sidebar state management
 */
export const useSidebar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return { isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebar };
};

export default useSidebar;

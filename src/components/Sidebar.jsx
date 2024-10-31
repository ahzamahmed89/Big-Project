import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Import your sidebar CSS file where styles are defined

const Sidebar = ({ showSidebar, toggleSidebar }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); // State for submenu open/close
  const sidebarRef = useRef(null);

  // Close the sidebar if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(false); // Close the sidebar when clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar, toggleSidebar]);

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen); // Toggle submenu open/close state
  };

  return (
    <div 
      className={`sidebar ${showSidebar ? 'open' : ''}`} 
      ref={sidebarRef} 
    >
      <ul>
        <li className="submenu-toggle" onClick={toggleSubmenu}>
          Physical Mystery Shopping Form
          <ul className={`submenu ${isSubmenuOpen ? 'show' : ''}`}>
            <li><Link to="/newentry" onClick={() => toggleSidebar(false)}>New Entry</Link></li>
            <li><Link to="/edit" onClick={() => toggleSidebar(false)}>Edit/Authorize</Link></li>
            <li><Link to="/display-review" onClick={() => toggleSidebar(false)}>Display/Review</Link></li>
            
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Import your sidebar CSS file where styles are defined

const Sidebar = ({ showSidebar, toggleSidebar }) => {
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

  return (
    <div 
      className={`sidebar ${showSidebar ? 'open' : ''}`} 
      ref={sidebarRef} 
    >
      <ul>
        <li className="submenu-toggle">
          Physical Mystery Shopping Form
          <ul className="submenu">
            <li><Link to="/newentry" onClick={() => toggleSidebar(false)}>New Entry</Link></li>
            <li><Link to="/edit" onClick={() => toggleSidebar(false)}>Edit</Link></li>
            <li><Link to="/display-review" onClick={() => toggleSidebar(false)}>Display/Review</Link></li>
            <li><Link to="/authorize" onClick={() => toggleSidebar(false)}>Authorize</Link></li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

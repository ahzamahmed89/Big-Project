import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Sidebar = ({ showSidebar, toggleSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null); // Track which menu is open
  const sidebarRef = useRef(null);

  // Close the sidebar if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(false); // Close the sidebar when clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar, toggleSidebar]);

  const toggleSubmenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName); // Toggle the specific menu open/close
  };

  return (
    <div 
      className={`sidebar ${showSidebar ? 'open' : ''}`} 
      ref={sidebarRef} 
    >
      <ul>
        <li className="submenu-toggle" onClick={() => toggleSubmenu('physical')}>
          Physical Mystery Shopping Form
          <ul className={`submenu ${openMenu === 'physical' ? 'show' : ''}`}>
            <li><Link to="/newentry" onClick={() => toggleSidebar(false)}>New Entry</Link></li>
            <li><Link to="/edit" onClick={() => toggleSidebar(false)}>Edit/Authorize</Link></li>
            <li><Link to="/display-review" onClick={() => toggleSidebar(false)}>Display/Review</Link></li>
          </ul>
        </li>
        
        <li className="submenu-toggle" onClick={() => toggleSubmenu('transactional')}>
          Transactional Mystery Shopping Form
          <ul className={`submenu ${openMenu === 'transactional' ? 'show' : ''}`}>
            <li><Link to="/trentry" onClick={() => toggleSidebar(false)}>Transactional Entry</Link></li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

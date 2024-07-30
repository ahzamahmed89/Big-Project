import React from 'react';
import { Link } from 'react-router-dom';
import '../../src/App.css'; // Import your sidebar CSS file where styles are defined

const Sidebar = ({ showSidebar, toggleSidebar }) => {
  const [showSubmenu, setShowSubmenu] = React.useState(false);

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  return (
    <div>
      <div className={`sidebar ${showSidebar ? 'open' : ''}`} id="sidebar">
        <ul>
          <li className="submenu-toggle" onClick={toggleSubmenu}>
            Physical Mystery Shopping Form
            <ul className={`submenu ${showSubmenu ? 'show' : ''}`}>
              <li><Link to="/newentry" onClick={toggleSidebar}>New Entry</Link></li>
              <li><a href="#" onClick={toggleSidebar}>Edit</a></li>
              <li><a href="#" onClick={toggleSidebar}>Display</a></li>
              <li><a href="#" onClick={toggleSidebar}>Authorize</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

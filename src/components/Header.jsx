import React, { useState } from 'react';
import logo from '../../public/Images/Logo.png';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar'; // Adjust the import path as necessary
import '../App.css';

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  // Toggle the sidebar open/close
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <header>
      <div className="right-container">
        <nav className="top-nav">
          <ul>
            <li>
              <a href="#" id="menu-toggle" onClick={toggleSidebar}>
                <i className="bi bi-list"></i> {/* Button to toggle sidebar */}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="branding">Service & Quality</div>
      <div className="right-container">
        <Link to="/Home"><img src={logo} alt="Logo" id="navbar-logo" /></Link>
      </div>

      {/* Sidebar Component */}
      <Sidebar showSidebar={showSidebar} toggleSidebar={setShowSidebar} />
    </header>
  );
};

export default Header;

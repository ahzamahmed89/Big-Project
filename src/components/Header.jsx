import React, { useState } from 'react';
import logo from '../../public/Images/Logo.png';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar'; // Adjust the import path as necessary

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <header>
      <div className="right-container">
        <nav className="top-nav">
          <ul>
            <li><a href="#" id="menu-toggle" onClick={toggleSidebar}><i className="bi bi-list"></i></a></li>
          </ul>
        </nav>
      </div>
      <div className="branding">Service & Quality</div>
      <div className="right-container">
        <Link to="/"><img src={logo} alt="Logo" id="navbar-logo" /></Link>
      </div>
      <Sidebar showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;

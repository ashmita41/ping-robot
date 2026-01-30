/**
 * Navbar Component
 * 
 * Navigation bar for all pages
 * Shows active route highlighting
 */

import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">Ping Robot</Link>
        </div>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={isActive('/') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/schedules" 
            className={isActive('/schedules') ? 'active' : ''}
          >
            Schedules
          </Link>
          <Link 
            to="/runs" 
            className={isActive('/runs') ? 'active' : ''}
          >
            Runs
          </Link>
        </div>
      </div>
    </nav>
  );
}

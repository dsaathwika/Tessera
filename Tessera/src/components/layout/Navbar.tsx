import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { NotificationDropdown } from './NotificationDropdown';
import './Navbar.css';

interface NavbarProps {
  isAdmin: boolean;
  userEmail?: string;
}

export function Navbar({ isAdmin, userEmail }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-text">Tessera</span>
          </Link>
        </div>

        <div className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
          >
            Dashboard
          </Link>
          
          {!isAdmin && (
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'nav-link--active' : ''}`}
            >
              Profile
            </Link>
          )}
        </div>

        <div className="navbar-user-section">
          <NotificationDropdown />
          <div className="navbar-user" ref={menuRef}>
          <button 
            className="user-avatar-btn"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            title="User menu"
          >
            <div className="user-avatar">
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">
              {userEmail?.split('@')[0] || 'User'}
            </span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {isMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-item">
                {userEmail}
                {isAdmin && <span style={{ color: 'var(--color-primary)', fontSize: '10px', marginLeft: 'auto' }}>ADMIN</span>}
              </div>
              <button 
                onClick={handleLogout}
                className="user-dropdown-item logout-item"
              >
                <span>Sign out</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}
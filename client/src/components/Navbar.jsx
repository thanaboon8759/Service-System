import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = ({ isAdmin = false }) => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <div className="nav-brand">
                    <img src="/4449037.png" alt="Service System Logo" style={{ height: '32px', width: 'auto' }} /> Service System
                    {isAdmin && <span style={{ fontSize: '0.8em', opacity: 0.8, marginLeft: '0.5rem' }}>(Admin)</span>}
                </div>

                <button
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen((s) => !s)}
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <div className={`nav-user ${menuOpen ? 'open' : ''}`}>
                    <span>Welcome, <strong id="user-name">{user?.name || user?.username || 'User'}</strong></span>
                    <button onClick={logout} className="btn-secondary btn-sm">
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import { useAuth } from '../context/AuthContext';

const Navbar = ({ isAdmin = false }) => {
    const { user, logout } = useAuth();
    return (
        <nav className="navbar">
            <div className="container nav-content">
                <div className="nav-brand">
                    <img src="/4449037.png" alt="Service System Logo" style={{ height: '32px', width: 'auto' }} /> Repair System
                    {isAdmin && <span style={{ fontSize: '0.8em', opacity: 0.8, marginLeft: '0.5rem' }}>(Admin)</span>}
                </div>
                <div className="nav-user">
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

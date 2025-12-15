import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    // Login State
    const [loginData, setLoginData] = useState({ username: '', password: '' });

    // Register State
    const [registerData, setRegisterData] = useState({
        name: '', username: '', email: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.id]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.id]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login(loginData.username, loginData.password);
        setLoading(false);
        if (res.success) {
            // Navigation handled by App component user state change or explicitly here
            // user state update triggers re-render in App.js which redirects
        } else {
            setError(res.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError('');
        // Map id inputs to expected API fields (reg-name -> name, etc)
        // Actually simple mapping:
        const payload = {
            name: registerData['reg-name'] || registerData.name, // checking logic
            username: registerData['reg-username'] || registerData.username,
            email: registerData['reg-email'] || registerData.email,
            password: registerData['reg-password'] || registerData.password
        };
        const res = await register(payload);
        setLoading(false);
        if (!res.success) setError(res.message);
    };

    const InputChange = (e, type) => {
        if (type === 'login') {
            setLoginData({ ...loginData, [e.target.id.replace('login-', '')]: e.target.value });
        } else {
            setRegisterData({ ...registerData, [e.target.id]: e.target.value });
        }
    }

    return (
        <div className="container main-content">
            {error && (
                <div id="alert-box" className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="landing-grid">
                {/* Hero Section */}
                <div className="hero-section">
                    <h1 className="hero-title">Professional Repair Tracking Made Simple</h1>
                    <p className="hero-subtitle">Track your device repairs in real-time. Get instant updates, communicate with technicians, and know exactly when your device is ready.</p>
                    <div className="hero-features">
                        <div className="feature-item">
                            <i className="fa-solid fa-bolt"></i>
                            <span>Fast Updates</span>
                        </div>
                        <div className="feature-item">
                            <i className="fa-solid fa-shield-halved"></i>
                            <span>Secure Data</span>
                        </div>
                        <div className="feature-item">
                            <i className="fa-solid fa-comments"></i>
                            <span>Direct Chat</span>
                        </div>
                    </div>
                </div>

                {/* Auth Forms */}
                <div id="auth-card" className="card auth-card">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Register
                        </button>
                    </div>

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <form id="login-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    required
                                    value={loginData.username}
                                    onChange={(e) => InputChange(e, 'login')}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => InputChange(e, 'login')}
                                />
                            </div>
                            <button type="submit" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
                        <form id="register-form" onSubmit={handleRegister}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" id="reg-name" required value={registerData['reg-name']} onChange={(e) => InputChange(e, 'register')} />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" id="reg-username" required value={registerData['reg-username']} onChange={(e) => InputChange(e, 'register')} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" id="reg-email" required value={registerData['reg-email']} onChange={(e) => InputChange(e, 'register')} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="reg-password"
                                        required
                                        value={registerData['reg-password']}
                                        onChange={(e) => InputChange(e, 'register')}
                                    />
                                    <i
                                        className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                        onClick={() => setShowPassword(!showPassword)}
                                    ></i>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="reg-confirm-password"
                                        required
                                        value={registerData['reg-confirm-password']}
                                        onChange={(e) => InputChange(e, 'register')}
                                    />
                                    <i
                                        className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    ></i>
                                </div>
                            </div>
                            <button type="submit" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

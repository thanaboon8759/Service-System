import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // user.isAdmin might be boolean, or role string. 
        // Based on analysis, legacy didn't explicitly show role check in js but server has it.
        // Assuming user object has 'isAdmin' boolean or 'role' string.
        // Let's check authController.js later to be sure. 
        // For now, assume user.isAdmin if it matches typical pattern, or user.role === 'admin'
        // Just in case, if user is not admin, redirect to dashboard.

        // Actually, the server authController returns: name, email, token, isAdmin.
        if (user.isAdmin === true || user.isAdmin === "true") {
            return <Outlet />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;

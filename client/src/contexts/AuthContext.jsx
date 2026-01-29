import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/auth/me');
                    setUser(response.data.data.user);
                } catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // Register
    const register = async (name, email, password, role = 'viewer') => {
        try {
            setError(null);
            const response = await api.post('/auth/register', { name, email, password, role });
            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setError(null);
    };

    // Update profile
    const updateProfile = async (data) => {
        try {
            const response = await api.put('/auth/me', data);
            setUser(response.data.data.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Update failed';
            return { success: false, error: message };
        }
    };

    // Check if user has required role
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    // Check if user can upload (editor or admin)
    const canUpload = () => hasRole(['editor', 'admin']);

    // Check if user is admin
    const isAdmin = () => hasRole('admin');

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        hasRole,
        canUpload,
        isAdmin,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

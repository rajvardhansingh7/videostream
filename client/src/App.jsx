import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllVideos from './pages/AllVideos';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard - My Videos for editors/admins, All Videos for viewers */}
                <Route path="dashboard" element={<Dashboard />} />

                {/* All Videos - for editors/admins to see all platform videos */}
                <Route path="videos" element={
                    <ProtectedRoute roles={['editor', 'admin']}>
                        <AllVideos />
                    </ProtectedRoute>
                } />

                {/* Video Player - all users */}
                <Route path="video/:id" element={<VideoPlayer />} />

                {/* Upload - Editor/Admin only */}
                <Route path="upload" element={
                    <ProtectedRoute roles={['editor', 'admin']}>
                        <Upload />
                    </ProtectedRoute>
                } />

                {/* Admin Panel - Admin only */}
                <Route path="admin" element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminPanel />
                    </ProtectedRoute>
                } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
    FiHome,
    FiUpload,
    FiVideo,
    FiLogOut,
    FiMenu,
    FiX,
    FiUsers,
    FiWifi,
    FiWifiOff,
    FiGrid
} from 'react-icons/fi';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, canUpload, isAdmin } = useAuth();
    const { connected } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on role
    const getNavItems = () => {
        const items = [];

        if (user?.role === 'viewer') {
            // Viewers only see videos
            items.push({ path: '/dashboard', icon: FiVideo, label: 'Videos' });
        } else if (user?.role === 'editor') {
            // Editors: Videos (all), Dashboard (my videos), Upload
            items.push({ path: '/videos', icon: FiGrid, label: 'Videos' });
            items.push({ path: '/dashboard', icon: FiHome, label: 'Dashboard' });
            items.push({ path: '/upload', icon: FiUpload, label: 'Upload Video' });
        } else if (user?.role === 'admin') {
            // Admins: Videos (all), Dashboard (my videos), Upload, Admin Panel
            items.push({ path: '/videos', icon: FiGrid, label: 'Videos' });
            items.push({ path: '/dashboard', icon: FiHome, label: 'Dashboard' });
            items.push({ path: '/upload', icon: FiUpload, label: 'Upload Video' });
            items.push({ path: '/admin', icon: FiUsers, label: 'Admin Panel' });
        }

        return items;
    };

    const navItems = getNavItems();

    const isActive = (path) => location.pathname === path;

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return user?.role === 'viewer' ? 'Videos' : 'My Dashboard';
            case '/videos':
                return 'All Videos';
            case '/upload':
                return 'Upload Video';
            case '/admin':
                return 'Admin Panel';
            default:
                if (location.pathname.startsWith('/video/')) return 'Video Player';
                return 'Dashboard';
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 glass
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-dark-600">
                        <Link to="/dashboard" className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <FiVideo className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl gradient-text">StreamVault</h1>
                                <p className="text-xs text-gray-400">Video Platform</p>
                            </div>
                        </Link>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-dark-600">
                        <div className="flex items-center space-x-3">
                            <img
                                src={user?.avatar}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full border-2 border-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user?.name}</p>
                                <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                                title={connected ? 'Connected' : 'Disconnected'} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-300
                  ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-dark-700'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom section */}
                    <div className="p-4 border-t border-dark-600 space-y-2">
                        {/* Connection status */}
                        <div className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-400">
                            {connected ? (
                                <>
                                    <FiWifi className="w-4 h-4 text-green-500" />
                                    <span>Real-time connected</span>
                                </>
                            ) : (
                                <>
                                    <FiWifiOff className="w-4 h-4 text-red-500" />
                                    <span>Reconnecting...</span>
                                </>
                            )}
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                       text-gray-400 hover:text-red-400 hover:bg-red-500/10
                       transition-all duration-300"
                        >
                            <FiLogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 glass border-b border-dark-600">
                    <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
                        >
                            {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>

                        {/* Page title */}
                        <h2 className="text-xl font-semibold hidden lg:block">
                            {getPageTitle()}
                        </h2>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            {/* Role badge */}
                            <span className={`
                px-3 py-1 rounded-full text-xs font-semibold uppercase
                ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : ''}
                ${user?.role === 'editor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                ${user?.role === 'viewer' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : ''}
              `}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

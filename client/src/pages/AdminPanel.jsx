import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
    FiUsers,
    FiVideo,
    FiCheckCircle,
    FiAlertTriangle,
    FiLoader,
    FiEdit,
    FiShield,
    FiRefreshCw
} from 'react-icons/fi';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, videosRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/videos')
            ]);

            setStats(statsRes.data.data);
            setUsers(usersRes.data.data.users);
            setVideos(videosRes.data.data.videos);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(user =>
                user._id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleStatusChange = async (videoId, newStatus) => {
        try {
            await api.put(`/admin/videos/${videoId}`, { status: newStatus });
            setVideos(prev => prev.map(video =>
                video._id === videoId ? { ...video, status: newStatus } : video
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleReprocess = async (videoId) => {
        try {
            await api.post(`/videos/${videoId}/reprocess`);
            alert('Video queued for reprocessing');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reprocess video');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-gray-400 mt-1">Manage users, videos, and platform settings</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-dark-600 pb-4">
                {['overview', 'users', 'videos'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeTab === tab
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-gray-400 hover:text-white hover:bg-dark-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <FiUsers className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.stats.users.total}</p>
                                    <p className="text-sm text-gray-400">Total Users</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <FiVideo className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.stats.videos.total}</p>
                                    <p className="text-sm text-gray-400">Total Videos</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <FiCheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.stats.videos.safe}</p>
                                    <p className="text-sm text-gray-400">Safe Videos</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <FiAlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.stats.videos.flagged}</p>
                                    <p className="text-sm text-gray-400">Flagged Videos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User breakdown */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Users by Role</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(stats.stats.users.byRole || {}).map(([role, count]) => (
                                <div key={role} className="p-4 rounded-xl bg-dark-800">
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-sm text-gray-400 capitalize">{role}s</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Videos */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Recent Videos</h3>
                        <div className="space-y-3">
                            {stats.recentVideos?.map((video) => (
                                <div key={video._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-800">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-16 h-10 rounded object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{video.title}</p>
                                            <p className="text-sm text-gray-400">{video.uploadedBy?.name}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={video.status} size="sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-600">
                                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Videos</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-dark-700 hover:bg-dark-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`
                        px-3 py-1 rounded-full text-xs font-semibold uppercase
                        ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : ''}
                        ${user.role === 'editor' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${user.role === 'viewer' ? 'bg-gray-500/20 text-gray-400' : ''}
                      `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">{user.videoCount || 0}</td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-600">
                                    <th className="text-left p-4 text-gray-400 font-medium">Video</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Uploader</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Views</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map((video) => (
                                    <tr key={video._id} className="border-b border-dark-700 hover:bg-dark-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-20 h-12 rounded object-cover"
                                                />
                                                <span className="font-medium line-clamp-1">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{video.uploadedBy?.name}</td>
                                        <td className="p-4">
                                            <StatusBadge status={video.status} size="sm" />
                                        </td>
                                        <td className="p-4">{video.views}</td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={video.status}
                                                    onChange={(e) => handleStatusChange(video._id, e.target.value)}
                                                    className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="safe">Safe</option>
                                                    <option value="flagged">Flagged</option>
                                                    <option value="error">Error</option>
                                                </select>
                                                <button
                                                    onClick={() => handleReprocess(video._id)}
                                                    className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white"
                                                    title="Reprocess"
                                                >
                                                    <FiRefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

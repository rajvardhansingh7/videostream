import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import VideoGrid from '../components/VideoGrid';
import videoService from '../services/videoService';
import {
    FiVideo,
    FiCheckCircle,
    FiAlertTriangle,
    FiLoader,
    FiUpload,
    FiClock
} from 'react-icons/fi';

const Dashboard = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        safe: 0,
        flagged: 0,
        processing: 0,
        pending: 0
    });

    const { user } = useAuth();
    const { processingUpdates } = useSocket();

    const fetchMyVideos = async () => {
        try {
            setLoading(true);

            // Viewers see all safe videos, Editors/Admins see their own videos
            let response;
            if (user?.role === 'viewer') {
                response = await videoService.getVideos({ status: 'safe' });
                setVideos(response.data.videos);
                setStats({
                    total: response.data.videos.length,
                    safe: response.data.videos.length,
                    flagged: 0,
                    processing: 0,
                    pending: 0
                });
            } else {
                response = await videoService.getMyVideos();
                const myVideos = response.data.videos;
                setVideos(myVideos);

                // Calculate stats from my videos
                setStats({
                    total: myVideos.length,
                    safe: myVideos.filter(v => v.status === 'safe').length,
                    flagged: myVideos.filter(v => v.status === 'flagged').length,
                    processing: myVideos.filter(v => v.status === 'processing').length,
                    pending: myVideos.filter(v => v.status === 'pending').length
                });
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyVideos();
    }, [user]);

    // Update video status when processing completes
    useEffect(() => {
        Object.values(processingUpdates).forEach(update => {
            if (update.type === 'complete' || update.type === 'progress') {
                setVideos(prev => prev.map(video => {
                    if (video._id === update.videoId) {
                        return {
                            ...video,
                            status: update.status || video.status,
                            processingProgress: update.progress || video.processingProgress
                        };
                    }
                    return video;
                }));

                // Refresh stats after processing completes
                if (update.type === 'complete') {
                    fetchMyVideos();
                }
            }
        });
    }, [processingUpdates]);

    // Filter videos based on active filter
    const getFilteredVideos = () => {
        if (activeFilter === 'all') return videos;
        return videos.filter(video => video.status === activeFilter);
    };

    // Filter tabs configuration
    const filterTabs = [
        { id: 'all', label: 'All Videos', icon: FiVideo, count: stats.total, color: 'text-white' },
        { id: 'safe', label: 'Safe', icon: FiCheckCircle, count: stats.safe, color: 'text-green-400' },
        { id: 'flagged', label: 'Flagged', icon: FiAlertTriangle, count: stats.flagged, color: 'text-red-400' },
        { id: 'processing', label: 'Processing', icon: FiLoader, count: stats.processing, color: 'text-amber-400', animate: true },
    ];

    // For viewers, show a simpler interface
    if (user?.role === 'viewer') {
        return (
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="card bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Welcome, <span className="gradient-text">{user?.name}</span>!
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Browse and watch videos from our collection.
                    </p>
                </div>

                {/* Video Grid */}
                <VideoGrid
                    videos={videos}
                    loading={loading}
                    emptyMessage="No videos available yet"
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="card bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            My Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage your uploaded videos and track their processing status.
                        </p>
                    </div>
                    <Link to="/upload" className="btn-primary flex items-center space-x-2 w-fit">
                        <FiUpload className="w-5 h-5" />
                        <span>Upload New Video</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card cursor-pointer hover:border-indigo-500/50 transition-colors"
                    onClick={() => setActiveFilter('all')}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <FiVideo className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-gray-400">Total Videos</p>
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:border-green-500/50 transition-colors"
                    onClick={() => setActiveFilter('safe')}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <FiCheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.safe}</p>
                            <p className="text-sm text-gray-400">Safe Videos</p>
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:border-red-500/50 transition-colors"
                    onClick={() => setActiveFilter('flagged')}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <FiAlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.flagged}</p>
                            <p className="text-sm text-gray-400">Flagged</p>
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => setActiveFilter('processing')}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <FiLoader className="w-6 h-6 text-amber-400 animate-spin" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.processing}</p>
                            <p className="text-sm text-gray-400">Processing</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`
                            flex items-center space-x-2 px-4 py-3 rounded-xl font-medium
                            transition-all duration-300
                            ${activeFilter === tab.id
                                ? 'bg-indigo-500/20 text-white border border-indigo-500/50'
                                : 'bg-dark-800 text-gray-400 border border-dark-600 hover:border-dark-500'
                            }
                        `}
                    >
                        <tab.icon className={`w-4 h-4 ${tab.color} ${tab.animate ? 'animate-spin' : ''}`} />
                        <span>{tab.label}</span>
                        <span className={`
                            px-2 py-0.5 rounded-full text-xs
                            ${activeFilter === tab.id ? 'bg-indigo-500/30' : 'bg-dark-700'}
                        `}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <VideoGrid
                videos={getFilteredVideos()}
                loading={loading}
                emptyMessage={
                    activeFilter === 'all'
                        ? "You haven't uploaded any videos yet"
                        : `No ${activeFilter} videos found`
                }
            />

            {/* Empty state with CTA */}
            {!loading && videos.length === 0 && (
                <div className="text-center py-4">
                    <Link to="/upload" className="btn-primary inline-flex items-center space-x-2">
                        <FiUpload className="w-5 h-5" />
                        <span>Upload Your First Video</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

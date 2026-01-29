import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import StatusBadge from '../components/StatusBadge';
import videoService from '../services/videoService';
import {
    FiArrowLeft,
    FiEye,
    FiClock,
    FiHardDrive,
    FiUser,
    FiCalendar,
    FiEdit,
    FiTrash2,
    FiDownload
} from 'react-icons/fi';

const VideoPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setLoading(true);
                const response = await videoService.getVideo(id);
                setVideo(response.data.video);
            } catch (err) {
                console.error('Error fetching video:', err);
                setError(err.response?.data?.message || 'Failed to load video');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            setDeleting(true);
            await videoService.deleteVideo(id);
            navigate('/my-videos');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete video');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`;
        }
        return `${mins}m ${secs}s`;
    };

    const formatSize = (bytes) => {
        const mb = bytes / (1024 * 1024);
        if (mb > 1000) {
            return `${(mb / 1024).toFixed(2)} GB`;
        }
        return `${mb.toFixed(2)} MB`;
    };

    const canModify = () => {
        if (!user || !video) return false;
        if (user.role === 'admin') return true;
        if (user.role === 'editor' && video.uploadedBy?._id === user.id) return true;
        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center py-12">
                <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Video</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <Link to="/dashboard" className="btn-primary">
                    <FiArrowLeft className="inline mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    if (!video) return null;

    // Build stream URL - use external videoUrl if available, otherwise use stream endpoint with auth token
    const token = localStorage.getItem('token');
    const streamUrl = video.videoUrl
        ? video.videoUrl
        : `/api/videos/stream/${video._id}?token=${token}`;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </Link>

            {/* Video Player */}
            <div className="card p-0 overflow-hidden">
                {video.status === 'safe' || video.status === 'flagged' ? (
                    <CustomVideoPlayer
                        src={streamUrl}
                        poster={video.thumbnail}
                        title={video.title}
                    />
                ) : (
                    <div className="aspect-video flex items-center justify-center bg-dark-800">
                        <div className="text-center">
                            <StatusBadge status={video.status} size="lg" />
                            <p className="mt-4 text-gray-400">
                                {video.status === 'processing' && 'Video is being processed...'}
                                {video.status === 'pending' && 'Video is pending processing...'}
                                {video.status === 'error' && 'An error occurred during processing.'}
                            </p>
                            {video.status === 'processing' && (
                                <div className="mt-4 w-64 mx-auto">
                                    <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                                            style={{ width: `${video.processingProgress || 0}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{video.processingProgress || 0}% complete</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Video Info */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{video.title}</h1>
                                <div className="flex items-center space-x-4 mt-2 text-gray-400">
                                    <span className="flex items-center space-x-1">
                                        <FiEye className="w-4 h-4" />
                                        <span>{video.views} views</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>{formatDate(video.createdAt)}</span>
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={video.status} size="lg" />
                        </div>

                        {video.description && (
                            <div className="pt-4 border-t border-dark-600">
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-400 whitespace-pre-wrap">{video.description}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {video.tags && video.tags.length > 0 && (
                            <div className="pt-4 border-t border-dark-600">
                                <h3 className="font-semibold mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {video.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-dark-700 text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Uploader Info */}
                    {video.uploadedBy && (
                        <div className="card">
                            <h3 className="font-semibold mb-4">Uploaded By</h3>
                            <div className="flex items-center space-x-4">
                                <img
                                    src={video.uploadedBy.avatar}
                                    alt={video.uploadedBy.name}
                                    className="w-12 h-12 rounded-full border-2 border-indigo-500"
                                />
                                <div>
                                    <p className="font-medium">{video.uploadedBy.name}</p>
                                    <p className="text-sm text-gray-400">{video.uploadedBy.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Video Stats */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Video Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center space-x-2 text-gray-400">
                                    <FiClock className="w-4 h-4" />
                                    <span>Duration</span>
                                </span>
                                <span>{formatDuration(video.duration || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center space-x-2 text-gray-400">
                                    <FiHardDrive className="w-4 h-4" />
                                    <span>Size</span>
                                </span>
                                <span>{formatSize(video.size)}</span>
                            </div>
                            {video.metadata?.resolution && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Resolution</span>
                                    <span>{video.metadata.resolution}</span>
                                </div>
                            )}
                            {video.metadata?.codec && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Codec</span>
                                    <span>{video.metadata.codec}</span>
                                </div>
                            )}
                            {video.sensitivityScore !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Sensitivity Score</span>
                                    <span className={video.status === 'safe' ? 'text-green-400' : 'text-red-400'}>
                                        {video.sensitivityScore}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {canModify() && (
                        <div className="card">
                            <h3 className="font-semibold mb-4">Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href={`/api/videos/download/${video._id}`}
                                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="btn-danger w-full flex items-center justify-center space-x-2"
                                >
                                    {deleting ? (
                                        <div className="spinner w-4 h-4"></div>
                                    ) : (
                                        <>
                                            <FiTrash2 className="w-4 h-4" />
                                            <span>Delete Video</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

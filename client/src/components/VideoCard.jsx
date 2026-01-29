import { Link } from 'react-router-dom';
import { FiPlay, FiClock, FiEye } from 'react-icons/fi';
import StatusBadge from './StatusBadge';

const VideoCard = ({ video, showStatus = true }) => {
    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '0 MB';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Link to={`/video/${video._id}`} className="group">
            <div className="card-hover overflow-hidden">
                {/* Thumbnail Container */}
                <div className="relative aspect-video overflow-hidden rounded-xl mb-4">
                    <img
                        src={video.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400'}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                <FiPlay className="w-8 h-8 text-white ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Duration badge */}
                    {video.duration > 0 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-medium">
                            {formatDuration(video.duration)}
                        </div>
                    )}

                    {/* Status badge */}
                    {showStatus && (
                        <div className="absolute top-2 left-2">
                            <StatusBadge status={video.status} size="sm" />
                        </div>
                    )}

                    {/* Processing progress */}
                    {video.status === 'processing' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-800">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${video.processingProgress || 0}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {video.title}
                    </h3>

                    {video.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                            {video.description}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                                <FiEye className="w-4 h-4" />
                                <span>{video.views || 0}</span>
                            </span>
                            <span>{formatSize(video.size)}</span>
                        </div>
                        <span className="flex items-center space-x-1">
                            <FiClock className="w-4 h-4" />
                            <span>{formatDate(video.createdAt)}</span>
                        </span>
                    </div>

                    {/* Uploader */}
                    {video.uploadedBy && (
                        <div className="flex items-center space-x-2 pt-2 border-t border-dark-600">
                            <img
                                src={video.uploadedBy.avatar}
                                alt={video.uploadedBy.name}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-400">{video.uploadedBy.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;

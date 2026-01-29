import VideoCard from './VideoCard';
import { FiVideo } from 'react-icons/fi';

const VideoGrid = ({ videos, loading, emptyMessage = 'No videos found' }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="aspect-video bg-dark-700 rounded-xl mb-4"></div>
                        <div className="h-6 bg-dark-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="card text-center py-16">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
                    <FiVideo className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400">{emptyMessage}</h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
            ))}
        </div>
    );
};

export default VideoGrid;

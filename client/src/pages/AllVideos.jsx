import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import VideoGrid from '../components/VideoGrid';
import videoService from '../services/videoService';
import {
    FiSearch,
    FiFilter
} from 'react-icons/fi';

const AllVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const { processingUpdates } = useSocket();

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;

            const response = await videoService.getVideos(params);
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [search]);

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
            }
        });
    }, [processingUpdates]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="card bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
                <h1 className="text-2xl md:text-3xl font-bold">
                    All Videos
                </h1>
                <p className="text-gray-400 mt-1">
                    Browse all videos uploaded by users on the platform.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search videos by title or description..."
                    className="input-field pl-12 w-full"
                />
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-gray-400">
                    {videos.length} video{videos.length !== 1 ? 's' : ''} found
                    {search && ` for "${search}"`}
                </p>
            )}

            {/* Video Grid */}
            <VideoGrid
                videos={videos}
                loading={loading}
                emptyMessage={
                    search
                        ? `No videos found for "${search}"`
                        : 'No videos available yet'
                }
            />
        </div>
    );
};

export default AllVideos;

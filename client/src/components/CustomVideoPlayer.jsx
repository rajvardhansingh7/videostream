import { useState, useRef, useEffect } from 'react';
import {
    FiPlay,
    FiPause,
    FiVolume2,
    FiVolumeX,
    FiMaximize,
    FiMinimize,
    FiSkipBack,
    FiSkipForward
} from 'react-icons/fi';

const CustomVideoPlayer = ({ src, poster, title }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const progressRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [loading, setLoading] = useState(true);

    let controlsTimeout;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        const handleEnded = () => {
            setPlaying(false);
        };

        const handleWaiting = () => setLoading(true);
        const handleCanPlay = () => setLoading(false);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        // Handle fullscreen change
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const togglePlay = () => {
        if (playing) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
        setPlaying(!playing);
    };

    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        setMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (muted) {
            videoRef.current.volume = volume || 1;
            setMuted(false);
        } else {
            videoRef.current.volume = 0;
            setMuted(true);
        }
    };

    const toggleFullscreen = () => {
        if (!fullscreen) {
            playerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const skip = (seconds) => {
        videoRef.current.currentTime = Math.min(
            Math.max(0, videoRef.current.currentTime + seconds),
            duration
        );
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            ref={playerRef}
            className="relative bg-black rounded-xl overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full aspect-video"
                onClick={togglePlay}
                playsInline
                preload="auto"
                {...(src?.startsWith('http') ? { crossOrigin: 'anonymous' } : {})}
            />

            {/* Loading Spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="spinner"></div>
                </div>
            )}

            {/* Play Button Overlay */}
            {!playing && !loading && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <FiPlay className="w-10 h-10 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className={`
        absolute bottom-0 left-0 right-0 p-4
        bg-gradient-to-t from-black/90 via-black/50 to-transparent
        transition-opacity duration-300
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 group/progress"
                    onClick={handleProgressClick}
                >
                    {/* Buffered */}
                    <div
                        className="absolute h-full bg-white/30 rounded-full"
                        style={{ width: `${(buffered / duration) * 100}%` }}
                    />
                    {/* Played */}
                    <div
                        className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* Hover indicator */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            {playing ? (
                                <FiPause className="w-6 h-6" />
                            ) : (
                                <FiPlay className="w-6 h-6" />
                            )}
                        </button>

                        {/* Skip buttons */}
                        <button
                            onClick={() => skip(-10)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Skip back 10s"
                        >
                            <FiSkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => skip(10)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Skip forward 10s"
                        >
                            <FiSkipForward className="w-5 h-5" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center space-x-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {muted ? (
                                    <FiVolumeX className="w-5 h-5" />
                                ) : (
                                    <FiVolume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 rounded-full cursor-pointer"
                            />
                        </div>

                        {/* Time */}
                        <span className="text-sm text-white/80">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-2">
                        {/* Title */}
                        {title && (
                            <span className="text-sm text-white/80 mr-4 hidden md:block">
                                {title}
                            </span>
                        )}

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            {fullscreen ? (
                                <FiMinimize className="w-5 h-5" />
                            ) : (
                                <FiMaximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;

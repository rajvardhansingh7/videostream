import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import videoService from '../services/videoService';
import {
    FiUploadCloud,
    FiFile,
    FiX,
    FiCheck,
    FiLoader
} from 'react-icons/fi';

const UploadComponent = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [processingData, setProcessingData] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef(null);
    const { processingUpdates } = useSocket();

    // Listen for processing updates
    useEffect(() => {
        if (processingData?.videoId) {
            const update = processingUpdates[processingData.videoId];
            if (update) {
                setProcessingData(prev => ({ ...prev, ...update }));

                if (update.type === 'complete') {
                    setProcessing(false);
                    setSuccess(true);
                    if (onUploadComplete) {
                        onUploadComplete(update);
                    }
                } else if (update.type === 'error') {
                    setProcessing(false);
                    setError(update.message);
                }
            }
        }
    }, [processingUpdates, processingData?.videoId, onUploadComplete]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload MP4, WebM, OGG, or MOV files.');
            return;
        }

        // Validate file size (500MB max)
        if (selectedFile.size > 500 * 1024 * 1024) {
            setError('File too large. Maximum size is 500MB.');
            return;
        }

        setFile(selectedFile);
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
        setError(null);
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a video file');
            return;
        }

        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', title);
            formData.append('description', description);

            const response = await videoService.uploadVideo(formData, (progress) => {
                setUploadProgress(progress);
            });

            // Upload complete, now processing
            setUploading(false);
            setProcessing(true);
            setProcessingData({
                videoId: response.data.video._id,
                progress: 0,
                message: 'Processing started...'
            });

        } catch (err) {
            setUploading(false);
            setError(err.response?.data?.message || 'Upload failed');
        }
    };

    const handleReset = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setUploading(false);
        setUploadProgress(0);
        setProcessing(false);
        setProcessingData(null);
        setError(null);
        setSuccess(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (success) {
        return (
            <div className="card text-center py-12">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Upload Complete!</h3>
                <p className="text-gray-400 mb-2">Your video has been processed successfully.</p>
                {processingData?.status && (
                    <p className="text-lg">
                        Status: <span className={processingData.status === 'safe' ? 'text-green-400' : 'text-red-400'}>
                            {processingData.status.toUpperCase()}
                        </span>
                    </p>
                )}
                <button onClick={handleReset} className="btn-primary mt-6">
                    Upload Another Video
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Error display */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    {error}
                </div>
            )}

            {/* Upload zone */}
            {!file && !uploading && !processing && (
                <div
                    className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center
            transition-all duration-300 cursor-pointer
            ${dragActive
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-dark-500 hover:border-indigo-500/50 hover:bg-dark-800/50'
                        }
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                        <FiUploadCloud className="w-10 h-10 text-indigo-400" />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                        Drag and drop your video here
                    </h3>
                    <p className="text-gray-400 mb-4">
                        or click to browse files
                    </p>
                    <p className="text-sm text-gray-500">
                        Supported formats: MP4, WebM, OGG, MOV (Max 500MB)
                    </p>
                </div>
            )}

            {/* File selected - show details form */}
            {file && !uploading && !processing && (
                <div className="card space-y-6">
                    {/* File info */}
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-dark-800">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <FiFile className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Title input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter video title"
                            className="input-field"
                        />
                    </div>

                    {/* Description input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter video description (optional)"
                            rows={4}
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Upload button */}
                    <div className="flex space-x-4">
                        <button onClick={handleReset} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="btn-primary flex-1">
                            Upload Video
                        </button>
                    </div>
                </div>
            )}

            {/* Upload progress */}
            {uploading && (
                <div className="card">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                            <FiUploadCloud className="w-8 h-8 text-indigo-400 animate-bounce" />
                        </div>
                        <h3 className="text-xl font-semibold">Uploading...</h3>
                        <p className="text-gray-400">Please wait while your video is being uploaded</p>
                    </div>

                    <div className="relative h-4 rounded-full bg-dark-700 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-center mt-2 text-gray-400">{uploadProgress}%</p>
                </div>
            )}

            {/* Processing progress */}
            {processing && processingData && (
                <div className="card">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <FiLoader className="w-8 h-8 text-amber-400 animate-spin" />
                        </div>
                        <h3 className="text-xl font-semibold">Processing Video...</h3>
                        <p className="text-gray-400">{processingData.message}</p>
                    </div>

                    <div className="relative h-4 rounded-full bg-dark-700 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${processingData.progress || 0}%` }}
                        />
                    </div>
                    <p className="text-center mt-2 text-gray-400">{processingData.progress || 0}%</p>

                    {/* Processing steps */}
                    <div className="mt-6 p-4 rounded-xl bg-dark-800">
                        <p className="text-sm text-gray-400">
                            Step {processingData.step || 1} of {processingData.totalSteps || 10}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadComponent;

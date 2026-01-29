const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

/**
 * Streaming Controller - Handles HTTP 206 Partial Content Video Streaming
 * 
 * This controller implements Range Requests for efficient video streaming,
 * allowing:
 * - Seeking to any point in the video
 * - Efficient buffering
 * - Pause/resume without re-downloading
 */

// @desc    Stream video with Range Request support
// @route   GET /api/videos/stream/:id
// @access  Private (All authenticated users)
exports.streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if video is accessible (status must be safe for viewers)
        if (req.user.role === 'viewer' && video.status !== 'safe') {
            return res.status(403).json({
                success: false,
                message: 'This video is not available for viewing'
            });
        }

        // If video has an external URL, redirect to it
        if (video.videoUrl) {
            return res.redirect(video.videoUrl);
        }

        // Construct the absolute file path
        const videoPath = path.join(__dirname, '..', video.filepath);

        // Check if file exists
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
                success: false,
                message: 'Video file not found on server. Please upload a video to stream it.'
            });
        }

        // Get file stats
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Increment view count (but not on every range request)
        if (!range || range === 'bytes=0-') {
            video.views += 1;
            await video.save();
        }

        if (range) {
            // Parse Range header
            // Format: "bytes=start-end"
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            // Validate range
            if (start >= fileSize) {
                res.status(416).json({
                    success: false,
                    message: 'Requested range not satisfiable',
                    error: `Range start (${start}) >= file size (${fileSize})`
                });
                return;
            }

            // Calculate chunk size (max 1MB chunks for better streaming)
            const chunkSize = Math.min(end - start + 1, 1024 * 1024);
            const adjustedEnd = start + chunkSize - 1;

            const contentLength = adjustedEnd - start + 1;

            // Set response headers for partial content
            const headers = {
                'Content-Range': `bytes ${start}-${adjustedEnd}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': video.mimetype || 'video/mp4',
                'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
            };

            // Send 206 Partial Content response
            res.writeHead(206, headers);

            // Create read stream for the specific byte range
            const fileStream = fs.createReadStream(videoPath, { start, end: adjustedEnd });

            // Handle stream errors
            fileStream.on('error', (error) => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error streaming video'
                    });
                }
            });

            // Pipe the stream to response
            fileStream.pipe(res);

        } else {
            // No Range header - send entire file
            // This is typically the initial request or download
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': video.mimetype || 'video/mp4',
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=86400'
            };

            res.writeHead(200, headers);

            const fileStream = fs.createReadStream(videoPath);

            fileStream.on('error', (error) => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error streaming video'
                    });
                }
            });

            fileStream.pipe(res);
        }

    } catch (error) {
        console.error('Stream video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error streaming video',
            error: error.message
        });
    }
};

// @desc    Get video thumbnail
// @route   GET /api/videos/thumbnail/:id
// @access  Public (for display purposes)
exports.getThumbnail = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // If thumbnail is a URL, redirect to it
        if (video.thumbnail && video.thumbnail.startsWith('http')) {
            return res.redirect(video.thumbnail);
        }

        // If thumbnail is a local file path
        if (video.thumbnail) {
            const thumbnailPath = path.join(__dirname, '..', video.thumbnail);
            if (fs.existsSync(thumbnailPath)) {
                return res.sendFile(thumbnailPath);
            }
        }

        // Return default placeholder
        res.redirect('https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400');

    } catch (error) {
        console.error('Get thumbnail error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching thumbnail'
        });
    }
};

// @desc    Download video file
// @route   GET /api/videos/download/:id
// @access  Private (Owner/Admin)
exports.downloadVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user can download (admin or owner)
        if (req.user.role !== 'admin' &&
            video.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this video'
            });
        }

        const videoPath = path.join(__dirname, '..', video.filepath);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
                success: false,
                message: 'Video file not found on server'
            });
        }

        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${video.filename}"`);
        res.setHeader('Content-Type', video.mimetype);

        const fileStream = fs.createReadStream(videoPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading video',
            error: error.message
        });
    }
};

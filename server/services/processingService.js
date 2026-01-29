const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

/**
 * Processing Service - The Sensitivity Engine
 * 
 * This service simulates video sensitivity analysis.
 * In production, this would integrate with actual video processing tools
 * like FFmpeg or cloud-based AI services for content moderation.
 */

class ProcessingService {
    constructor(io) {
        this.io = io; // Socket.io instance for real-time updates
    }

    /**
     * Set the Socket.io instance (called from server.js after initialization)
     */
    setSocketIO(io) {
        this.io = io;
    }

    /**
     * Process a newly uploaded video
     * @param {string} videoId - MongoDB ObjectId of the video
     * @param {string} userId - ID of the user who uploaded the video
     */
    async processVideo(videoId, userId) {
        try {
            console.log(`🎬 Starting processing for video: ${videoId}`);

            // Get the video document
            const video = await Video.findById(videoId);
            if (!video) {
                console.error(`Video not found: ${videoId}`);
                return;
            }

            // Update status to processing
            video.status = 'processing';
            video.processingProgress = 0;
            await video.save();

            // Emit processing start event
            this.emitToUser(userId, 'processing_start', {
                videoId: video._id,
                title: video.title,
                message: 'Video processing has started'
            });

            // Simulate processing with progress updates
            await this.simulateProcessing(video, userId);

        } catch (error) {
            console.error('Processing error:', error);

            // Update video status to error
            await Video.findByIdAndUpdate(videoId, {
                status: 'error',
                processingProgress: 0
            });

            this.emitToUser(userId, 'processing_error', {
                videoId,
                message: 'An error occurred during processing'
            });
        }
    }

    /**
     * Simulate video processing with progress updates
     */
    async simulateProcessing(video, userId) {
        const TOTAL_STEPS = 10;
        const STEP_DELAY = 1000; // 1 second per step (10 seconds total)

        for (let step = 1; step <= TOTAL_STEPS; step++) {
            await this.delay(STEP_DELAY);

            const progress = Math.round((step / TOTAL_STEPS) * 100);

            // Update progress in database
            video.processingProgress = progress;
            await video.save();

            // Emit progress update
            this.emitToUser(userId, 'processing_progress', {
                videoId: video._id,
                progress,
                step,
                totalSteps: TOTAL_STEPS,
                message: this.getProgressMessage(step)
            });

            console.log(`📊 Video ${video._id}: ${progress}% complete`);
        }

        // Simulate sensitivity analysis result
        const analysisResult = this.performSensitivityAnalysis();

        // Update video with final status
        video.status = analysisResult.status;
        video.sensitivityScore = analysisResult.score;
        video.processingProgress = 100;
        video.processedAt = new Date();
        video.metadata = this.generateMockMetadata();
        await video.save();

        // Emit processing complete event
        this.emitToUser(userId, 'processing_complete', {
            videoId: video._id,
            title: video.title,
            status: analysisResult.status,
            sensitivityScore: analysisResult.score,
            message: `Video marked as ${analysisResult.status.toUpperCase()}`
        });

        console.log(`✅ Video ${video._id} processing complete: ${analysisResult.status}`);
    }

    /**
     * Perform simulated sensitivity analysis
     * Randomly assigns safe or flagged status
     */
    performSensitivityAnalysis() {
        // Generate random sensitivity score (0-100)
        const score = Math.floor(Math.random() * 100);

        // 70% chance of being safe, 30% chance of being flagged
        const random = Math.random();
        const status = random < 0.7 ? 'safe' : 'flagged';

        return { status, score };
    }

    /**
     * Generate mock video metadata
     */
    generateMockMetadata() {
        const resolutions = ['1920x1080', '1280x720', '854x480', '640x360'];
        const codecs = ['H.264', 'H.265', 'VP9', 'AV1'];

        return {
            codec: codecs[Math.floor(Math.random() * codecs.length)],
            resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
            bitrate: Math.floor(Math.random() * 8000) + 2000, // 2000-10000 kbps
            fps: [24, 30, 60][Math.floor(Math.random() * 3)]
        };
    }

    /**
     * Get human-readable progress message
     */
    getProgressMessage(step) {
        const messages = [
            'Initializing video analysis...',
            'Extracting video frames...',
            'Analyzing audio track...',
            'Running content detection...',
            'Performing sensitivity scan...',
            'Checking for policy violations...',
            'Extracting metadata...',
            'Generating thumbnail...',
            'Finalizing analysis...',
            'Completing processing...'
        ];
        return messages[step - 1] || 'Processing...';
    }

    /**
     * Emit event to specific user via Socket.io
     */
    emitToUser(userId, event, data) {
        if (this.io) {
            // Emit to user's room (user-{userId})
            this.io.to(`user-${userId}`).emit(event, {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Utility: Promise-based delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Re-process a video (admin function)
     */
    async reprocessVideo(videoId, userId) {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error('Video not found');
        }

        // Reset processing status
        video.status = 'pending';
        video.processingProgress = 0;
        video.sensitivityScore = null;
        await video.save();

        // Start processing
        this.processVideo(videoId, userId);

        return { message: 'Video queued for reprocessing' };
    }
}

// Create singleton instance
const processingService = new ProcessingService();

module.exports = processingService;

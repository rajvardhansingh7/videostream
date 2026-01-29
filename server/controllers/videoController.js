const Video = require('../models/Video');
const processingService = require('../services/processingService');
const fs = require('fs');
const path = require('path');

/**
 * Video Controller - Handles video CRUD operations
 */

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private (All authenticated users)
exports.getVideos = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 12 } = req.query;

        // Build query
        let query = {};

        // Filter by status if provided
        if (status && ['pending', 'processing', 'safe', 'flagged', 'error'].includes(status)) {
            query.status = status;
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Viewers can only see safe videos
        if (req.user.role === 'viewer') {
            query.status = 'safe';
            query.isPublic = true;
        }
        // Editors can see their own videos + all public safe videos
        else if (req.user.role === 'editor') {
            query.$or = [
                { uploadedBy: req.user._id },
                { status: 'safe', isPublic: true }
            ];
        }
        // Admins can see all videos (no additional filter)

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const videos = await Video.find(query)
            .populate('uploadedBy', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Video.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                videos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('uploadedBy', 'name email avatar');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check access permission
        if (!video.canAccess(req.user)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this video'
            });
        }

        res.status(200).json({
            success: true,
            data: { video }
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching video',
            error: error.message
        });
    }
};

// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private (Editor, Admin)
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a video file'
            });
        }

        const { title, description, tags, isPublic } = req.body;

        // Create video document
        const video = await Video.create({
            title: title || req.file.originalname,
            description: description || '',
            filename: req.file.filename,
            filepath: `/uploads/${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isPublic: isPublic !== 'false',
            uploadedBy: req.user._id,
            status: 'pending'
        });

        // Populate uploader info
        await video.populate('uploadedBy', 'name email avatar');

        // Start processing in background
        processingService.processVideo(video._id.toString(), req.user._id.toString());

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully. Processing started.',
            data: { video }
        });
    } catch (error) {
        console.error('Upload video error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading video',
            error: error.message
        });
    }
};

// @desc    Update video details
// @route   PUT /api/videos/:id
// @access  Private (Owner/Admin)
exports.updateVideo = async (req, res) => {
    try {
        let video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check modification permission
        if (!video.canModify(req.user)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this video'
            });
        }

        const { title, description, tags, isPublic } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
        if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;

        video = await Video.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('uploadedBy', 'name email avatar');

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: { video }
        });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video',
            error: error.message
        });
    }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private (Owner/Admin)
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check modification permission
        if (!video.canModify(req.user)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this video'
            });
        }

        // Delete the actual file
        const filePath = path.join(__dirname, '..', video.filepath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await video.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting video',
            error: error.message
        });
    }
};

// @desc    Get my videos (for editor)
// @route   GET /api/videos/my
// @access  Private (Editor, Admin)
exports.getMyVideos = async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.user._id })
            .populate('uploadedBy', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { videos }
        });
    } catch (error) {
        console.error('Get my videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your videos',
            error: error.message
        });
    }
};

// @desc    Reprocess a video
// @route   POST /api/videos/:id/reprocess
// @access  Private (Admin)
exports.reprocessVideo = async (req, res) => {
    try {
        const result = await processingService.reprocessVideo(
            req.params.id,
            req.user._id.toString()
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Reprocess video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reprocessing video',
            error: error.message
        });
    }
};

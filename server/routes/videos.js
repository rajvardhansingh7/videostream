const express = require('express');
const router = express.Router();
const {
    getVideos,
    getVideo,
    uploadVideo,
    updateVideo,
    deleteVideo,
    getMyVideos,
    reprocessVideo
} = require('../controllers/videoController');
const { streamVideo, getThumbnail, downloadVideo } = require('../controllers/streamingController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// IMPORTANT: Specific routes must come BEFORE wildcard :id routes

// List routes
router.get('/', getVideos);
router.get('/my', authorize('editor', 'admin'), getMyVideos);

// Streaming routes (must be before /:id)
router.get('/stream/:id', streamVideo);
router.get('/thumbnail/:id', getThumbnail);
router.get('/download/:id', authorize('editor', 'admin'), downloadVideo);

// Upload - requires editor or admin role
router.post(
    '/upload',
    authorize('editor', 'admin'),
    upload.single('video'),
    handleMulterError,
    uploadVideo
);

// Admin only - reprocess (must be before generic /:id)
router.post('/:id/reprocess', authorize('admin'), reprocessVideo);

// Generic :id routes LAST (these are wildcards that match anything)
router.get('/:id', getVideo);
router.put('/:id', authorize('editor', 'admin'), updateVideo);
router.delete('/:id', authorize('editor', 'admin'), deleteVideo);

module.exports = router;

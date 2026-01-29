const mongoose = require('mongoose');

/**
 * Video Schema for Video Streaming Platform
 * Stores video metadata, processing status, and ownership
 */
const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a video title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
        default: ''
    },
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    filepath: {
        type: String,
        required: [true, 'Filepath is required']
    },
    videoUrl: {
        type: String, // External video URL for demo/streaming
        default: null
    },
    mimetype: {
        type: String,
        required: [true, 'MIME type is required'],
        enum: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    },
    size: {
        type: Number,
        required: [true, 'File size is required']
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0
    },
    thumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'safe', 'flagged', 'error'],
        default: 'pending'
    },
    processingProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    sensitivityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    metadata: {
        codec: String,
        resolution: String,
        bitrate: Number,
        fps: Number
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Video must have an uploader']
    },
    views: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    processedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted file size
VideoSchema.virtual('formattedSize').get(function () {
    const bytes = this.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
});

// Virtual for formatted duration
VideoSchema.virtual('formattedDuration').get(function () {
    const seconds = this.duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
});

// Populate uploader info
VideoSchema.virtual('uploader', {
    ref: 'User',
    localField: 'uploadedBy',
    foreignField: '_id',
    justOne: true
});

// Indexes for faster queries
VideoSchema.index({ uploadedBy: 1 });
VideoSchema.index({ status: 1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ title: 'text', description: 'text' });

// Check if user can access this video
VideoSchema.methods.canAccess = function (user) {
    if (!user) return this.isPublic;
    if (user.role === 'admin') return true;
    if (this.uploadedBy.toString() === user._id.toString()) return true;
    return this.isPublic;
};

// Check if user can modify this video
VideoSchema.methods.canModify = function (user) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'editor' && this.uploadedBy.toString() === user._id.toString()) {
        return true;
    }
    return false;
};

// Increment view count
VideoSchema.methods.incrementViews = async function () {
    this.views += 1;
    await this.save();
};

// Static: Get videos by status
VideoSchema.statics.findByStatus = function (status) {
    return this.find({ status }).populate('uploadedBy', 'name email');
};

// Static: Get user's videos
VideoSchema.statics.findByUser = function (userId) {
    return this.find({ uploadedBy: userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Video', VideoSchema);

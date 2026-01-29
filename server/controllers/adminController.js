const User = require('../models/User');
const Video = require('../models/Video');

/**
 * Admin Controller - Admin-only operations
 */

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get video counts for each user
        const usersWithVideoCount = await Promise.all(
            users.map(async (user) => {
                const videoCount = await Video.countDocuments({ uploadedBy: user._id });
                return {
                    ...user.toObject(),
                    videoCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                users: usersWithVideoCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'editor', 'viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be admin, editor, or viewer'
            });
        }

        // Prevent admin from changing their own role
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: { user }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deactivating themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
            data: { user }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};

// @desc    Update any video (Admin override)
// @route   PUT /api/admin/videos/:id
// @access  Private (Admin only)
exports.updateAnyVideo = async (req, res) => {
    try {
        const { title, description, status, isPublic, tags } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status && ['pending', 'processing', 'safe', 'flagged', 'error'].includes(status)) {
            updateData.status = status;
        }
        if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;
        if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

        const video = await Video.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('uploadedBy', 'name email avatar');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: { video }
        });
    } catch (error) {
        console.error('Admin update video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video',
            error: error.message
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalVideos,
            safeVideos,
            flaggedVideos,
            processingVideos,
            usersByRole,
            recentVideos
        ] = await Promise.all([
            User.countDocuments(),
            Video.countDocuments(),
            Video.countDocuments({ status: 'safe' }),
            Video.countDocuments({ status: 'flagged' }),
            Video.countDocuments({ status: 'processing' }),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Video.find()
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const roleStats = usersByRole.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    users: {
                        total: totalUsers,
                        byRole: roleStats
                    },
                    videos: {
                        total: totalVideos,
                        safe: safeVideos,
                        flagged: flaggedVideos,
                        processing: processingVideos
                    }
                },
                recentVideos
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

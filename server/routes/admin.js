const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserRole,
    toggleUserStatus,
    updateAnyVideo,
    getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);

// Video management (admin override)
router.put('/videos/:id', updateAnyVideo);

// Statistics
router.get('/stats', getStats);

module.exports = router;

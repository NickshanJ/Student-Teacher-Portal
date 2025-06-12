const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

// Get all notifications for logged-in user
router.get('/', protect, getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', protect, markAsRead);

module.exports = router;
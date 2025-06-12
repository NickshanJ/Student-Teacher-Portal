const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  sendMessage,
  getConversation,
  getThreads,
} = require('../controllers/messageController');

// 📨 Send a message (student or teacher)
router.post('/send', protect, sendMessage);

// 📬 Get all messages between two users in a course
router.get('/conversation/:userId/:courseId', protect, getConversation);

// ✅ Added alias route to match your Postman call
router.get('/conversations/:userId/:courseId', protect, getConversation);

// 🧵 Get all message threads for a user and a course
router.get('/threads/:userId/:courseId', protect, getThreads);

module.exports = router;
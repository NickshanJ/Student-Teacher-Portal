const express = require('express');
const router = express.Router();
const { markContentCompleted, getCompletedContents } = require('../controllers/courseProgressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/complete', protect, markContentCompleted);
router.get('/:courseId/completed', protect, getCompletedContents);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createContent,
  getContentsByCourse,
  updateContent,
  deleteContent
} = require('../controllers/courseContentController');

const { protect } = require('../middleware/authMiddleware');

// Create content (teacher only)
router.post('/', protect, createContent);

// Get all contents of a course (any logged-in user)
router.get('/:courseId', protect, getContentsByCourse);

// Update content (teacher only)
router.put('/:contentId', protect, updateContent);

// Delete content (teacher only)
router.delete('/:contentId', protect, deleteContent);


module.exports = router;
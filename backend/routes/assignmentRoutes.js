const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTeacher,
} = require('../controllers/assignmentController');

const { protect } = require('../middleware/authMiddleware');

// Get assignments by teacher (teacher only) — put this BEFORE the :courseId route
router.get('/teacher-assignments', protect, getAssignmentsByTeacher);

// Create assignment (teacher only)
router.post('/', protect, createAssignment);

// Get assignments of a course (any logged-in user)
router.get('/:courseId', protect, getAssignmentsByCourse);

// Update assignment (teacher only)
router.put('/:assignmentId', protect, updateAssignment);

// Delete assignment (teacher only)
router.delete('/:assignmentId', protect, deleteAssignment);

module.exports = router;
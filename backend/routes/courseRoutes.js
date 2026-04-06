const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getEnrolledStudents } = require('../controllers/courseController');
const {
  createCourse,
  getMyCourses,
  getAllCourses,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

router.post('/', protect, createCourse);
router.get('/mycourses', protect, getMyCourses);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);
router.get('/:courseId/students', protect, getEnrolledStudents);
router.get('/', getAllCourses);

module.exports = router;
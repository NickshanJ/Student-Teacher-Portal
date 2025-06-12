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
router.get('/', getAllCourses);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);
router.get('/:courseId/students', protect, getEnrolledStudents);

module.exports = router;
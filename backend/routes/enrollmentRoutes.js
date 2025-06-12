const express = require('express');
const router = express.Router();

const {
  enrollCourse,
  getEnrolledCourses,
  getEnrolledStudents,
  unenrollCourse 
} = require('../controllers/enrollmentController');

const { protect } = require('../middleware/authMiddleware'); 

router.post('/enroll', protect, enrollCourse); 
router.get('/my-courses', protect, getEnrolledCourses); 
router.get('/course/:courseId/students', protect, getEnrolledStudents);
router.delete('/unenroll/:courseId', protect, unenrollCourse);

module.exports = router;
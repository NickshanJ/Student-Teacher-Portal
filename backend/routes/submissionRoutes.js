const express = require('express');
const router = express.Router();

const {
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  getAssignmentsWithSubmissionStatus,
  getMySubmissionByAssignment,
  getAllSubmissionsForTeacher,
} = require('../controllers/submissionController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 🧑‍🎓 Student submits assignment (with file)
router.post('/submit/:assignmentId', protect, upload.single('file'), submitAssignment);

// ✅ New: Student views their own submission for a specific assignment
router.get('/submit/:assignmentId', protect, getMySubmissionByAssignment);

// 👨‍🏫 Teacher grades submission
router.put('/grade/:submissionId', protect, gradeSubmission);

// 👨‍🏫 Teacher views all submissions
router.get('/assignment/:assignmentId', protect, getSubmissionsByAssignment);

// 🧑‍🎓 Student views their submissions
router.get('/my-submissions', protect, getMySubmissions);

// 🧑‍🎓 Student gets assignments with submission status
router.get('/course/:courseId/assignments', protect, getAssignmentsWithSubmissionStatus);

// 👨‍🏫 Teacher views all submissions for all assignments
router.get('/teacher/submissions', protect, getAllSubmissionsForTeacher);

module.exports = router;
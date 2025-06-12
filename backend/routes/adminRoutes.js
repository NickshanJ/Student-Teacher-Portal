const express = require('express');
const router = express.Router();
const { getPendingTeachers, approveTeacher, declineTeacher, promoteTeacherToAdmin, getAllStudents, getAllTeachers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/pending-teachers', protect, adminOnly, getPendingTeachers);
router.put('/approve/:id', protect, adminOnly, approveTeacher);
router.delete('/decline/:id', protect, adminOnly, declineTeacher);
router.put('/promote/:id', protect, adminOnly, promoteTeacherToAdmin);
router.get('/students', protect, adminOnly, getAllStudents);
router.get('/teachers', protect, adminOnly, getAllTeachers);

module.exports = router;

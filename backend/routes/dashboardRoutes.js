const express = require('express');
const router = express.Router();
const { getStudentDashboardStats, getTeacherDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, (req, res) => {
  if (req.user.role === 'teacher') {
    return getTeacherDashboardStats(req, res);
  } else if (req.user.role === 'student') {
    return getStudentDashboardStats(req, res);
  } else {
    return res.status(403).json({ message: 'Forbidden: Invalid role' });
  }
});

module.exports = router;
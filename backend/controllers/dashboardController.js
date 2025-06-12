const Course = require('../models/courseModel');
const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const Enrollment = require('../models/enrollmentModel'); // ← Add this

const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Find all enrollments for this student
    const enrollments = await Enrollment.find({ student: studentId }).select('course');
    const courseIds = enrollments.map(e => e.course);

    // 2. Find all assignments in those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    // 3. Count total assignments
    const totalAssignments = assignments.length;

    // 4. Count submitted assignments
    const submittedAssignments = await Submission.countDocuments({
      assignment: { $in: assignmentIds },
      student: studentId
    });

    const pendingAssignments = totalAssignments - submittedAssignments;

    res.json({
      enrolledCourses: courseIds.length,
      totalAssignments,
      submittedAssignments,
      pendingAssignments
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // 1. Find courses created by this teacher
    const courses = await Course.find({ teacher: teacherId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // 2. Find assignments in those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    // 3. Count total assignments created by teacher
    const totalAssignments = assignments.length;

    // 4. Count total submissions received for those assignments
    const totalSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds } });

    res.json({
      coursesTaught: courseIds.length,
      totalAssignments,
      totalSubmissions,
    });

  } catch (error) {
    console.error('Teacher dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentDashboardStats, getTeacherDashboardStats };
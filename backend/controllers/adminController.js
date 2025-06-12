const User = require('../models/userModel');
const { sendEmail } = require('../utils/sendEmail');
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');


// Get unapproved teachers
const getPendingTeachers = async (req, res) => {
  const teachers = await User.find({ role: 'teacher', isApproved: false }).select('-password');
  res.json(teachers);
};

// Approve teacher
const approveTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  teacher.isApproved = true;
  await teacher.save();
  try {
    await sendEmail(
      teacher.email,
      'Account Approved',
      `Hello ${teacher.name}, your teacher account has been approved. You can now log in.`
    );
  } catch (err) {
    console.error('Email failed:', err.message);
  }
  res.json({ message: 'Teacher approved successfully' });
};

// Decline (reject) teacher
const declineTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  if (teacher.isApproved) {
    return res.status(400).json({ message: 'Cannot decline an already approved teacher' });
  }
  await User.deleteOne({ _id: teacher._id });
  try {
    await sendEmail(
      teacher.email,
      'Account Declined',
      `Hello ${teacher.name}, your teacher account request has been declined. Please contact support for more information.`
    );
  } catch (err) {
    console.error('Decline email failed:', err.message);
  }
  res.json({ message: 'Teacher declined and removed successfully' });
};

// Get all students with name, email, and enrolled course count
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    // For each student, count their enrollments
    const studentData = await Promise.all(
      students.map(async (student) => {
        const enrolledCount = await Enrollment.countDocuments({ student: student._id });
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          enrolledCount
        };
      })
    );
    res.json(studentData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Get all teachers with name, email, and course count
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    // For each teacher, count their courses
    const teacherData = await Promise.all(
      teachers.map(async (teacher) => {
        const courseCount = await Course.countDocuments({ teacher: teacher._id });
        return {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          courseCount
        };
      })
    );
    res.json(teacherData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

// Promote teacher to admin (single-role)
const promoteTeacherToAdmin = async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  teacher.role = 'admin';
  teacher.isApproved = true;
  await teacher.save();
  try {
    await sendEmail(
      teacher.email,
      'Promoted to Admin',
      `Hello ${teacher.name}, you have been promoted to admin. You now have admin privileges.`
    );
  } catch (err) {
    console.error('Promotion email failed:', err.message);
  }
  res.json({ message: 'Teacher promoted to admin successfully' });
};

module.exports = {
  getPendingTeachers,
  approveTeacher,
  declineTeacher,
  getAllStudents,
  getAllTeachers,
  promoteTeacherToAdmin
};

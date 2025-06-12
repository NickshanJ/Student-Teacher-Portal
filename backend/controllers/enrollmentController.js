const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const { createNotification } = require('./notificationController');
const { sendEmail } = require('../utils/sendEmail');

// Enroll student in a course
const enrollCourse = async (req, res) => {
  const { courseId } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if already enrolled
  const alreadyEnrolled = await Enrollment.findOne({
    student: req.user._id,
    course: courseId
  });

  if (alreadyEnrolled) {
    return res.status(400).json({ message: 'Already enrolled in this course' });
  }

  // Create the enrollment
  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId
  });

  // Notifications and email
  try {
    // In-app notification to teacher
    await createNotification(
      course.teacher,
      `Student ${req.user.name || 'A student'} enrolled in your course "${course.title}".`
    );

    // In-app notification to student
    await createNotification(
      req.user._id,
      `You have successfully enrolled in the course "${course.title}".`
    );

    // Send confirmation email to student
    await sendEmail(
      req.user.email,
      'Enrollment Confirmation',
      `Hi ${req.user.name},\n\nYou have successfully enrolled in the course "${course.title}".`
    );
  } catch (error) {
    console.error('Notification or email sending failed:', error);
  }

  res.status(201).json({ message: 'Enrollment successful', enrollment });
};

// Get all courses a student is enrolled in
const getEnrolledCourses = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
  res.json(enrollments);
};

// Get all students enrolled in a course (teacher only)
const getEnrolledStudents = async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (course.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You are not the owner of this course' });
  }

  const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email');
  res.json(enrollments);
};

// Unenroll student from a course
const unenrollCourse = async (req, res) => {
  const { courseId } = req.params;

  const enrollment = await Enrollment.findOneAndDelete({
    student: req.user._id,
    course: courseId
  });

  if (!enrollment) {
    return res.status(404).json({ message: 'You are not enrolled in this course' });
  }

  res.json({ message: 'Unenrolled successfully' });
};

module.exports = {
  enrollCourse,
  getEnrolledCourses,
  getEnrolledStudents,
  unenrollCourse
};
const Assignment = require('../models/assignmentModel');
const Course = require('../models/courseModel');
const Notification = require('../models/notificationModel');
const { sendEmail } = require('../utils/sendEmail');
const User = require('../models/userModel'); 
const Enrollment = require('../models/enrollmentModel');

// Create assignment (only teacher of the course)
const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    // Check if course exists and user is the course teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add assignments' });
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      dueDate,
    });

    // Notify enrolled students (assuming enrolledCourses exists in User model)
    const enrollments = await Enrollment.find({ course: courseId }).populate('student');
    const students = enrollments.map(e => e.student);


    // Create in-app notifications
    const notifications = students.map((student) => ({
      user: student._id,
      message: `📘 New assignment "${title}" posted in course "${course.name}"`,
    }));
    await Notification.insertMany(notifications);

    // Send email notifications
    students.forEach((student) => {
  sendEmail(
    student.email,
    'New Assignment Posted',
    `Hello ${student.name},\n\nA new assignment titled "${title}" has been posted in your course "${course.name}".\n\nDue Date: ${new Date(dueDate).toLocaleString()}\n\nLogin to your portal to view more details.`
  );
});

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignments by course
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ course: courseId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updates = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    Object.assign(assignment, updates);
    await assignment.save();

    res.json({ message: 'Assignment updated', assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne();

    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Get all assignments created by a specific teacher across their courses
const getAssignmentsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Find all courses taught by this teacher
    const courses = await Course.find({ teacher: teacherId });

    const courseIds = courses.map(course => course._id);

    // Find all assignments for these courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'name') // optional: shows course name with assignment
      .sort({ dueDate: 1 });

    res.status(200).json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments by teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTeacher,
};
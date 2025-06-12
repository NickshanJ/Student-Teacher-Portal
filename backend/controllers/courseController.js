const Course = require('../models/courseModel');
const mongoose = require('mongoose');
const Enrollment = require('../models/enrollmentModel');

// Add new course (teacher only)
const createCourse = async (req, res) => {
  if (!req.user.role || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create courses' });
  }

  const { title, description } = req.body;

  const course = await Course.create({
    title,
    description,
    teacher: req.user._id
  });

  res.status(201).json(course);
};

// Get courses created by logged-in teacher
const getMyCourses = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id });
  res.json(courses);
};

// Get all courses (accessible to students)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Update a course (teacher only, own courses)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only the teacher who created the course can update
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const { title, description } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a course (teacher only, own courses)
const deleteCourse = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    const enrollments = await Enrollment.find({ course: req.params.id });
    if (enrollments.length > 0) {
      return res.status(400).json({ message: 'Cannot delete course. Students are enrolled.' });
    }

    await course.deleteOne(); // use deleteOne instead of remove
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view enrolled students' });
    }

    res.json(course.students);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { 
  createCourse, 
  getMyCourses, 
  getAllCourses, 
  updateCourse, 
  deleteCourse,
  getEnrolledStudents,
  
};

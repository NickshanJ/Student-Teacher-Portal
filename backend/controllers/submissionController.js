const Submission = require('../models/submissionModel');
const Assignment = require('../models/assignmentModel');
const Course = require('../models/courseModel');
const { createNotification } = require('./notificationController');
const { sendEmail } = require('../utils/sendEmail');
const User = require('../models/userModel'); 


// Student submits an assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    const file = req.file; // Get uploaded file

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Prevent multiple submissions
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already submitted this assignment' });

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      content,
      file: file ? file.path : null,
    });

    // Send in-app notification
    await createNotification(
      req.user._id,
      `You have successfully submitted the assignment "${assignment.title}".`
    );

    // Email confirmation
    const student = await User.findById(req.user._id);
    await sendEmail(
      student.email,
      'Assignment Submission Confirmation',
      `Hi ${student.name},\n\nYou have successfully submitted your assignment: "${assignment.title}".\n\nKeep up the good work!`
    );

    res.status(201).json({ message: 'Submission successful', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher grades a student's submission
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('assignment student');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const course = await Course.findById(submission.assignment.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();

    // 📨 Send email to student
    const studentEmail = submission.student.email;
    const subject = `Your assignment "${submission.assignment.title}" has been graded`;
    const text = `Hello ${submission.student.name},\n\nYour assignment has been graded.\n\nGrade: ${grade}\nFeedback: ${feedback || 'No feedback'}\n\nRegards,\nStudent-Teacher Portal`;

    try {
      await sendEmail(studentEmail, subject, text);
    } catch (error) {
      console.error('Error sending graded email:', error);
    }

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher views all submissions for an assignment
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view submissions' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student views their own submissions
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title dueDate')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student gets all assignments for a course with submitted flag
const getAssignmentsWithSubmissionStatus = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId });

    // Get this student's submissions for these assignments
    const submissions = await Submission.find({
      student: studentId,
      assignment: { $in: assignments.map(a => a._id) }
    }).select('assignment');

    // Convert submitted assignment IDs to string for easy comparison
    const submittedAssignmentIds = submissions.map(s => s.assignment.toString());

    // Add submitted: true/false flag to each assignment
    const assignmentsWithStatus = assignments.map(a => ({
      ...a.toObject(),
      submitted: submittedAssignmentIds.includes(a._id.toString())
    }));

    res.status(200).json(assignmentsWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch assignments with submission status' });
  }
};

// Get a student's submission for a specific assignment (includes grade and feedback)
const getMySubmissionByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    })
    .populate('assignment', 'title dueDate')
    .populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this assignment' });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch submission details' });
  }
};

const getAllSubmissionsForTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all courses taught by this teacher
    const courses = await Course.find({ teacher: teacherId }).select('_id');

    if (!courses.length) {
      return res.json({ submissions: [] });
    }

    const courseIds = courses.map(c => c._id);

    // Get all assignments for those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id');

    if (!assignments.length) {
      return res.json({ submissions: [] });
    }

    const assignmentIds = assignments.map(a => a._id);

    // Get all submissions for those assignments
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('assignment', 'title course')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions for teacher:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
};

module.exports = {
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  getAssignmentsWithSubmissionStatus,
  getMySubmissionByAssignment,
  getAllSubmissionsForTeacher
};
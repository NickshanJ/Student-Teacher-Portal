// reminderJob.js
const cron = require('node-cron');
const Assignment = require('./models/assignmentModel');
const Course = require('./models/courseModel');
const User = require('./models/userModel');
const { sendEmail } = require('./utils/sendEmail');
const { createNotification } = require('./controllers/notificationController');

const sendDueReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAssignments = await Assignment.find({
      dueDate: {
        $gte: now,
        $lte: tomorrow,
      },
    });

    for (const assignment of upcomingAssignments) {
      const course = await Course.findById(assignment.course).populate('students');

      for (const student of course.students) {
        // 📨 Send Email
        await sendEmail(
          student.email,
          `Reminder: Assignment "${assignment.title}" due soon`,
          `Hi ${student.name},\n\nThis is a reminder that your assignment "${assignment.title}" is due on ${assignment.dueDate.toLocaleString()}.\n\nPlease submit it before the deadline.`
        );

        // 🔔 In-app Notification
        await createNotification(
          student._id,
          `Reminder: Assignment "${assignment.title}" is due on ${assignment.dueDate.toLocaleString()}`
        );
      }
    }
  } catch (err) {
    console.error('❌ Error sending due reminders:', err);
  }
};

// Run every hour
cron.schedule('0 * * * *', sendDueReminders);

module.exports = sendDueReminders;
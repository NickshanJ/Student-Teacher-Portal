const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseContentRoutes = require('./routes/courseContentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const connectDB = require('./config/db');
require('./reminderJob'); 
require('dotenv').config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/course-content', courseContentRoutes);
app.use('/api/course-progress', require('./routes/courseProgressRoutes'));
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/files', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {/* Server started on port ${PORT} */});
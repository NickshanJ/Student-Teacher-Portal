# Student-Teacher Portal

## Description
A web application for students and teachers to manage courses, assignments, messaging, and profiles. Teachers can create courses and assignments, students can enroll and submit work, and both can communicate via chat.

## Features
- Student and teacher dashboards
- Course and assignment management
- Real-time messaging/chat
- Profile management with image upload
- Enrollment and submission tracking
- Admin features (user/content management)
- Email notifications and reminders

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)

## Getting Started: Cloning the Project

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd Student-Teacher\ Portal
   ```
2. **Install dependencies for backend:**
   ```sh
   cd backend
   npm install
   ```
3. **Install dependencies for frontend:**
   ```sh
   cd ../frontend
   npm install
   ```
4. **Set up environment variables:**
   - In `backend/`, create a `.env` file with your MongoDB URI and any required secrets.
   - In `frontend/`, set `VITE_API_BASE_URL` in the `.env` file to your backend URL (e.g., `http://localhost:5000`).
5. **Run the backend server:**
   ```sh
   cd ../backend
   npm run dev
   # or: npm start
   ```
6. **Run the frontend app:**
   ```sh
   cd ../frontend
   npm run dev
   ```
7. **Access the app:**
   - Frontend (Production/Netlify): https://student-teacher-portal.netlify.app
   - Backend API (Production/Render): https://student-teacher-portal-backend.onrender.com

---

## Demo Accounts

You can use the following demo accounts to explore the portal:

- **Admin**
  - Username: admin
  - Email: admin@example.com
  - Password: admin123

- **Teacher**
  - Username: Teacher Test
  - Email: teacher@test.com
  - Password: Teacher123

- **Student**
  - Username: Nickshan
  - Email: nick@example.com
  - Password: Student123

---

## Backend
- **Tech Stack:** Node.js, Express, MongoDB (Mongoose)
- **Main Packages:**
  - express, mongoose, dotenv, cors, jsonwebtoken, bcryptjs, multer, nodemailer, node-cron
- **What it does:**
  - User authentication (JWT-based)
  - APIs for courses, assignments, submissions, messaging, notifications, and profiles
  - File upload support (profile images, assignment files)
  - Email notifications for reminders
  - Scheduled jobs for assignment reminders

## Frontend
- **Tech Stack:** React, Vite, Tailwind CSS
- **Main Packages:**
  - react, react-dom, react-router-dom, axios, chart.js, react-chartjs-2, react-calendar, lucide-react, tailwindcss
- **What it does:**
  - Student and teacher dashboards for managing courses and assignments
  - Messaging/chat panels for real-time communication
  - Profile management with image upload
  - Course and assignment views for both students and teachers
  - For students: enroll in courses, view assignments, submit work, chat with teachers
  - For teachers: create courses and assignments, view student submissions, chat with students
  - Admin features (if present): manage users and content
- **How it's built:**
  - Built with React and Vite for fast development and hot reloading
  - Uses Tailwind CSS for modern, responsive UI
  - Axios is used for API calls to the backend
  - Routing handled by react-router-dom

---

## Usage

To use this portal:
1. Follow the setup instructions above to install dependencies and configure environment variables.
2. Start both the backend and frontend servers.
3. Access the app using the provided URLs.
4. Log in with the demo accounts or register a new user.

---

## Project Structure

### Frontend
- `frontend/` - React app source code and configuration
  - `src/` - Main React source code
    - `components/` - Reusable UI components
    - `assets/` - Static assets (images, icons, etc.)
    - `App.jsx` - Main app component
    - `main.jsx` - Entry point for React app
    - `axiosConfig.js` - Axios API configuration
    - `config.js` - App configuration
    - `index.css`, `App.css` - Global and app styles
  - `public/portal-favicon.svg` - Custom favicon/logo
  - `index.html` - Main HTML template
  - `vite.config.js` - Vite build configuration
  - `package.json` - Frontend dependencies and scripts

### Backend
- `backend/` - Node.js/Express API and server code
  - `server.js` - Main Express server entry point
  - `config/db.js` - MongoDB connection setup
  - `controllers/` - Route handler logic for each feature (users, courses, etc.)
  - `middleware/` - Express middleware (auth, roles, uploads)
  - `models/` - Mongoose schemas for MongoDB collections
  - `routes/` - API route definitions for each feature
  - `utils/sendEmail.js` - Utility for sending emails
  - `reminderJob.js` - Scheduled job for assignment reminders
  - `uploads/` - Uploaded files (profile images, assignments)
  - `package.json` - Backend dependencies and scripts

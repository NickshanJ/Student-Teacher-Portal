# Student-Teacher Portal

## Description
A web application for students and teachers to manage courses, assignments, messaging, and profiles. Teachers can create courses and assignments, students can enroll and submit work, and both can communicate via chat.

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
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

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

## Deployment
- Set environment variables in production for both backend and frontend.
- Make sure to remove all debug `console.log` except for essential server/database status logs.

---

## Author & License
- Author: Your Name
- License: MIT (or your choice)

---

## Notes
- For any issues, check the logs in the backend server console.
- Database connection status will be shown as:
  - `Database is running on the server`
  - `MongoDB connected`
- For further customization, edit the respective files in `backend/` and `frontend/` folders.

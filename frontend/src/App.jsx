import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import DashboardContent from "./pages/student/DashboardContent";
import AllCourses from "./pages/student/AllCourses";
import ClassesPage from "./pages/student/ClassesPage";
import AssignmentsPage from "./pages/student/AssignmentsPage";
import CourseAssignments from "./pages/student/CourseAssignments";
import SubmissionDetail from "./pages/student/SubmissionDetail";
import MessageBase from "./pages/student/message/MessagePage";
import ClassContent from "./pages/student/ClassContent";
import ProfilePage from "./pages/student/ProfilePage";

// Teacher and Admin dashboards
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/" />;
    // Single-role support only
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student Dashboard and Nested Routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardContent />} />
          <Route path="course-enrollment" element={<AllCourses />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:courseId" element={<ClassContent />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="assignments/:courseId" element={<CourseAssignments />} />
          <Route path="assignment/:assignmentId" element={<SubmissionDetail />} />
          <Route path="messages" element={<MessageBase />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Teacher Dashboard */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
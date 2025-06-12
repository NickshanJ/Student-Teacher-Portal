import React, { useState } from "react";
import Sidebar from "../components/TeacherDashboard/Sidebar";
import DashboardContent from "../components/TeacherDashboard/DashboardContent";
import MyCourses from "../components/TeacherDashboard/MyCourses/MyCoursesPage";
import CourseContent from "../components/TeacherDashboard/CourseContent";
import CreateAssignment from "../components/TeacherDashboard/Assignment/AssignmentDashboard";
import Submissions from "../components/TeacherDashboard/Submissions";
import Messages from "../components/TeacherDashboard/Messages";
import TeacherProfilePage from "../components/TeacherDashboard/TeacherProfilePage";

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "courses":
        return <MyCourses />;
      case "course-content":
        return <CourseContent />;
      case "create-assignment":
        return <CreateAssignment />;
      case "submissions":
        return <Submissions />;
      case "messages":
        return <Messages />;
      case "profile":
        return <TeacherProfilePage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen font-bold">
      {/* Sidebar */}
      <Sidebar onSectionChange={setActiveSection} active={activeSection} />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
import React, { useState } from "react";
import CourseSelector from "./CourseSelector";
import StudentSelector from "./StudentSelector";
import MessageThreadForTeacher from "./MessageThreadForTeacher";

const MessageTeacherContainer = ({ token, teacherId }) => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedStudentId(""); // reset student selection when course changes
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Messages</h2>

      {/* Course Dropdown */}
      <CourseSelector token={token} teacherId={teacherId} onSelectCourse={handleCourseSelect} />

      {/* Student Dropdown (only show after course is selected) */}
      {selectedCourseId && (
        <StudentSelector
          token={token}
          teacherId={teacherId}
          courseId={selectedCourseId}
          onSelectStudent={handleStudentSelect}
        />
      )}

      {/* Message Thread (only show after student is selected) */}
      {selectedCourseId && selectedStudentId && (
        <MessageThreadForTeacher
          token={token}
          teacherId={teacherId}
          courseId={selectedCourseId}
          studentId={selectedStudentId}
        />
      )}
    </div>
  );
};

export default MessageTeacherContainer;
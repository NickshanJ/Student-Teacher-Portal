// TeacherMessagePage.jsx
import React, { useEffect, useState } from "react";
import CourseSelectorForTeacher from "./CourseSelectorForTeacher";
import StudentSelector from "./StudentSelector";
import MessageThread from "./MessageThreadForTeacher";

const TeacherMessagePage = () => {
  const [teacher, setTeacher] = useState(null);
  const [token, setToken] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setTeacher(storedUser);
      setToken(storedToken);
    }
  }, []);

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveStudentId(null);
  };

  const handleStudentSelect = (studentId) => {
    setActiveStudentId(studentId);
  };

  const handleBack = () => {
    setActiveStudentId(null);
  };

  if (!teacher) return <p>Loading teacher...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Teacher Messaging Panel
        </h1>
        {activeStudentId && (
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back
          </button>
        )}
      </div>
      {!activeStudentId ? (
        <>
          <CourseSelectorForTeacher
            token={token}
            teacherId={teacher.id}
            onSelectCourse={handleCourseSelect}
          />

          {selectedCourseId && (
            <StudentSelector
              token={token}
              courseId={selectedCourseId}
              onSelectStudent={handleStudentSelect}
            />
          )}
        </>
      ) : (
        <MessageThread
          token={token}
          studentId={activeStudentId}
          courseId={selectedCourseId}
          teacherId={teacher.id}
        />
      )}
    </div>
  );
};

export default TeacherMessagePage;
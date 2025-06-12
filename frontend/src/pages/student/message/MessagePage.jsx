import React, { useState, useEffect } from "react";
import CourseSelector from "./CourseSelector";
import MessageThread from "./MessageThread";

const MessagePage = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);

      const studentId = storedUser._id || storedUser.id;
      setStudentId(studentId);
    }
  }, []);

  const handleCourseSelect = (courseId, teacherId) => {
    setSelectedCourseId(courseId);
    setSelectedTeacherId(teacherId);
  };

  const handleThreadSelect = (teacherId) => {
    setSelectedTeacherId(teacherId);
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Messages</h1>

      <div className="mb-6">
        <CourseSelector
          token={token}
          studentId={studentId}
          onSelectCourse={handleCourseSelect}
        />
      </div>

      <div>
        <MessageThread
          token={token}
          studentId={studentId}
          selectedCourseId={selectedCourseId}
          selectedTeacherId={selectedTeacherId}
          onSelectThread={handleThreadSelect}
        />
      </div>
    </div>
  );
};

export default MessagePage;

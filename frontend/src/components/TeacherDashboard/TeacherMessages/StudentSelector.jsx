import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const StudentSelector = ({ token, courseId, onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/enrollments/course/${courseId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Extract and set the student data from the API response
        const studentsData = res.data.map((item) => item.student);
        setStudents(studentsData);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [courseId, token]);

  const handleSelectChange = (e) => {
    const selectedIndex = e.target.value;
    const selected = students[selectedIndex];
    setSelectedStudent(selectedIndex);
    if (selected) {
      onSelectStudent(selected._id); // studentId
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4 tracking-tight drop-shadow">
        Select a Student
      </h2>
      {students.length === 0 ? (
        <p className="text-base text-gray-400">
          No students enrolled in this course.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className={`bg-white p-5 rounded-xl shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 ${
                selectedStudent === student._id
                  ? "ring-2 ring-blue-400 border-blue-600"
                  : ""
              }`}
              onClick={() => {
                setSelectedStudent(student._id);
                onSelectStudent(student._id);
              }}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {student.name}
              </h2>
              {student.email && (
                <p className="text-xs text-blue-500 mt-1">{student.email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSelector;

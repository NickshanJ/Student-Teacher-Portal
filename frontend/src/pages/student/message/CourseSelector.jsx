import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const CourseSelector = ({ token, onSelectCourse }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/enrollments/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEnrollments(res.data);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      }
    };

    fetchEnrollments();
  }, [token]);

  const handleSelectChange = (e) => {
    const selectedIndex = e.target.value;
    const selectedEnrollment = enrollments[selectedIndex];
    const courseId = selectedEnrollment.course._id;
    const teacherId = selectedEnrollment.course.teacher;

    setSelected(selectedIndex);
    onSelectCourse(courseId, teacherId);
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-medium text-gray-700 mb-2">
        Select a Course
      </h2>

      {enrollments.length === 0 ? (
        <p className="text-sm text-gray-500">No enrolled courses found.</p>
      ) : (
        <select
          value={selected}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a Course --</option>
          {enrollments.map((enrollment, index) => (
            <option key={enrollment.course._id} value={index}>
              {enrollment.course.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CourseSelector;

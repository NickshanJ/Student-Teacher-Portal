import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const CourseSelectorForTeacher = ({ token, teacherId, onSelectCourse }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/mycourses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch teacher's courses:", err);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4 tracking-tight drop-shadow">
        Select a Course
      </h2>
      {courses.length === 0 ? (
        <p className="text-base text-gray-400">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`bg-white p-5 rounded-xl shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 ${
                selectedCourse === course._id
                  ? "ring-2 ring-blue-400 border-blue-600"
                  : ""
              }`}
              onClick={() => {
                setSelectedCourse(course._id);
                onSelectCourse(course._id);
              }}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {course.title}
              </h2>
              {course.description && (
                <p className="text-gray-600 text-sm mt-2">{course.description}</p>
              )}
              {course.code && (
                <p className="text-xs text-blue-500 mt-1">{course.code}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSelectorForTeacher;
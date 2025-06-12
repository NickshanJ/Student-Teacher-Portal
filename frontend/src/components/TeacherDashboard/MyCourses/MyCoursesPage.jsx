import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [viewEnrolled, setViewEnrolled] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cachedCourses = localStorage.getItem("teacherCourses");
    if (cachedCourses) {
      setCourses(JSON.parse(cachedCourses));
      setLoadingCourses(false);
    } else {
      fetchCourses();
    }
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
      localStorage.setItem("teacherCourses", JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching courses", error);
    }
    setLoadingCourses(false);
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${BASE_URL}/api/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course created successfully");
      setFormData({ title: "", description: "" });
      setShowCreateForm(false);
      fetchCourses();
    } catch (error) {
      console.error("Error creating course", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE_URL}/api/courses/${selectedCourse}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course updated successfully");
      setFormData({ title: "", description: "" });
      setShowEditForm(false);
      fetchCourses();
    } catch (error) {
      console.error("Error updating course", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/courses/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted successfully");
      setShowDeleteForm(false);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course", error);
    }
  };

  const viewEnrolledStudents = async (courseId) => {
    setSelectedCourse(courseId);
    setViewEnrolled(true);
    setLoadingEnrolled(true);
    const cacheKey = `teacherEnrolledStudents_${courseId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setEnrolledStudents(JSON.parse(cached));
      setLoadingEnrolled(false);
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/enrollments/course/${courseId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEnrolledStudents(res.data);
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching enrolled students", error);
    }
    setLoadingEnrolled(false);
  };

  const goBack = () => {
    setViewEnrolled(false);
    setEnrolledStudents([]);
    setSelectedCourse(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {!viewEnrolled ? (
        <>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Courses</h1>
          {loadingCourses ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.length === 0 ? (
                <p className="text-gray-600">No courses found.</p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200"
                    onClick={() => viewEnrolledStudents(course._id)}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold shadow"
            >
              Create Course
            </button>
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold shadow"
            >
              Edit Course
            </button>
            <button
              onClick={() => setShowDeleteForm(!showDeleteForm)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow"
            >
              Delete Course
            </button>
          </div>
          {showCreateForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg border mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Create New Course
              </h3>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleCreate}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow"
              >
                Create
              </button>
            </div>
          )}
          {showEditForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg border mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Edit Course
              </h3>
              <select
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <>
                  <input
                    type="text"
                    placeholder="New Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <textarea
                    placeholder="New Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow"
                  >
                    Update
                  </button>
                </>
              )}
            </div>
          )}
          {showDeleteForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg border mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Delete Course
              </h3>
              <select
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Enrolled Students
            </h2>
            <button
              onClick={goBack}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full shadow font-semibold"
            >
              Back
            </button>
          </div>
          {loadingEnrolled ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : enrolledStudents.length === 0 ? (
            <p className="text-gray-600">No students enrolled.</p>
          ) : (
            <div className="space-y-4">
              {enrolledStudents.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <p className="text-gray-800">
                    <strong>Name:</strong> {entry.student?.name}
                  </p>
                  <p className="text-gray-800">
                    <strong>Email:</strong> {entry.student?.email}
                  </p>
                  <p className="text-gray-800">
                    <strong>Role:</strong> Student
                  </p>
                  <p className="text-gray-800">
                    <strong>Enrolled Date:</strong>{" "}
                    {new Date(entry.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
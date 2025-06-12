import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const AssignmentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [message, setMessage] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // 🆕 state to control course view mode
  const [viewingCourseAssignments, setViewingCourseAssignments] =
    useState(false);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    const cachedCourses = localStorage.getItem("teacherCourses");
    if (cachedCourses) {
      setCourses(JSON.parse(cachedCourses));
      setLoadingCourses(false);
    } else {
      fetchCourses();
    }
    const cachedRecent = localStorage.getItem("teacherRecentAssignments");
    if (cachedRecent) {
      setRecentAssignments(JSON.parse(cachedRecent));
      setLoadingRecent(false);
    } else {
      fetchRecentAssignments();
    }
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/courses/mycourses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const coursesData = Array.isArray(res.data)
        ? res.data
        : res.data.courses || [];
      setCourses(coursesData);
      localStorage.setItem("teacherCourses", JSON.stringify(coursesData));
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
    }
    setLoadingCourses(false);
  };

  const fetchRecentAssignments = async () => {
    setLoadingRecent(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/assignments/teacher-assignments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const sorted = res.data.assignments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentAssignments(sorted);
      localStorage.setItem("teacherRecentAssignments", JSON.stringify(sorted));
    } catch (error) {
      console.error("Error fetching recent assignments:", error);
    }
    setLoadingRecent(false);
  };

  const fetchAssignments = async (courseId) => {
    setLoadingAssignments(true);
    const cacheKey = `teacherAssignments_${courseId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAssignments(JSON.parse(cached));
      setLoadingAssignments(false);
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/assignments/teacher-assignments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const filtered = res.data.assignments.filter(
        (a) => a.course._id === courseId
      );
      setAssignments(filtered);
      localStorage.setItem(cacheKey, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
    setLoadingAssignments(false);
  };

  // 🆕 fetch assignments for selected course and show detail view
  const handleCourseClick = async (course) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/assignments/teacher-assignments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const filtered = res.data.assignments.filter(
        (a) => a.course._id === course._id
      );
      setCourseAssignments(filtered);
      setCourseDetails(course);
      setViewingCourseAssignments(true);
    } catch (err) {
      console.error("Error loading course assignments:", err);
    }
  };

  const handleBack = () => {
    setViewingCourseAssignments(false);
    setCourseAssignments([]);
    setCourseDetails(null);
  };

  const handleToggle = (section) => {
    setActiveSection(activeSection === section ? "" : section);
    setFormData({ title: "", description: "", dueDate: "" });
    setSelectedCourse("");
    setSelectedAssignment("");
    setAssignments([]);
    setMessage("");
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/assignments`,
        {
          courseId: selectedCourse,
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("✅ Assignment created successfully!");
      fetchRecentAssignments();
    } catch (error) {
      console.error("Create error:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/assignments/${selectedAssignment}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("✅ Assignment updated successfully!");
      fetchRecentAssignments();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/assignments/${selectedAssignment}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage("✅ Assignment deleted successfully!");
      fetchRecentAssignments();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {viewingCourseAssignments ? (
        <>
          {/* 🆕 Assignment List for Selected Course */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
            Assignments for "{courseDetails?.title}"
          </h1>
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow">Back
          </button>
          </div>
          {courseAssignments.length === 0 ? (
            <p className="text-gray-600">No assignments found for this course.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseAssignments.map((assignment) => (
                <div key={assignment._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">{assignment.title}</h2>
                  <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Courses</h1>
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
                    onClick={() => handleCourseClick(course)}
                  >
                    <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 🔧 Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button onClick={() => handleToggle("create")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow">
              Create Assignment
            </button>
            <button onClick={() => handleToggle("update")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-medium shadow">
              Edit Assignment
            </button>
            <button onClick={() => handleToggle("delete")}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow">
              Delete Assignment
            </button>
          </div>

          {/* 🧾 Create Form */}
          {activeSection === "create" && (
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block mb-3 p-2 border rounded w-full"
              >
                <option value="">Select a course</option>
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
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Create
                  </button>
                </>
              )}
            </div>
          )}

          {/* ✏️ Update Form */}
          {activeSection === "update" && (
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchAssignments(e.target.value);
                }}
                className="block mb-3 p-2 border rounded w-full"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {loadingAssignments ? (
                <div className="flex justify-center items-center py-4">
                  <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : assignments.length > 0 && (
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="block mb-3 p-2 border rounded w-full"
                >
                  <option value="">Select assignment</option>
                  {assignments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              )}

              {selectedAssignment && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="block mb-2 p-2 border rounded w-full"
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                </>
              )}
            </div>
          )}

          {/* 🗑️ Delete Form */}
          {activeSection === "delete" && (
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchAssignments(e.target.value);
                }}
                className="block mb-3 p-2 border rounded w-full"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {loadingAssignments ? (
                <div className="flex justify-center items-center py-4">
                  <div className="w-6 h-6 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : assignments.length > 0 && (
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="block mb-3 p-2 border rounded w-full"
                >
                  <option value="">Select assignment</option>
                  {assignments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              )}

              {selectedAssignment && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {message && (
            <p className="text-green-700 font-semibold text-center mb-6">{message}</p>
          )}

          {/* 🕐 Recently Added Assignments */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recently Added Assignments</h2>
          {loadingRecent ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentAssignments.length === 0 ? (
            <p className="text-gray-600">No recent assignments found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow hover:shadow-lg transition-all">
                  <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                  <p className="text-gray-600 mt-2">{assignment.description}</p>
                  <p className="text-sm text-gray-500 mt-3">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentDashboard;

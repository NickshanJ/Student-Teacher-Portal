import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

const CourseContent = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [action, setAction] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "video",
    contentData: "",
    order: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/mycourses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Error loading courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const fetchContents = async (courseId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course-content/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setContents(res.data);
    } catch (err) {
      console.error("Error loading contents:", err);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setAction(null);
    setSelectedContentId("");
    setMessage("");
    setFormData({
      title: "",
      description: "",
      contentType: "video",
      contentData: "",
      order: 0,
    });
    fetchContents(course._id);
  };

  const handleSubmit = async () => {
    try {
      if (action === "create") {
        await axios.post(
          `${BASE_URL}/api/course-content`,
          {
            courseId: selectedCourse._id,
            ...formData,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage("✅ Content created successfully");
      } else if (action === "edit") {
        await axios.put(
          `${BASE_URL}/api/course-content/${selectedContentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage("✅ Content updated successfully");
      } else if (action === "delete") {
        await axios.delete(
          `${BASE_URL}/api/course-content/${selectedContentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage("✅ Content deleted successfully");
      }

      setFormData({
        title: "",
        description: "",
        contentType: "video",
        contentData: "",
        order: 0,
      });
      setSelectedContentId("");
      fetchContents(selectedCourse._id);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
        Course Contents
      </h1>

      {/* Course List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            onClick={() => handleCourseClick(course)}
            className={`cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-md transition-transform duration-200 ${
              selectedCourse?._id === course._id
                ? "ring-2 ring-indigo-500 bg-indigo-100"
                : "hover:scale-[1.03] hover:shadow-lg"
            }`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {course.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description}
            </p>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <section className="mt-12 bg-gray-50 rounded-lg p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">
            Managing Content for:{" "}
            <span className="text-indigo-900">{selectedCourse.title}</span>
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {["create", "edit", "delete"].map((act) => (
              <button
                key={act}
                onClick={() => setAction((prev) => (prev === act ? null : act))}
                className={`rounded-md px-5 py-2 text-white font-semibold transition-colors ${
                  act === "create"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : act === "edit"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {action === act
                  ? `Cancel ${act}`
                  : `${act.charAt(0).toUpperCase() + act.slice(1)} Content`}
              </button>
            ))}
          </div>

          {/* Content Dropdown */}
          {(action === "edit" || action === "delete") && (
            <select
              className="w-full rounded-md border border-gray-300 p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={selectedContentId}
              onChange={(e) => {
                const contentId = e.target.value;
                setSelectedContentId(contentId);
                const selected = contents.find((c) => c._id === contentId);
                if (selected && action === "edit") {
                  setFormData({
                    title: selected.title,
                    description: selected.description,
                    contentType: selected.contentType,
                    contentData: selected.contentData,
                    order: selected.order,
                  });
                }
              }}
            >
              <option value="">Select Content</option>
              {contents.map((content) => (
                <option key={content._id} value={content._id}>
                  {content.title}
                </option>
              ))}
            </select>
          )}

          {/* Form */}
          {action && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {action !== "delete" && (
                <>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                  <select
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData({ ...formData, contentType: e.target.value })
                    }
                    required
                  >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="quiz">Quiz</option>
                  </select>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Content Data (URL / Text)"
                    value={formData.contentData}
                    onChange={(e) =>
                      setFormData({ ...formData, contentData: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Order"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    required
                  />
                </>
              )}
              <button
                type="submit"
                disabled={action !== "create" && !selectedContentId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {action === "create"
                  ? "Create Content"
                  : action === "edit"
                  ? "Update Content"
                  : "Delete Content"}
              </button>
            </form>
          )}

          {/* Contents List */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-5 text-gray-900">
              Course Contents
            </h3>
            <div className="grid gap-5">
              {contents.map((content) => (
                <div
                  key={content._id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-indigo-700 mb-1">
                    {content.title}
                  </h4>
                  <p className="text-gray-700 mb-2">{content.description}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Type:</span>{" "}
                    {content.contentType} |{" "}
                    <span className="font-medium">Order:</span> {content.order}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <p className="mt-6 text-green-600 font-medium">{message}</p>
          )}
        </section>
      )}
    </div>
  );
};

export default CourseContent;

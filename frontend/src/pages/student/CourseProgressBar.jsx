import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BASE_URL } from "../../config";

/**
 * CourseProgressBar displays the completion progress for a given course.
 * Fetches progress from `/api/course-progress/:courseId/completed`.
 */
const CourseProgressBar = ({ courseId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/api/course-progress/${courseId}/completed`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProgress(res.data?.progress ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load progress");
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <span className="text-gray-400">Loading...</span>;
  if (error) return <span className="text-red-400">{error}</span>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-semibold text-purple-700">{progress}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full border border-gray-300 shadow-inner relative overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-500 shadow-md"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)",
            minWidth: progress > 0 ? '0.5rem' : 0
          }}
        ></div>
      </div>
    </div>
  );
};

CourseProgressBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseProgressBar;

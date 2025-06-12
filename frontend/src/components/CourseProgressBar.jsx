// This file is deprecated. The CourseProgressBar component has been moved to src/pages/student/CourseProgressBar.jsx and should be used from there.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

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
    axios
      .get(`/api/course-progress/${courseId}/completed`)
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
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-semibold text-purple-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3">
        <div
          className="bg-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

CourseProgressBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseProgressBar;

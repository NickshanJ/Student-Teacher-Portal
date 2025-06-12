import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config";

const ClassContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // Try to load from cache
    const cacheKey = `classContent_${courseId}`;
    const cachedContent = localStorage.getItem(cacheKey);
    if (cachedContent) {
      setContent(JSON.parse(cachedContent));
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchCourseContent = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/course-content/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Fetch completed content for this course
        const completedRes = await axios.get(
          `${BASE_URL}/api/course-progress/${courseId}/completed`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const completedIds = completedRes.data.completedContentIds || [];
        // Mark completed in UI
        const contentWithStatus = res.data.map((item) => ({
          ...item,
          completed: completedIds.includes(item._id),
        }));
        setContent(contentWithStatus);
        localStorage.setItem(cacheKey, JSON.stringify(contentWithStatus));
      } catch (err) {
        console.error("Error fetching course content:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId, navigate]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Heading and Back Button in Flex Row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Course Content
        </h1>
        <button
          onClick={() => navigate("/student-dashboard/classes")}
          className="text-sm bg-blue-600 text-white font-bold px-10 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Back
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-lg font-semibold text-blue-600 animate-bounce">
            Loading content...
          </p>
        </div>
      ) : content.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-lg font-semibold text-gray-500">
            No content available for this course.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {content.map((item) => (
            <div
              key={item._id}
              className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>

              {item.contentType === "video" ? (
                <a
                  href={item.contentData}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 underline font-medium hover:text-blue-800"
                >
                  ▶ Watch Video
                </a>
              ) : item.contentType === "quiz" ? (
                <div className="mt-4 space-y-5">
                  {item.contentData.questions.map((q, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 p-4 rounded-md bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">
                        {index + 1}. {q.question}
                      </p>
                      <ul className="list-disc pl-6 text-sm text-gray-700 mt-2 space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-700">{item.contentData}</p>
              )}
              {/* Mark as Completed Button (right side, only if not already completed) */}
              <div className="flex justify-end">
                {item.completed ? (
                  <button
                    className="mt-4 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                    disabled
                  >
                    Completed
                  </button>
                ) : (
                  <button
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    onClick={async () => {
                      try {
                        await axios.post(
                          `${BASE_URL}/api/course-progress/complete`,
                          { courseId, contentId: item._id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        // Mark as completed in UI
                        setContent((prev) =>
                          prev.map((c) =>
                            c._id === item._id ? { ...c, completed: true } : c
                          )
                        );
                        alert("Marked as completed!");
                      } catch (err) {
                        alert("Failed to mark as completed.");
                      }
                    }}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassContent;

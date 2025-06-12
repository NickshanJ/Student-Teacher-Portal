import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const AssignmentsPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // Try to load from cache
    const cachedEnrolled = localStorage.getItem("enrolledCourses");
    if (cachedEnrolled) {
      setEnrolledCourses(JSON.parse(cachedEnrolled));
      setLoading(false);
      return;
    }

    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/enrollments/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrolledCourses(res.data);
        localStorage.setItem("enrolledCourses", JSON.stringify(res.data));
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [navigate]);

  const handleCourseClick = (courseId) => {
    navigate(`/student-dashboard/assignments/${courseId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My Enrolled Courses
      </h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-lg font-semibold text-blue-600 animate-bounce">
            Loading courses...
          </p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <p className="text-gray-600 italic">
          You have not enrolled in any courses yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {enrolledCourses.map(({ course }) => (
            <div
              key={course._id}
              onClick={() => handleCourseClick(course._id)}
              className="cursor-pointer p-6 border rounded-2xl shadow-md bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {course.title}
              </h2>
              <p className="text-gray-600">
                {course.description || "No description available."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
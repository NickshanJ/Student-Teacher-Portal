import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const Classes = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const fetchEnrolledCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/enrollments/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrolledCourses(res.data);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };

    fetchEnrolledCourses();
  }, [navigate, token, user]);

  const handleCourseClick = (courseId) => {
    // Update this path to be nested inside student-dashboard
    navigate(`/student-dashboard/classes/${courseId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Classes</h1>

      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {enrolledCourses.map(({ course }) => (
            <div
              key={course._id}
              onClick={() => handleCourseClick(course._id)}
              className="cursor-pointer p-6 border rounded-2xl shadow-md bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">{course.title}</h2>
              <p className="text-gray-600">{course.description || "No description available."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;
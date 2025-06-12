import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [actionType, setActionType] = useState(""); // "enroll" or "unenroll"
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) return navigate("/login");

    // Try to load from cache
    const cachedCourses = localStorage.getItem("allCourses");
    const cachedEnrolled = localStorage.getItem("enrolledCourses");
    if (cachedCourses && cachedEnrolled) {
      setCourses(JSON.parse(cachedCourses));
      setEnrolledCourses(JSON.parse(cachedEnrolled));
      return;
    }

    // Otherwise, fetch from API and cache
    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/enrollments/my-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCourses(coursesRes.data);
        setEnrolledCourses(enrolledRes.data);
        localStorage.setItem("allCourses", JSON.stringify(coursesRes.data));
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledRes.data));
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleClick = (type, courseId) => {
    setActionType(type);
    setSelectedCourseId(courseId);
    setShowForm({ type, courseId });
    setFormData({ name: "", email: "" });
    setError("");
  };

  // New function to handle Back button click
  const handleBack = () => {
    setShowForm(null);
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (actionType === "enroll") {
        // Enroll is POST
        res = await axios.post(
          `${BASE_URL}/api/enrollments/enroll`,
          {
            courseId: selectedCourseId,
            name: formData.name,
            email: formData.email,
          },
          {
            headers: { Authorization: `Bearer ${user?.token || token}` },
          }
        );
      } else {
        // Unenroll is DELETE with payload in data
        res = await axios.delete(
          `${BASE_URL}/api/enrollments/unenroll/${selectedCourseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { name: formData.name, email: formData.email },
          }
        );
      }

      // Removed submit success log for production

      if (actionType === "enroll") {
        const enrolledCourse = courses.find((c) => c._id === selectedCourseId);
        if (enrolledCourse) {
          setEnrolledCourses((prev) => [...prev, { course: enrolledCourse }]);
        }
      } else {
        setEnrolledCourses((prev) =>
          prev.filter((enroll) => enroll.course?._id !== selectedCourseId)
        );
      }

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setShowForm(null);
      }, 3000);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      console.error("Submit error:", error?.response?.data || error.message);
      setError(errMsg);
    }
  };

  const isCourseEnrolled = (courseId) =>
    enrolledCourses.some((enroll) => enroll.course?._id === courseId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>

      {showForm ? (
        <form
          onSubmit={handleFormSubmit}
          className="bg-gray-100 p-6 rounded-xl shadow max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {showForm.type} Form
          </h2>

          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full mb-4 p-2 rounded border"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full mb-4 p-2 rounded border"
            required
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-500">Back</button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-400">Submit</button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full flex justify-center items-center min-h-[200px]">
              <p className="text-lg font-semibold text-blue-600 animate-bounce">Loading courses...</p>
            </div>
          ) : (
            courses.map((course) => {
              const isEnrolled = isCourseEnrolled(course._id);
              return (
                <div key={course._id}
                  className="cursor-pointer p-6 border rounded-2xl shadow-md bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <h2 className="text-xl font-semibold text-blue-700 mb-2">{course.title}</h2>
                  <p className="mb-4 text-gray-600">
                    {course.description || "No description"}
                  </p>
                  <button
                    onClick={() =>
                      handleClick(
                        isEnrolled ? "unenroll" : "enroll",
                        course._id
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-white ${
                      isEnrolled
                        ? "bg-red-600 hover:bg-red-400"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
              alt="Success"
              className="w-16 h-16 mb-4 animate-bounce"
            />
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              {actionType === "enroll"
                ? "Enrolled Successfully!"
                : "Unenrolled Successfully!"}
            </h3>
            <p className="text-gray-700">This message will close shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourses;

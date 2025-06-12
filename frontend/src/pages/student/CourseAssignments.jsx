import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const CourseAssignments = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    file: null,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // Try to load from cache
    const cacheKey = `assignments_${courseId}`;
    const cachedAssignments = localStorage.getItem(cacheKey);
    if (cachedAssignments) {
      setAssignments(JSON.parse(cachedAssignments));
      setLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      try {
        // Use the submissions API that includes the submitted flag
        const res = await axios.get(
          `${BASE_URL}/api/submissions/course/${courseId}/assignments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssignments(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      } catch (error) {
        console.error("Error fetching assignments:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Normalize today's date (00:00:00)
  const today = normalizeDate(new Date());

  // Filter assignments:
  // Upcoming: dueDate >= today AND not submitted
  // Pending: dueDate < today AND not submitted
  // Completed: submitted === true
  const upcomingAssignments = assignments.filter((a) => {
    const due = normalizeDate(a.dueDate);
    return due >= today && !a.submitted;
  });

  const pendingAssignments = assignments.filter((a) => {
    const due = normalizeDate(a.dueDate);
    return due < today && !a.submitted;
  });

  const completedAssignments = assignments.filter((a) => a.submitted);

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowForm(true);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      file: null,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert("Please select a file.");
      return;
    }

    const submissionForm = new FormData();
    submissionForm.append("name", formData.name);
    submissionForm.append("email", formData.email);
    submissionForm.append("file", formData.file);

    try {
      await axios.post(
        `${BASE_URL}/api/submissions/submit/${selectedAssignment._id}`,
        submissionForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optimistically update the assignment's submitted status
      setAssignments((prevAssignments) =>
        prevAssignments.map((a) =>
          a._id === selectedAssignment._id ? { ...a, submitted: true } : a
        )
      );

      setSubmitted(true);
      setShowForm(false);

      setTimeout(() => {
        setSubmitted(false);
        fetchAssignments();
      }, 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    }
  };

  if (loading) return <div className="p-6">Loading assignments...</div>;

  return (
    <div className="p-6 relative max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Assignments for Course
        </h1>
        <button
          className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition duration-200"
          onClick={() => navigate("/student-dashboard/assignments")}
          aria-label="Back to courses">Back
        </button>
      </div>

      {/* Upcoming & Pending Assignments */}
      {[
        {
          title: "Upcoming Assignments",
          data: upcomingAssignments,
          color: "blue",
        },
        {
          title: "Pending Assignments",
          data: pendingAssignments,
          color: "yellow",
        },
      ].map((section, idx) => (
        <section key={idx} className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-4 text-${section.color}-700`}
          >
            {section.title}
          </h2>
          {section.data.length === 0 ? (
            <p className="italic text-gray-600">
              No {section.title.toLowerCase()}.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {section.data.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {a.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {a.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {normalizeDate(a.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`px-4 py-1 text-sm rounded-md text-white ${
                            section.title === "Pending Assignments"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                          onClick={() => handleSubmitClick(a)}
                          disabled={section.title === "Pending Assignments"}
                          aria-disabled={
                            section.title === "Pending Assignments"
                          }
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      {/* Completed Assignments */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          Completed Assignments
        </h2>
        {completedAssignments.length === 0 ? (
          <p className="italic text-gray-600">No completed assignments.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {completedAssignments.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {a.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {a.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {normalizeDate(a.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/student-dashboard/assignment/${a._id}`)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-sm rounded-md transition"
                      >
                        Show More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Submission Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submitAssignmentTitle"
        >
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2
              id="submitAssignmentTitle"
              className="text-lg font-semibold mb-4"
            >
              Submit Assignment
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label htmlFor="nameInput" className="block mb-1 font-medium">
                  Name
                </label>
                <input
                  id="nameInput"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  autoComplete="name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="emailInput" className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  autoComplete="email"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="fileInput" className="block mb-1 font-medium">
                  Upload File
                </label>
                <input
                  id="fileInput"
                  type="file"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  className="w-full"
                  accept=".pdf,.doc,.docx,.txt,.zip"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submitted success animation */}
      {submitted && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-white p-8 rounded shadow-lg flex flex-col items-center">
            <CheckCircle2 className="text-green-600" size={64} />
            <p className="mt-4 text-lg font-semibold text-green-700">
              Submitted successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignments;

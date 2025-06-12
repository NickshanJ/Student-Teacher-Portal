import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

const Submissions = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [ungradedByCourse, setUngradedByCourse] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingUngraded, setLoadingUngraded] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch courses taught by teacher
  useEffect(() => {
    const cachedCourses = localStorage.getItem("teacherCourses");
    if (cachedCourses) {
      setCourses(JSON.parse(cachedCourses));
      setLoadingCourses(false);
    } else {
      fetchCourses();
    }
  }, [token]);

  useEffect(() => {
    fetchAllSubmissions();
  }, [token]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/mycourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
      localStorage.setItem("teacherCourses", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching courses", error);
    }
    setLoadingCourses(false);
  };

  const fetchAllSubmissions = async () => {
    setLoadingUngraded(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/submissions/teacher/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllSubmissions(response.data.submissions);
      localStorage.setItem("teacherAllSubmissions", JSON.stringify(response.data.submissions));
      // Filter ungraded submissions
      const ungraded = response.data.submissions.filter(
        (sub) => sub.grade === null
      );
      // Group by course title
      const grouped = {};
      ungraded.forEach((sub) => {
        const courseTitle =
          sub.assignment.course.title || sub.assignment.course;
        const courseId = sub.assignment.course._id || sub.assignment.course;
        if (!grouped[courseId]) {
          grouped[courseId] = {
            title: courseTitle,
            submissions: [],
          };
        }
        grouped[courseId].submissions.push(sub);
      });
      setUngradedByCourse(grouped);
    } catch (error) {
      console.error("Error fetching all submissions", error);
    }
    setLoadingUngraded(false);
  };

  // Fetch assignments when course selected
  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    setSelectedAssignment(null);
    setSubmissions([]);
    setLoadingAssignments(true);
    const cacheKey = `teacherAssignments_${course._id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAssignments(JSON.parse(cached));
      setLoadingAssignments(false);
    } else {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/assignments/${course._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssignments(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching assignments", error);
      }
      setLoadingAssignments(false);
    }
  };

  // Fetch submissions when assignment selected
  const handleAssignmentClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    const cacheKey = `teacherSubmissions_${assignment._id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setSubmissions(JSON.parse(cached));
      setLoadingSubmissions(false);
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/submissions/assignment/${assignment._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(response.data);
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching submissions", error);
    }
    setLoadingSubmissions(false);
  };

  // Open grading modal for a submission
  const openGradingModal = (submissionId) => {
    setGradingSubmissionId(submissionId);
    setGrade("");
    setFeedback("");
    setShowModal(true);
  };

  const closeGradingModal = () => {
    setShowModal(false);
    setGradingSubmissionId(null);
  };

  // Submit grade & feedback API call
  const handleGradeSubmit = async () => {
    if (grade === "") {
      alert("Please enter a grade");
      return;
    }
    try {
      await axios.put(
        `${BASE_URL}/api/submissions/grade/${gradingSubmissionId}`,
        { grade, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh submissions for selected assignment
      if (selectedAssignment) {
        const response = await axios.get(
          `${BASE_URL}/api/submissions/assignment/${selectedAssignment._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissions(response.data);
      }

      // Also refresh all submissions for pending grading reminders
      const responseAll = await axios.get(
        `${BASE_URL}/api/submissions/teacher/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllSubmissions(responseAll.data.submissions);
      const ungraded = responseAll.data.submissions.filter(
        (sub) => sub.grade === null
      );
      const grouped = {};
      ungraded.forEach((sub) => {
        const courseTitle =
          sub.assignment.course.title || sub.assignment.course;
        const courseId = sub.assignment.course._id || sub.assignment.course;
        if (!grouped[courseId]) {
          grouped[courseId] = {
            title: courseTitle,
            submissions: [],
          };
        }
        grouped[courseId].submissions.push(sub);
      });
      setUngradedByCourse(grouped);

      closeGradingModal();
    } catch (error) {
      console.error("Error grading submission", error);
    }
  };

  return (
    <div className="p-6">
      {/* Step 1: Course Selection */}
      {!selectedCourse && (
        <>
          <h2 className="text-3xl font-bold mb-4">Your Course</h2>
          {loadingCourses ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <p className="text-gray-600">No courses found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer bg-white"
                  onClick={() => handleCourseClick(course)}
                >
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Pending Grading Reminders Section */}
      {!selectedCourse && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-red-600 mt-6">Pending Grading Reminders</h2>
          {loadingUngraded ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : Object.keys(ungradedByCourse).length === 0 ? (
            <p className="mb-6">No submissions pending grading.</p>
          ) : (
            <div className="p-6 rounded-xl border border-gray-200 cursor-pointer bg-red-50">
              {Object.entries(ungradedByCourse).map(
                ([courseId, courseData]) => (
                  <div key={courseId}>
                    {courseData.submissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex justify-between items-center shadow hover:shadow-lg transition-all bg-white p-3 rounded mb-2">
                        <div>
                          <p className="font-semibold">Assignment: {sub.assignment.title}</p>
                          <p className="mb-1">Student: {sub.student.name} ({sub.student.email})</p>
                          <a
                            href={`${BASE_URL}/${sub.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white px-4 py-1 bg-blue-600 text-sm rounded hover:bg-blue-500">
                            View Submission
                          </a>
                        </div>
                        <button
                          onClick={() => openGradingModal(sub._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Grade
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Step 2: Assignment Selection */}
      {selectedCourse && !selectedAssignment && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-4">
            Assignments for: {selectedCourse.title}
          </h2>
          <button
            className="mb-4 text-white bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
            onClick={() => {
              setSelectedCourse(null);
              setAssignments([]);
            }}>Back to Courses
          </button>
          </div>
          {loadingAssignments ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-gray-600">No assignments found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="p-6 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer bg-white"
                  onClick={() => handleAssignmentClick(assignment)} 
                >
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-gray-600">
                    {assignment.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Step 3 & 4: Submissions View + Grading */}
      {selectedAssignment && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-4">
            Submissions for: {selectedAssignment.title}
          </h2>
          <button
            className="mb-4 text-white bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
            onClick={() => {
              setSelectedAssignment(null);
              setSubmissions([]);
            }}>Back to Assignments
          </button>
          </div>
          {loadingSubmissions ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {submission.student.name} ({submission.student.email})
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Submitted: {" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      <a
                        href={`${BASE_URL}/${submission.file}`}
                        className="text-white px-4 py-1 bg-blue-600 text-sm rounded hover:bg-blue-500"
                        target="_blank"
                        rel="noopener noreferrer">
                        View Submission
                      </a>
                    </div>
                    <div>
                      {submission.grade !== undefined &&
                      submission.grade !== null ? (
                        <div className="text-green-600 font-semibold">
                          Graded: {submission.grade}/100
                          <p className="text-sm text-gray-500">Feedback: {submission.feedback}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => openGradingModal(submission._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Grade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Grading Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Grade Submission</h3>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Grade (0-100)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border px-3 py-2 mb-3 rounded"/>
            <textarea
              placeholder="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border px-3 py-2 mb-4 rounded"
              rows={3}/>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeGradingModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel
              </button>
              <button
                onClick={handleGradeSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
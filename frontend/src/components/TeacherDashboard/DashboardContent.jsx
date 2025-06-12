// src/components/TeacherDashboard/DashboardContent.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardContent = () => {
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [receivedSubmissions, setReceivedSubmissions] = useState(0);
  const [ungradedSubmissions, setUngradedSubmissions] = useState(0);
  const [notSubmitted, setNotSubmitted] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const cachedStats = localStorage.getItem("teacherDashboardStats");
      const cachedRecent = localStorage.getItem("teacherDashboardRecentSubmissions");
      const cachedUpcoming = localStorage.getItem("teacherDashboardUpcomingAssignments");
      if (cachedStats && cachedRecent && cachedUpcoming) {
        const stats = JSON.parse(cachedStats);
        setTotalCourses(stats.totalCourses);
        setTotalAssignments(stats.totalAssignments);
        setReceivedSubmissions(stats.receivedSubmissions);
        setUngradedSubmissions(stats.ungradedSubmissions);
        setNotSubmitted(stats.notSubmitted);
        setRecentSubmissions(JSON.parse(cachedRecent));
        setUpcomingAssignments(JSON.parse(cachedUpcoming));
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) return;
      const courseRes = await axios.get(`${BASE_URL}/api/courses/mycourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalCourses(courseRes.data.length);
      const assignmentRes = await axios.get(
        `${BASE_URL}/api/assignments/teacher-assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const assignments = Array.isArray(assignmentRes.data.assignments)
        ? assignmentRes.data.assignments
        : [];
      setTotalAssignments(assignments.length);
      const submissionRes = await axios.get(
        `${BASE_URL}/api/submissions/teacher/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const submissions = Array.isArray(submissionRes.data.submissions)
        ? submissionRes.data.submissions
        : [];
      setReceivedSubmissions(submissions.length);
      const ungraded = submissions.filter(
        (submission) => !submission.grade && submission.grade !== 0
      );
      setUngradedSubmissions(ungraded.length);
      const notSubmittedCount = assignments.length - submissions.length;
      setNotSubmitted(notSubmittedCount < 0 ? 0 : notSubmittedCount);
      const sortedRecent = submissions
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
      setRecentSubmissions(sortedRecent);
      const upcoming = assignments
        .filter((a) => new Date(a.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);
      setUpcomingAssignments(upcoming);
      localStorage.setItem(
        "teacherDashboardStats",
        JSON.stringify({
          totalCourses: courseRes.data.length,
          totalAssignments: assignments.length,
          receivedSubmissions: submissions.length,
          ungradedSubmissions: ungraded.length,
          notSubmitted: notSubmittedCount < 0 ? 0 : notSubmittedCount,
        })
      );
      localStorage.setItem("teacherDashboardRecentSubmissions", JSON.stringify(sortedRecent));
      localStorage.setItem("teacherDashboardUpcomingAssignments", JSON.stringify(upcoming));
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    { title: "Total Courses", value: totalCourses },
    { title: "Total Assignments", value: totalAssignments },
    { title: "Submissions Received", value: receivedSubmissions },
    { title: "Ungraded Submissions", value: ungradedSubmissions },
  ];

  const chartData = {
    labels: ["Submitted", "Not Submitted", "Ungraded"],
    datasets: [
      {
        label: "Submission Status",
        data: [receivedSubmissions, notSubmitted, ungradedSubmissions],
        backgroundColor: ["#4ade80", "#f87171", "#facc15"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats cards on top */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <h2 className="text-lg font-semibold text-gray-600">
                  {stat.title}
                </h2>
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Upcoming assignments and Bar Chart side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Upcoming Assignment Deadlines
              </h2>
              {upcomingAssignments.length === 0 ? (
                <p className="text-gray-600">No upcoming assignments.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingAssignments.map((assignment) => (
                    <li
                      key={assignment._id}
                      className="p-4 bg-gray-100 rounded-xl flex justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.02] shadow-md">
                      <span>{assignment.title}</span>
                      <span className="text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bar Chart */}
            <div
              className="bg-white p-6 rounded-2xl shadow-md"
              style={{ height: "280px" }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-1">
                  Submission Status
                </h2>
                <p className="text-gray-600 mb-4">
                  Total Assignments:{" "}
                  <span className="font-bold">{totalAssignments}</span>
                </p>
              </div>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Student Submissions - full width */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Recent Student Submissions
            </h2>
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-600">No recent submissions.</p>
            ) : (
              <ul className="space-y-2">
                {recentSubmissions.map((submission) => (
                  <li key={submission._id} className="p-4 bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] shadow-md">
                    <p className="font-medium">
                      {submission.student.name} submitted “
                      {submission.assignment.title}”
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardContent;
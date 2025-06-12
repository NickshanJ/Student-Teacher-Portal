import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import CourseProgressBar from "./CourseProgressBar"; // Import from student folder

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardContent = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [date, setDate] = useState(new Date());
  const [assignmentStats, setAssignmentStats] = useState({ pending: 0, completed: 0 });
  const [allAssignments, setAllAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!user || !token) {
        navigate("/login");
        return;
      }

      let enrolledResData;
      // Try to load from cache
      const cachedCourses = localStorage.getItem("allCourses");
      const cachedEnrolled = localStorage.getItem("enrolledCourses");
      if (cachedCourses && cachedEnrolled) {
        setCourses(JSON.parse(cachedCourses));
        setEnrolled(JSON.parse(cachedEnrolled));
        enrolledResData = JSON.parse(cachedEnrolled);
      } else {
        try {
          // Fetch courses and enrolled courses in parallel
          const [allCoursesRes, enrolledRes] = await Promise.all([
            axios.get(`${BASE_URL}/api/courses`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${BASE_URL}/api/enrollments/my-courses`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setCourses(allCoursesRes.data);
          setEnrolled(enrolledRes.data);
          localStorage.setItem("allCourses", JSON.stringify(allCoursesRes.data));
          localStorage.setItem("enrolledCourses", JSON.stringify(enrolledRes.data));
          enrolledResData = enrolledRes.data;
        } catch (err) {
          if (err.response && err.response.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
        }
      }

      // Fetch all submissions of this student
      const submissionsRes = await axios.get(`${BASE_URL}/api/submissions/my-submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const submissionsData = submissionsRes.data;
      setSubmissions(submissionsData);

      // Fetch assignments for all enrolled courses
      let allAssignmentsData = [];
      if (enrolledResData && Array.isArray(enrolledResData)) {
        for (const enrollment of enrolledResData) {
          const courseId = enrollment.course._id;
          const assignmentsRes = await axios.get(`${BASE_URL}/api/assignments/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allAssignmentsData = allAssignmentsData.concat(assignmentsRes.data);
        }
      }
      setAllAssignments(allAssignmentsData);

      // Calculate completed and pending assignments
      let completedCount = 0;
      let pendingCount = 0;

      allAssignmentsData.forEach((assignment) => {
        const submission = submissionsData.find(
          (sub) => sub.assignment._id === assignment._id
        );
        if (submission && submission.grade !== null) {
          completedCount++;
        } else {
          pendingCount++;
        }
      });
      setAssignmentStats({ pending: pendingCount, completed: completedCount });
    };
    fetchData();
  }, [navigate]);

  // Bar chart data for dashboard stats
  const barData = {
    labels: ['Total Courses', 'Enrolled', 'Assignment Pending', 'Assignment Completed'], // keep labels for bars
    datasets: [
      {
        label: 'Count',
        data: [
          courses.length || 0,
          enrolled.length || 0,
          assignmentStats.pending,
          assignmentStats.completed,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // blue-500
          'rgba(34, 197, 94, 0.7)',  // green-500
          'rgba(234, 179, 8, 0.7)',  // yellow-500
          'rgba(168, 85, 247, 0.7)', // purple-500
        ],
        borderRadius: 8,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Dashboard Overview', color: '#7c3aed', font: { size: 20, weight: 'bold' } },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Custom tooltip titles for each bar
            const titles = ['Total Courses', 'Enrolled', 'Assignment Pending', 'Assignment Completed'];
            return titles[context[0].dataIndex];
          }
        }
      }
    },
    scales: {
      x: {
        display: true, // Show x-axis labels so bars are visible
        ticks: { color: '#7c3aed', font: { weight: 'bold' } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { color: '#7c3aed', font: { weight: 'bold' } },
      },
    },
  };

  return (
    <div className="relative min-h-[700px] p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-2xl transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <h2 className="text-lg font-semibold text-center">Total Courses</h2>
          <p className="text-3xl text-center">{courses.length || 0}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-2xl transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <h2 className="text-lg font-semibold text-center">Enrolled</h2>
          <p className="text-3xl text-center">{enrolled.length || 0}</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-2xl transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <h2 className="text-lg font-semibold text-center">Assignment Pending</h2>
          <p className="text-3xl text-center">{assignmentStats.pending}</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-2xl transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <h2 className="text-lg font-semibold text-center">Assignment Completed</h2>
          <p className="text-3xl text-center">{assignmentStats.completed}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-6 mt-8">
        {/* Left Side: Enrolled Courses */}
        <div className="w-full md:w-[44%] bg-white rounded-2xl p-6 transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <h3 className="text-xl font-bold mb-4 text-purple-700">Your Enrolled Courses</h3>
          {Array.isArray(enrolled) && enrolled.length > 0 ? (
            <ul className="space-y-2">
              {enrolled.map((enrollment) => (
                <li key={enrollment._id}
                  className="p-3 bg-gray-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] shadow">
                  {enrollment.course?.title || "Untitled Course"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses enrolled yet.</p>
          )}
        </div>
        {/* Right Side: Bar Chart */}
        <div className="w-full md:w-[56%] bg-white rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]">
          <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-1 text-center">Dashboard Overview</h2>
            <Bar
              data={{
                ...barData,
                labels: ['', '', '', ''], // Remove x-axis labels under bars
              }}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  title: { display: false },
                  legend: { display: false },
                },
                indexAxis: 'x', // vertical bar chart
                aspectRatio: 1.5,
                maintainAspectRatio: true,
                scales: {
                  ...barOptions.scales,
                  x: {
                    ...barOptions.scales.x,
                    ticks: { display: false }, // Hide x-axis ticks/labels
                  },
                },
              }}
              height={260}
            />
          </div>
        </div>
      </div>

      {/* Course Progress Overview Section */}
      <div className="mt-10 w-full">
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">
            Course Progress Overview
          </h3>
          {Array.isArray(enrolled) && enrolled.length > 0 ? (
            <ul className="space-y-4 w-full">
              {enrolled.map((enrollment) => (
                <li key={enrollment._id} className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:gap-6 md:justify-between shadow w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <span className="font-semibold text-gray-700 mb-2 md:mb-0 md:w-1/3 truncate">{enrollment.course?.title || "Untitled Course"}</span>
                  <div className="w-full md:w-1/2 max-w-md">
                    <CourseProgressBar courseId={enrollment.course?._id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No enrolled courses to show progress for.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
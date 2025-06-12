import { Link, Outlet, useLocation } from "react-router-dom";

const StudentDashboard = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 fixed top-0 left-0 h-full bg-gray-800 text-white p-6 flex flex-col justify-between shadow-2xl z-20">
        {/* Top menu */}
        <div>
          <h2 className="text-xl font-bold mb-8">Student Dashboard</h2>
          <ul className="space-y-5 font-bold">
            <li>
              <Link
                to="/student-dashboard"
                className={`block px-3 py-2 rounded transition ${
                  isActive("/student-dashboard")
                    ? "bg-gray-700 text-blue-400 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/student-dashboard/course-enrollment"
                className={`block px-3 py-2 rounded transition ${
                  isActive("/student-dashboard/course-enrollment")
                    ? "bg-gray-700 text-blue-400 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                Course Enrollment
              </Link>
            </li>
            <li>
              <Link
                to="/student-dashboard/classes"
                className={`block px-3 py-2 rounded transition ${
                  isActive("/student-dashboard/classes")
                    ? "bg-gray-700 text-blue-400 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                Classes
              </Link>
            </li>
            <li>
              <Link
                to="/student-dashboard/assignments"
                className={`block px-3 py-2 rounded transition ${
                  isActive("/student-dashboard/assignments")
                    ? "bg-gray-700 text-blue-400 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                Assignments
              </Link>
            </li>
            <li>
              <Link
                to="/student-dashboard/messages"
                className={`block px-3 py-2 rounded transition ${
                  isActive("/student-dashboard/messages")
                    ? "bg-gray-700 text-blue-400 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                Messages
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom section: Profile and Logout - stacked */}
        <ul className="space-y-5 font-bold">
          <li>
            <Link
              to="/student-dashboard/profile"
              className={`block px-3 py-2 rounded transition text-blue-400 ${
                isActive("/student-dashboard/profile")
                  ? "bg-gray-700 font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-400 font-bold transition"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="ml-64 w-full overflow-y-auto bg-gray-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

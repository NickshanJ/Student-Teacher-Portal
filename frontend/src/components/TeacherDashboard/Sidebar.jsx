import React from "react";

const Sidebar = ({ onSectionChange, active }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "courses", label: "My Courses" },
    { id: "course-content", label: "Course Content" },
    { id: "create-assignment", label: "Assignment" },
    { id: "submissions", label: "Submissions & Grading" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: <span className="text-blue-300">Profile</span> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6">Teacher Panel</h2>
        <ul>
          {menuItems.slice(0, -1).map((item) => (
            <li
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`cursor-pointer px-3 py-2 rounded mb-2 ${
                active === item.id ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <ul className="mb-0">
        <li
          onClick={() => onSectionChange("profile")}
          className={`cursor-pointer px-3 py-2 rounded mb-2 ${
            active === "profile"
              ? "bg-gray-700 text-blue-300"
              : "hover:bg-gray-700 text-blue-300"
          }`}
        >
          Profile
        </li>
        <li
          onClick={handleLogout}
          className="cursor-pointer px-3 py-2 rounded mb-2 hover:bg-gray-700 text-red-400"
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
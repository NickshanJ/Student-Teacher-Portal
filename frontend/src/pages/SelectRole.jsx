import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SelectRole() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && Array.isArray(user.roles)) {
      setRoles(user.roles);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    if (role === "student") navigate("/student-dashboard");
    else if (role === "teacher") navigate("/teacher-dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
    else navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Select Your Role</h2>
        <div className="flex flex-col gap-4 w-64">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold text-lg hover:bg-purple-800 transition"
            >
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectRole;

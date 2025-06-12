import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");

      setTimeout(() => {
        if (Array.isArray(user.roles)) {
          if (user.roles.length === 1) {
            if (user.roles[0] === "student") navigate("/student-dashboard");
            else if (user.roles[0] === "teacher") navigate("/teacher-dashboard");
            else if (user.roles[0] === "admin") navigate("/admin-dashboard");
            else navigate("/login");
          } else {
            // Multi-role: prompt user to select role
            localStorage.setItem("pendingRoleSelection", "true");
            navigate("/select-role");
          }
        } else {
          // fallback for old user.role string
          if (user.role === "student") navigate("/student-dashboard");
          else if (user.role === "teacher") navigate("/teacher-dashboard");
          else if (user.role === "admin") navigate("/admin-dashboard");
          else navigate("/login");
        }
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side Image/Message */}
        <div className="hidden md:flex md:w-1/2 bg-blue-700 items-center justify-center relative">
          <img
            src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80"
            alt="Education"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-blue-800 bg-opacity-60 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome Back!
            </h1>
            <p className="text-base text-blue-100 max-w-xs text-center">
              Access your courses, connect with your teachers, and keep learning.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center px-8 py-12 bg-gray-800">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-purple-300 mb-2 text-center">
              Login to Your Account
            </h2>
            <p className="text-purple-200 text-center mb-8">
              Student & Teacher Portal
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-purple-200 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
              </div>

              <div className="flex justify-between text-sm text-purple-300">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot Password?
                </Link>
                <Link to="/register" className="hover:underline">
                  Register here!
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition font-semibold shadow-md"
              >
                Login
              </button>
            </form>

            {message && (
              <div className="mt-4 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/success.json";
import { BASE_URL } from "../config";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/users/reset-password/${token}`, {
        password,
      });

      setShowModal(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      {!showModal ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl mb-6 text-center text-blue-700 font-bold">
            Reset Password
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
          >
            Reset Password
          </button>
        </form>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-xl flex flex-col items-center shadow-2xl max-w-sm w-full">
            <Lottie
              animationData={successAnimation}
              style={{ width: 180, height: 180 }}
            />
            <h2 className="text-2xl font-semibold mt-4 text-green-600">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mt-2 text-center">
              You’ll be redirected to login shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;

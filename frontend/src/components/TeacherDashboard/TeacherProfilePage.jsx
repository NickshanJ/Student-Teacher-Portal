import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from '../../config';

const TeacherProfilePage = () => {
  const [image, setImage] = useState(null);
  const [courseCount, setCourseCount] = useState(0);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/profile/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const filename = res.data.profileImage;
      setImage(filename);
      localStorage.setItem("profileImage", filename);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const fetchCourseCount = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/courses/mycourses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCourseCount(res.data.length);
    } catch (error) {
      console.error("Failed to fetch teacher's courses", error);
    }
  };

  useEffect(() => {
    fetchCourseCount();
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setImage(savedImage);
    }
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-gray-100 mb-6">My Profile</h1>
      <div className="flex flex-col items-center bg-white shadow-xl rounded-2xl p-8">
        <div className="relative">
          <img
            src={
              image
                ? `${BASE_URL}/uploads/${image}`
                : "/default-avatar.png"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover cursor-pointer border-4 border-gray-300 hover:opacity-90 transition"
            onClick={handleImageClick}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>
        <div className="mt-6 text-left w-full max-w-sm space-y-3 text-gray-800">
          <p className="text-lg">
            <span className="font-semibold">Name:</span> {user?.name}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          <p className="text-lg capitalize">
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Courses Created:</span> {courseCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;

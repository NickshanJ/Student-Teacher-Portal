import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

const AdminDashboard = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Robust token extraction (try 'token', 'user', or 'userInfo')
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user'));
    token = user?.token;
  }
  if (!token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    token = userInfo?.token;
  }

  const fetchPendingTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BASE_URL}/api/admin/pending-teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingTeachers(res.data);
    } catch (error) {
      setError('Failed to fetch pending teachers.');
    } finally {
      setLoading(false);
    }
  };

  const approveTeacher = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/approve/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      setError('Failed to approve teacher.');
    }
  };

  // Decline teacher
  const declineTeacher = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/decline/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      setError('Failed to decline teacher.');
    }
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch students.');
    }
  };

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      setError('Failed to fetch teachers.');
    }
  };

  // Promote teacher to admin
  const promoteTeacher = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/promote/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      setError('Failed to promote teacher.');
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Unauthorized: Please login as admin.');
      return;
    }
    fetchPendingTeachers();
    fetchStudents();
    fetchTeachers();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-100 via-white to-purple-200">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-800 text-white min-h-screen py-8 px-4 shadow-lg">
        <div className="mb-10 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-wide">Admin</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2 rounded-lg transition font-semibold shadow bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none ${activeTab === 'dashboard' ? 'text-blue-400 font-bold' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full text-left px-4 py-2 rounded-lg transition font-semibold shadow bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none ${activeTab === 'students' ? 'text-blue-400 font-bold' : ''}`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`w-full text-left px-4 py-2 rounded-lg transition font-semibold shadow bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none ${activeTab === 'teachers' ? 'text-blue-400 font-bold' : ''}`}
          >
            Teachers
          </button>
        </nav>
        <div className="flex-1" />
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 bg-transparent hover:bg-gray-700 text-red-400 rounded-lg font-semibold shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          style={{ marginTop: 'auto' }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1' />
          </svg>
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-2 md:px-8">
        <div className="w-full bg-white/90 rounded-2xl shadow-lg p-8 border border-purple-200">
          <h1 className="text-3xl font-bold mb-6 text-purple-700 text-center">Admin Dashboard</h1>

          {/* NAV TABS CONTENT */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="flex justify-start w-full mb-8">
                <div className="flex gap-6 w-1/2">
                  <div className="flex-1 bg-blue-500 text-white p-6 rounded-2xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    <h2 className="text-lg font-semibold text-center">Total Students</h2>
                    <p className="text-3xl text-center">{students.length}</p>
                  </div>
                  <div className="flex-1 bg-purple-500 text-white p-6 rounded-2xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    <h2 className="text-lg font-semibold text-center">Total Teachers</h2>
                    <p className="text-3xl text-center">{teachers.length}</p>
                  </div>
                </div>
              </div>

              {/* Pending Teacher Requests Section */}
              <h2 className="text-xl font-bold text-purple-700 mb-4 mt-2">Teachers Pending Request</h2>

              {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center border border-red-200">{error}</div>
              )}
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : pendingTeachers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No pending teachers</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher._id} className="flex items-center justify-between bg-white border border-purple-200 rounded-2xl px-6 py-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-purple-900">{teacher.name}</div>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveTeacher(teacher._id)}
                          className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:from-green-500 hover:to-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => declineTeacher(teacher._id)}
                          className="bg-gradient-to-r from-red-400 to-red-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:from-red-500 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'students' && (
            <>
              <h2 className="text-2xl font-bold text-purple-700 mb-6">All Students</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.map((student) => (
                  <div key={student._id} className="bg-purple-100 text-gray-900 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    <div className="mb-2">
                      <span className="font-semibold">Name:</span> {student.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Email:</span> {student.email}
                    </div>
                    <div>
                      <span className="font-semibold">Enrolled Courses:</span> {student.enrolledCount}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'teachers' && (
            <>
              <h2 className="text-2xl font-bold text-purple-700 mb-6">All Teachers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => (
                  <div key={teacher._id} className="bg-purple-100 text-gray-900 rounded-2xl p-6 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="mb-2 font-semibold text-lg text-purple-900 flex items-center gap-2">
                        <span className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </span>
                        {teacher.name}
                      </div>
                      <div className="mb-2 text-gray-700">
                        <span className="font-semibold">Email:</span> {teacher.email}
                      </div>
                      <div>
                        <span className="font-semibold">Courses:</span> {teacher.courseCount}
                      </div>
                    </div>
                    <button
                      onClick={() => promoteTeacher(teacher._id)}
                      className="bg-gradient-to-r from-blue-400 to-purple-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:from-blue-500 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Make Admin
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
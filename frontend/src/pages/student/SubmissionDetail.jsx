import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';

const SubmissionDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // Try to load from cache
    const cacheKey = `submission_${assignmentId}`;
    const cachedSubmission = localStorage.getItem(cacheKey);
    setLoading(true);
    if (cachedSubmission) {
      setSubmission(JSON.parse(cachedSubmission));
      setLoading(false);
      return;
    }

    const fetchSubmission = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/submissions/submit/${assignmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmission(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to fetch submission:', err);
        setError('No submission found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId, navigate]);

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <p className="text-lg font-semibold text-blue-600 animate-bounce">Loading submission details...</p>
    </div>
  );
  if (!submission) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-sky-50 to-blue-100 shadow-2xl rounded-3xl border border-blue-200">
      
      {/* Header with title left and back button right */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          📄 Assignment Submission
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="px-8 py-2 bg-blue-600 font-bold text-white rounded-lg shadow hover:bg-blue-700 transition"> Back
        </button>
      </div>

      {/* Submission Details Grid */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-blue-900">
        <div className="font-semibold text-lg">📘 Assignment Title:</div>
        <div>{submission.assignment.title}</div>

        <div className="font-semibold text-lg">🗓 Due Date:</div>
        <div>{new Date(submission.assignment.dueDate).toLocaleDateString()}</div>

        <div className="font-semibold text-lg">👤 Student Name:</div>
        <div>{submission.student.name}</div>

        <div className="font-semibold text-lg">📧 Student Email:</div>
        <div>{submission.student.email}</div>

        <div className="font-semibold text-lg">✅ Grade:</div>
        <div className="text-green-700 font-semibold">
          {submission.grade != null ? `${submission.grade} / 100` : 'Not graded yet'}
        </div>

        <div className="font-semibold text-lg">📝 Feedback:</div>
        <div>{submission.feedback ?? 'No feedback yet'}</div>

        {submission.file && (
          <>
            <div className="font-semibold text-lg">📎 Submitted File:</div>
            <div>
              <a
                href={`${BASE_URL}/${submission.file.replace(/\\/g, '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                View File
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;
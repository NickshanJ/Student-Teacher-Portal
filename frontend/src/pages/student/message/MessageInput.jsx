import React, { useState, useRef } from "react";
import { BASE_URL } from "../../../config";

const MessageInput = ({
  token,
  studentId,
  teacherId,
  courseId,
  onMessageSent,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          senderId: studentId,
          receiverId: teacherId,
          message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      setMessage(""); // Clear text immediately
      textareaRef.current?.focus(); // Focus back
      setSuccess(true);
      if (onMessageSent) onMessageSent(data);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-gray-300 bg-gray-50 p-4 flex flex-col">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && (
        <p className="text-green-600 mb-2">Message sent successfully!</p>
      )}
      <textarea
        ref={textareaRef}
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="w-full p-3 rounded-lg border border-gray-300 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${
            sending
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

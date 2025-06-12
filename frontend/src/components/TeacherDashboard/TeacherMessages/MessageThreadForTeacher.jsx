import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../../config";
import axios from "axios";

const MessageThreadForTeacher = ({ token, teacherId, studentId, courseId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState(teacherId || "");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Set teacherId from prop or localStorage
    if (!teacherId) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const realTeacherId = storedUser?._id || storedUser?.id;
      if (realTeacherId) setCurrentTeacherId(realTeacherId);
    } else {
      setCurrentTeacherId(teacherId);
    }
  }, [teacherId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!courseId || !studentId) return;
      setLoading(true);
      try {
        // Fetch messages from the correct API
        const res = await axios.get(
          `${BASE_URL}/api/messages/conversations/${studentId}/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check if messages are found
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages([]); // No messages found
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]); // Handle error by clearing the message list
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentTeacherId, studentId, courseId, token]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          senderId: currentTeacherId,
          receiverId: studentId,
          message: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        const result = await res.json();
        const newMsg = result.data;
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      } else {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col border rounded-lg h-[450px] shadow-sm bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-lg mb-3 text-gray-800">
          Conversation
        </h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages found for this conversation.
          </p>
        ) : (
          <div>
            {messages.map((msg, index) => {
              return (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    String(msg.sender?._id) === String(currentTeacherId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      String(msg.sender?._id) === String(currentTeacherId)
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  >
                    <p className="text-sm text-gray-800">{msg.message}</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">
                      {formatTimestamp(msg.sentAt || msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          placeholder="Type your reply..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageThreadForTeacher;

import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../../config";

const MessageThread = ({
  token,
  studentId,
  selectedCourseId,
  selectedTeacherId,
}) => {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch threads
  useEffect(() => {
    if (!studentId || !selectedCourseId) return;

    const fetchThreads = async () => {
      setLoadingThreads(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/messages/threads/${studentId}/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setThreads(data);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    };

    fetchThreads();
  }, [studentId, selectedCourseId, token]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedCourseId || !selectedTeacherId) return;

    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/conversation/${selectedTeacherId}/${selectedCourseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedThread, selectedTeacherId, selectedCourseId, token]);

  // Send message
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
          receiverId: selectedTeacherId,
          courseId: selectedCourseId,
          message: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(); // refresh messages
      } else {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row border rounded-lg h-[450px] shadow-sm bg-white">
      {/* Left: Threads */}
      <div className="md:w-1/3 w-full border-b md:border-b-0 md:border-r p-4 overflow-y-auto">
        <h4 className="font-semibold text-lg mb-3 text-gray-800">Threads</h4>
        {loadingThreads ? (
          <p className="text-sm text-gray-500">Loading threads...</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-gray-500">No threads found.</p>
        ) : (
          threads.map((thread, index) => (
            <div
              key={index}
              onClick={() => setSelectedThread(thread)}
              className={`p-3 rounded cursor-pointer mb-2 transition-colors duration-200 ${
                selectedThread === thread
                  ? "bg-blue-100"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <strong className="block text-gray-700">
                {thread.title || "Untitled Thread"}
              </strong>
              <span className="text-xs text-gray-500">
                {formatTimestamp(thread.createdAt || thread.lastMessageAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Right: Messages */}
      <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden">
        <div className="overflow-y-auto pr-2 mb-2">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">
            Conversation
          </h4>
          {loadingMessages ? (
            <p className="text-sm text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              No messages found for this conversation.
            </p>
          ) : (
            <div>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    msg.sender?._id === studentId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      msg.sender?._id === studentId
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
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t pt-3 flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const Chat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(
    [] as { id: string; message: string }[]
  );
  const [notifications, setNotifications] = useState([] as string[]);
  const [activeUsers, setActiveUsers] = useState([] as string[]);

  useEffect(() => {
    const chatSocket = io("http://localhost:3000/");
    setSocket(chatSocket);

    chatSocket.on("connect", () => {
      console.log("Connected UserId:", chatSocket.id);
    });

    chatSocket.on("receive-msg", ({ id, message }) => {
      setMessages((prev) => [...prev, { id, message }]);
    });

    chatSocket.on("user-joined", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    chatSocket.on("user-left", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    chatSocket.on("active-users", (users) => {
      setActiveUsers(users);
    });

    return () => {
      chatSocket.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket && message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Real-Time Chat App</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Active Users */}
        <div style={{ flex: "1", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Active Users</h2>
          <ul>
            {activeUsers.map((user) => (
              <li key={user} style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    height: "10px",
                    width: "10px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></span>
                {user}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Section */}
        <div style={{ flex: "2", border: "1px solid #ccc", padding: "10px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2>Messages</h2>
            <ul style={{ listStyleType: "none", padding: "0" }}>
              {messages.map((msg, index) => (
                <li
                  key={index}
                  style={{
                    background: "#f1f1f1",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    textAlign: msg.id === socket?.id ? "right" : "left",
                  }}
                >
                  <strong>{msg.id}:</strong> {msg.message}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type a message..."
              style={{
                padding: "10px",
                width: "300px",
                marginRight: "10px",
              }}
            />
            <button type="submit" style={{ padding: "10px" }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

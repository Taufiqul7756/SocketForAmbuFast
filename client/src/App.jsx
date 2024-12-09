import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [notifications, setNotifications] = useState([]); // Stores join/leave notifications

  useEffect(() => {
    const chatSocket = io("http://localhost:3000/");
    setSocket(chatSocket);

    // Handle connection
    chatSocket.on("connect", () => {
      console.log("Connected UserId:", chatSocket.id);
    });

    // Listen for new messages
    chatSocket.on("receive-msg", ({ id, message }) => {
      setMessages((prev) => [...prev, { id, message }]);
    });

    // Listen for user join notifications
    chatSocket.on("user-joined", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    // Listen for user leave notifications
    chatSocket.on("user-left", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    return () => {
      chatSocket.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket && message.trim()) {
      socket.emit("message", message); // Emit the message to the server
      setMessage(""); // Clear the input field
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Real-Time Chat App </h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Notifications</h2>
        <ul>
          {notifications.map((note, index) => (
            <li key={index} style={{ color: "blue" }}>
              {note}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
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
  );
};

export default App;

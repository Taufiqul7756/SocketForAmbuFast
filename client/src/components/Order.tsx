import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Initialize the socket connection type
let socket: Socket | null = null;

const Order = () => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [orders, setOrders] = useState(
    [] as { id: string; location: string }[]
  );
  const [driverId, setDriverId] = useState<string>("");

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:3000");

    // Handle connection & setup driverId
    socket.on("connect", () => {
      setDriverId(socket?.id || "");
      console.log("Connected with id: ", socket?.id);
    });

    // Handle active users (drivers currently connected)
    socket.on("active-users", (users: string[]) => {
      setActiveUsers(users);
    });

    // Handle order request notifications
    socket.on("new-order", (order: { id: string; location: string }) => {
      setOrders((prevOrders) => {
        // Avoid duplicates in the order list
        return prevOrders.some((o) => o.id === order.id)
          ? prevOrders
          : [...prevOrders, order];
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleAcceptOrder = (orderId: string) => {
    if (socket) {
      console.log("Accepting Order:", orderId);
      socket.emit("accept-order", { orderId });
      // Remove it from the visible list
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Ambulance Driver Orders</h1>
      <p>Connected Driver ID: {driverId}</p>
      <h2>Available Orders</h2>
      {orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <li key={order.id} style={{ marginBottom: "10px" }}>
              <span>Request at: {order.location}</span>
              <button
                onClick={() => handleAcceptOrder(order.id)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Accept Order
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No new requests currently.</p>
      )}
      <h2>Active Users</h2>
      <ul>
        {activeUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default Order;

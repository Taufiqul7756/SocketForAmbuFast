import { useEffect, useState } from "react";
import socket from "./socket";

const DriverOrders = () => {
  const [orderRequests, setOrderRequests] = useState([]);
  const [acceptedOrderId, setAcceptedOrderId] = useState(null);

  useEffect(() => {
    // Notify server about driver's role
    socket.emit("set-role", { role: "driver" });

    // Listen for new orders via server
    socket.on("new-order", (order) => {
      if (!acceptedOrderId) {
        // Only show new orders if no order is accepted
        console.log("New order received: ", order);

        // Avoid duplicate entries
        if (!orderRequests.find((o) => o.id === order.id)) {
          setOrderRequests((prevOrders) => [...prevOrders, order]);
        }
      }
    });

    // Listen for hidden orders
    socket.on("order-hidden", ({ orderId }) => {
      setOrderRequests((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    });

    // Cleanup socket events on component unmount
    return () => {
      socket.off("new-order");
      socket.off("order-hidden");
    };
  }, [orderRequests, acceptedOrderId]);

  const handleAcceptOrder = (orderId) => {
    console.log(`Accepting order ${orderId}`);
    socket.emit("accept-order", { orderId });
    setAcceptedOrderId(orderId); // Set accepted order
    setOrderRequests([]); // Clear all requests from UI
  };

  const handleRejectOrder = (orderId) => {
    console.log(`Rejecting order ${orderId}`);
    socket.emit("reject-order", { orderId });
    setOrderRequests((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  return (
    <div>
      <h2>Driver Panel - Active Orders</h2>
      {acceptedOrderId ? (
        <p>Order {acceptedOrderId} accepted. No other requests visible.</p>
      ) : orderRequests.length === 0 ? (
        <p>No new requests currently.</p>
      ) : (
        orderRequests.map((order) => (
          <div key={order.id} style={{ margin: "10px 0" }}>
            <p>Order ID: {order.id}</p>
            <p>Location: {order.location}</p>
            <button onClick={() => handleAcceptOrder(order.id)}>Accept</button>
            <button onClick={() => handleRejectOrder(order.id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default DriverOrders;

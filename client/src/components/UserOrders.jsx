import { useState } from "react";
import socket from "./socket";

const UserOrders = () => {
  const [orderLocation, setOrderLocation] = useState("");

  const sendOrderRequest = () => {
    if (orderLocation.trim() !== "") {
      const newOrder = {
        id: Date.now().toString(),
        location: orderLocation,
      };

      console.log("Sending order request: ", newOrder);

      // Emit event for new order
      socket.emit("new-order", newOrder);
      setOrderLocation("");
      alert("Order request sent to drivers!");
    } else {
      alert("Please input a location.");
    }
  };

  return (
    <div>
      <h2>User Panel - Send Order Requests</h2>
      <input
        type="text"
        value={orderLocation}
        onChange={(e) => setOrderLocation(e.target.value)}
        placeholder="Enter Pickup Location"
      />
      <button onClick={sendOrderRequest}>Send Request</button>
    </div>
  );
};

export default UserOrders;

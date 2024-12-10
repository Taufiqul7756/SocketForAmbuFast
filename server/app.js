import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Active users and order state management
const activeUsers = new Set();
let activeOrders = {}; // { orderId: { id, location, driverId } }
let driverOrderMap = {}; // { driverId: orderId }

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Handle socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  activeUsers.add(socket.id);

  // Notify about active users
  io.emit("active-users", Array.from(activeUsers));

  // Send available orders to the newly connected driver
  const availableOrders = Object.values(activeOrders).filter(
    (order) => !order.driverId
  );
  socket.emit("available-orders", availableOrders);

  // Handle new order notifications
  socket.on("new-order", (order) => {
    if (!activeOrders[order.id]) {
      console.log(`Active order: ${order.id}`);
      activeOrders[order.id] = {
        id: order.id,
        location: order.location,
        driverId: null,
      };
      io.emit("new-order", { id: order.id, location: order.location }); // Notify all drivers
    } else {
      console.log("Order already exists.");
    }
  });

  // Handle order acceptance
  socket.on("accept-order", ({ orderId }) => {
    const order = activeOrders[orderId];
    if (order && !order.driverId && !driverOrderMap[socket.id]) {
      console.log(`Order accepted by ${socket.id}`);
      order.driverId = socket.id; // Assign driver to the order
      driverOrderMap[socket.id] = orderId; // Map driver to the order

      // Notify the driver about success
      socket.emit("order-accepted", { orderId });

      // Notify all drivers to hide this order
      io.emit("order-hidden", { orderId });

      // Remove the order from the visible pool
      delete activeOrders[orderId];
    } else if (driverOrderMap[socket.id]) {
      socket.emit("order-unavailable", {
        reason: "You already accepted an order.",
      });
    } else {
      console.log(
        `Driver ${socket.id} tried to accept order ${orderId}, but it's already accepted.`
      );
      socket.emit("order-unavailable", {
        reason: "Another driver has already accepted this order.",
      });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers.delete(socket.id);

    // Handle cleanup if the driver had an accepted order
    const acceptedOrderId = driverOrderMap[socket.id];
    if (acceptedOrderId) {
      console.log(
        `Driver ${socket.id} disconnected. Reverting order ${acceptedOrderId}.`
      );
      delete driverOrderMap[socket.id];
      activeOrders[acceptedOrderId] = {
        ...activeOrders[acceptedOrderId],
        driverId: null,
      };
      io.emit("order-reavailable", { orderId: acceptedOrderId });
    }

    // Notify about the disconnection
    io.emit("active-users", Array.from(activeUsers));
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

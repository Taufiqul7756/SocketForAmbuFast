import { io } from "socket.io-client";

// Establish the connection to the server
const socket = io("http://localhost:3000");

export default socket;

import { useState } from "react";
import UserOrders from "./components/UserOrders";
import DriverOrders from "./components/DriverOrders";

function App() {
  const [role, setRole] = useState("user");

  return (
    <div>
      <h1>Ambulance Order Service</h1>
      <div>
        <button onClick={() => setRole("user")}>User Panel</button>
        <button onClick={() => setRole("driver")}>Driver Panel</button>
      </div>
      {role === "user" ? <UserOrders /> : <DriverOrders />}
    </div>
  );
}

export default App;

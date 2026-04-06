import { useState } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { initialBins } from "./data/initialBins.js";
import { resetCriticalAlertGuard } from "./utils/criticalAlertGuard.js";

const shell = {
  minHeight: "100vh",
  fontFamily: 'system-ui, "Segoe UI", sans-serif',
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div style={shell}>
      {!loggedIn ? (
        <Login
          onSuccess={() => {
            resetCriticalAlertGuard();
            setLoggedIn(true);
          }}
        />
      ) : (
        <Dashboard initialBins={initialBins} />
      )}
    </div>
  );
}

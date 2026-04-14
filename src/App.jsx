import { useState } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { initialBins } from "./data/initialBins.js";
import { resetCriticalAlertGuard } from "./utils/criticalAlertGuard.js";

const shell = {
  minHeight: "100vh",
  fontFamily: 'system-ui, "Segoe UI", sans-serif',
  background: "radial-gradient(circle at top left, #4d7cff55 0%, transparent 30%), radial-gradient(circle at bottom right, #6ff1c755 0%, transparent 25%), #08101f",
  color: "#f4f7ff",
  padding: 0,
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const getPrediction = async (bin) => {
    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fill: bin.fill,
          time: 2,
        }),
      });

      if (!res.ok) {
        throw new Error(`Prediction request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data?.predicted_fill == null) {
        throw new Error("Prediction response missing predicted_fill");
      }

      return data.predicted_fill;
    } catch (error) {
      console.error("Prediction error", error);
      throw error;
    }
  };
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
        <Dashboard initialBins={initialBins} getPrediction={getPrediction} />
      )}
    </div>
  );
}

import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { initialBins } from "./data/initialBins.js";
import { apiUrl } from "./config/api.js";

export default function App() {
  const getPrediction = async (bin) => {
    const res = await fetch(apiUrl("/predict"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fill: bin.fill,
        temperature: bin.temperature,
        gas: bin.gas,
        area: bin.area,
        time: 2,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData?.message || `Prediction request failed: ${res.status} ${res.statusText}`;
      throw new Error(message);
    }

    const data = await res.json();
    if (data?.predicted_fill == null) {
      throw new Error("Prediction response missing predicted_fill");
    }

    return data.predicted_fill;
  };

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard/*" element={<Dashboard initialBins={initialBins} getPrediction={getPrediction} />} />
    </Routes>
  );
}

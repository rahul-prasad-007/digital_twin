import { useEffect, useState } from "react";
import BinChart from "./BinChart.jsx";
import WasteMap from "./WasteMap.jsx";
import { countStats } from "../utils/binHelpers.js";
import { optimizePickupRoute } from "../utils/routeHelpers.js";
import { municipalDepots } from "../data/municipalDepots.js";
import { criticalAlertGuard } from "../utils/criticalAlertGuard.js";

const titleStyle = { textAlign: "center" };

const statsBar = {
  padding: 10,
  background: "#f4f4f4",
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
};

const routeBar = {
  margin: "16px 0",
  padding: 16,
  background: "#faf5ff",
  borderRadius: 18,
  border: "1px solid rgba(146, 96, 255, 0.18)",
  color: "#4b2f90",
};

const routeButton = {
  border: "none",
  background: "linear-gradient(135deg, #8457ff, #c292ff)",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 16,
  cursor: "pointer",
  fontWeight: 700,
};

export default function Dashboard({ initialBins }) {
  const [bins, setBins] = useState(() =>
    initialBins.map((b) => ({ ...b }))
  );
  const [routeData, setRouteData] = useState({ bins: [], coordinates: [], distance: 0, warning: "" });
  const [routeMessage, setRouteMessage] = useState(
    "Optimize pickup for full or critical bins using the map route."
  );
  const [isRouting, setIsRouting] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(municipalDepots[0]);

  useEffect(() => {
    if (criticalAlertGuard.initialFullBinAlertsDone) return;
    criticalAlertGuard.initialFullBinAlertsDone = true;
    initialBins.forEach((bin) => {
      if (bin.fill === 100) {
        alert(`CRITICAL ALERT: ${bin.name} is full!`);
      }
    });
  }, [initialBins]);

  useEffect(() => {
    const id = setInterval(() => {
      setBins((prev) =>
        prev.map((bin) => ({
          ...bin,
          fill: Math.min(100, bin.fill + Math.floor(Math.random() * 10)),
        }))
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const { total, full, critical } = countStats(bins);

  async function handleOptimizeRoute() {
    const routeTargets = bins.filter((bin) => bin.fill >= 80);
    if (routeTargets.length === 0) {
      setRouteData({ bins: [], coordinates: [], distance: 0, warning: "" });
      setRouteMessage("No full or critical bins need pickup right now.");
      return;
    }

    setIsRouting(true);
    setRouteMessage("Computing best road route using actual roads...");

    const result = await optimizePickupRoute(routeTargets, selectedDepot);
    setIsRouting(false);

    if (!result.bins.length) {
      setRouteData({ bins: [], coordinates: [], distance: 0, warning: result.warning });
      setRouteMessage(result.warning || "Unable to compute a road route at this time.");
      return;
    }

    setRouteData(result);
    const names = result.bins.map((bin) => bin.name).join(" → ");
    const distanceKm = (result.distance / 1000).toFixed(1);
    setRouteMessage(
      `Road route optimized for ${result.bins.length} bin(s) (${distanceKm} km) from ${selectedDepot.name}: ${names}` +
        (result.warning ? ` ${result.warning}` : "")
    );
  }

  function clearRoute() {
    setRouteData({ bins: [], coordinates: [], distance: 0, warning: "" });
    setRouteMessage("Route cleared. Optimize again to recompute pickup order.");
  }

  return (
    <div>
      <h2 style={titleStyle}>IoT Waste Monitoring - Meghalaya</h2>
      <div style={statsBar}>
        <span>
          <b>Total Bins:</b> {total} | <b>Full Bins:</b> {full} | <b>Critical:</b> {critical}
        </span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedDepot.name}
            onChange={(e) => {
              const depot = municipalDepots.find((d) => d.name === e.target.value);
              setSelectedDepot(depot);
            }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          >
            {municipalDepots.map((depot) => (
              <option key={depot.name} value={depot.name}>
                {depot.name} ({depot.region})
              </option>
            ))}
          </select>
          <button style={routeButton} onClick={handleOptimizeRoute} disabled={isRouting}>
            {isRouting ? "Optimizing…" : "Optimize Route"}
          </button>
          <button style={{ ...routeButton, background: "#d9c3ff", color: "#441f93" }} onClick={clearRoute}>
            Clear Route
          </button>
        </div>
      </div>
      <div style={routeBar}>{routeMessage}</div>
      <BinChart bins={bins} />
      <WasteMap bins={bins} routeData={routeData} depots={municipalDepots} selectedDepot={selectedDepot} />
    </div>
  );
}

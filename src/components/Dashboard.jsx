import { useEffect, useState, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import BinChart from "./BinChart.jsx";
import WasteMap from "./WasteMap.jsx";
import NotificationPanel from "./NotificationPanel.jsx";
import ScenarioPlanner from "./ScenarioPlanner.jsx";
import { countStats, getOverflowRisk } from "../utils/binHelpers.js";
import { optimizePickupRoute } from "../utils/routeHelpers.js";
import { municipalDepots } from "../data/municipalDepots.js";
import { criticalAlertGuard } from "../utils/criticalAlertGuard.js";
import { getCurrentTimeOfDay, sortBinsBySmartPriority, getSchedulingInsights } from "../utils/schedulingHelpers.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const titleStyle = {
  margin: 0,
  fontSize: "clamp(2rem, 3vw, 3.4rem)",
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
};

const pageContainer = {
  maxWidth: 1380,
  margin: "0 auto",
  padding: "16px 12px 24px",
  display: "grid",
  gap: 16,
  background: "linear-gradient(135deg, #0a0f1c 0%, #1a1f35 50%, #0a0f1c 100%)",
  minHeight: "100vh",
};

const heroCard = {
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(108, 92, 231, 0.05) 100%)",
  border: "1px solid rgba(108, 92, 231, 0.3)",
  boxShadow: "0 20px 60px rgba(108, 92, 231, 0.15)",
  backdropFilter: "blur(20px)",
  position: "relative",
};

const heroInner = {
  padding: "24px 28px",
  display: "grid",
  gap: 12,
};

const heroSubtitle = {
  maxWidth: 620,
  color: "rgba(243, 246, 255, 0.75)",
  fontSize: "1rem",
  lineHeight: 1.8,
};

const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginTop: 16,
};

const statCard = {
  padding: "16px 18px",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(108, 92, 231, 0.2)",
  },
};

const statLabel = {
  color: "rgba(255, 255, 255, 0.62)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: 12,
  marginBottom: 8,
};

const statValue = {
  fontSize: "2rem",
  fontWeight: 800,
  margin: 0,
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "2.4fr 1fr",
  gap: 16,
  alignItems: "start",
};

const largeCard = {
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
  overflow: "hidden",
  transition: "all 0.3s ease",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  background: "linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(108, 92, 231, 0.05) 100%)",
};

const cardTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
};

const cardContent = {
  padding: "16px 20px 20px",
  display: "grid",
  gap: 12,
};

const insightsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const insightCard = {
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
  overflow: "hidden",
  transition: "all 0.3s ease",
};

const insightHeader = {
  padding: "14px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(108, 92, 231, 0.03) 100%)",
};

const insightTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const insightBody = {
  padding: "14px 18px 18px",
};

const statBadge = {
  padding: "10px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.06)",
  color: "#f4f7ff",
  fontSize: 13,
  fontWeight: 700,
};

const controlRow = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "1fr auto auto",
  alignItems: "center",
};

const selectStyle = {
  width: "100%",
  minWidth: 0,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#fff",
  fontSize: 14,
};

const routeButton = {
  border: "none",
  background: "linear-gradient(135deg, #84d2ff, #7a5bff)",
  color: "#07112c",
  padding: "14px 20px",
  borderRadius: 18,
  cursor: "pointer",
  fontWeight: 700,
  transition: "transform 0.18s ease",
};

const clearButton = {
  ...routeButton,
  background: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.14)",
};

const routeBar = {
  margin: "0",
  padding: 16,
  background: "rgba(13, 19, 37, 0.88)",
  borderRadius: 22,
  border: "1px solid rgba(255, 255, 255, 0.08)",
  color: "rgba(237, 242, 255, 0.82)",
};

const truckSelect = {
  width: "100%",
  minWidth: 0,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#fff",
  fontSize: 14,
};

const binList = {
  display: "grid",
  gap: 14,
  margin: 0,
  padding: 0,
};

const binCard = {
  display: "grid",
  gap: 14,
  padding: "18px 20px",
  borderRadius: 20,
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const binRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const binName = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
};

const binMeta = {
  margin: 0,
  color: "rgba(255, 255, 255, 0.68)",
  fontSize: 13,
};

const progressBarBackground = {
  height: 12,
  borderRadius: 999,
  background: "rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
};

const progressBarFill = (value) => ({
  width: `${value}%`,
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #74d0ff, #8a5bff)",
});

const predictButton = {
  border: "none",
  background: "#46d6ff",
  color: "#081220",
  padding: "12px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 700,
};

// Environmental Impact Calculation Utilities
const calculateEnvironmentalImpact = (optimizedDistance, binCount) => {
  // Baseline: assume random collection would be 30% less efficient
  const baselineDistance = optimizedDistance * 1.3;
  const distanceSaved = baselineDistance - optimizedDistance;

  // Fuel consumption: ~8L per 100km for waste collection truck
  const fuelConsumptionPerKm = 0.08; // liters per km
  const fuelSaved = distanceSaved * fuelConsumptionPerKm;

  // CO2 emissions: ~2.3 kg CO2 per liter of diesel
  const co2PerLiter = 2.3; // kg CO2 per liter
  const co2Reduced = fuelSaved * co2PerLiter;

  return {
    distanceSaved: Math.round(distanceSaved * 10) / 10,
    fuelSaved: Math.round(fuelSaved * 10) / 10,
    co2Reduced: Math.round(co2Reduced * 10) / 10,
    baselineDistance: Math.round(baselineDistance * 10) / 10
  };
};

const formatImpactNumber = (value, unit) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${unit}`;
  }
  return `${value.toFixed(1)} ${unit}`;
};

export default function Dashboard({ initialBins, getPrediction }) {
  const trucks = [
    { id: "T1", name: "Truck A" },
    { id: "T2", name: "Truck B" },
    { id: "T3", name: "Truck C" },
  ];

  const [assignMenuBin, setAssignMenuBin] = useState(null);
  const [bins, setBins] = useState(() =>
    initialBins.map((b) => ({
      ...b,
      assigned: false,
      assignedTruck: null,
      assignedTruckId: null,
      highFillCount: b.fill >= 85 ? 1 : 0,
      hotspot: b.fill >= 95,
      fillHistory: [b.fill],
      isOnline: true,
      lastSeen: new Date(),
      offlineCount: 0,
    }))
  );
  const [routeData, setRouteData] = useState({ bins: [], coordinates: [], distance: 0, warning: "" });
  const [routeMessage, setRouteMessage] = useState(
    "Smart scheduling active: Route optimization considers time of day and area priorities."
  );
  const [isRouting, setIsRouting] = useState(false);
  const [isAutoRouting, setIsAutoRouting] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(municipalDepots[0]);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [environmentalImpact, setEnvironmentalImpact] = useState({
    totalDistanceSaved: 15.7, // Start with some sample data
    totalFuelSaved: 1.3,
    totalCO2Reduced: 3.0,
    routesOptimized: 3,
    lastRouteDistance: 0,
    baselineDistance: 0,
    autoRoutesTriggered: 0,
    selfHealingEvents: 0,
  });
  const [citizenReports, setCitizenReports] = useState([]);
  const [reportingLocation, setReportingLocation] = useState(null);
  const [selectedReplayMode, setSelectedReplayMode] = useState("current");
  const [weather, setWeather] = useState("sunny"); // Options: sunny, cloudy, rain, thunderstorm
  const [activeScenario, setActiveScenario] = useState(null);
  const [historicalBins] = useState(() => ({
    morning: initialBins.map((b) => ({
      ...b,
      fill: Math.max(5, b.fill - 10 - Math.floor(Math.random() * 10)),
      temperature: Math.max(18, b.temperature - 2),
      gas: Math.max(10, b.gas - 6),
      lastCollected: "06:30 AM",
      assigned: false,
      assignedTruck: null,
      assignedTruckId: null,
      highFillCount: b.fill >= 85 ? 1 : 0,
      hotspot: b.fill >= 95,
      fillHistory: [Math.max(5, b.fill - 10 - Math.floor(Math.random() * 10))],
      isOnline: Math.random() > 0.1, // 90% online in morning
      lastSeen: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      offlineCount: Math.random() > 0.1 ? 0 : Math.floor(Math.random() * 3),
    })),
    evening: initialBins.map((b) => ({
      ...b,
      fill: Math.min(100, b.fill + 12 + Math.floor(Math.random() * 10)),
      temperature: b.temperature + 3,
      gas: Math.min(100, b.gas + 7),
      lastCollected: "07:00 PM",
      assigned: false,
      assignedTruck: null,
      assignedTruckId: null,
      highFillCount: b.fill >= 85 ? 1 : 0,
      hotspot: b.fill >= 95,
      fillHistory: [Math.min(100, b.fill + 12 + Math.floor(Math.random() * 10))],
      isOnline: Math.random() > 0.15, // 85% online in evening
      lastSeen: new Date(Date.now() - Math.random() * 7200000), // Within last 2 hours
      offlineCount: Math.random() > 0.15 ? 0 : Math.floor(Math.random() * 5),
    })),
  }));
  const activeBins = selectedReplayMode === "current"
    ? (activeScenario ? activeScenario.result.modifiedBins : bins)
    : historicalBins[selectedReplayMode];

  useEffect(() => {
    if (criticalAlertGuard.initialFullBinAlertsDone) return;
    criticalAlertGuard.initialFullBinAlertsDone = true;
    initialBins.forEach((bin) => {
      if (bin.fill === 100) {
        addNotification(`${bin.name} is critical and needs immediate pickup!`, "critical");
      }
    });
  }, [initialBins]);

  useEffect(() => {
    const id = setInterval(() => {
      setBins((prev) =>
        prev.map((bin) => {
          // Skip updates for offline bins
          if (!bin.isOnline) {
            return bin;
          }

          // Weather-based fill rate modifier
          let baseIncrement = Math.floor(Math.random() * 10);
          let weatherMultiplier = 1;

          if (weather === "rain") {
            weatherMultiplier = 1.5; // 50% increase during rain
            baseIncrement += Math.floor(Math.random() * 5); // Additional randomness
          } else if (weather === "thunderstorm") {
            weatherMultiplier = 2.0; // 100% increase during thunderstorm
            baseIncrement += Math.floor(Math.random() * 8);
          } else if (weather === "cloudy") {
            weatherMultiplier = 1.2; // 20% increase when cloudy
          }

          const nextFill = Math.min(100, bin.fill + Math.floor(baseIncrement * weatherMultiplier));
          const nextHighFillCount = bin.highFillCount + (nextFill >= 85 ? 1 : 0);
          const nextHotspot = nextHighFillCount >= 3 || nextFill === 100;
          const nextHistory = [...bin.fillHistory, nextFill].slice(-4);

          return {
            ...bin,
            fill: nextFill,
            highFillCount: nextHighFillCount,
            hotspot: nextHotspot,
            fillHistory: nextHistory,
          };
        })
      );
    }, 5000);
    return () => clearInterval(id);
  }, [weather]);

  useEffect(() => {
    const timeId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timeId);
  }, []);

  useEffect(() => {
    const weatherId = setInterval(() => {
      const conditions = ["sunny", "cloudy", "rain", "thunderstorm"];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      setWeather(randomCondition);
      if (randomCondition !== "sunny") {
        addNotification(`🌦️ Weather changed to ${randomCondition} - increased overflow risk!`, "info");
      }
    }, 30000); // Change weather every 30 seconds for demo
    return () => clearInterval(weatherId);
  }, []);

  // Network failure simulation
  useEffect(() => {
    const networkId = setInterval(() => {
      setBins((prevBins) =>
        prevBins.map((bin) => {
          // Randomly make bins go offline (2% chance per interval)
          if (bin.isOnline && Math.random() < 0.02) {
            addNotification(`📡 ${bin.name} went offline - network connectivity lost!`, "warning");
            return {
              ...bin,
              isOnline: false,
              lastSeen: new Date(),
              offlineCount: bin.offlineCount + 1,
            };
          }

          // Randomly bring offline bins back online (15% chance per interval)
          if (!bin.isOnline && Math.random() < 0.15) {
            const offlineDuration = Date.now() - bin.lastSeen.getTime();
            const wasOfflineLong = offlineDuration > 300000; // 5 minutes
            if (wasOfflineLong) {
              addNotification(`📡 ${bin.name} back online after ${Math.round(offlineDuration / 60000)} minutes!`, "success");
            }
            return {
              ...bin,
              isOnline: true,
              lastSeen: new Date(),
            };
          }

          // Update lastSeen for online bins
          if (bin.isOnline) {
            return {
              ...bin,
              lastSeen: new Date(),
            };
          }

          return bin;
        })
      );
    }, 15000); // Check network status every 15 seconds
    return () => clearInterval(networkId);
  }, []);

  // Auto route recalculation when bins become critical
  const lastBinStatesRef = useRef({});
  const lastAutoRouteTimeRef = useRef(0);

  useEffect(() => {
    const currentBinStates = {};
    activeBins.forEach(bin => {
      currentBinStates[bin.id] = bin.fill;
    });

    // Check for bins that just became full (reached 100%)
    const newlyFullBins = activeBins.filter(bin => {
      const wasFull = lastBinStatesRef.current[bin.id] === 100;
      const isNowFull = bin.fill === 100;
      return !wasFull && isNowFull;
    });

    // Auto-recalculate route if any bin just became full and it's been at least 30 seconds since last auto-route
    if (newlyFullBins.length > 0 && Date.now() - lastAutoRouteTimeRef.current > 30000) {
      lastAutoRouteTimeRef.current = Date.now();
      setIsAutoRouting(true);

      // Trigger auto route recalculation
      handleOptimizeRoute().then(() => {
        const binNames = newlyFullBins.map(bin => bin.name).join(", ");
        addNotification(`🚨 Auto-route updated: ${binNames} reached critical level!`, "critical");
        setRouteMessage(`🚨 EMERGENCY: Route recalculated due to ${binNames} reaching 100% capacity!`);

        // Update auto routes counter
        setEnvironmentalImpact(prev => ({
          ...prev,
          autoRoutesTriggered: prev.autoRoutesTriggered + 1,
        }));

        setIsAutoRouting(false);
      }).catch(error => {
        console.warn("Auto route recalculation failed:", error);
        setIsAutoRouting(false);
      });
    }

    // Update last states
    lastBinStatesRef.current = currentBinStates;
  }, [activeBins, selectedDepot]); // Depend on activeBins and selectedDepot

  // Self-healing system: Monitor current route and reroute when bins go offline
  const lastRouteBinStatesRef = useRef({});
  const lastSelfHealTimeRef = useRef(0);
  const [isSelfHealing, setIsSelfHealing] = useState(false);

  useEffect(() => {
    if (!routeData.bins || routeData.bins.length === 0) return;

    const currentRouteBinStates = {};
    routeData.bins.forEach(bin => {
      currentRouteBinStates[bin.id] = bin.isOnline;
    });

    // Check for route bins that just went offline
    const newlyOfflineRouteBins = routeData.bins.filter(bin => {
      const wasOnline = lastRouteBinStatesRef.current[bin.id] !== false;
      const isNowOffline = !bin.isOnline;
      return wasOnline && isNowOffline;
    });

    // Self-heal: Reroute immediately if any bin in current route goes offline (5-second cooldown)
    if (newlyOfflineRouteBins.length > 0 && Date.now() - lastSelfHealTimeRef.current > 5000) {
      lastSelfHealTimeRef.current = Date.now();
      setIsSelfHealing(true);

      // Get alternative bins that could replace the offline ones
      const offlineBinIds = newlyOfflineRouteBins.map(bin => bin.id);
      const alternativeBins = activeBins
        .filter(bin => bin.isOnline && !routeData.bins.some(routeBin => routeBin.id === bin.id))
        .sort((a, b) => b.fill - a.fill) // Prioritize fuller bins
        .slice(0, newlyOfflineRouteBins.length);

      // Trigger self-healing route recalculation
      handleOptimizeRoute().then(() => {
        const binNames = newlyOfflineRouteBins.map(bin => bin.name).join(", ");
        const alternativeNames = alternativeBins.map(bin => bin.name).join(", ");

        addNotification(`🔄 Self-healing: Route rerouted around ${binNames} (offline)!`, "info");

        if (alternativeBins.length > 0) {
          setRouteMessage(`🔄 SELF-HEALING: Route automatically optimized! Replaced ${binNames} with ${alternativeNames} for maximum efficiency.`);
        } else {
          setRouteMessage(`🔄 SELF-HEALING: Route automatically rerouted to avoid ${binNames} which went offline!`);
        }

        // Update self-healing counter
        setEnvironmentalImpact(prev => ({
          ...prev,
          autoRoutesTriggered: prev.autoRoutesTriggered + 1,
          selfHealingEvents: prev.selfHealingEvents + 1,
        }));

        setIsSelfHealing(false);
      }).catch(error => {
        console.warn("Self-healing route recalculation failed:", error);
        setIsSelfHealing(false);
      });
    }

    // Update last route bin states
    lastRouteBinStatesRef.current = currentRouteBinStates;
  }, [routeData.bins, activeBins, selectedDepot]); // Depend on route bins, activeBins, and selectedDepot

  const { total, full, critical } = countStats(activeBins);
  const offlineCount = activeBins.filter(bin => !bin.isOnline).length;

  const wastedToday = activeBins.reduce((sum, bin) => sum + bin.fill * 0.12, 0);
  const pickupCount = activeBins.filter((bin) => bin.assigned).length;
  const avgTemp = Math.round(activeBins.reduce((sum, bin) => sum + bin.temperature, 0) / activeBins.length);

  const timeOfDay = getCurrentTimeOfDay();
  const schedulingInsights = getSchedulingInsights(activeBins, timeOfDay);
  const hotspotBins = activeBins.filter((bin) => bin.hotspot);
  const hotspotNames = hotspotBins.map((bin) => bin.name).join(", ");
  const overflowRiskBins = activeBins
    .map((bin) => ({ ...bin, overflowRisk: getOverflowRisk(bin) }))
    .filter((bin) => bin.overflowRisk && bin.overflowRisk.hours <= 4);
  const overflowWarning = overflowRiskBins.length
    ? `${overflowRiskBins[0].name} likely to overflow in ${overflowRiskBins[0].overflowRisk.hours}h`
    : null;

  const trendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Average Fill (%)",
        data: [54, 60, 65, 72, 76, 81, Math.round(activeBins.reduce((sum, bin) => sum + bin.fill, 0) / activeBins.length)],
        borderColor: "rgba(132, 210, 255, 0.95)",
        backgroundColor: "rgba(132, 210, 255, 0.28)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.08)" }, ticks: { color: "#e8f1ff" } },
      y: { beginAtZero: true, max: 100, grid: { color: "rgba(255,255,255,0.08)" }, ticks: { color: "#e8f1ff" } },
    },
  };

  const areaComparisonData = {
    labels: ["North", "South", "East", "West"],
    datasets: [
      {
        label: "Average Fill (%)",
        data: [72, 81, 64, 78],
        backgroundColor: ["#5b9bff", "#7ff3a4", "#ffb86c", "#d37bff"],
        borderRadius: 12,
      },
    ],
  };

  const areaOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true, max: 100, grid: { color: "rgba(255,255,255,0.08)" }, ticks: { color: "#e8f1ff" } },
      y: { ticks: { color: "#e8f1ff" }, grid: { display: false } },
    },
  };

  async function handleOptimizeRoute() {
    // Use smart scheduling to prioritize bins based on time of day
    const onlineBins = activeBins.filter(bin => bin.isOnline);
    const prioritizedBins = sortBinsBySmartPriority(onlineBins, timeOfDay);
    const routeTargets = prioritizedBins.slice(0, 6); // Take top 6 priority bins

    if (routeTargets.length === 0) {
      const offlineCount = activeBins.filter(bin => !bin.isOnline).length;
      setRouteData({ bins: [], coordinates: [], distance: 0, warning: "" });
      setRouteMessage(offlineCount > 0
        ? `No online bins need pickup right now. ${offlineCount} bin(s) are currently offline.`
        : "No bins need pickup right now based on smart scheduling."
      );
      return;
    }

    setIsRouting(true);
    setRouteMessage(`Computing smart route for ${timeOfDay} priorities (${schedulingInsights.topPriorityAreas.join(", ")} areas first)...`);

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

    // Calculate environmental impact
    const impact = calculateEnvironmentalImpact(result.distance / 1000, result.bins.length);
    setEnvironmentalImpact(prev => ({
      totalDistanceSaved: prev.totalDistanceSaved + impact.distanceSaved,
      totalFuelSaved: prev.totalFuelSaved + impact.fuelSaved,
      totalCO2Reduced: prev.totalCO2Reduced + impact.co2Reduced,
      routesOptimized: prev.routesOptimized + 1,
      lastRouteDistance: result.distance / 1000,
      baselineDistance: impact.baselineDistance
    }));

    setRouteMessage(
      `Smart route optimized for ${timeOfDay} (${result.bins.length} bin(s), ${distanceKm} km) from ${selectedDepot.name}: ${names}` +
        (result.warning ? ` ${result.warning}` : "")
    );
    addNotification(`Smart route optimized for ${timeOfDay} priorities (${distanceKm} km) - Saved ${impact.distanceSaved}km!`, "success");
  }

  function clearRoute() {
    setRouteData({ bins: [], coordinates: [], distance: 0, warning: "" });
    setRouteMessage("Route cleared. Smart scheduling will recompute optimal pickup order based on current time.");
    addNotification("Route cleared", "info");
  }

  const handlePrediction = async (bin) => {
    if (!getPrediction) {
      addNotification("Prediction service is unavailable.", "critical");
      return;
    }

    try {
      const predicted = await getPrediction(bin);
      addNotification(`Predicted fill in 2 hours: ${predicted}% for ${bin.name}`, "info");
    } catch (error) {
      addNotification(`Prediction failed: ${error?.message || "check console for details"}`, "critical");
    }
  };

  const addNotification = (message, type = "info") => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep only 10 most recent
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAssign = (binName, truck) => {
    setBins((prevBins) =>
      prevBins.map((bin) =>
        bin.name === binName
          ? {
              ...bin,
              assigned: true,
              assignedTruck: truck.name,
              assignedTruckId: truck.id,
            }
          : bin
      )
    );
    setAssignMenuBin(null);
    addNotification(`${binName} assigned to ${truck.name}`, "success");
  };

  const handleCancelAssignment = (binName) => {
    setBins((prevBins) =>
      prevBins.map((bin) =>
        bin.name === binName
          ? { ...bin, assigned: false, assignedTruck: null, assignedTruckId: null }
          : bin
      )
    );
    setAssignMenuBin(null);
    addNotification(`${binName} unassigned from truck`, "info");
  };

  const handleReportIssue = (type) => {
    if (!reportingLocation) {
      addNotification("Click on the map to select a location for reporting.", "info");
      return;
    }
    const report = {
      id: Date.now(),
      type,
      location: reportingLocation,
      timestamp: new Date(),
      status: "open",
    };
    setCitizenReports((prev) => [report, ...prev]);
    setReportingLocation(null);
    addNotification(`Issue reported: ${type} at location`, "success");
  };

  const removeReport = (id) => {
    setCitizenReports((prev) => prev.filter((r) => r.id !== id));
    addNotification("Report removed.", "info");
  };

  const markReportResolved = (id) => {
    setCitizenReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
    addNotification("Report marked as resolved.", "success");
  };

  const handleMapLocationClick = (lat, lng) => {
    setReportingLocation({ lat, lng });
  };

  return (
    <div style={pageContainer}>
      <ScenarioPlanner
        bins={bins}
        selectedDepot={selectedDepot}
        onScenarioChange={setActiveScenario}
      />

      <div style={heroCard}>
        <div style={heroInner}>
          <div style={{ display: "grid", gap: 16 }}>
            <h2 style={titleStyle}>Meghalaya Smart Waste Dashboard</h2>
            <p style={heroSubtitle}>
              Real-time waste bin monitoring with route optimization, predictive fill estimates, and a responsive map.
              Monitor pickup demand and keep services ahead of every full bin.
            </p>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#84d2ff" }}>
                🕐 {currentTime.toLocaleTimeString()} ({timeOfDay})
              </div>
              <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.75)" }}>
                🌦️ {weather.charAt(0).toUpperCase() + weather.slice(1)} - Fill rate: {weather === "sunny" ? "1.0x" : weather === "cloudy" ? "1.2x" : weather === "rain" ? "1.5x" : "2.0x"}
              </div>
              {(isSelfHealing || isAutoRouting) && (
                <div style={{ fontSize: "0.9rem", color: "#74d0ff", fontWeight: 600 }}>
                  🤖 {isSelfHealing ? "SELF-HEALING ACTIVE" : "AUTO-ROUTING ACTIVE"}
                </div>
              )}
              <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.75)" }}>
                Prioritizing: {schedulingInsights.topPriorityAreas.join(" & ")} areas
                ({schedulingInsights.highPriorityBins} high priority bins)
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Historical Replay:</span>
                {[
                  { key: "current", label: "Live" },
                  { key: "morning", label: "Morning" },
                  { key: "evening", label: "Evening" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedReplayMode(option.key)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: selectedReplayMode === option.key ? "rgba(132, 210, 255, 0.2)" : "rgba(255,255,255,0.06)",
                      color: "#f4f7ff",
                      padding: "10px 14px",
                      borderRadius: 14,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {hotspotBins.length > 0 && (
                <div style={{ fontSize: "0.85rem", color: "#ffd166", fontWeight: 600 }}>
                  🔥 Hotspot: {hotspotNames}
                </div>
              )}
              {overflowWarning && (
                <div style={{ fontSize: "0.85rem", color: "#ff9f43", fontWeight: 600 }}>
                  ⚠️ {overflowWarning}
                </div>
              )}
              {environmentalImpact.routesOptimized > 0 && (
                <div style={{ fontSize: "0.85rem", color: "#7ff3a4", fontWeight: 500 }}>
                  🌱 Today: {formatImpactNumber(environmentalImpact.totalDistanceSaved, 'km')} saved, {formatImpactNumber(environmentalImpact.totalCO2Reduced, 'kg')} CO₂ reduced
                </div>
              )}
            </div>
          </div>

          <div style={statGrid}>
            <div style={statCard}>
              <span style={statLabel}>Total Bins</span>
              <p style={statValue}>{total}</p>
            </div>
            <div style={statCard}>
              <span style={statLabel}>Full Bins</span>
              <p style={statValue}>{full}</p>
            </div>
            <div style={statCard}>
              <span style={statLabel}>Critical Alerts</span>
              <p style={statValue}>{critical}</p>
            </div>
            <div style={statCard}>
              <span style={statLabel}>Offline Bins</span>
              <p style={{ ...statValue, color: offlineCount > 0 ? "#ff6b6b" : "#7ff3a4" }}>{offlineCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={insightsGrid}>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>Daily Waste Stats</h4>
            <span style={statBadge}>{selectedReplayMode === "current" ? "Today" : selectedReplayMode === "morning" ? "Morning" : "Evening"}</span>
          </div>
          <div style={insightBody}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total waste</span>
                <strong>{Math.round(wastedToday)} kg</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Bins collected</span>
                <strong>{pickupCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Average temp</span>
                <strong>{avgTemp}°C</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Alerts raised</span>
                <strong>{Math.max(0, critical - 1)}</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>Trends</h4>
            <span style={statBadge}>Weekly</span>
          </div>
          <div style={insightBody}>
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>Area Comparison</h4>
            <span style={statBadge}>Live</span>
          </div>
          <div style={insightBody}>
            <Bar data={areaComparisonData} options={areaOptions} />
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>🔥 Hotspot Detection</h4>
            <span style={statBadge}>Live</span>
          </div>
          <div style={insightBody}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Hotspot bins</span>
                <strong>{hotspotBins.length}</strong>
              </div>
              <div style={{ color: "rgba(255,255,255,0.78)", minHeight: 72 }}>
                {hotspotBins.length > 0 ? hotspotNames : "No recurring hotspot locations yet."}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>High-fill streak</span>
                <strong>{hotspotBins.length > 0 ? "Detected" : "Monitoring"}</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>⚠️ Overflow Risk</h4>
            <span style={statBadge}>Predictive</span>
          </div>
          <div style={insightBody}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>At-risk bins</span>
                <strong>{overflowRiskBins.length}</strong>
              </div>
              <div style={{ color: "rgba(255,255,255,0.78)", minHeight: 72 }}>
                {overflowRiskBins.length > 0
                  ? overflowRiskBins
                      .slice(0, 3)
                      .map((bin) => `${bin.name} in ${bin.overflowRisk.hours}h`)
                      .join(" • ")
                  : "No overflow risk detected in the next 4 hours."}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Prediction basis</span>
                <strong>Fill rate</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>🌱 Environmental Impact</h4>
            <span style={statBadge}>Today</span>
          </div>
          <div style={insightBody}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🚛 Distance Saved</span>
                <strong style={{ color: "#7ff3a4" }}>{formatImpactNumber(environmentalImpact.totalDistanceSaved, 'km')}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⛽ Fuel Saved</span>
                <strong style={{ color: "#ffb86c" }}>{formatImpactNumber(environmentalImpact.totalFuelSaved, 'L')}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌿 CO₂ Reduced</span>
                <strong style={{ color: "#74d0ff" }}>{formatImpactNumber(environmentalImpact.totalCO2Reduced, 'kg')}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Routes Optimized</span>
                <strong>{environmentalImpact.routesOptimized}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🚨 Auto Routes</span>
                <strong style={{ color: "#ff6b6b" }}>{environmentalImpact.autoRoutesTriggered}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🔄 Self-Healing</span>
                <strong style={{ color: "#74d0ff" }}>{environmentalImpact.selfHealingEvents}</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={insightCard}>
          <div style={insightHeader}>
            <h4 style={insightTitle}>🌦️ Weather Impact</h4>
            <span style={statBadge}>{weather.charAt(0).toUpperCase() + weather.slice(1)}</span>
          </div>
          <div style={insightBody}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Current</span>
                <strong style={{ color: weather === "sunny" ? "#ffd166" : weather === "cloudy" ? "#d0d0d0" : weather === "rain" ? "#6dd5ff" : "#ff7043" }}>
                  {weather === "sunny" ? "☀️ Sunny" : weather === "cloudy" ? "☁️ Cloudy" : weather === "rain" ? "🌧️ Rain" : "⛈️ Storm"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Fill Multiplier</span>
                <strong style={{ color: weather === "rain" || weather === "thunderstorm" ? "#ff6b6b" : "#fff" }}>
                  {weather === "sunny" ? "1.0x" : weather === "cloudy" ? "1.2x" : weather === "rain" ? "1.5x" : "2.0x"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Overflow Risk</span>
                <strong style={{ color: weather === "thunderstorm" ? "#ff6b6b" : weather === "rain" ? "#ff9f43" : "#7ff3a4" }}>
                  {weather === "thunderstorm" ? "🔴 Critical" : weather === "rain" ? "🟠 High" : "🟢 Normal"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <span>At-risk bins</span>
                <strong>{activeBins.filter(b => b.fill > 70).length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={mainGrid}>
        <div style={largeCard}>
          <div style={cardHeader}>
            <div>
              <h3 style={cardTitle}>Route Control</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Fine-tune the current depot and optimize pickup when bins are nearly full.
              </p>
            </div>
          </div>
          <div style={cardContent}>
            <div style={controlRow}>
              <select
                value={selectedDepot.name}
                onChange={(e) => {
                  const depot = municipalDepots.find((d) => d.name === e.target.value);
                  setSelectedDepot(depot);
                }}
                style={selectStyle}
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
            </div>
            <div style={routeBar}>
              {isSelfHealing && <span style={{ color: "#74d0ff", marginRight: 8 }}>🔄 SELF-HEALING...</span>}
              {isAutoRouting && <span style={{ color: "#ff6b6b", marginRight: 8 }}>🔄 AUTO-ROUTING...</span>}
              {routeMessage}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          <div style={largeCard}>
            <div style={cardHeader}>
              <h3 style={cardTitle}>{selectedReplayMode === "current" ? "Live Fill Predictions" : `${selectedReplayMode.charAt(0).toUpperCase() + selectedReplayMode.slice(1)} Replay`}</h3>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                Tap a bin to forecast its fill percentage in 2 hours.
              </span>
            </div>
            <div style={cardContent}>
              <div style={binList}>
                {activeBins.map((bin) => (
                  <div key={bin.name} style={{
                    ...binCard,
                    opacity: bin.isOnline ? 1 : 0.6,
                    border: bin.isOnline ? binCard.border : "1px solid rgba(255, 107, 107, 0.3)",
                  }}>
                    <div style={binRow}>
                      <div>
                        <p style={binName}>
                          {bin.name}
                          {!bin.isOnline && <span style={{ color: "#ff6b6b", marginLeft: 8, fontSize: "0.8em" }}>📡 OFFLINE</span>}
                        </p>
                        <p style={binMeta}>
                          Current fill: {bin.fill}% · {bin.assigned ? `Assigned to ${bin.assignedTruck}` : "Unassigned"}
                          {!bin.isOnline && ` · Last seen: ${Math.round((Date.now() - bin.lastSeen.getTime()) / 60000)}m ago`}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={predictButton}
                          onClick={() => handlePrediction(bin)}
                        >
                          Predict Future
                        </button>
                        <button
                          type="button"
                          style={{
                            border: "none",
                            background: bin.assigned ? "#6bd1ff" : "#ff6b6b",
                            color: "#081220",
                            padding: "12px 16px",
                            borderRadius: 14,
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                          onClick={() => setAssignMenuBin(bin.name)}
                        >
                          {bin.assigned ? "Change truck" : "Assign"}
                        </button>
                        {bin.assigned && (
                          <button
                            type="button"
                            style={{
                              border: "none",
                              background: "#ffb74d",
                              color: "#081220",
                              padding: "12px 16px",
                              borderRadius: 14,
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                            onClick={() => handleCancelAssignment(bin.name)}
                          >
                            Unassign
                          </button>
                        )}
                      </div>
                    </div>
                    {assignMenuBin === bin.name && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                        {trucks.map((truck) => (
                          <button
                            key={truck.id}
                            type="button"
                            style={{
                              border: "none",
                              background: bin.assigned && bin.assignedTruckId === truck.id ? "#5bff96" : "#4f71ff",
                              color: "#fff",
                              padding: "10px 14px",
                              borderRadius: 14,
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                            onClick={() => handleAssign(bin.name, truck)}
                          >
                            {truck.name}
                          </button>
                        ))}
                        <button
                          type="button"
                          style={{
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            padding: "10px 14px",
                            borderRadius: 14,
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                          onClick={() => setAssignMenuBin(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                    <div style={progressBarBackground}>
                      <div style={progressBarFill(bin.fill)} />
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
                      <span>🌡️ {bin.temperature}°C</span>
                      <span>🟠 Gas {bin.gas}%</span>
                      <span>⏱️ Last collected {bin.lastCollected}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={largeCard}>
            <div style={cardHeader}>
              <h3 style={cardTitle}>Bin Fill Distribution</h3>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <BinChart bins={activeBins} />
            </div>
          </div>
        </div>
      </div>

      <div style={largeCard}>
        <div style={cardHeader}>
          <h3 style={cardTitle}>📲 Citizen Reporting</h3>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            Click on the map, then report an issue
          </span>
        </div>
        <div style={cardContent}>
          {reportingLocation && (
            <div style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(132, 210, 255, 0.2)",
              border: "1px solid rgba(132, 210, 255, 0.4)",
              marginBottom: 14,
              fontSize: 13,
              color: "#84d2ff"
            }}>
              📍 Location selected: {reportingLocation.lat.toFixed(3)}, {reportingLocation.lng.toFixed(3)}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              style={{
                border: "none",
                background: "linear-gradient(135deg, #ff6b6b, #ff8787)",
                color: "#fff",
                padding: "14px 16px",
                borderRadius: 14,
                cursor: reportingLocation ? "pointer" : "not-allowed",
                fontWeight: 700,
                opacity: reportingLocation ? 1 : 0.5,
                transition: "transform 0.18s"
              }}
              onClick={() => handleReportIssue("Overflow")}
              disabled={!reportingLocation}
            >
              🚨 Overflow
            </button>
            <button
              style={{
                border: "none",
                background: "linear-gradient(135deg, #ffd166, #ffb84d)",
                color: "#081220",
                padding: "14px 16px",
                borderRadius: 14,
                cursor: reportingLocation ? "pointer" : "not-allowed",
                fontWeight: 700,
                opacity: reportingLocation ? 1 : 0.5,
                transition: "transform 0.18s"
              }}
              onClick={() => handleReportIssue("Dirty Area")}
              disabled={!reportingLocation}
            >
              🧹 Dirty Area
            </button>
          </div>
        </div>
      </div>

      <div style={largeCard}>
        <div style={cardHeader}>
          <h3 style={cardTitle}>🔔 Active Reports ({citizenReports.filter(r => r.status === "open").length})</h3>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            Community-reported issues
          </span>
        </div>
        <div style={cardContent}>
          {citizenReports.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "20px 0" }}>
              No reports yet. Help keep the area clean!
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {citizenReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: report.status === "resolved" ? "rgba(127, 243, 164, 0.1)" : "rgba(255, 107, 107, 0.1)",
                    border: `1px solid ${report.status === "resolved" ? "rgba(127, 243, 164, 0.3)" : "rgba(255, 107, 107, 0.3)"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: report.status === "resolved" ? 0.7 : 1
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {report.type === "Overflow" ? "🚨" : "🧹"} {report.type}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                      {report.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {report.status === "open" && (
                      <button
                        style={{
                          border: "none",
                          background: "rgba(127, 243, 164, 0.3)",
                          color: "#7ff3a4",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600
                        }}
                        onClick={() => markReportResolved(report.id)}
                      >
                        ✓ Resolve
                      </button>
                    )}
                    <button
                      style={{
                        border: "none",
                        background: "rgba(255, 107, 107, 0.2)",
                        color: "#ff6b6b",
                        padding: "6px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      onClick={() => removeReport(report.id)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={largeCard}>
        <div style={cardHeader}>
          <h3 style={cardTitle}>Live Waste Map</h3>
        </div>
        <div style={{ height: 560 }}>
          <WasteMap bins={activeBins} routeData={routeData} depots={municipalDepots} selectedDepot={selectedDepot} citizenReports={citizenReports} onLocationClick={handleMapLocationClick} />
        </div>
      </div>
      <NotificationPanel notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}

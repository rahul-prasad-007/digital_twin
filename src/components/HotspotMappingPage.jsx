import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import WasteMap from "./WasteMap.jsx";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const card = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 14,
};

const KPI = [
  { label: "High Density Areas", value: 12, trend: "↑ 2 new this week", tone: "#ef4444", border: "rgba(239,68,68,0.35)" },
  { label: "Medium Density Areas", value: 18, trend: "↑ 3 new this week", tone: "#f97316", border: "rgba(249,115,22,0.35)" },
  { label: "Low Density Areas", value: 24, trend: "↓ 5 less this week", tone: "#5cb85c", border: "rgba(92,184,92,0.35)" },
  { label: "Total Waste Points", value: 152, trend: "↑ 12.5% from last month", tone: "#5cb85c", border: "rgba(92,184,92,0.35)" },
  { label: "Total Tourist Spots", value: 48, trend: "All monitored locations", tone: "#3b82f6", border: "rgba(59,130,246,0.35)", sub: true },
];

const TOP_HOTSPOTS = [
  { name: "Nohkalikai Falls", pct: 92, level: "High" },
  { name: "Dawki River", pct: 78, level: "High" },
  { name: "Shillong Peak trail", pct: 65, level: "Medium" },
  { name: "Mawlynnong village", pct: 54, level: "Medium" },
  { name: "Elephant Falls", pct: 41, level: "Low" },
];

const STATIC_ALERTS = [
  { id: "a1", level: "high", text: "Overflow risk near market bins — Shillong", time: "12 min ago" },
  { id: "a2", level: "med", text: "Sensor spike: organic waste — Sohra", time: "48 min ago" },
  { id: "a3", level: "low", text: "Route deviation logged — Tura corridor", time: "2 h ago" },
];

const CAROUSEL = [
  { label: "Nohkalikai Falls", status: "High Waste", tone: "#ef4444", img: `${import.meta.env.BASE_URL}hotspot-bg.png` },
  { label: "Dawki Umngot", status: "Medium", tone: "#f97316", img: `${import.meta.env.BASE_URL}hotspot-bg.png` },
  { label: "Shillong Viewpoint", status: "Low", tone: "#5cb85c", img: `${import.meta.env.BASE_URL}hotspot-bg.png` },
  { label: "Mawsmai Cave", status: "Medium", tone: "#f97316", img: `${import.meta.env.BASE_URL}hotspot-bg.png` },
];

export default function HotspotMappingPage({
  bins,
  citizenReports,
  routeData,
  depots,
  selectedDepot,
  reportingLocation,
  reportsSyncing,
  reportsReady,
  onLocationClick,
  onReportOverflow,
  onReportDirty,
  onResolveReport,
  onRemoveReport,
}) {
  const donutData = useMemo(
    () => ({
      labels: ["High", "Medium", "Low", "Very Low"],
      datasets: [
        {
          data: [12, 18, 24, 98],
          backgroundColor: ["#ef4444", "#f97316", "#5cb85c", "#3b82f6"],
          borderWidth: 0,
        },
      ],
    }),
    []
  );

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "rgba(228,224,236,0.88)", boxWidth: 10, padding: 10, font: { size: 11 } },
      },
    },
    cutout: "58%",
  };

  const alerts = useMemo(() => {
    const live =
      citizenReports?.slice(0, 4).map((r) => ({
        id: `r-${r.id}`,
        level: r.type === "Overflow" ? "high" : "med",
        text: `${r.type} report — open`,
        time: new Date(r.timestamp).toLocaleString(),
      })) || [];
    return [...live, ...STATIC_ALERTS].slice(0, 6);
  }, [citizenReports]);

  const inputBar = {
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid rgba(255,255,255,0.12)`,
    background: "rgba(0,0,0,0.35)",
    color: t.text,
    fontSize: 13,
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <select style={{ ...inputBar, minWidth: 160, cursor: "pointer" }}>
          <option>Meghalaya</option>
          <option>East Khasi Hills</option>
          <option>West Jaintia Hills</option>
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>Range</span>
          <input type="text" readOnly value="01 May 2024 — 21 May 2024" style={{ ...inputBar, minWidth: 220 }} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${t.cardBorder}`,
              background: "rgba(255,255,255,0.06)",
              color: t.text,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Filter
          </button>
          <select style={{ ...inputBar, cursor: "pointer", minWidth: 160 }}>
            <option>All Waste Types</option>
            <option>Organic</option>
            <option>Plastic</option>
            <option>Mixed</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {KPI.map((k) => (
          <div key={k.label} style={{ ...card, padding: 16, borderTop: `3px solid ${k.tone}` }}>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.tone }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.sub ? t.textMuted : "#86efac", marginTop: 6 }}>{k.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: t.textMuted }}>Citizen reporting</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              {reportingLocation && (
                <span style={{ fontSize: 12, color: "#93c5fd" }}>
                  📍 {reportingLocation.lat.toFixed(3)}, {reportingLocation.lng.toFixed(3)}
                </span>
              )}
              <button
                type="button"
                disabled={!reportingLocation}
                onClick={onReportOverflow}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: reportingLocation ? "#dc2626" : "#444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: reportingLocation ? "pointer" : "not-allowed",
                  fontSize: 12,
                }}
              >
                Overflow
              </button>
              <button
                type="button"
                disabled={!reportingLocation}
                onClick={onReportDirty}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: reportingLocation ? "#ea580c" : "#444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: reportingLocation ? "pointer" : "not-allowed",
                  fontSize: 12,
                }}
              >
                Dirty Area
              </button>
              <span style={{ fontSize: 11, color: t.textMuted }}>{reportsSyncing ? "Syncing…" : reportsReady ? "Live" : "…"}</span>
            </div>
          </div>

          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Regional hotspot map</span>
              <span style={{ fontSize: 11, color: t.textMuted }}>Bins + reports overlay</span>
            </div>
            <div style={{ height: 520, position: "relative" }}>
              <WasteMap
                bins={bins}
                routeData={routeData}
                depots={depots}
                selectedDepot={selectedDepot}
                citizenReports={citizenReports}
                onLocationClick={onLocationClick}
              />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Monitored Tourist Locations</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
              {CAROUSEL.map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: "0 0 180px",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${t.cardBorder}`,
                    background: "#000",
                  }}
                >
                  <div
                    style={{
                      height: 100,
                      backgroundImage: `url(${c.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{c.label}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: c.tone, padding: "2px 8px", borderRadius: 6, marginTop: 6, display: "inline-block" }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800 }}>Top 5 Hotspot Areas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TOP_HOTSPOTS.map((h, idx) => (
                <div key={h.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.textMuted, width: 22 }}>{idx + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>{h.level} waste pressure</div>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: `3px solid ${h.level === "High" ? "#ef4444" : h.level === "Medium" ? "#f97316" : "#5cb85c"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12,
                      color: "#fff",
                    }}
                  >
                    {h.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Waste Density Distribution</h3>
            <div style={{ height: 220, position: "relative" }}>
              <Doughnut data={donutData} options={donutOpts} />
            </div>
          </div>

          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800 }}>Live Waste Alerts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      marginTop: 5,
                      flexShrink: 0,
                      background: a.level === "high" ? "#ef4444" : a.level === "med" ? "#f97316" : "#3b82f6",
                      boxShadow: `0 0 10px ${a.level === "high" ? "#ef4444" : "#f97316"}`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {citizenReports.length > 0 && (
            <div style={{ ...card, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Active reports</div>
              <div style={{ display: "grid", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {citizenReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                    }}
                  >
                    <span>
                      {report.type} · {report.status}
                    </span>
                    <span style={{ display: "flex", gap: 6 }}>
                      {report.status === "open" && (
                        <button type="button" style={{ border: "none", background: "rgba(92,184,92,0.25)", color: "#86efac", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }} onClick={() => onResolveReport(report.id)}>
                          Resolve
                        </button>
                      )}
                      <button type="button" style={{ border: "none", background: "rgba(239,68,68,0.2)", color: "#fca5a5", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }} onClick={() => onRemoveReport(report.id)}>
                        ✕
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

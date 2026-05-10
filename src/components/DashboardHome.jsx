import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import WasteMap from "./WasteMap.jsx";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const DASH = "/dashboard";

const card = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 14,
  overflow: "hidden",
};

const KPI_ICON = {
  width: 40,
  height: 40,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
};

const CLASS_ROWS = [
  { thumb: "🧴", predicted: "Plastic Bottle", type: "Plastic", typeTone: "#34d399", conf: "Recyclable", confTone: "#5cb85c", time: "10:29 AM" },
  { thumb: "📰", predicted: "Newspaper bundle", type: "Paper", typeTone: "#3b82f6", conf: "Recyclable", confTone: "#5cb85c", time: "10:14 AM" },
  { thumb: "🍎", predicted: "Food scraps", type: "Organic", typeTone: "#5cb85c", conf: "Non-recyclable", confTone: "#eab308", time: "09:58 AM" },
  { thumb: "🥫", predicted: "Metal can", type: "Metal", typeTone: "#f97316", conf: "Recyclable", confTone: "#5cb85c", time: "09:41 AM" },
];

const HOTSPOT_ROWS = [
  { rank: 1, name: "Nohkalikai Falls", level: "High Waste", total: "1,248" },
  { rank: 2, name: "Dawki Riverfront", level: "Medium", total: "892" },
  { rank: 3, name: "Shillong CBD", level: "Medium", total: "764" },
  { rank: 4, name: "Sohra market", level: "Low", total: "521" },
  { rank: 5, name: "Mawsmai Cave trail", level: "Low", total: "408" },
];

const ALERTS = [
  { tone: "#ef4444", border: "rgba(239,68,68,0.35)", title: "High Waste Detected", body: "Nohkalikai Falls area has high waste accumulation.", time: "10:25 AM" },
  { tone: "#eab308", border: "rgba(234,179,8,0.35)", title: "New Hotspot Identified", body: "A new hotspot detected in Mairang area.", time: "09:45 AM" },
  { tone: "#f97316", border: "rgba(249,115,22,0.35)", title: "AI Model Updated", body: "Vision Transformer model updated successfully.", time: "09:30 AM" },
  { tone: "#5cb85c", border: "rgba(92,184,92,0.35)", title: "Report Generated", body: "Monthly waste report for April 2024 is ready.", time: "Yesterday" },
];

export default function DashboardHome({
  bins,
  routeData,
  depots,
  selectedDepot,
  citizenReports = [],
  hotspotCount = 0,
  onMapLocationClick,
}) {
  const donutData = useMemo(
    () => ({
      labels: ["Plastic", "Paper", "Food Waste", "Glass", "Metal", "Others"],
      datasets: [
        {
          data: [40.2, 18.7, 15.3, 10.4, 8.6, 6.8],
          backgroundColor: ["#34d399", "#3b82f6", "#5cb85c", "#eab308", "#f97316", "#64748b"],
          borderWidth: 0,
        },
      ],
    }),
    []
  );

  const donutOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(228,224,236,0.88)",
            boxWidth: 10,
            padding: 10,
            font: { size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              return ` ${ctx.label}: ${v}%`;
            },
          },
        },
      },
    }),
    []
  );

  const trendData = useMemo(
    () => ({
      labels: ["15 May", "16 May", "17 May", "18 May", "19 May", "20 May", "21 May"],
      datasets: [
        {
          label: "Total",
          data: [920, 1010, 980, 1120, 1180, 1240, 1320],
          borderColor: "#5cb85c",
          backgroundColor: "rgba(92,184,92,0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2,
        },
        {
          label: "Recyclable",
          data: [560, 620, 590, 680, 710, 750, 790],
          borderColor: "#5cb85c",
          backgroundColor: "rgba(92,184,92,0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const trendOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(228,224,236,0.65)", font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(228,224,236,0.65)",
            font: { size: 10 },
            callback: (v) => (v >= 1000 ? `${v / 1000}K` : v),
          },
          suggestedMax: 1500,
        },
      },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: { color: "rgba(228,224,236,0.88)", boxWidth: 12, font: { size: 11 } },
        },
      },
    }),
    []
  );

  const hotspotsDisplay = hotspotCount > 0 ? hotspotCount : 12;

  return (
    <div style={{ display: "grid", gap: 18, paddingBottom: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            label: "Total Images Analyzed",
            value: "5,248",
            sub: "+12.5% vs last month",
            subUp: true,
            iconBg: "rgba(92,184,92,0.25)",
            emoji: "📊",
          },
          {
            label: "Recyclable Waste",
            value: "3,142",
            sub: "59.8% of total",
            iconBg: "rgba(92,184,92,0.22)",
            emoji: "♻️",
          },
          {
            label: "Non-Recyclable Waste",
            value: "2,106",
            sub: "40.2% of total",
            iconBg: "rgba(234,179,8,0.2)",
            emoji: "🗑️",
          },
          {
            label: "Hotspot Areas",
            value: String(hotspotsDisplay),
            sub: "↑ 2 new areas",
            subUp: true,
            iconBg: "rgba(239,68,68,0.2)",
            emoji: "📍",
          },
          {
            label: "AI Accuracy (Avg.)",
            value: "92.35%",
            sub: "↑ 4.8% improvement",
            subUp: true,
            iconBg: "rgba(59,130,246,0.22)",
            emoji: "🧠",
          },
        ].map((k) => (
          <div key={k.label} style={{ ...card, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8, fontWeight: 600 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>{k.value}</div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    color: k.subUp ? "#86efac" : t.textMuted,
                  }}
                >
                  {k.sub}
                </div>
              </div>
              <div style={{ ...KPI_ICON, background: k.iconBg }}>{k.emoji}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)",
          gap: 18,
          alignItems: "stretch",
        }}
        className="dashboard-home-mid"
      >
        <div style={{ ...card, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div
            style={{
              padding: "12px 14px",
              borderBottom: `1px solid ${t.cardBorder}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Waste Hotspot Map — Meghalaya</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                Legend: Low · Medium · High — bins & routes overlay
              </div>
            </div>
            <select
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${t.cardBorder}`,
                background: "rgba(0,0,0,0.35)",
                color: t.text,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <option>All Locations</option>
              <option>East Khasi Hills</option>
              <option>West Jaintia Hills</option>
            </select>
          </div>
          <div style={{ flex: 1, minHeight: 360, position: "relative" }}>
            <WasteMap
              bins={bins}
              routeData={routeData}
              depots={depots}
              selectedDepot={selectedDepot}
              citizenReports={citizenReports}
              onLocationClick={onMapLocationClick}
            />
          </div>
        </div>

        <div style={{ ...card, padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Waste Classification (Live)</div>
            <span style={{ fontSize: 11, color: t.textMuted }}>ViT pipeline</span>
          </div>
          <div style={{ flex: 1, minHeight: 220, position: "relative" }}>
            <Doughnut data={donutData} options={donutOpts} />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "42%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>5,248</div>
              <div style={{ fontSize: 11, color: t.textMuted }}>Total</div>
            </div>
          </div>
          <NavLink
            to={`${DASH}/classify`}
            style={{
              marginTop: 12,
              fontSize: 13,
              fontWeight: 700,
              color: t.accent,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            View Details →
          </NavLink>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr) minmax(260px, 0.9fr)",
          gap: 18,
          alignItems: "stretch",
        }}
        className="dashboard-home-bottom"
      >
        <div style={{ ...card }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, fontWeight: 800, fontSize: 14 }}>
            Recent Classifications
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: t.textMuted, textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", fontWeight: 600 }}>Image</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Predicted Class</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Type</th>
                  <th style={{ padding: "10px 8px", fontWeight: 600 }}>Confidence</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                    <td style={{ padding: "10px 12px", fontSize: 18 }}>{row.thumb}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: t.text }}>{row.predicted}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: `${row.typeTone}33`,
                          color: row.typeTone,
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: `${row.confTone}33`,
                          color: row.confTone,
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {row.conf}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: t.textMuted }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.cardBorder}` }}>
            <NavLink to={`${DASH}/classify`} style={{ fontSize: 13, fontWeight: 700, color: t.accent, textDecoration: "none" }}>
              View All Classifications →
            </NavLink>
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Waste Trend (This Week)</span>
            <select
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${t.cardBorder}`,
                background: "rgba(0,0,0,0.35)",
                color: t.text,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div style={{ height: 220 }}>
            <Line data={trendData} options={trendOpts} />
          </div>
        </div>

        <div style={{ ...card }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, fontWeight: 800, fontSize: 14 }}>
            Top Hotspot Areas
          </div>
          <div style={{ padding: "8px 12px 12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: t.textMuted, textAlign: "left" }}>
                  <th style={{ padding: "8px 6px", width: 36 }}>#</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600 }}>Location</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600 }}>Waste Level</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, textAlign: "right" }}>Total Waste</th>
                </tr>
              </thead>
              <tbody>
                {HOTSPOT_ROWS.map((row) => (
                  <tr key={row.rank} style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                    <td style={{ padding: "10px 6px", fontWeight: 800, color: t.textMuted }}>{row.rank}</td>
                    <td style={{ padding: "10px 6px", fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: "10px 6px", color: t.textMuted }}>{row.level}</td>
                    <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.cardBorder}` }}>
            <NavLink to={`${DASH}/field`} style={{ fontSize: 13, fontWeight: 700, color: t.accent, textDecoration: "none" }}>
              View All Hotspots →
            </NavLink>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Recent Alerts &amp; Notifications</span>
          <NavLink to={`${DASH}/alerts`} style={{ fontSize: 12, fontWeight: 700, color: t.accent, textDecoration: "none" }}>
            View All Alerts →
          </NavLink>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
          {ALERTS.map((a, i) => (
            <div
              key={i}
              style={{
                padding: "14px 14px",
                borderRadius: 12,
                border: `1px solid ${a.border}`,
                background: "rgba(0,0,0,0.28)",
                borderLeft: `4px solid ${a.tone}`,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: a.tone }}>{a.title}</div>
              <div style={{ fontSize: 12, color: t.text, lineHeight: 1.45 }}>{a.body}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .dashboard-home-mid { grid-template-columns: 1fr !important; }
          .dashboard-home-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

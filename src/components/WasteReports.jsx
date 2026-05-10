import { NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const DASH = "/dashboard";

const TOTAL_KG = 12458;
const DATE_RANGE_LABEL = "01 May 2024 — 21 May 2024";
const TOTAL_DAYS = 21;

const HOTSPOTS_TOP = [
  { name: "Nohkalikai Falls", tag: "High Waste", tagTone: "#ef4444", kg: "4,104" },
  { name: "Mawsmai Cave", tag: "Medium Waste", tagTone: "#f97316", kg: "3,021" },
  { name: "Mawkdok View Point", tag: "Medium Waste", tagTone: "#f97316", kg: "2,688" },
  { name: "Seven Sisters Falls", tag: "Low Waste", tagTone: "#5cb85c", kg: "1,942" },
  { name: "Dawki", tag: "Low Waste", tagTone: "#5cb85c", kg: "1,856" },
];

const LOCATION_ROWS = [
  {
    id: "l1",
    name: "Nohkalikai Falls",
    sub: "Sohra, Meghalaya",
    thumb: "🏔️",
    rec: "2,856",
    non: "1,248",
    total: "4,104",
    trend: [34, 42, 38, 55, 62, 58, 71],
    status: "High Waste",
    statusTone: "#ef4444",
  },
  {
    id: "l2",
    name: "Mawsmai Cave",
    sub: "East Khasi Hills",
    thumb: "🕳️",
    rec: "1,920",
    non: "1,101",
    total: "3,021",
    trend: [28, 30, 32, 31, 35, 38, 40],
    status: "Medium Waste",
    statusTone: "#f97316",
  },
  {
    id: "l3",
    name: "Mawkdok View Point",
    sub: "East Khasi Hills",
    thumb: "🌄",
    rec: "1,702",
    non: "986",
    total: "2,688",
    trend: [22, 24, 26, 25, 28, 30, 32],
    status: "Medium Waste",
    statusTone: "#f97316",
  },
  {
    id: "l4",
    name: "Seven Sisters Falls",
    sub: "East Khasi Hills",
    thumb: "💧",
    rec: "1,284",
    non: "658",
    total: "1,942",
    trend: [18, 19, 20, 21, 20, 22, 24],
    status: "Low Waste",
    statusTone: "#5cb85c",
  },
  {
    id: "l5",
    name: "Dawki",
    sub: "West Jaintia Hills",
    thumb: "🛶",
    rec: "1,120",
    non: "736",
    total: "1,856",
    trend: [20, 21, 22, 23, 24, 25, 26],
    status: "Low Waste",
    statusTone: "#5cb85c",
  },
  {
    id: "l6",
    name: "Shillong Peak trail",
    sub: "Shillong",
    thumb: "🥾",
    rec: "892",
    non: "412",
    total: "1,304",
    trend: [15, 16, 17, 18, 17, 19, 20],
    status: "Medium Waste",
    statusTone: "#f97316",
  },
  {
    id: "l7",
    name: "Elephant Falls",
    sub: "Shillong",
    thumb: "🐘",
    rec: "756",
    non: "388",
    total: "1,144",
    trend: [12, 13, 14, 14, 15, 16, 17],
    status: "Low Waste",
    statusTone: "#5cb85c",
  },
  ...Array.from({ length: 17 }, (_, i) => ({
    id: `lx${i}`,
    name: `Ward collection ${i + 8}`,
    sub: "Meghalaya",
    thumb: "📍",
    rec: String(400 + i * 12),
    non: String(200 + i * 8),
    total: String(600 + i * 20),
    trend: [10, 11, 10, 12, 11, 13, 12],
    status: i % 3 === 0 ? "Low Waste" : "Medium Waste",
    statusTone: i % 3 === 0 ? "#5cb85c" : "#f97316",
  })),
];

const PAGE_SIZE = 7;

function MiniSparkline({ values }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, minWidth: 72 }}>
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            minWidth: 4,
            height: `${Math.max(12, (v / max) * 100)}%`,
            borderRadius: 2,
            background: "linear-gradient(180deg, #5cb85c, #449d44)",
            opacity: 0.75 + (i / values.length) * 0.25,
          }}
        />
      ))}
    </div>
  );
}

export default function WasteReports() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(LOCATION_ROWS.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  const slice = LOCATION_ROWS.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const trendLabels = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const d = i + 1;
        return `May ${String(d).padStart(2, "0")}`;
      }),
    []
  );

  const trendData = useMemo(
    () => ({
      labels: trendLabels,
      datasets: [
        {
          label: "Recyclable",
          data: trendLabels.map((_, i) => 320 + i * 18 + Math.sin(i * 0.4) * 40),
          borderColor: "#5cb85c",
          backgroundColor: "rgba(92,184,92,0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Non-Recyclable",
          data: trendLabels.map((_, i) => 180 + i * 12 + Math.cos(i * 0.35) * 28),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Total Waste",
          data: trendLabels.map((_, i) => 500 + i * 30 + Math.sin(i * 0.25) * 55),
          borderColor: "#5cb85c",
          backgroundColor: "rgba(92,184,92,0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [trendLabels]
  );

  const trendOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(228,224,236,0.55)", maxTicksLimit: 8, font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(228,224,236,0.55)",
            font: { size: 10 },
            callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          align: "start",
          labels: { color: "rgba(228,224,236,0.88)", boxWidth: 12, font: { size: 11 }, padding: 16 },
        },
      },
    }),
    []
  );

  const donutData = useMemo(
    () => ({
      labels: ["Plastic", "Paper", "Food Waste", "Glass", "Metal", "Others"],
      datasets: [
        {
          data: [35.4, 20.1, 18.7, 10.3, 8.2, 7.3],
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
          labels: { color: "rgba(228,224,236,0.88)", boxWidth: 10, padding: 10, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`,
          },
        },
      },
    }),
    []
  );

  const card = {
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 14,
    overflow: "hidden",
  };

  const generatedOn = useMemo(() => new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }), []);

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 10 }}>
          <NavLink to={DASH} style={{ color: t.accent, textDecoration: "none", fontWeight: 600 }}>
            Dashboard
          </NavLink>
          <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
          <span>Waste Reports</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            readOnly
            value={DATE_RANGE_LABEL}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${t.cardBorder}`,
              background: "rgba(0,0,0,0.35)",
              color: t.text,
              fontSize: 13,
              minWidth: 260,
            }}
          />
          <button
            type="button"
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #5cb85c, #449d44)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Generate Report
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {[
          ["Total Waste Collected", `${TOTAL_KG.toLocaleString()} kg`, "↑ 18.6% from last period", "rgba(92,184,92,0.22)", "📦"],
          ["Recyclable Waste", "7,860 kg", "↑ 21.3% from last period", "rgba(92,184,92,0.22)", "♻️"],
          ["Non-Recyclable Waste", "4,598 kg", "↑ 14.2% from last period", "rgba(239,68,68,0.2)", "🗑️"],
          ["Total Hotspot Areas", "24", "↑ 9.1% from last period", "rgba(59,130,246,0.22)", "📍"],
          ["Active Collection Points", "48", "↑ 8.3% from last period", "rgba(234,179,8,0.22)", "📌"],
        ].map(([title, val, sub, bg, icon]) => (
          <div key={title} style={{ ...card, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#86efac", marginTop: 6 }}>{sub}</div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, 1fr) minmax(220px, 0.85fr)",
          gap: 16,
          marginBottom: 18,
          alignItems: "stretch",
        }}
        className="waste-reports-mid"
      >
        <div style={{ ...card }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Waste Collection Trend</span>
            <select
              defaultValue="daily"
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
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div style={{ height: 280, padding: "8px 12px 16px" }}>
            <Line data={trendData} options={trendOpts} />
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Waste Distribution by Type</div>
          <div style={{ height: 240, position: "relative" }}>
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
              <div style={{ fontSize: 18, fontWeight: 800 }}>{TOTAL_KG.toLocaleString()} kg</div>
              <div style={{ fontSize: 11, color: t.textMuted }}>Total</div>
            </div>
          </div>
          <NavLink to={`${DASH}/analytics`} style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 700, color: t.accent, textDecoration: "none" }}>
            View Detailed Analysis →
          </NavLink>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Top Waste Hotspots</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HOTSPOTS_TOP.map((h) => (
              <div key={h.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${h.tagTone}28`,
                      color: h.tagTone,
                      marginTop: 6,
                      display: "inline-block",
                    }}
                  >
                    {h.tag}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: t.textMuted }}>{h.kg} kg</div>
              </div>
            ))}
          </div>
          <NavLink to={`${DASH}/field`} style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 700, color: t.accent, textDecoration: "none" }}>
            View All Hotspots →
          </NavLink>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)",
          gap: 18,
          alignItems: "start",
        }}
        className="waste-reports-bottom"
      >
        <div style={{ ...card }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, fontWeight: 800, fontSize: 14 }}>Waste Collection by Location</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: t.textMuted, textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Location</th>
                  <th style={{ padding: "10px 8px" }}>Recyclable (kg)</th>
                  <th style={{ padding: "10px 8px" }}>Non-Recyclable (kg)</th>
                  <th style={{ padding: "10px 8px" }}>Total Waste (kg)</th>
                  <th style={{ padding: "10px 8px" }}>Trend</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((row) => (
                  <tr key={row.id} style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{row.thumb}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{row.name}</div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>{row.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{row.rec}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{row.non}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>{row.total}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <MiniSparkline values={row.trend} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: `${row.statusTone}22`,
                          color: row.statusTone,
                          border: `1px solid ${row.statusTone}55`,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.cardBorder}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, LOCATION_ROWS.length)} of {LOCATION_ROWS.length} locations
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    minWidth: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${p === safePage ? `rgba(${t.accentRgb}, 0.55)` : t.cardBorder}`,
                    background: p === safePage ? `rgba(${t.accentRgb}, 0.22)` : "transparent",
                    color: p === safePage ? "#fff" : t.textMuted,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Report Summary</div>
            <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
              {[
                ["Report Type", "Custom Range Report"],
                ["Duration", DATE_RANGE_LABEL],
                ["Total Days", `${TOTAL_DAYS} Days`],
                ["Generated On", generatedOn],
                ["Generated By", "Admin User"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${t.cardBorder}`, paddingBottom: 10 }}>
                  <span style={{ color: t.textMuted }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Download Report</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary})`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span>📄</span> Download PDF
              </button>
              <button
                type="button"
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1px solid rgba(92,184,92,0.45)`,
                  background: "rgba(92,184,92,0.15)",
                  color: "#86efac",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span>📊</span> Download Excel
              </button>
              <button
                type="button"
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1px solid rgba(59,130,246,0.45)`,
                  background: "rgba(59,130,246,0.12)",
                  color: "#93c5fd",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span>🖨️</span> Print Report
              </button>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .waste-reports-mid { grid-template-columns: 1fr !important; }
          .waste-reports-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

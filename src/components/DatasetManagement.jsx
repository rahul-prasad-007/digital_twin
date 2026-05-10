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
  BarElement,
  Filler,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

const TOTAL_IMAGES = 18542;
const TYPE_BREAKDOWN = [
  { label: "Plastic", pct: 35.4, tone: "#34d399" },
  { label: "Paper", pct: 20.1, tone: "#3b82f6" },
  { label: "Food Waste", pct: 18.7, tone: "#5cb85c" },
  { label: "Glass", pct: 10.3, tone: "#eab308" },
  { label: "Metal", pct: 8.2, tone: "#f97316" },
  { label: "Others", pct: 7.3, tone: "#64748b" },
];

const DATASET_ROWS = [
  {
    id: "d1",
    thumb: "🧴",
    name: "Plastic Waste Dataset",
    desc: "Street bins & market plastics — labeled multi-region.",
    typeKey: "waste",
    images: "6,542",
    labeled: "6,125",
    labeledPct: "93.6%",
    size: "12.4 GB",
    created: "20 May 2024",
    status: "completed",
  },
  {
    id: "d2",
    thumb: "📰",
    name: "Paper & Cardboard Dataset",
    desc: "Newsprint and packaging streams.",
    typeKey: "waste",
    images: "4,210",
    labeled: "3,892",
    labeledPct: "92.5%",
    size: "8.2 GB",
    created: "18 May 2024",
    status: "completed",
  },
  {
    id: "d3",
    thumb: "♻️",
    name: "Recyclability QC Dataset",
    desc: "Binary recyclable vs non with adjudicated edges.",
    typeKey: "recyclability",
    images: "3,890",
    labeled: "3,721",
    labeledPct: "95.7%",
    size: "6.8 GB",
    created: "15 May 2024",
    status: "completed",
  },
  {
    id: "d4",
    thumb: "🍎",
    name: "Organic / Food Waste Dataset",
    desc: "Compostable fraction from markets & kitchens.",
    typeKey: "waste",
    images: "2,980",
    labeled: "2,601",
    labeledPct: "87.3%",
    size: "5.4 GB",
    created: "12 May 2024",
    status: "processing",
  },
  {
    id: "d5",
    thumb: "🥫",
    name: "Metal & Glass Mixed Dataset",
    desc: "Curbside capture — ongoing label review.",
    typeKey: "waste",
    images: "2,156",
    labeled: "1,988",
    labeledPct: "92.2%",
    size: "4.1 GB",
    created: "10 May 2024",
    status: "completed",
  },
  {
    id: "d6",
    thumb: "🗺️",
    name: "Meghalaya Tourist Spots Dataset",
    desc: "Corridor imagery from trails & viewpoints.",
    typeKey: "custom",
    images: "2,145",
    labeled: "1,487",
    labeledPct: "69.3%",
    size: "3.1 GB",
    created: "08 May 2024",
    status: "processing",
  },
  {
    id: "d7",
    thumb: "🏙️",
    name: "Urban Night Sweep Dataset",
    desc: "Low-light augmentation pack.",
    typeKey: "custom",
    images: "1,820",
    labeled: "1,654",
    labeledPct: "90.9%",
    size: "2.9 GB",
    created: "05 May 2024",
    status: "completed",
  },
  {
    id: "d8",
    thumb: "🌧️",
    name: "Monsoon Weather Augmentation",
    desc: "Rain streak & fog overlays.",
    typeKey: "custom",
    images: "1,402",
    labeled: "1,201",
    labeledPct: "85.7%",
    size: "2.2 GB",
    created: "02 May 2024",
    status: "processing",
  },
  {
    id: "d9",
    thumb: "📷",
    name: "Mobile Citizen Uploads",
    desc: "Crowdsourced validation queue.",
    typeKey: "recyclability",
    images: "980",
    labeled: "812",
    labeledPct: "82.9%",
    size: "1.6 GB",
    created: "28 Apr 2024",
    status: "processing",
  },
  {
    id: "d10",
    thumb: "🏫",
    name: "Schools Recycling Education Pack",
    typeKey: "recyclability",
    images: "756",
    labeled: "702",
    labeledPct: "92.9%",
    size: "1.1 GB",
    created: "22 Apr 2024",
    status: "completed",
  },
  {
    id: "d11",
    thumb: "🛣️",
    name: "Highway Corridor Litter Dataset",
    typeKey: "waste",
    images: "612",
    labeled: "540",
    labeledPct: "88.2%",
    size: "0.9 GB",
    created: "18 Apr 2024",
    status: "completed",
  },
  {
    id: "d12",
    thumb: "🔬",
    name: "Lab Controlled Capture Set",
    typeKey: "custom",
    images: "449",
    labeled: "421",
    labeledPct: "93.8%",
    size: "0.7 GB",
    created: "10 Apr 2024",
    status: "completed",
  },
];

const PAGE_SIZE = 6;

const TYPE_TAG = {
  waste: { label: "Waste Type", bg: "rgba(92,184,92,0.2)", color: "#bbf7d0", border: "rgba(92,184,92,0.45)" },
  recyclability: { label: "Recyclability", bg: "rgba(92,184,92,0.18)", color: "#86efac", border: "rgba(92,184,92,0.4)" },
  custom: { label: "Custom", bg: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "rgba(59,130,246,0.45)" },
};

const STATUS_TAG = {
  completed: { label: "Completed", bg: "rgba(92,184,92,0.18)", color: "#86efac" },
  processing: { label: "Processing", bg: "rgba(245,158,11,0.2)", color: "#fcd34d" },
};

export default function DatasetManagement() {
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (tab === "all") return DATASET_ROWS;
    if (tab === "waste") return DATASET_ROWS.filter((r) => r.typeKey === "waste");
    if (tab === "recyclability") return DATASET_ROWS.filter((r) => r.typeKey === "recyclability");
    if (tab === "custom") return DATASET_ROWS.filter((r) => r.typeKey === "custom");
    return DATASET_ROWS;
  }, [tab]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const donutData = useMemo(
    () => ({
      labels: TYPE_BREAKDOWN.map((x) => x.label),
      datasets: [
        {
          data: TYPE_BREAKDOWN.map((x) => x.pct),
          backgroundColor: TYPE_BREAKDOWN.map((x) => x.tone),
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
          labels: { color: "rgba(228,224,236,0.88)", boxWidth: 10, padding: 8, font: { size: 10 } },
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

  const growthData = useMemo(
    () => ({
      labels: ["Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024"],
      datasets: [
        {
          label: "Total Images",
          data: [8200, 10400, 12100, 14200, 16800, TOTAL_IMAGES],
          borderColor: "#5cb85c",
          backgroundColor: "rgba(92,184,92,0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const growthOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(228,224,236,0.6)", font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: {
            color: "rgba(228,224,236,0.6)",
            font: { size: 10 },
            callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    []
  );

  const barData = useMemo(
    () => ({
      labels: TYPE_BREAKDOWN.map((x) => x.label),
      datasets: [
        {
          label: "%",
          data: TYPE_BREAKDOWN.map((x) => x.pct),
          backgroundColor: TYPE_BREAKDOWN.map((x) => x.tone),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }),
    []
  );

  const barOpts = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          max: 40,
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(228,224,236,0.6)", font: { size: 10 }, callback: (v) => `${v}%` },
        },
        y: {
          grid: { display: false },
          ticks: { color: "rgba(228,224,236,0.88)", font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x}%`,
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

  const tabs = [
    ["all", "All Datasets"],
    ["waste", "Waste Type Datasets"],
    ["recyclability", "Recyclability Datasets"],
    ["custom", "Custom Datasets"],
  ];

  return (
    <div style={{ paddingBottom: 28 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 150px), 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {[
          ["Total Datasets", "12", "↑ 2 new this month", "📁"],
          ["Total Images", "18,542", "↑ 12.5% from last month", "🖼️"],
          ["Labeled Images", "16,230", "87.5% of total", "✅"],
          ["Unlabeled Images", "2,312", "12.5% of total", "◌"],
          ["Total Size", "34.6 GB", "↑ 8.3% from last month", "💾"],
        ].map(([title, val, sub, icon]) => (
          <div key={title} style={{ ...card, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: 11, color: title.includes("Unlabeled") ? t.textMuted : "#86efac", marginTop: 6 }}>{sub}</div>
              </div>
              <div style={{ fontSize: 26, opacity: 0.9 }}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr) minmax(260px, 1fr)",
          gap: 16,
          marginBottom: 22,
          alignItems: "stretch",
        }}
        className="dataset-mgmt-charts"
      >
        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Dataset Overview</div>
          <div style={{ height: 220, position: "relative" }}>
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
              <div style={{ fontSize: 16, fontWeight: 800 }}>{TOTAL_IMAGES.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>Total Images</div>
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Dataset Growth</span>
            <span style={{ fontSize: 11, color: t.textMuted }}>Last 6 Months</span>
          </div>
          <div style={{ height: 220 }}>
            <Line data={growthData} options={growthOpts} />
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Data Distribution by Type</div>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>
      </div>

      <div style={{ ...card }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${tab === key ? `rgba(${t.accentRgb}, 0.55)` : t.cardBorder}`,
                background: tab === key ? `rgba(${t.accentRgb}, 0.2)` : "transparent",
                color: tab === key ? "#fff" : t.textMuted,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setView("grid")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${view === "grid" ? `rgba(${t.accentRgb}, 0.5)` : t.cardBorder}`,
                background: view === "grid" ? `rgba(${t.accentRgb}, 0.15)` : "transparent",
                color: t.text,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
              }}
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${view === "list" ? `rgba(${t.accentRgb}, 0.5)` : t.cardBorder}`,
                background: view === "list" ? `rgba(${t.accentRgb}, 0.15)` : "transparent",
                color: t.text,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
              }}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${t.cardBorder}`,
                background: "rgba(255,255,255,0.06)",
                color: t.text,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Filter
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.textMuted }}>
              Sort By:
              <select
                defaultValue="latest"
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1px solid ${t.cardBorder}`,
                  background: "rgba(0,0,0,0.35)",
                  color: t.text,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="size">Size</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: t.textMuted, textAlign: "left" }}>
                <th style={{ padding: "12px 14px" }}>Dataset Name</th>
                <th style={{ padding: "12px 10px" }}>Type</th>
                <th style={{ padding: "12px 10px" }}>Images</th>
                <th style={{ padding: "12px 10px" }}>Labeled</th>
                <th style={{ padding: "12px 10px" }}>Size</th>
                <th style={{ padding: "12px 10px" }}>Created On</th>
                <th style={{ padding: "12px 10px" }}>Status</th>
                <th style={{ padding: "12px 14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => {
                const tt = TYPE_TAG[row.typeKey];
                const st = STATUS_TAG[row.status];
                const pctNum = parseFloat(String(row.labeledPct).replace(/%/g, ""));
                const labelColor = pctNum >= 90 ? "#86efac" : pctNum >= 75 ? "#fcd34d" : "#fca5a5";
                return (
                  <tr key={row.id} style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                    <td style={{ padding: "14px 14px", verticalAlign: "top" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{row.thumb}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{row.name}</div>
                          {row.desc && (
                            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, lineHeight: 1.4, maxWidth: 280 }}>{row.desc}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: tt.bg,
                          color: tt.color,
                          border: `1px solid ${tt.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tt.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 10px", fontWeight: 700, verticalAlign: "middle" }}>{row.images}</td>
                    <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                      <span style={{ fontWeight: 700, color: labelColor }}>
                        {row.labeled} ({row.labeledPct})
                      </span>
                    </td>
                    <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>{row.size}</td>
                    <td style={{ padding: "14px 10px", color: t.textMuted, verticalAlign: "middle" }}>{row.created}</td>
                    <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" style={actionBtn} title="View">
                          👁
                        </button>
                        <button type="button" style={actionBtn} title="Edit">
                          ✏️
                        </button>
                        <button type="button" style={{ ...actionBtn, color: "#fca5a5" }} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.cardBorder}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>
            Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} datasets
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" style={pageArrow} disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              ‹
            </button>
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
            <button
              type="button"
              style={pageArrow}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .dataset-mgmt-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const actionBtn = {
  border: `1px solid rgba(255,255,255,0.12)`,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 8,
  width: 34,
  height: 34,
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const pageArrow = {
  ...actionBtn,
  minWidth: 34,
  opacity: 1,
};

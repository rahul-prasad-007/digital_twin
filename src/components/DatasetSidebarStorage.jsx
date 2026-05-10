import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip);

export default function DatasetSidebarStorage() {
  const data = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [34, 16],
        backgroundColor: ["#5cb85c", "rgba(255,255,255,0.08)"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} GB`,
        },
      },
    },
  };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: t.card,
        border: `1px solid ${t.cardBorder}`,
        marginTop: 8,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 10 }}>Storage Overview</div>
      <div style={{ height: 120, position: "relative", marginBottom: 12 }}>
        <Doughnut data={data} options={options} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -52%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800 }}>68%</div>
          <div style={{ fontSize: 10, color: t.textMuted }}>Used</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, fontSize: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.textMuted }}>Total Storage</span>
          <strong>50 GB</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.textMuted }}>Used Storage</span>
          <strong style={{ color: "#86efac" }}>34 GB</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.textMuted }}>Free Storage</span>
          <strong>16 GB</strong>
        </div>
      </div>
      <button
        type="button"
        style={{
          width: "100%",
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg, #5cb85c, #449d44)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Upgrade Storage
      </button>
    </div>
  );
}

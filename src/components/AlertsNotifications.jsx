import { useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SEVERITY_STYLES = {
  critical: { label: "Critical", bg: "rgba(239,68,68,0.18)", color: "#ef4444", border: "rgba(239,68,68,0.45)" },
  high: { label: "High", bg: "rgba(249,115,22,0.18)", color: "#f97316", border: "rgba(249,115,22,0.45)" },
  medium: { label: "Medium", bg: "rgba(245,158,11,0.18)", color: "#f59e0b", border: "rgba(245,158,11,0.45)" },
  low: { label: "Low", bg: "rgba(16,185,129,0.18)", color: "#10b981", border: "rgba(16,185,129,0.45)" },
};

const STATUS_STYLES = {
  new: { label: "New", bg: "rgba(239,68,68,0.2)", color: "#fca5a5" },
  "in progress": { label: "In Progress", bg: "rgba(249,115,22,0.2)", color: "#fdba74" },
  acknowledged: { label: "Acknowledged", bg: "rgba(245,158,11,0.2)", color: "#fcd34d" },
  resolved: { label: "Resolved", bg: "rgba(92,184,92,0.2)", color: "#86efac" },
};

const ALL_ITEMS = [
  {
    id: "a1",
    kind: "alert",
    severity: "critical",
    title: "High Waste Accumulation Detected",
    desc: "Sensor cluster reports sustained fill above policy threshold.",
    location: "Nohkalikai Falls, Sohra",
    when: "8 min ago",
    status: "new",
    warn: true,
  },
  {
    id: "a2",
    kind: "alert",
    severity: "critical",
    title: "Route Delay — Collection Truck B",
    desc: "Vehicle stationary beyond SLA near market corridor.",
    location: "Police Bazar, Shillong",
    when: "22 min ago",
    status: "in progress",
    warn: true,
  },
  {
    id: "a3",
    kind: "alert",
    severity: "critical",
    title: "Landfill Capacity Warning",
    desc: "Projected capacity breach within 48h at designated cell.",
    location: "Umkseh landfill cell C",
    when: "41 min ago",
    status: "acknowledged",
    warn: true,
  },
  {
    id: "a4",
    kind: "alert",
    severity: "high",
    title: "Organic Waste Spike",
    desc: "Classification rate for organic waste exceeded rolling average.",
    location: "Jowai wholesale market",
    when: "1 h ago",
    status: "new",
    warn: true,
  },
  {
    id: "a5",
    kind: "alert",
    severity: "high",
    title: "Illegal Dumping Signal",
    desc: "Citizen reports clustered near tourist trailhead.",
    location: "Mawsmai Cave approach",
    when: "2 h ago",
    status: "in progress",
    warn: true,
  },
  {
    id: "a6",
    kind: "alert",
    severity: "high",
    title: "Sensor Offline Cluster",
    desc: "Three IoT bins not reporting — escalated to field ops.",
    location: "Tura ward 4",
    when: "3 h ago",
    status: "acknowledged",
    warn: true,
  },
  {
    id: "a7",
    kind: "alert",
    severity: "high",
    title: "Plastic Contamination Uptick",
    desc: "Batch QC flagged elevated mixed-plastic loads.",
    location: "Material recovery facility — Shillong",
    when: "4 h ago",
    status: "new",
    warn: true,
  },
  {
    id: "a8",
    kind: "alert",
    severity: "high",
    title: "Weekend Festival Waste Load",
    desc: "Predictive model expects +35% tonnage Saturday.",
    location: "Sohhra festival grounds",
    when: "5 h ago",
    status: "resolved",
    warn: true,
  },
  {
    id: "a9",
    kind: "alert",
    severity: "medium",
    title: "Bin Maintenance Due",
    desc: "Scheduled service window for compacting units.",
    location: "Laban depot ring",
    when: "6 h ago",
    status: "acknowledged",
    warn: true,
  },
  {
    id: "a10",
    kind: "alert",
    severity: "medium",
    title: "Weather Advisory — Heavy Rain",
    desc: "Increase slip risk at riverside collection points.",
    location: "Dawki riverfront",
    when: "7 h ago",
    status: "in progress",
    warn: true,
  },
  {
    id: "a11",
    kind: "alert",
    severity: "medium",
    title: "Dataset Drift Notice",
    desc: "Embedding shift detected on plastics subclass.",
    location: "ML pipeline — ViT head",
    when: "Yesterday",
    status: "new",
    warn: true,
  },
  {
    id: "a12",
    kind: "alert",
    severity: "low",
    title: "Routine Sweep Completed",
    desc: "Night sweep verified clear on assigned arc.",
    location: "Nongthymmai ward",
    when: "Yesterday",
    status: "resolved",
    warn: false,
  },
];

/** Full-width list when "Notifications" tab is selected (count matches TAB_COUNTS.notifications). */
const NOTIFICATION_ITEMS = [
  { id: "n1", title: "Dataset Update", desc: "New labeled samples ingested from East Khasi Hills.", location: "Data lake — batch 14", when: "09:12 AM", status: "resolved" },
  { id: "n2", title: "Weekly Report Generated", desc: "Executive PDF ready for stakeholder distribution.", location: "Reports service", when: "08:40 AM", status: "resolved" },
  { id: "n3", title: "Model Training Completed", desc: "ViT fine-tune job #482 finished within SLO.", location: "ML pipeline", when: "07:55 AM", status: "resolved" },
  { id: "n4", title: "New Location Added", desc: "Monitoring polygon registered — Mairang corridor.", location: "GIS registry", when: "Yesterday", status: "resolved" },
  { id: "n5", title: "API Key Rotation", desc: "Scheduled credential refresh for field collector app.", location: "Security", when: "Yesterday", status: "resolved" },
  { id: "n6", title: "Backup Completed", desc: "Nightly snapshot verified — checksum OK.", location: "Infrastructure", when: "Yesterday", status: "resolved" },
  { id: "n7", title: "Policy Acknowledgement", desc: "Operators confirmed updated SOP for monsoon season.", location: "Compliance", when: "2 days ago", status: "acknowledged" },
  { id: "n8", title: "Digest Email Sent", desc: "Weekly anomaly digest delivered to district leads.", location: "Notifications", when: "2 days ago", status: "resolved" },
  { id: "n9", title: "Integration Health", desc: "All webhook endpoints returned 200 in last 24h.", location: "Observability", when: "3 days ago", status: "resolved" },
];

const RECENT_STRIP = [
  { id: "r1", title: "Dataset Update", sub: "v1.3 samples merged", icon: "📦", when: "11:02 AM" },
  { id: "r2", title: "Weekly Report Generated", sub: "Distributed to stakeholders", icon: "📑", when: "08:55 AM" },
  { id: "r3", title: "Model Training Completed", sub: "Accuracy gate passed", icon: "⚙️", when: "Yesterday" },
  { id: "r4", title: "New Location Added", sub: "GIS layer synced", icon: "🗺️", when: "Yesterday" },
];

const TAB_COUNTS = {
  all: 12,
  critical: 3,
  high: 5,
  medium: 3,
  low: 1,
  notifications: 9,
};

const PAGE_SIZE = 7;

function ToggleRow({ label, on, onToggle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
      <span style={{ fontSize: 13, color: t.text }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onToggle(!on)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          border: "none",
          background: on ? "linear-gradient(135deg, #5cb85c, #449d44)" : "rgba(255,255,255,0.15)",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: on ? 22 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}

export default function AlertsNotifications() {
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [pushOn, setPushOn] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "notifications") {
      const base = NOTIFICATION_ITEMS.map((n) => ({
        id: n.id,
        kind: "notice",
        severity: "low",
        title: n.title,
        desc: n.desc,
        location: n.location,
        when: n.when,
        status: n.status,
        warn: false,
      }));
      return sortBy === "oldest" ? [...base].reverse() : base;
    }
    let list = ALL_ITEMS;
    if (tab === "critical") list = ALL_ITEMS.filter((x) => x.severity === "critical");
    else if (tab === "high") list = ALL_ITEMS.filter((x) => x.severity === "high");
    else if (tab === "medium") list = ALL_ITEMS.filter((x) => x.severity === "medium");
    else if (tab === "low") list = ALL_ITEMS.filter((x) => x.severity === "low");
    if (sortBy === "latest") return [...list].reverse();
    return list;
  }, [tab, sortBy]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const donutData = useMemo(
    () => ({
      labels: ["Critical", "High", "Medium", "Low", "Resolved"],
      datasets: [
        {
          data: [3, 5, 3, 1, 4],
          backgroundColor: ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#64748b"],
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
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "rgba(228,224,236,0.88)", boxWidth: 10, padding: 10, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
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
  };

  const tabs = [
    ["all", `All Alerts (${TAB_COUNTS.all})`],
    ["critical", `Critical (${TAB_COUNTS.critical})`],
    ["high", `High (${TAB_COUNTS.high})`],
    ["medium", `Medium (${TAB_COUNTS.medium})`],
    ["low", `Low (${TAB_COUNTS.low})`],
    ["notifications", `Notifications (${TAB_COUNTS.notifications})`],
  ];

  return (
    <div
      className="alerts-grid-main"
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 340px)", gap: 20, alignItems: "start", paddingBottom: 28 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${tab === key ? `rgba(${t.accentRgb}, 0.55)` : t.cardBorder}`,
                background: tab === key ? `rgba(${t.accentRgb}, 0.22)` : "rgba(0,0,0,0.25)",
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

        <div style={{ ...card, padding: "14px 16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
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
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: t.textMuted }}>
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
              </select>
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pageSlice.map((item) => {
              const sev = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low;
              const st = STATUS_STYLES[item.status] || STATUS_STYLES.new;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 14,
                    padding: "14px 12px",
                    borderTop: `1px solid ${t.cardBorder}`,
                  }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1, paddingTop: 2 }} aria-hidden>
                    {item.warn ? "⚠️" : "ℹ️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.45, marginBottom: 10 }}>{item.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: sev.bg,
                          color: sev.color,
                          border: `1px solid ${sev.border}`,
                        }}
                      >
                        {sev.label}
                      </span>
                      <span style={{ fontSize: 12, color: t.textMuted }}>{item.location}</span>
                      <span style={{ fontSize: 12, color: t.textMuted }}>·</span>
                      <span style={{ fontSize: 12, color: t.textMuted }}>{item.when}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: st.bg,
                          color: st.color,
                          marginLeft: 4,
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open details"
                    style={{
                      alignSelf: "center",
                      border: `1px solid ${t.cardBorder}`,
                      background: "rgba(255,255,255,0.05)",
                      color: t.textMuted,
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${t.cardBorder}` }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, totalFiltered)} of {totalFiltered}{" "}
              {tab === "notifications" ? "notifications" : "alerts"}
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
                    background: p === safePage ? `rgba(${t.accentRgb}, 0.25)` : "transparent",
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

        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Recent Notifications</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
            {RECENT_STRIP.map((r) => (
              <div key={r.id} style={{ ...card, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24 }} aria-hidden>
                  {r.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4, lineHeight: 1.4 }}>{r.sub}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>{r.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 12 }}>
        <div style={{ ...card, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800 }}>Alert Summary</h3>
          <div style={{ height: 200, position: "relative" }}>
            <Doughnut data={donutData} options={donutOpts} />
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
            Distribution across open tickets and resolved closures this period.
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Quick Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Critical Alerts", "3", "#ef4444"],
              ["High Priority", "5", "#f97316"],
              ["Medium Priority", "3", "#f59e0b"],
              ["Resolved", "4", "#10b981"],
            ].map(([label, val, tone]) => (
              <div key={label} style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.28)", border: `1px solid ${t.cardBorder}` }}>
                <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: tone }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "8px 16px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: 13, padding: "8px 0 4px" }}>Notification Settings</div>
          <ToggleRow label="Email" on={emailOn} onToggle={setEmailOn} />
          <ToggleRow label="SMS" on={smsOn} onToggle={setSmsOn} />
          <ToggleRow label="Push Notifications" on={pushOn} onToggle={setPushOn} />
          <ToggleRow label="Critical Alerts Only" on={criticalOnly} onToggle={setCriticalOnly} />
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Emergency Contacts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Waste Management", "+91 364 222 4100"],
              ["Tourism", "+91 364 250 1244"],
              ["Environmental Control Board", "+91 364 222 0189"],
            ].map(([dept, phone]) => (
              <div key={dept} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{dept}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{phone}</div>
                </div>
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 20, textDecoration: "none" }} aria-label={`Call ${dept}`}>
                  📞
                </a>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1060px) {
          .alerts-grid-main { grid-template-columns: 1fr !important; }
          .alerts-grid-main aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}

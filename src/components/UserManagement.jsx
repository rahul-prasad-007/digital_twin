import { useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { portal as t } from "./portal/portalTheme.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const card = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 14,
};

const KPI = [
  { label: "Total Users", value: 48, trend: "+12.5%", icon: "👥", tone: "#5cb85c" },
  { label: "Active Users", value: 38, trend: "+8.2%", icon: "✓", tone: "#5cb85c" },
  { label: "Administrators", value: 6, trend: "+0%", icon: "⚡", tone: "#3b82f6" },
  { label: "Data Entry Users", value: 24, trend: "+4.1%", icon: "📝", tone: "#f97316" },
  { label: "View Only Users", value: 18, trend: "+2.0%", icon: "👁", tone: "#14b8a6" },
];

const DEPTS = ["IT & Systems", "Urban Waste", "Field Ops", "Planning", "Tourism Corridor", "Finance"];
const ROLE_CYCLE = ["Super Admin", "Administrator", "Data Entry", "Viewer", "Data Entry", "Viewer", "Administrator"];

const MOCK_USERS = Array.from({ length: 48 }, (_, i) => {
  const id = i + 1;
  const inactive = id % 11 === 0;
  return {
    id,
    name: id === 1 ? "Admin User" : `Portal User ${String(id).padStart(2, "0")}`,
    email: id === 1 ? "admin@meghalaya.portal" : `user.${id}@meghalaya.portal`,
    role: id === 1 ? "Super Admin" : ROLE_CYCLE[i % ROLE_CYCLE.length],
    department: DEPTS[i % DEPTS.length],
    status: inactive ? "Inactive" : "Active",
    lastLogin: inactive ? "Apr 2026" : id % 3 === 0 ? "Today" : id % 2 === 0 ? "Yesterday" : "May 2026",
  };
});

const ACTIVITIES = [
  { id: 1, icon: "➕", color: "#5cb85c", text: "New user 'Rohan Sharma' added", time: "32 min ago" },
  { id: 2, icon: "✎", color: "#5cb85c", text: "Role updated for Ibashisha Lyngdoh", time: "2 h ago" },
  { id: 3, icon: "🔑", color: "#3b82f6", text: "Password reset requested — Jason Khonglah", time: "5 h ago" },
  { id: 4, icon: "🚫", color: "#ef4444", text: "Account deactivated — Kevin Laloo", time: "Yesterday" },
];

function roleBadge(role) {
  const map = {
    "Super Admin": { bg: "rgba(92,184,92,0.22)", border: "rgba(92,184,92,0.45)", color: "#bbf7d0" },
    Administrator: { bg: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.45)", color: "#bfdbfe" },
    "Data Entry": { bg: "rgba(249,115,22,0.18)", border: "rgba(249,115,22,0.4)", color: "#fdba74" },
    Viewer: { bg: "rgba(20,184,166,0.18)", border: "rgba(20,184,166,0.4)", color: "#5eead4" },
  };
  const s = map[role] || map.Viewer;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}
    >
      {role}
    </span>
  );
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchR = roleFilter === "all" || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage);

  const doughnutData = {
    labels: ["Super Admin", "Administrator", "Data Entry", "Viewer"],
    datasets: [
      {
        data: [6, 6, 24, 12],
        backgroundColor: ["#5cb85c", "#3b82f6", "#f97316", "#14b8a6"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "rgba(228,224,236,0.85)", boxWidth: 12, padding: 12, font: { size: 11 } },
      },
    },
    cutout: "62%",
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active sessions",
        data: [28, 31, 29, 34, 36, 33, 38],
        fill: true,
        borderColor: "#5cb85c",
        backgroundColor: "rgba(92,184,92,0.15)",
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#5cb85c",
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: t.textMuted, font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.06)" } },
      y: {
        beginAtZero: true,
        ticks: { color: t.textMuted, font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  const inputStyle = {
    padding: "11px 14px",
    borderRadius: 10,
    border: `1px solid rgba(255,255,255,0.12)`,
    background: "rgba(0,0,0,0.35)",
    color: t.text,
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <input
          type="search"
          placeholder="Search users…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, maxWidth: 420 }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {KPI.map((k) => (
          <div key={k.label} style={{ ...card, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.green }}>{k.trend}</span>
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.tone }}>{k.value}</div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>vs last month</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ ...card, padding: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>All Users</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: `1px solid ${t.cardBorder}`,
                    background: "rgba(255,255,255,0.06)",
                    color: t.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Filter
                </button>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  style={{ ...inputStyle, width: "auto", minWidth: 140, cursor: "pointer" }}
                >
                  <option value="all">All roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button
                  type="button"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: `linear-gradient(135deg, ${t.accent}, #9333ea)`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  + Add New User
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: t.textMuted, fontSize: 11, borderBottom: `1px solid ${t.cardBorder}` }}>
                    <th style={{ padding: "10px 8px" }}>User</th>
                    <th style={{ padding: "10px 8px" }}>Email</th>
                    <th style={{ padding: "10px 8px" }}>Role</th>
                    <th style={{ padding: "10px 8px" }}>Department</th>
                    <th style={{ padding: "10px 8px" }}>Status</th>
                    <th style={{ padding: "10px 8px" }}>Last Login</th>
                    <th style={{ padding: "10px 8px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #5cb85c, #449d44)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {u.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", color: t.textMuted }}>{u.email}</td>
                      <td style={{ padding: "12px 8px" }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: "12px 8px", color: t.textMuted }}>{u.department}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            background: u.status === "Active" ? "rgba(92,184,92,0.2)" : "rgba(239,68,68,0.18)",
                            color: u.status === "Active" ? t.green : t.red,
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", color: t.textMuted, fontSize: 12 }}>{u.lastLogin}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, marginLeft: 6 }} title="View">
                          👁
                        </button>
                        <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, marginLeft: 6 }} title="Edit">
                          ✎
                        </button>
                        <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, marginLeft: 6 }} title="Delete">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16, fontSize: 12, color: t.textMuted }}>
              <span>
                {filtered.length === 0
                  ? "No users match your filters."
                  : `Showing ${(pageSafe - 1) * perPage + 1} to ${Math.min(pageSafe * perPage, filtered.length)} of ${filtered.length} users`}
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    style={{
                      minWidth: 32,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: n === pageSafe ? `1px solid rgba(92,184,92,0.55)` : `1px solid ${t.cardBorder}`,
                      background: n === pageSafe ? "rgba(92,184,92,0.22)" : "transparent",
                      color: t.text,
                      cursor: "pointer",
                      fontWeight: n === pageSafe ? 700 : 500,
                      fontSize: 13,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800 }}>User Roles</h3>
            <div style={{ height: 220, position: "relative" }}>
              <Doughnut data={doughnutData} options={doughnutOpts} />
            </div>
          </div>

          <div style={{ ...card, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Active Users</h3>
              <span style={{ fontSize: 11, color: t.textMuted }}>Last 7 days</span>
            </div>
            <div style={{ height: 200, position: "relative" }}>
              <Line data={lineData} options={lineOpts} />
            </div>
          </div>

          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800 }}>Recent User Activities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ACTIVITIES.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.45 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

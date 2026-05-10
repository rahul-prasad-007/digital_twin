import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { portal as t } from "./portal/portalTheme.js";

const card = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 14,
  padding: 22,
};

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8 };
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1px solid rgba(255,255,255,0.12)`,
  background: "rgba(0,0,0,0.35)",
  color: t.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const tabs = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "system", label: "System" },
  { id: "integrations", label: "Integrations" },
  { id: "backup", label: "Backup" },
  { id: "appearance", label: "Appearance" },
];

function Toggle({ checked, onChange, label, noBorder }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 12,
        padding: "12px 0",
        border: "none",
        borderBottom: noBorder ? "none" : `1px solid ${t.cardBorder}`,
        background: "transparent",
        cursor: "pointer",
        color: t.text,
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          background: checked ? "rgba(92,184,92,0.85)" : "rgba(255,255,255,0.15)",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 22 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            transition: "left 0.2s",
          }}
        />
      </span>
    </button>
  );
}

function Btn({ children, variant = "outline" }) {
  const isSolid = variant === "solid";
  return (
    <button
      type="button"
      style={{
        padding: "10px 18px",
        borderRadius: 10,
        border: isSolid ? "none" : `1px solid rgba(92,184,92,0.55)`,
        background: isSolid ? `linear-gradient(135deg, ${t.accent}, #9333ea)` : "transparent",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      ✓ {children}
    </button>
  );
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = tabs.some((x) => x.id === tabParam) ? tabParam : "general";

  const goTab = (id) => setSearchParams({ tab: id });

  const [portalName, setPortalName] = useState("Meghalaya Smart Waste Portal");
  const [tagline, setTagline] = useState("AI-Powered Waste Intelligence");
  const [language, setLanguage] = useState("en");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [dateFmt, setDateFmt] = useState("DD/MM/YYYY");
  const [timeFmt, setTimeFmt] = useState("24h");

  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [compact, setCompact] = useState(false);
  const [confirmDel, setConfirmDel] = useState(true);

  const [storagePath, setStoragePath] = useState("D:\\Data\\MeghalayaWaste");
  const [maxMb, setMaxMb] = useState("25");
  const [retention, setRetention] = useState("90");

  const [smtpHost, setSmtpHost] = useState("smtp.example.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("noreply@meghalaya.gov.in");
  const [smtpSecure, setSmtpSecure] = useState(true);

  return (
    <div style={{ paddingBottom: 28 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 22,
          borderBottom: `1px solid ${t.cardBorder}`,
          paddingBottom: 4,
        }}
      >
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => goTab(x.id)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: tab === x.id ? `1px solid rgba(92,184,92,0.55)` : "1px solid transparent",
              background: tab === x.id ? "rgba(92,184,92,0.22)" : "transparent",
              color: tab === x.id ? "#fff" : t.textMuted,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          {tab === "general" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
                <div style={card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800 }}>General Settings</h3>
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Portal Name</label>
                      <input style={inputStyle} value={portalName} onChange={(e) => setPortalName(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Portal Tagline</label>
                      <input style={inputStyle} value={tagline} onChange={(e) => setTagline(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Default Language</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="kha">Khasi</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Time Zone</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={tz} onChange={(e) => setTz(e.target.value)}>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Date Format</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={dateFmt} onChange={(e) => setDateFmt(e.target.value)}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Time Format</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={timeFmt} onChange={(e) => setTimeFmt(e.target.value)}>
                        <option value="24h">24-hour</option>
                        <option value="12h">12-hour</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    <Btn>Save Changes</Btn>
                  </div>
                </div>

                <div style={card}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>System Preferences</h3>
                  <Toggle label="Enable Dark Mode" checked={darkMode} onChange={setDarkMode} />
                  <Toggle label="Auto Refresh Dashboard" checked={autoRefresh} onChange={setAutoRefresh} />
                  <Toggle label="Show System Announcements" checked={announcements} onChange={setAnnouncements} />
                  <Toggle label="Compact Mode" checked={compact} onChange={setCompact} />
                  <Toggle label="Confirm Before Delete" checked={confirmDel} onChange={setConfirmDel} noBorder />
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <Btn>Save Preferences</Btn>
                  </div>
                </div>

                <div style={card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800 }}>Data &amp; Storage</h3>
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Dataset Storage Path</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input style={{ ...inputStyle, flex: 1 }} value={storagePath} onChange={(e) => setStoragePath(e.target.value)} />
                        <button
                          type="button"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: `1px solid ${t.cardBorder}`,
                            background: "rgba(255,255,255,0.06)",
                            color: t.text,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Browse
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Max File Upload Size (MB)</label>
                      <input style={inputStyle} value={maxMb} onChange={(e) => setMaxMb(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Allowed File Types</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["JPG", "JPEG", "PNG"].map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              background: "rgba(92,184,92,0.15)",
                              border: `1px solid rgba(92,184,92,0.35)`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Data Retention Period (days)</label>
                      <input style={inputStyle} value={retention} onChange={(e) => setRetention(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    <Btn>Save Data Settings</Btn>
                  </div>
                </div>

                <div style={card}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800 }}>Email Configuration</h3>
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>SMTP Host</label>
                      <input style={inputStyle} value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Port</label>
                      <input style={inputStyle} value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input style={inputStyle} value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Password</label>
                      <input style={inputStyle} type="password" placeholder="••••••••" autoComplete="off" readOnly />
                    </div>
                    <Toggle label="Secure Connection (TLS/SSL)" checked={smtpSecure} onChange={setSmtpSecure} noBorder />
                  </div>
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    <Btn>Save Email Settings</Btn>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab !== "general" && (
            <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
              <p style={{ margin: 0, color: t.textMuted, fontSize: 14 }}>
                <strong style={{ color: t.text }}>{tabs.find((x) => x.id === tab)?.label}</strong> settings will mirror the same layout as General — forms coming in the next iteration.
              </p>
            </div>
          )}
        </div>

        <aside style={{ flex: "0 1 340px", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Account Information</h3>
            <dl style={{ margin: 0, display: "grid", gap: 12, fontSize: 13 }}>
              {[
                ["Full Name", "Admin User"],
                ["Email", "admin@meghalaya.portal"],
                ["Role", "Super Administrator", "tag"],
                ["Department", "Urban Waste Ops"],
                ["Last Login", "Today, 09:42 AM"],
              ].map(([k, v, type]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <dt style={{ margin: 0, color: t.textMuted }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 600, textAlign: "right" }}>
                    {type === "tag" ? (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          background: "rgba(92,184,92,0.25)",
                          border: `1px solid rgba(92,184,92,0.45)`,
                          color: "#bbf7d0",
                        }}
                      >
                        {v}
                      </span>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div style={{ marginTop: 18 }}>
              <Btn variant="solid">Edit Profile</Btn>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>System Information</h3>
            <dl style={{ margin: 0, display: "grid", gap: 12, fontSize: 13 }}>
              {[
                ["Portal Version", "2.4.1"],
                ["AI Model Version", "ViT-B/16"],
                ["Database Version", "PostgreSQL 15"],
                ["Last System Update", "12 May 2026"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ margin: 0, color: t.textMuted }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>{v}</dd>
                </div>
              ))}
            </dl>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.green, boxShadow: `0 0 10px ${t.green}` }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>All Systems Operational</span>
            </div>
          </div>

          <div
            style={{
              ...card,
              border: `1px solid rgba(239, 68, 68, 0.45)`,
              background: "rgba(239, 68, 68, 0.06)",
            }}
          >
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#fca5a5" }}>Danger Zone</h3>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
              Destructive actions cannot always be undone. Proceed with caution.
            </p>
            {[
              ["Clear Cache", "🗑️"],
              ["Reset All Settings", "↻"],
              ["Delete All Data", "✕"],
            ].map(([label, icon]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid rgba(239,68,68,0.15)`,
                }}
              >
                <span style={{ fontSize: 13 }}>{label}</span>
                <button
                  type="button"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.5)",
                    background: "rgba(239,68,68,0.15)",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  aria-label={label}
                >
                  {icon}
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

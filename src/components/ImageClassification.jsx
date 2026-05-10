import { useCallback, useRef, useState } from "react";
import { portal as t } from "./portal/portalTheme.js";

const cardBase = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  overflow: "hidden",
};

const MOCK_RESULT = {
  predictedClass: "Plastic Bottle",
  category: "Recyclable",
  confidence: 94.32,
  model: "Vision Transformer (ViT)",
  wasteType: "Plastic",
  material: "Polyethylene (PET)",
  recyclable: "Yes",
  decomposition: "450–1000 years",
  impact: "High",
  impactTone: "bad",
  disposal: "Recycle in plastic bin",
  probs: [
    { label: "Plastic Bottle", pct: 94.32 },
    { label: "Plastic Wrapper", pct: 3.25 },
    { label: "Plastic Container", pct: 1.45 },
    { label: "Glass Bottle", pct: 0.62 },
    { label: "Metal Can", pct: 0.36 },
  ],
};

const RECENT = [
  { id: 1, label: "Chip Packet", rec: false, conf: 88.2, time: "10:12 AM" },
  { id: 2, label: "Paper Cup", rec: true, conf: 91.0, time: "09:47 AM" },
  { id: 3, label: "Plastic Bottle", rec: true, conf: 94.3, time: "09:15 AM" },
  { id: 4, label: "Organic Peel", rec: true, conf: 87.5, time: "Yesterday" },
];

export default function ImageClassification() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);

  const revoke = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const onFile = (fileList) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    revoke();
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setResult(null);
  };

  const clearImage = () => {
    revoke();
    setPreview(null);
    setFileName("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const classify = () => {
    if (!preview) return;
    setResult(MOCK_RESULT);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        {/* Upload */}
        <div style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Upload Waste Image</h3>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files)} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              flex: 1,
              minHeight: 180,
              borderRadius: 14,
              border: `2px dashed ${t.accentMuted}`,
              background: `rgba(${t.accentRgb}, 0.08)`,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: t.textMuted,
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 36 }}>☁️</span>
            <span>Drag & drop or browse</span>
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${t.accent}, #9333ea)`,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Browse Image
          </button>
          <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
            <strong style={{ color: t.text }}>Tips:</strong> use good lighting, center the object, avoid heavy blur.
          </div>
        </div>

        {/* Preview */}
        <div style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 12, minHeight: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Image Preview</h3>
            {preview && (
              <button
                type="button"
                onClick={clearImage}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: `1px solid ${t.cardBorder}`,
                  background: "rgba(255,255,255,0.06)",
                  color: t.text,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear Image
              </button>
            )}
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 12,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              minHeight: 200,
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }} />
            ) : (
              <span style={{ color: t.textMuted, fontSize: 13 }}>No image selected</span>
            )}
          </div>
          <button
            type="button"
            onClick={classify}
            disabled={!preview}
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              border: "none",
              background: preview ? `linear-gradient(135deg, ${t.accent}, #9333ea)` : "rgba(255,255,255,0.1)",
              color: preview ? "#fff" : t.textMuted,
              fontWeight: 800,
              fontSize: 15,
              cursor: preview ? "pointer" : "not-allowed",
            }}
          >
            Classify Waste
          </button>
          {fileName ? <div style={{ fontSize: 11, color: t.textMuted }}>{fileName}</div> : null}
        </div>

        {/* Result */}
        <div style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Classification Result</h3>
          {!result ? (
            <p style={{ margin: 0, fontSize: 13, color: t.textMuted }}>Run classification to see predicted class and confidence.</p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>🧴</span>
                <div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>Predicted Class</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>{result.predictedClass}</div>
                </div>
              </div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(92, 184, 92, 0.2)",
                    color: t.green,
                  }}
                >
                  {result.category}
                </span>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: t.textMuted }}>Confidence</span>
                  <strong>{result.confidence}%</strong>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${result.confidence}%`, height: "100%", background: `linear-gradient(90deg, ${t.accentSecondary}, ${t.accent})` }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                AI Model: <strong style={{ color: t.text }}>{result.model}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18 }}>
          <div style={{ ...cardBase, padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Waste Details</h3>
            <dl style={{ margin: 0, display: "grid", gap: 10, fontSize: 13 }}>
              {[
                ["Waste Type", result.wasteType],
                ["Material", result.material],
                ["Recyclable", result.recyclable, t.green],
                ["Decomposition Time", result.decomposition],
                ["Environmental Impact", result.impact, result.impactTone === "bad" ? t.red : t.text],
                ["Proper Disposal", result.disposal],
              ].map(([k, v, col]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${t.cardBorder}`, paddingBottom: 8 }}>
                  <dt style={{ color: t.textMuted, margin: 0 }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 600, color: col || t.text }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={{ ...cardBase, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Classification Probabilities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.probs.map((row) => (
                <div key={row.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>{row.label}</span>
                    <span style={{ fontWeight: 700, color: t.accent }}>{row.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ width: `${row.pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${t.accentSecondary}, ${t.accent})` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ ...cardBase, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Recent Classifications</h3>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }}>
          {RECENT.map((r) => (
            <div
              key={r.id}
              style={{
                flex: "0 0 160px",
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              <div style={{ height: 72, borderRadius: 10, background: `rgba(${t.accentRgb}, 0.15)`, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                📷
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.label}</div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: r.rec ? "rgba(92,184,92,0.2)" : "rgba(239,68,68,0.2)",
                  color: r.rec ? t.green : t.red,
                }}
              >
                {r.rec ? "Recyclable" : "Non-Recyclable"}
              </span>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
                {r.conf}% · {r.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

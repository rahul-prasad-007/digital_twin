/** Base URL for Flask API (empty in dev → same-origin + Vite proxy). Set VITE_API_URL when packaging Electron. */
const raw = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!raw) return p;
  return `${String(raw).replace(/\/$/, "")}${p}`;
}

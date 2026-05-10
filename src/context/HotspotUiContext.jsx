import { createContext, useContext, useMemo, useState } from "react";

const HotspotUiContext = createContext(null);

export function HotspotUiProvider({ children }) {
  const [mapMode, setMapMode] = useState("heatmap");
  const value = useMemo(() => ({ mapMode, setMapMode }), [mapMode]);
  return <HotspotUiContext.Provider value={value}>{children}</HotspotUiContext.Provider>;
}

export function useHotspotUiOptional() {
  return useContext(HotspotUiContext);
}

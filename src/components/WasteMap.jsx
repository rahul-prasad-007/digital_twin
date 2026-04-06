import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import GeocoderControl from "leaflet-control-geocoder";
import { getColor, popupHtml } from "../utils/binHelpers.js";
import { blockedAreas } from "../utils/routeHelpers.js";

const mapContainer = {
  height: "100vh",
  width: "100%",
};

export default function WasteMap({ bins, routeData, depots, selectedDepot }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const routeMarkersRef = useRef([]);
  const blockedLayersRef = useRef([]);
  const depotMarkersRef = useRef([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [selectedDepot.lat, selectedDepot.lng],
      zoom: 10,
      minZoom: 9,
      maxBounds: [
        [25.0, 90.8],
        [26.2, 92.5],
      ],
    });

    mapRef.current = map;

    new GeocoderControl({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", (e) => {
        const bbox = e.geocode.bbox;
        const bounds = L.latLngBounds(bbox);
        map.fitBounds(bounds);
      })
      .addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    depotMarkersRef.current = depots.map((depot) => {
      const isSelected = depot.name === selectedDepot.name;
      const marker = L.marker([depot.lat, depot.lng], {
        icon: L.divIcon({
          className: "depot-marker",
          html: `<div style="background:${isSelected ? '#5c3cff' : '#888'};color:#fff;padding:8px 12px;border-radius:14px;box-shadow:0 0 18px rgba(92,60,255,0.35);font-weight:700;font-size:0.9rem;border:2px solid #fff;text-align:center;min-width:120px;">🏠 ${depot.name}</div>`,
        }),
      }).addTo(map);
      marker.bindPopup(`<b>${depot.name}</b><br>${depot.address}<br>Region: ${depot.region}`);
      return marker;
    });

    blockedLayersRef.current = blockedAreas.map((block) =>
      L.circle([block.lat, block.lng], {
        radius: block.radiusDeg * 111000,
        weight: 2,
        color: "#ff4d4d",
        fillColor: "#ff4d4d",
        fillOpacity: 0.16,
        dashArray: "8,8",
      }).addTo(map)
    );

    markersRef.current = bins.map((bin) => {
      const marker = L.circleMarker([bin.lat, bin.lng], {
        color: getColor(bin.fill),
        radius: 10,
      }).addTo(map);
      marker.bindPopup(popupHtml(bin));
      return marker;
    });

    const t = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(t);
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      routeRef.current = null;
      routeMarkersRef.current = [];
      blockedLayersRef.current = [];
      depotMarkersRef.current = [];
    };
  }, [selectedDepot, depots]);

  useEffect(() => {
    const markers = markersRef.current;
    if (!markers.length) return;
    bins.forEach((bin, i) => {
      const m = markers[i];
      if (m) {
        m.setStyle({ color: getColor(bin.fill) });
        m.setPopupContent(popupHtml(bin));
      }
    });
    mapRef.current?.invalidateSize();
  }, [bins]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    routeMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    routeMarkersRef.current = [];

    if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) return;

    routeRef.current = L.polyline(routeData.coordinates.map(([lng, lat]) => [lat, lng]), {
      color: "#7e4bff",
      weight: 5,
      opacity: 0.95,
    }).addTo(map);

    routeData.bins.forEach((bin, index) => {
      const marker = L.circleMarker([bin.lat, bin.lng], {
        color: "#7e4bff",
        fillColor: "#d4c7ff",
        fillOpacity: 0.9,
        radius: 9,
        weight: 2,
      }).addTo(map);
      marker.bindTooltip(`${index + 1}. ${bin.name}`, {
        permanent: true,
        direction: "top",
        className: "route-tooltip",
      });
      routeMarkersRef.current.push(marker);
    });

    map.fitBounds(L.latLngBounds(routeData.coordinates.map(([lng, lat]) => [lat, lng])), {
      padding: [50, 50],
    });
  }, [routeData]);

  return <div ref={containerRef} style={mapContainer} />;
}

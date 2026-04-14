import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import GeocoderControl from "leaflet-control-geocoder";
import { getColor, popupHtml } from "../utils/binHelpers.js";
import { blockedAreas } from "../utils/routeHelpers.js";

const mapContainer = {
  height: "100%",
  width: "100%",
};

export default function WasteMap({ bins, routeData, depots, selectedDepot, citizenReports = [], onLocationClick = ()=>{} }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const routeMarkersRef = useRef([]);
  const blockedLayersRef = useRef([]);
  const depotMarkersRef = useRef([]);
  const truckMarkerRef = useRef(null);
  const truckAnimationRef = useRef(null);
  const reportMarkersRef = useRef([]);

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
        color: bin.isOnline ? getColor(bin.fill) : "#666",
        radius: bin.isOnline ? 10 : 8,
        fillOpacity: bin.isOnline ? 0.8 : 0.4,
        weight: bin.isOnline ? 2 : 1,
      }).addTo(map);
      marker.bindPopup(popupHtml(bin));
      return marker;
    });

    map.on("click", (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
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
      reportMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      reportMarkersRef.current = [];
      if (truckAnimationRef.current) {
        window.clearInterval(truckAnimationRef.current);
        truckAnimationRef.current = null;
      }
      if (truckMarkerRef.current) {
        truckMarkerRef.current.remove();
        truckMarkerRef.current = null;
      }
    };
  }, [selectedDepot, depots]);

  useEffect(() => {
    const markers = markersRef.current;
    if (!markers.length) return;
    bins.forEach((bin, i) => {
      const m = markers[i];
      if (m) {
        m.setStyle({
          color: bin.isOnline ? getColor(bin.fill) : "#666",
          radius: bin.isOnline ? 10 : 8,
          fillOpacity: bin.isOnline ? 0.8 : 0.4,
          weight: bin.isOnline ? 2 : 1,
        });
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

    if (truckAnimationRef.current) {
      window.clearInterval(truckAnimationRef.current);
      truckAnimationRef.current = null;
    }
    if (truckMarkerRef.current) {
      truckMarkerRef.current.remove();
      truckMarkerRef.current = null;
    }

    if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) return;

    const routeCoords = routeData.coordinates.map(([lng, lat]) => [lat, lng]);

    routeRef.current = L.polyline(routeCoords, {
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

    const truckIcon = L.divIcon({
      className: "truck-marker",
      html: `<div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#3fd3ff,#8d5fff);box-shadow:0 16px 30px rgba(0,0,0,0.28);color:#fff;font-size:1.2rem;">🚚</div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    truckMarkerRef.current = L.marker(routeCoords[0], {
      icon: truckIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    let currentStep = 0;
    truckAnimationRef.current = window.setInterval(() => {
      currentStep += 1;
      if (currentStep >= routeCoords.length) {
        currentStep = 0;
      }
      truckMarkerRef.current?.setLatLng(routeCoords[currentStep]);
    }, 700);

    map.fitBounds(L.latLngBounds(routeCoords), {
      padding: [50, 50],
    });
  }, [routeData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    reportMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    reportMarkersRef.current = [];

    citizenReports.forEach((report) => {
      const icon = L.divIcon({
        className: "report-marker",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${report.type === "Overflow" ? "linear-gradient(135deg,#ff6b6b,#ff8787)" : "linear-gradient(135deg,#ffd166,#ffb84d)"};box-shadow:0 12px 24px rgba(0,0,0,0.3);color:#fff;font-size:1.1rem;border:3px solid #fff;">${report.type === "Overflow" ? "🚨" : "🧹"}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([report.location.lat, report.location.lng], {
        icon,
        zIndexOffset: 500,
      }).addTo(map);

      marker.bindPopup(
        `<b>${report.type}</b><br>Reported: ${report.timestamp.toLocaleTimeString()}<br>Status: ${report.status}`
      );

      reportMarkersRef.current.push(marker);
    });
  }, [citizenReports]);

  return <div ref={containerRef} style={mapContainer} />;
}

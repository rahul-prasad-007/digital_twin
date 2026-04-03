var map = null;
var binMarkers = [];

function getColor(fill) {
    if (fill < 40) return "green";
    if (fill < 80) return "orange";
    return "red";
}

function getStatus(fill) {
    if (fill < 40) return "Empty";
    if (fill < 80) return "Moderate";
    if (fill < 100) return "Almost Full";
    return "CRITICAL - Needs Immediate Pickup!";
}

function invalidateMapSize() {
    if (map) {
        map.invalidateSize();
    }
}

function popupHtml(bin) {
    return (
        "<b>" +
        bin.name +
        "</b><br>Fill Level: " +
        bin.fill +
        "%<br>Status: " +
        getStatus(bin.fill)
    );
}

function updateBins() {
    bins.forEach(function (bin, i) {
        var change = Math.floor(Math.random() * 10);
        bin.fill = Math.min(100, bin.fill + change);
        var marker = binMarkers[i];
        if (marker) {
            marker.setStyle({ color: getColor(bin.fill) });
            marker.setPopupContent(popupHtml(bin));
        }
    });

    if (typeof refreshChartAndStats === "function") {
        refreshChartAndStats();
    }
}

function initMap() {
    binMarkers = [];

    map = L.map("map", {
        center: [25.5788, 91.8933],
        zoom: 10,
        minZoom: 9,
        maxBounds: [
            [25.0, 90.8],
            [26.2, 92.5],
        ],
    });

    L.Control.geocoder({
        defaultMarkGeocode: false,
    }).on("markgeocode", function (e) {
        var bbox = e.geocode.bbox;
        var bounds = L.latLngBounds(bbox);
        map.fitBounds(bounds);
    }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    bins.forEach(function (bin) {
        var color = getColor(bin.fill);
        var marker = L.circleMarker([bin.lat, bin.lng], {
            color: color,
            radius: 10,
        }).addTo(map);

        marker.bindPopup(popupHtml(bin));
        binMarkers.push(marker);
    });

    setInterval(updateBins, 5000);

    setTimeout(invalidateMapSize, 0);
}

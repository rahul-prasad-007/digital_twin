var appInitialized = false;

function login() {
    var u = document.getElementById("user").value;
    var p = document.getElementById("pass").value;

    if (u === "admin" && p === "1234") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("mainApp").style.display = "block";

        if (!appInitialized) {
            appInitialized = true;
            if (typeof initChartAndStats === "function") {
                initChartAndStats();
            }
            if (typeof initMap === "function") {
                initMap();
            }
        } else if (typeof invalidateMapSize === "function") {
            invalidateMapSize();
        }
    } else {
        alert("Invalid login!");
    }
}

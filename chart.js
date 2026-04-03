var binChart = null;

function countBinCategories() {
    var empty = 0;
    var moderate = 0;
    var fullBins = 0;
    bins.forEach(function (bin) {
        if (bin.fill < 40) empty++;
        else if (bin.fill < 80) moderate++;
        else fullBins++;
    });
    return { empty: empty, moderate: moderate, fullBins: fullBins };
}

function initChartAndStats() {
    var total = bins.length;
    var full = 0;
    var critical = 0;

    bins.forEach(function (bin) {
        if (bin.fill >= 80) full++;
        if (bin.fill === 100) critical++;
        if (bin.fill === 100) {
            alert("CRITICAL ALERT: " + bin.name + " is full!");
        }
    });

    var counts = countBinCategories();

    var ctx = document.getElementById("binChart");
    if (ctx && typeof Chart !== "undefined") {
        binChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Empty", "Moderate", "Full"],
                datasets: [{
                    data: [counts.empty, counts.moderate, counts.fullBins],
                }],
            },
        });
    }

    document.getElementById("total").innerText = total;
    document.getElementById("full").innerText = full;
    document.getElementById("critical").innerText = critical;
}

function refreshChartAndStats() {
    var total = bins.length;
    var full = 0;
    var critical = 0;

    bins.forEach(function (bin) {
        if (bin.fill >= 80) full++;
        if (bin.fill === 100) critical++;
    });

    document.getElementById("total").innerText = total;
    document.getElementById("full").innerText = full;
    document.getElementById("critical").innerText = critical;

    if (binChart) {
        var counts = countBinCategories();
        binChart.data.datasets[0].data = [counts.empty, counts.moderate, counts.fullBins];
        binChart.update();
    }
}

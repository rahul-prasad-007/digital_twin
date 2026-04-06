export function getColor(fill) {
  if (fill < 40) return "green";
  if (fill < 80) return "orange";
  return "red";
}

export function getStatus(fill) {
  if (fill < 40) return "Empty";
  if (fill < 80) return "Moderate";
  if (fill < 100) return "Almost Full";
  return "CRITICAL - Needs Immediate Pickup!";
}

export function countBinCategories(binList) {
  let empty = 0;
  let moderate = 0;
  let fullBins = 0;
  binList.forEach((bin) => {
    if (bin.fill < 40) empty++;
    else if (bin.fill < 80) moderate++;
    else fullBins++;
  });
  return { empty, moderate, fullBins };
}

export function countStats(binList) {
  let full = 0;
  let critical = 0;
  binList.forEach((bin) => {
    if (bin.fill >= 80) full++;
    if (bin.fill === 100) critical++;
  });
  return { total: binList.length, full, critical };
}

export function popupHtml(bin) {
  return `<b>${bin.name}</b><br>Fill Level: ${bin.fill}%<br>Status: ${getStatus(bin.fill)}`;
}

window.OS = window.OS || {};

OS.parseCsv = async function parseCsv(file) {
  const text = await file.text();
  const delimiter = detectDelimiter(text);
  return parseDelimited(text, delimiter);
};

function detectDelimiter(text) {
  const first = text.slice(0, 4000);
  const candidates = [",", ";", "\t"];
  return candidates
    .map((char) => ({ char, count: (first.match(new RegExp(char === "\t" ? "\\t" : `\\${char}`, "g")) || []).length }))
    .sort((a, b) => b.count - a.count)[0].char;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

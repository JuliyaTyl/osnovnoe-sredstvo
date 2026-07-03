window.OS = window.OS || {};

OS.parseXlsx = async function parseXlsx(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = readZipEntries(bytes);
  const shared = parseSharedStrings(await readZipText(entries, "xl/sharedStrings.xml"));
  const workbook = parseWorkbook(await readZipText(entries, "xl/workbook.xml"));
  const rels = parseWorkbookRels(await readZipText(entries, "xl/_rels/workbook.xml.rels"));
  const firstSheet = workbook[0];
  const sheetPath = firstSheet && rels[firstSheet.relId] ? `xl/${rels[firstSheet.relId].replace(/^\/?xl\//, "")}` : "xl/worksheets/sheet1.xml";
  return parseSheet(await readZipText(entries, sheetPath), shared);
};

function readZipEntries(bytes) {
  const entries = new Map();
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (u32(bytes, i) === 0x06054b50) {
      const centralOffset = u32(bytes, i + 16);
      const total = u16(bytes, i + 10);
      let ptr = centralOffset;
      for (let e = 0; e < total; e += 1) {
        if (u32(bytes, ptr) !== 0x02014b50) break;
        const method = u16(bytes, ptr + 10);
        const compressedSize = u32(bytes, ptr + 20);
        const fileNameLength = u16(bytes, ptr + 28);
        const extraLength = u16(bytes, ptr + 30);
        const commentLength = u16(bytes, ptr + 32);
        const localOffset = u32(bytes, ptr + 42);
        const name = textDecode(bytes.slice(ptr + 46, ptr + 46 + fileNameLength));
        entries.set(name, { method, compressedSize, localOffset, bytes });
        ptr += 46 + fileNameLength + extraLength + commentLength;
      }
      return entries;
    }
  }
  throw new Error("Не удалось прочитать XLSX: файл не похож на ZIP-архив.");
}

async function readZipText(entries, name) {
  const entry = entries.get(name);
  if (!entry) return "";
  const ptr = entry.localOffset;
  const nameLength = u16(entry.bytes, ptr + 26);
  const extraLength = u16(entry.bytes, ptr + 28);
  const dataStart = ptr + 30 + nameLength + extraLength;
  const compressed = entry.bytes.slice(dataStart, dataStart + entry.compressedSize);
  let data = compressed;
  if (entry.method === 8) {
    if (!window.DecompressionStream) {
      throw new Error("Этот браузер не поддерживает локальную распаковку XLSX. Сохраните файл как CSV или откройте приложение в современном Edge/Chrome.");
    }
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    data = new Uint8Array(await new Response(stream).arrayBuffer());
  } else if (entry.method !== 0) {
    throw new Error("XLSX использует неподдерживаемый метод сжатия.");
  }
  return textDecode(data);
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("si")).map((si) => {
    return Array.from(si.getElementsByTagName("t")).map((t) => t.textContent || "").join("");
  });
}

function parseWorkbook(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("sheet")).map((sheet) => ({
    name: sheet.getAttribute("name"),
    relId: sheet.getAttribute("r:id")
  }));
}

function parseWorkbookRels(xml) {
  if (!xml) return {};
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("Relationship")).reduce((acc, rel) => {
    acc[rel.getAttribute("Id")] = rel.getAttribute("Target");
    return acc;
  }, {});
}

function parseSheet(xml, shared) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const rows = [];
  Array.from(doc.getElementsByTagName("row")).forEach((rowNode) => {
    const row = [];
    Array.from(rowNode.getElementsByTagName("c")).forEach((cell) => {
      const ref = cell.getAttribute("r") || "";
      const colIndex = columnIndex(ref.replace(/[0-9]/g, ""));
      const type = cell.getAttribute("t");
      const valueNode = cell.getElementsByTagName("v")[0] || cell.getElementsByTagName("t")[0];
      let value = valueNode ? valueNode.textContent : "";
      if (type === "s") value = shared[Number(value)] || "";
      if (type === "inlineStr") value = Array.from(cell.getElementsByTagName("t")).map((t) => t.textContent || "").join("");
      row[colIndex] = value;
    });
    rows.push(row.map((value) => value ?? ""));
  });
  return rows;
}

function columnIndex(letters) {
  return letters.split("").reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function u16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function textDecode(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

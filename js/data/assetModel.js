window.OS = window.OS || {};

OS.assetModel = (() => {
  const DAY = 24 * 60 * 60 * 1000;

  function fromRows(rows) {
    if (!rows.length) return { assets: [], schema: { columns: {}, missing: [] } };
    const schema = OS.schema.detect(rows);
    const assets = rows.slice(1).map((row, index) => normalizeAsset(row, schema.columns, index)).filter(hasContent);
    return { assets, schema };
  }

  function normalizeAsset(row, columns, index) {
    const get = (field) => columns[field] === undefined ? "" : row[columns[field]];
    const purchaseDate = parseDate(get("purchaseDate"));
    const commissioningDate = parseDate(get("commissioningDate")) || purchaseDate;
    const usefulLife = parseLife(get("usefulLife"));
    const cost = parseNumber(get("cost"));
    const computed = computeLifecycle(commissioningDate, usefulLife);
    const status = normalizeStatus(get("status"), computed);
    const rawSearch = row.join(" ").toLowerCase();
    return {
      id: `asset-${index}`,
      raw: row,
      inventoryNumber: clean(get("inventoryNumber")),
      name: clean(get("name")) || `Объект ${index + 1}`,
      department: clean(get("department")),
      responsible: clean(get("responsible")),
      cost,
      purchaseDate,
      commissioningDate,
      usefulLife,
      status,
      age: computed.age,
      remainingLife: computed.remainingLife,
      wearPercent: computed.wearPercent,
      lifecycleState: computed.state,
      search: rawSearch
    };
  }

  function hasContent(asset) {
    return asset.name || asset.inventoryNumber || asset.department || Number.isFinite(asset.cost);
  }

  function computeLifecycle(startDate, usefulLife) {
    if (!startDate || !Number.isFinite(usefulLife) || usefulLife <= 0) {
      return { age: null, remainingLife: null, wearPercent: null, state: "neutral" };
    }
    const today = new Date();
    const age = Math.max(0, (today - startDate) / DAY / 365.25);
    const remainingLife = usefulLife - age;
    const wearPercent = Math.min(100, Math.max(0, (age / usefulLife) * 100));
    let state = "ok";
    if (age < 1) state = "new";
    if (remainingLife <= 1 && remainingLife > 0) state = "warn";
    if (remainingLife <= 0) state = "danger";
    return { age, remainingLife, wearPercent, state };
  }

  function normalizeStatus(value, computed) {
    const text = clean(value);
    if (computed.state === "danger") return "Требует списания";
    if (computed.state === "warn") return "Подходит к окончанию срока службы";
    if (text) return text;
    if (computed.state === "new") return "Новое оборудование";
    return "Исправно";
  }

  function parseNumber(value) {
    if (typeof value === "number") return value;
    const cleaned = String(value || "").replace(/\s/g, "").replace(/,/g, ".").replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function parseLife(value) {
    const num = parseNumber(value);
    if (!Number.isFinite(num)) return null;
    return num > 60 ? num / 12 : num;
  }

  function parseDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value).trim())) {
      const serial = Number(value);
      if (serial > 20000 && serial < 80000) return new Date(Math.round((serial - 25569) * DAY));
    }
    const text = String(value || "").trim();
    if (!text) return null;
    const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (match) {
      const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
      return new Date(year, Number(match[2]) - 1, Number(match[1]));
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function clean(value) {
    return String(value ?? "").trim();
  }

  function stateClass(asset) {
    return asset.lifecycleState === "danger" ? "danger" : asset.lifecycleState === "warn" ? "warn" : asset.lifecycleState === "new" ? "new" : "ok";
  }

  return { fromRows, stateClass };
})();

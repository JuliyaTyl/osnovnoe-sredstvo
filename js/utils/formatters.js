window.OS = window.OS || {};

OS.format = {
  number(value, digits = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(num) : "—";
  },
  money(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0
    }).format(num);
  },
  percent(value) {
    const num = Number(value);
    return Number.isFinite(num) ? `${Math.round(num)}%` : "—";
  },
  date(value) {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("ru-RU");
  },
  years(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(num)} лет`;
  },
  safe(value) {
    return value === null || value === undefined || value === "" ? "—" : String(value);
  }
};

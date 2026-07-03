window.OS = window.OS || {};

OS.schema = (() => {
  const fields = {
    inventoryNumber: ["инвентар", "инв. номер", "inv", "inventory"],
    name: ["наименование", "название", "основное средство", "asset", "name"],
    department: ["подраздел", "отдел", "департамент", "department"],
    responsible: ["ответствен", "мол", "материально", "responsible"],
    cost: ["стоимость", "балансов", "цена", "cost", "value"],
    purchaseDate: ["дата приобрет", "приобрет", "purchase"],
    commissioningDate: ["дата ввода", "ввод", "эксплуатац", "начало эксплуатации", "commission"],
    usefulLife: ["срок службы", "срок износа", "период амортизации", "срок амортизации", "полезного", "life", "срок"],
    status: ["статус", "состояние", "status"]
  };

  function normalizeHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function detect(rows) {
    const header = rows[0] || [];
    const normalized = header.map(normalizeHeader);
    const columns = {};
    Object.entries(fields).forEach(([field, aliases]) => {
      const index = normalized.findIndex((name) => aliases.some((alias) => name.includes(alias)));
      if (index >= 0) columns[field] = index;
    });
    return { header, columns, missing: Object.keys(fields).filter((field) => columns[field] === undefined) };
  }

  return { detect };
})();

window.OS = window.OS || {};

OS.FilterPanel = class {
  constructor(app) {
    this.app = app;
  }

  render() {
    const assets = this.app.state.assets;
    const filters = this.app.state.filters;
    return OS.dom.el("section", { class: "panel" }, [
      OS.dom.el("div", { class: "panel-header" }, [
        OS.dom.el("h2", { class: "section-title", text: "Фильтры" }),
        OS.dom.el("button", { class: "ghost-btn", text: "Сбросить", onclick: () => this.app.resetFilters() })
      ]),
      OS.dom.el("div", { class: "panel-body filters" }, [
        this.select("department", "Подразделение", unique(assets, "department"), filters.department),
        this.select("responsible", "Ответственное лицо", unique(assets, "responsible"), filters.responsible),
        this.select("status", "Статус", unique(assets, "status"), filters.status),
        this.range("minCost", "Стоимость от", filters.minCost),
        this.range("minAge", "Возраст от", filters.minAge),
        this.range("year", "Год приобретения", filters.year)
      ])
    ]);
  }

  select(key, label, options, value) {
    const select = OS.dom.el("select", { class: "field" }, [
      OS.dom.el("option", { value: "", text: "Все" }),
      ...options.map((option) => OS.dom.el("option", { value: option, text: option }))
    ]);
    select.value = value || "";
    select.addEventListener("change", () => this.app.setFilter(key, select.value));
    return field(label, select);
  }

  range(key, label, value) {
    const input = OS.dom.el("input", { class: "field", type: "number", value: value || "" });
    input.addEventListener("input", OS.dom.debounce(() => this.app.setFilter(key, input.value)));
    return field(label, input);
  }
};

function field(label, control) {
  return OS.dom.el("div", { class: "filter-field" }, [OS.dom.el("label", { text: label }), control]);
}

function unique(assets, key) {
  return Array.from(new Set(assets.map((a) => a[key]).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ru")).slice(0, 500);
}

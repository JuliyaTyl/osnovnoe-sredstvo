window.OS = window.OS || {};

OS.App = class {
  constructor(root) {
    this.root = root;
    this.state = {
      title: "Dashboard",
      view: "dashboard",
      assets: [],
      schema: null,
      selected: null,
      search: "",
      filters: {},
      sort: { key: "name", dir: "asc" },
      page: 1,
      pageSize: 50,
      cacheKey: "",
      cacheRows: []
    };
  }

  start() {
    new OS.UploadScreen((file) => this.loadFile(file)).render(this.root);
  }

  async loadFile(file) {
    try {
      this.root.append(OS.dom.el("div", { class: "chart-tooltip", text: "Загрузка и анализ файла..." }));
      const rows = file.name.toLowerCase().endsWith(".xlsx") ? await OS.parseXlsx(file) : await OS.parseCsv(file);
      const { assets, schema } = OS.assetModel.fromRows(rows);
      this.state.assets = assets;
      this.state.schema = schema;
      this.state.selected = assets[0] || null;
      this.state.search = "";
      this.state.filters = {};
      this.state.view = "dashboard";
      this.state.title = "Dashboard";
      this.invalidate();
      this.render();
    } catch (error) {
      alert(error.message || "Не удалось загрузить файл.");
      this.start();
    }
  }

  render() {
    OS.dom.clear(this.root);
    const shell = OS.dom.el("div", { class: "app-shell" }, [
      this.sidebar(),
      OS.dom.el("main", { class: "main" }, [
        new OS.Topbar(this).render(),
        this.renderView()
      ])
    ]);
    this.root.append(shell);
  }

  renderView() {
    if (this.state.view === "analytics") return new OS.AnalyticsView(this).render();
    if (this.state.view === "amortization") return new OS.AmortizationView(this).render();
    return new OS.Dashboard(this).render();
  }

  sidebar() {
    const nav = [
      ["dashboard", "▦", "Dashboard"],
      ["amortization", "◷", "Амортизация"],
      ["analytics", "◫", "Аналитика"]
    ];
    return OS.dom.el("aside", { class: "sidebar" }, [
      OS.dom.el("div", { class: "brand" }, [
        OS.dom.el("div", { class: "brand-mark", text: "ОС" }),
        OS.dom.el("div", {}, [
          OS.dom.el("div", { class: "brand-title", text: "Реестр основных средств" }),
          OS.dom.el("div", { class: "brand-subtitle", text: "Локальная аналитика" })
        ])
      ]),
      OS.dom.el("nav", { class: "nav" }, nav.map(([view, icon, label]) => {
        return OS.dom.el("button", { class: this.state.view === view ? "active" : "", onclick: () => this.setView(view) }, [
          OS.dom.el("strong", { text: icon }),
          OS.dom.el("span", { text: label })
        ]);
      }))
    ]);
  }

  getVisibleAssets() {
    const key = JSON.stringify({ s: this.state.search, f: this.state.filters, sort: this.state.sort });
    if (key === this.state.cacheKey) return this.state.cacheRows;
    const search = this.state.search.trim().toLowerCase();
    const f = this.state.filters;
    let rows = this.state.assets.filter((a) => {
      if (search && !a.search.includes(search)) return false;
      if (f.department && a.department !== f.department) return false;
      if (f.responsible && a.responsible !== f.responsible) return false;
      if (f.status && a.status !== f.status) return false;
      if (f.minCost && !(Number(a.cost) >= Number(f.minCost))) return false;
      if (f.minAge && !(Number(a.age) >= Number(f.minAge))) return false;
      if (f.year && (!a.purchaseDate || a.purchaseDate.getFullYear() !== Number(f.year))) return false;
      return true;
    });
    rows = rows.slice().sort((a, b) => compare(a[this.state.sort.key], b[this.state.sort.key], this.state.sort.dir));
    this.state.cacheKey = key;
    this.state.cacheRows = rows;
    return rows;
  }

  setView(view) {
    this.state.view = view;
    const titles = { analytics: "Аналитика и KPI", amortization: "Амортизация", dashboard: "Dashboard" };
    this.state.title = titles[view] || "Dashboard";
    this.render();
  }

  setSearch(search) {
    this.state.search = search;
    this.state.page = 1;
    this.invalidate();
    this.render();
  }

  setFilter(key, value) {
    this.state.filters[key] = value;
    this.state.page = 1;
    this.invalidate();
    this.render();
  }

  resetFilters() {
    this.state.filters = {};
    this.state.search = "";
    this.state.page = 1;
    this.invalidate();
    this.render();
  }

  setSort(key) {
    const sort = this.state.sort;
    this.state.sort = { key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" };
    this.invalidate();
    this.render();
  }

  setPage(page) {
    this.state.page = Math.max(1, page);
    this.render();
  }

  setPageSize(size) {
    this.state.pageSize = size;
    this.state.page = 1;
    this.render();
  }

  selectAsset(asset) {
    this.state.selected = asset;
    this.render();
  }

  invalidate() {
    this.state.cacheKey = "";
  }

  hasField(field) {
    if (field === "name") return true;
    return this.state.schema?.columns?.[field] !== undefined;
  }

  hasLifecycleFields() {
    return this.hasField("usefulLife") && (this.hasField("commissioningDate") || this.hasField("purchaseDate"));
  }
};

function compare(a, b, dir) {
  const mult = dir === "asc" ? 1 : -1;
  const av = a instanceof Date ? a.getTime() : a;
  const bv = b instanceof Date ? b.getTime() : b;
  if (Number.isFinite(Number(av)) && Number.isFinite(Number(bv))) return (Number(av) - Number(bv)) * mult;
  return String(av ?? "").localeCompare(String(bv ?? ""), "ru", { numeric: true }) * mult;
}

document.addEventListener("DOMContentLoaded", () => new OS.App(document.getElementById("app")).start());

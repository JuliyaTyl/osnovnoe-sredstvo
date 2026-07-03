window.OS = window.OS || {};

OS.AssetTable = class {
  constructor(app) {
    this.app = app;
    this.baseColumns = [
      ["inventoryNumber", "Инвентарный номер", 150],
      ["name", "Наименование", 260],
      ["department", "Подразделение", 180],
      ["responsible", "Ответственное лицо", 190],
      ["cost", "Стоимость", 140],
      ["purchaseDate", "Дата приобретения", 150],
      ["commissioningDate", "Дата ввода", 130],
      ["usefulLife", "Срок службы", 120],
      ["age", "Возраст", 110],
      ["remainingLife", "Остаток срока службы", 170],
      ["status", "Статус", 210]
    ];
    this.columns = this.baseColumns.filter(([key]) => this.isColumnAvailable(key));
    this.widths = Object.fromEntries(this.baseColumns.map(([key,, width]) => [key, width]));
  }

  render() {
    const state = this.app.state;
    const visible = this.app.getVisibleAssets();
    const pageSize = state.pageSize;
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * pageSize;
    const pageRows = visible.slice(start, start + pageSize);
    const tbody = OS.dom.el("tbody", {}, pageRows.map((asset) => this.row(asset)));
    return OS.dom.el("section", { class: "panel" }, [
      OS.dom.el("div", { class: "panel-header" }, [
        OS.dom.el("h2", { class: "section-title", text: "Реестр основных средств" }),
        OS.dom.el("span", { class: "subtle", text: `${OS.format.number(visible.length)} найдено` })
      ]),
      this.toolbar(),
      OS.dom.el("div", { class: "table-wrap" }, [
        OS.dom.el("table", {}, [this.header(), tbody])
      ]),
      OS.dom.el("div", { class: "pagination" }, [
        OS.dom.el("span", { text: `Страница ${state.page} из ${totalPages}` }),
        OS.dom.el("div", { class: "pager-buttons" }, [
          OS.dom.el("button", { class: "ghost-btn", text: "Назад", onclick: () => this.app.setPage(state.page - 1) }),
          OS.dom.el("button", { class: "ghost-btn", text: "Вперед", onclick: () => this.app.setPage(state.page + 1) })
        ])
      ])
    ]);
  }

  toolbar() {
    const input = OS.dom.el("input", { class: "field", type: "search", placeholder: "Поиск по всем полям", value: this.app.state.search });
    input.addEventListener("input", OS.dom.debounce(() => this.app.setSearch(input.value), 120));
    return OS.dom.el("div", { class: "table-toolbar" }, [
      input,
      this.pageSizeSelect(),
      OS.dom.el("button", { class: "ghost-btn", text: "Обновить", onclick: () => this.app.render() })
    ]);
  }

  pageSizeSelect() {
    const select = OS.dom.el("select", { class: "field", onchange: (event) => this.app.setPageSize(Number(event.target.value)) }, [
      OS.dom.el("option", { value: "50", text: "50 строк" }),
      OS.dom.el("option", { value: "100", text: "100 строк" }),
      OS.dom.el("option", { value: "250", text: "250 строк" })
    ]);
    select.value = String(this.app.state.pageSize);
    return select;
  }

  header() {
    return OS.dom.el("thead", {}, [
      OS.dom.el("tr", {}, this.columns.map(([key, label]) => {
        const th = OS.dom.el("th", { class: "sortable", style: `width:${this.widths[key]}px` }, [
          OS.dom.el("span", { text: `${label}${this.sortMark(key)}` }),
          OS.dom.el("span", { class: "resize-handle", title: "Изменить ширину" })
        ]);
        th.addEventListener("click", (event) => {
          if (event.target.className === "resize-handle") return;
          this.app.setSort(key);
        });
        this.attachResize(th, key);
        return th;
      }))
    ]);
  }

  row(asset) {
    const tr = OS.dom.el("tr", { class: this.app.state.selected?.id === asset.id ? "selected" : "", onclick: () => this.app.selectAsset(asset) });
    this.columns.forEach(([key]) => tr.append(OS.dom.el("td", {}, [this.cellValue(asset, key)])));
    return tr;
  }

  cellValue(asset, key) {
    if (key === "cost") return OS.format.money(asset.cost);
    if (key === "purchaseDate" || key === "commissioningDate") return OS.format.date(asset[key]);
    if (key === "usefulLife" || key === "age" || key === "remainingLife") return OS.format.years(asset[key]);
    if (key === "status") return OS.dom.el("span", { class: `badge ${OS.assetModel.stateClass(asset)}`, text: asset.status });
    return OS.format.safe(asset[key]);
  }

  sortMark(key) {
    const sort = this.app.state.sort;
    if (sort.key !== key) return "";
    return sort.dir === "asc" ? " ↑" : " ↓";
  }

  attachResize(th, key) {
    const handle = th.querySelector(".resize-handle");
    handle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = this.widths[key];
      const move = (moveEvent) => {
        this.widths[key] = Math.max(90, startWidth + moveEvent.clientX - startX);
        th.style.width = `${this.widths[key]}px`;
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
  }

  isColumnAvailable(key) {
    if (key === "name") return true;
    if (key === "age" || key === "remainingLife") return this.app.hasLifecycleFields();
    return this.app.hasField(key);
  }
};

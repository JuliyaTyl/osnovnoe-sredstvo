window.OS = window.OS || {};

OS.AmortizationView = class {
  constructor(app) {
    this.app = app;
  }

  render() {
    const assets = this.app.getVisibleAssets();
    const expired = assets.filter((a) => a.lifecycleState === "danger");
    const expiring = assets.filter((a) => a.lifecycleState === "warn");
    const usable = assets.filter((a) => a.lifecycleState === "ok" || a.lifecycleState === "new");
    return OS.dom.el("div", { class: "content" }, [
      OS.dom.el("div", { class: "kpi-grid" }, [
        this.card("Требует списания", expired.length, "danger"),
        this.card("Подходит к окончанию срока службы", expiring.length, "warn"),
        this.card("В нормативном сроке", usable.length, "ok")
      ]),
      new OS.FilterPanel(this.app).render(),
      this.table("Объекты, требующие списания", expired),
      this.table("Объекты с истекающим сроком службы", expiring)
    ]);
  }

  card(label, value, tone) {
    return OS.dom.el("article", { class: "kpi-card" }, [
      OS.dom.el("div", { class: "kpi-label", text: label }),
      OS.dom.el("div", { class: "kpi-value" }, [
        OS.dom.el("span", { class: `badge ${tone}`, text: OS.format.number(value) })
      ])
    ]);
  }

  table(title, rows) {
    const limited = rows.slice(0, 300);
    return OS.dom.el("section", { class: "panel" }, [
      OS.dom.el("div", { class: "panel-header" }, [
        OS.dom.el("h2", { class: "section-title", text: title }),
        OS.dom.el("span", { class: "subtle", text: `${OS.format.number(rows.length)} объектов` })
      ]),
      OS.dom.el("div", { class: "table-wrap" }, [
        OS.dom.el("table", {}, [
          OS.dom.el("thead", {}, [OS.dom.el("tr", {}, [
            OS.dom.el("th", { text: "Инвентарный номер" }),
            OS.dom.el("th", { text: "Наименование" }),
            OS.dom.el("th", { text: "Подразделение" }),
            OS.dom.el("th", { text: "Возраст" }),
            OS.dom.el("th", { text: "Остаток срока" }),
            OS.dom.el("th", { text: "Износ" }),
            OS.dom.el("th", { text: "Статус" })
          ])]),
          OS.dom.el("tbody", {}, limited.map((a) => OS.dom.el("tr", { onclick: () => this.app.selectAsset(a) }, [
            OS.dom.el("td", { text: OS.format.safe(a.inventoryNumber) }),
            OS.dom.el("td", { text: OS.format.safe(a.name) }),
            OS.dom.el("td", { text: OS.format.safe(a.department) }),
            OS.dom.el("td", { text: OS.format.years(a.age) }),
            OS.dom.el("td", { text: OS.format.years(a.remainingLife) }),
            OS.dom.el("td", { text: OS.format.percent(a.wearPercent) }),
            OS.dom.el("td", {}, [OS.dom.el("span", { class: `badge ${OS.assetModel.stateClass(a)}`, text: a.status })])
          ])))
        ])
      ])
    ]);
  }
};

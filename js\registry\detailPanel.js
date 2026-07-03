window.OS = window.OS || {};

OS.DetailPanel = class {
  constructor(asset, app) {
    this.asset = asset;
    this.app = app;
  }

  render() {
    return OS.dom.el("aside", { class: "panel detail-panel" }, [
      OS.dom.el("div", { class: "panel-header" }, [OS.dom.el("h2", { class: "section-title", text: "Карточка объекта" })]),
      OS.dom.el("div", { class: "panel-body" }, this.asset ? [this.details()] : [
        OS.dom.el("div", { class: "detail-empty", text: "Выберите строку в реестре, чтобы открыть подробную карточку объекта." })
      ])
    ]);
  }

  details() {
    const a = this.asset;
    return OS.dom.el("div", { class: "detail-list" }, [
      this.item("Наименование", a.name),
      this.optional("inventoryNumber", "Инвентарный номер", a.inventoryNumber),
      this.optional("cost", "Стоимость", OS.format.money(a.cost)),
      this.optional("department", "Подразделение", a.department),
      this.optional("responsible", "Ответственный", a.responsible),
      this.optional("purchaseDate", "Дата приобретения", OS.format.date(a.purchaseDate)),
      this.optional("commissioningDate", "Дата ввода", OS.format.date(a.commissioningDate)),
      this.optional("usefulLife", "Срок службы", OS.format.years(a.usefulLife)),
      this.lifecycle("Фактический возраст", OS.format.years(a.age)),
      this.lifecycle("Остаток срока службы", OS.format.years(a.remainingLife)),
      this.lifecycle("Процент износа", OS.format.percent(a.wearPercent)),
      this.optional("status", "Статус", OS.dom.el("span", { class: `badge ${OS.assetModel.stateClass(a)}`, text: a.status }))
    ].filter(Boolean));
  }

  optional(field, label, value) {
    return this.app?.hasField(field) ? this.item(label, value) : null;
  }

  lifecycle(label, value) {
    return this.app?.hasField("commissioningDate") && this.app?.hasField("usefulLife") ? this.item(label, value) : null;
  }

  item(label, value) {
    return OS.dom.el("div", { class: "detail-item" }, [
      OS.dom.el("span", { text: label }),
      OS.dom.el("strong", {}, [value?.nodeType ? value : OS.format.safe(value)])
    ]);
  }
};

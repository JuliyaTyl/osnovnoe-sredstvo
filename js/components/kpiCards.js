window.OS = window.OS || {};

OS.KpiCards = class {
  constructor(summary) {
    this.summary = summary;
  }

  renderLeader() {
    const s = this.summary;
    return OS.dom.el("div", { class: "kpi-leader-grid" }, [
      this.card("Количество объектов", OS.format.number(s.count)),
      this.card("Общая стоимость", OS.format.money(s.totalCost)),
      this.card("Средний возраст", OS.format.years(s.avgAge)),
      this.card("Средний срок службы", OS.format.years(s.avgLife)),
      this.card("Просроченные объекты", OS.format.number(s.expired)),
      this.card("Старше 10 лет", OS.format.number(s.olderThan10)),
      this.card("Самое дорогое", s.mostExpensive ? `${s.mostExpensive.name} · ${OS.format.money(s.mostExpensive.cost)}` : "—"),
      this.card("Самое старое", s.oldest ? `${s.oldest.name} · ${OS.format.years(s.oldest.age)}` : "—")
    ]);
  }

  renderDashboard() {
    const s = this.summary;
    return OS.dom.el("div", { class: "kpi-grid" }, [
      this.card("Общее количество основных средств", OS.format.number(s.count)),
      this.card("Общая стоимость имущества", OS.format.money(s.totalCost)),
      this.card("Средний срок эксплуатации", OS.format.years(s.avgAge)),
      this.card("Средний процент износа", OS.format.percent(s.avgWear)),
      this.card("С истекшим сроком службы", OS.format.number(s.expired)),
      this.card("Заканчиваются в ближайший год", OS.format.number(s.expiring))
    ]);
  }

  card(label, value) {
    return OS.dom.el("article", { class: "kpi-card" }, [
      OS.dom.el("div", { class: "kpi-label", text: label }),
      OS.dom.el("div", { class: "kpi-value", text: value })
    ]);
  }
};

window.OS = window.OS || {};

OS.AnalyticsView = class {
  constructor(app) {
    this.app = app;
  }

  render() {
    const assets = this.app.getVisibleAssets();
    const summary = OS.analytics.summarize(assets);
    const byDeptCost = OS.analytics.groupBy(assets, "department", "sumCost", 12);
    const byDeptCount = OS.analytics.groupBy(assets, "department", "count", 12);
    const age = OS.analytics.histogram(assets, "age", 2, 20, " лет");
    const life = OS.analytics.histogram(assets, "usefulLife", 2, 20, " лет");
    const topExpensive = OS.analytics.topExpensive(assets, 20);
    const risky = [
      { label: "Требует списания", value: summary.expired },
      { label: "Срок истекает", value: summary.expiring },
      { label: "Исправно/новое", value: Math.max(0, summary.count - summary.expired - summary.expiring) }
    ];
    return OS.dom.el("div", { class: "content" }, [
      OS.dom.el("section", {}, [
        OS.dom.el("h2", { class: "section-title", text: "KPI руководителя" }),
        OS.dom.el("div", { style: "height:12px" }),
        new OS.KpiCards(summary).renderLeader()
      ]),
      new OS.FilterPanel(this.app).render(),
      OS.dom.el("div", { class: "charts-grid" }, [
        new OS.Chart("Стоимость имущества по подразделениям", byDeptCost, "bar", OS.format.money).render(),
        new OS.Chart("Количество объектов по подразделениям", byDeptCount).render(),
        new OS.Chart("Возраст оборудования", age).render(),
        new OS.Chart("Распределение по сроку службы", life).render(),
        new OS.Chart("Топ-20 самых дорогих объектов", topExpensive, "bar", OS.format.money).render(),
        new OS.Chart("Объекты по состоянию срока службы", risky, "donut").render()
      ])
    ]);
  }
};

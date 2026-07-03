window.OS = window.OS || {};

OS.Dashboard = class {
  constructor(app) {
    this.app = app;
  }

  render() {
    const assets = this.app.getVisibleAssets();
    const summary = OS.analytics.summarize(assets);
    return OS.dom.el("div", { class: "content" }, [
      new OS.KpiCards(summary).renderDashboard(),
      new OS.FilterPanel(this.app).render(),
      OS.dom.el("div", { class: "two-column" }, [
        new OS.AssetTable(this.app).render(),
        new OS.DetailPanel(this.app.state.selected, this.app).render()
      ])
    ]);
  }
};

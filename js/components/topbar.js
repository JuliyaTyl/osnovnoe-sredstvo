window.OS = window.OS || {};

OS.Topbar = class {
  constructor(app) {
    this.app = app;
  }

  render() {
    const fileInput = OS.dom.el("input", { type: "file", accept: ".xlsx,.csv,text/csv", class: "hidden" });
    fileInput.addEventListener("change", () => fileInput.files[0] && this.app.loadFile(fileInput.files[0]));
    return OS.dom.el("header", { class: "topbar" }, [
      OS.dom.el("div", {}, [
        OS.dom.el("h1", { text: this.app.state.title }),
        OS.dom.el("div", { class: "subtle", text: `${OS.format.number(this.app.state.assets.length)} объектов в памяти приложения` })
      ]),
      OS.dom.el("div", { class: "topbar-actions" }, [
        OS.dom.el("button", { class: "ghost-btn", text: "Сменить файл", onclick: () => fileInput.click() }),
        fileInput
      ])
    ]);
  }
};

window.OS = window.OS || {};

OS.UploadScreen = class {
  constructor(onLoad) {
    this.onLoad = onLoad;
  }

  render(root) {
    OS.dom.clear(root);
    const input = OS.dom.el("input", { type: "file", accept: ".xlsx,.csv,text/csv", class: "hidden" });
    input.addEventListener("change", () => input.files[0] && this.onLoad(input.files[0]));
    root.append(OS.dom.el("main", { class: "upload-screen" }, [
      OS.dom.el("section", { class: "upload-card" }, [
        OS.dom.el("h1", { text: "Реестр основных средств" }),
        OS.dom.el("p", { text: "Загрузите Excel или CSV-файл. Приложение само определит структуру, рассчитает сроки службы, износ и построит управленческий dashboard." }),
        OS.dom.el("div", { class: "upload-drop" }, [
          OS.dom.el("button", { class: "primary-btn", text: "Загрузить файл", onclick: () => input.click() }),
          OS.dom.el("div", { class: "subtle", text: "Поддерживаются .xlsx и .csv. Данные остаются только в памяти браузера." }),
          input
        ]),
        OS.dom.el("div", { class: "upload-meta" }, [
          OS.dom.el("div", { text: "Минимальная настройка: столбцы определяются автоматически по названиям." }),
          OS.dom.el("div", { text: "Производительность: поиск, фильтры, сортировка и пагинация рассчитаны на большие файлы." }),
          OS.dom.el("div", { text: "Архитектура: модули готовы к ремонту, перемещениям, инвентаризации и экспорту." })
        ])
      ])
    ]));
  }
};

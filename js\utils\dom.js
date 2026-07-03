window.OS = window.OS || {};

OS.dom = {
  el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    });
    [].concat(children).filter(Boolean).forEach((child) => {
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  },
  clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  },
  debounce(fn, delay = 160) {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  }
};

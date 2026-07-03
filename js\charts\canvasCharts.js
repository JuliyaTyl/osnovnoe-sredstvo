window.OS = window.OS || {};

OS.Chart = class {
  constructor(title, data, type = "bar", valueFormatter = OS.format.number) {
    this.title = title;
    this.data = data;
    this.type = type;
    this.valueFormatter = valueFormatter;
    this.points = [];
  }

  render() {
    const canvas = OS.dom.el("canvas");
    const tooltip = OS.dom.el("div", { class: "chart-tooltip hidden" });
    const card = OS.dom.el("section", { class: "panel chart-card" }, [
      OS.dom.el("div", { class: "panel-header" }, [OS.dom.el("h2", { class: "section-title", text: this.title })]),
      OS.dom.el("div", { class: "panel-body" }, [canvas, tooltip])
    ]);
    requestAnimationFrame(() => this.draw(canvas));
    canvas.addEventListener("mousemove", (event) => this.hover(event, tooltip));
    canvas.addEventListener("mouseleave", () => tooltip.classList.add("hidden"));
    return card;
  }

  draw(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    this.points = [];
    if (this.type === "donut") this.drawDonut(ctx, rect.width, rect.height);
    else this.drawBars(ctx, rect.width, rect.height);
  }

  drawBars(ctx, width, height) {
    const data = this.data.filter((d) => Number.isFinite(d.value)).slice(0, 20);
    const max = Math.max(1, ...data.map((d) => d.value));
    const left = 42;
    const bottom = 54;
    const chartW = width - left - 18;
    const chartH = height - 26 - bottom;
    const gap = 8;
    const barW = Math.max(10, (chartW - gap * (data.length - 1)) / Math.max(1, data.length));
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#d9e0ea";
    ctx.beginPath();
    ctx.moveTo(left, 16);
    ctx.lineTo(left, 16 + chartH);
    ctx.lineTo(width - 10, 16 + chartH);
    ctx.stroke();
    data.forEach((item, i) => {
      const h = (item.value / max) * chartH;
      const x = left + i * (barW + gap);
      const y = 16 + chartH - h;
      ctx.fillStyle = i % 3 === 0 ? "#2563eb" : i % 3 === 1 ? "#0f766e" : "#64748b";
      ctx.fillRect(x, y, barW, h);
      ctx.fillStyle = "#667085";
      ctx.font = "11px Segoe UI";
      const label = String(item.label).slice(0, 14);
      ctx.save();
      ctx.translate(x + 2, height - 12);
      ctx.rotate(-Math.PI / 5);
      ctx.fillText(label, 0, 0);
      ctx.restore();
      this.points.push({ x, y, w: barW, h, item });
    });
  }

  drawDonut(ctx, width, height) {
    const data = this.data.filter((d) => d.value > 0);
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    const cx = width / 2;
    const cy = height / 2 - 4;
    const radius = Math.min(width, height) / 3;
    const colors = ["#2563eb", "#0f766e", "#a16207", "#475569", "#7c3aed", "#b91c1c"];
    let start = -Math.PI / 2;
    ctx.clearRect(0, 0, width, height);
    data.forEach((item, i) => {
      const end = start + (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      this.points.push({ cx, cy, radius, start, end, item });
      start = end;
    });
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  hover(event, tooltip) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const point = this.points.find((p) => {
      if (p.radius) {
        const angle = Math.atan2(y - p.cy, x - p.cx);
        const normalized = angle < -Math.PI / 2 ? angle + Math.PI * 2 : angle;
        const dist = Math.hypot(x - p.cx, y - p.cy);
        return dist <= p.radius && dist >= p.radius * 0.58 && normalized >= p.start && normalized <= p.end;
      }
      return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
    });
    if (!point) return tooltip.classList.add("hidden");
    tooltip.classList.remove("hidden");
    tooltip.style.left = `${event.clientX + 14}px`;
    tooltip.style.top = `${event.clientY + 14}px`;
    tooltip.textContent = `${point.item.label}: ${this.valueFormatter(point.item.value)}`;
  }
};

window.OS = window.OS || {};

OS.analytics = (() => {
  function summarize(assets) {
    const totalCost = sum(assets, "cost");
    const knownAge = values(assets, "age");
    const knownLife = values(assets, "usefulLife");
    const wear = values(assets, "wearPercent");
    const expired = assets.filter((a) => a.lifecycleState === "danger").length;
    const expiring = assets.filter((a) => a.lifecycleState === "warn").length;
    const olderThan10 = assets.filter((a) => Number.isFinite(a.age) && a.age > 10).length;
    return {
      count: assets.length,
      totalCost,
      avgAge: average(knownAge),
      avgLife: average(knownLife),
      avgWear: average(wear),
      expired,
      expiring,
      olderThan10,
      mostExpensive: maxBy(assets, "cost"),
      oldest: maxBy(assets, "age")
    };
  }

  function groupBy(assets, key, metric = "count", limit = 12) {
    const map = new Map();
    assets.forEach((asset) => {
      const label = asset[key] || "Не указано";
      const item = map.get(label) || { label, value: 0, count: 0 };
      item.count += 1;
      item.value += metric === "sumCost" ? Number(asset.cost) || 0 : 1;
      map.set(label, item);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, limit);
  }

  function histogram(assets, key, step, max, suffix) {
    const buckets = [];
    for (let start = 0; start < max; start += step) {
      buckets.push({ label: `${start}-${start + step}${suffix}`, value: 0 });
    }
    buckets.push({ label: `${max}+${suffix}`, value: 0 });
    assets.forEach((asset) => {
      const value = Number(asset[key]);
      if (!Number.isFinite(value)) return;
      const index = Math.min(Math.floor(value / step), buckets.length - 1);
      buckets[index].value += 1;
    });
    return buckets;
  }

  function topExpensive(assets, limit = 20) {
    return assets.filter((a) => Number.isFinite(a.cost)).sort((a, b) => b.cost - a.cost).slice(0, limit).map((a) => ({ label: a.name, value: a.cost }));
  }

  function values(assets, key) {
    return assets.map((a) => Number(a[key])).filter(Number.isFinite);
  }

  function sum(assets, key) {
    return assets.reduce((acc, asset) => acc + (Number(asset[key]) || 0), 0);
  }

  function average(valuesList) {
    return valuesList.length ? valuesList.reduce((a, b) => a + b, 0) / valuesList.length : null;
  }

  function maxBy(assets, key) {
    return assets.filter((a) => Number.isFinite(a[key])).sort((a, b) => b[key] - a[key])[0] || null;
  }

  return { summarize, groupBy, histogram, topExpensive };
})();

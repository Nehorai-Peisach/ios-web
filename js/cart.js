/* LUMA: bag (cart) state. Persisted to localStorage 'luma.cart'; emits 'cart:change'. */
(() => {
  'use strict';
  const L = window.Luma;
  const KEY = 'luma.cart';
  const MAX_QTY = 10;

  let lines = load();

  function load() {
    const raw = L.storage.get(KEY, []);
    return Array.isArray(raw) ? raw.filter(valid).map(normalizeLine) : [];
  }

  function valid(l) {
    const p = l && L.catalog.get(l.id);
    return !!p && Number(l.qty) > 0;
  }

  function normalizeLine(l) {
    const p = L.catalog.get(l.id);
    const size = (p.sizes.find((s) => s.id === l.size) || p.sizes[0]).id;
    const shade = p.shades ? (p.shades.includes(l.shade) ? l.shade : p.defaultShade) : null;
    return { id: p.id, shade, size, qty: L.clamp(Math.round(l.qty), 1, MAX_QTY) };
  }

  const keyOf = (l) => `${l.id}|${l.shade || ''}|${l.size}`;

  function resolve(l) {
    const product = L.catalog.get(l.id);
    const unitPrice = L.catalog.price(product, l.size);
    return { key: keyOf(l), id: l.id, shade: l.shade, size: l.size, qty: l.qty, product, unitPrice, lineTotal: unitPrice * l.qty };
  }

  function snapshot() {
    return { items: items(), count: count(), subtotal: subtotal() };
  }

  function commit() {
    L.storage.set(KEY, lines);
    L.bus.emit('cart:change', snapshot());
  }

  /* ---------- Public API ---------- */
  function items() { return lines.map(resolve); }

  function add(id, opts = {}) {
    const product = L.catalog.get(id);
    if (!product) throw new Error(`Unknown product "${id}"`);
    const line = normalizeLine({ id, shade: opts.shade, size: opts.size, qty: 1 });
    const qty = Math.max(1, Math.round(Number(opts.qty ?? 1)) || 1);
    const existing = lines.find((l) => keyOf(l) === keyOf(line));
    const before = existing ? existing.qty : 0;
    if (existing) existing.qty = L.clamp(existing.qty + qty, 1, MAX_QTY);
    else lines.push({ ...line, qty: L.clamp(qty, 1, MAX_QTY) });
    const target = existing || lines[lines.length - 1];
    if (target.qty !== before) commit();
    // `added` < `requested` when the per-item cap (MAX_QTY) kicked in.
    return { ...resolve(target), requested: qty, added: target.qty - before };
  }

  function setQty(key, qty) {
    const line = lines.find((l) => keyOf(l) === key);
    if (!line) return;
    const n = Math.round(Number(qty) || 0);
    if (n <= 0) lines = lines.filter((l) => l !== line);
    else line.qty = L.clamp(n, 1, MAX_QTY);
    commit();
  }

  function remove(key) {
    const before = lines.length;
    lines = lines.filter((l) => keyOf(l) !== key);
    if (lines.length !== before) commit();
  }

  function clear() {
    lines = [];
    commit();
  }

  const count = () => lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => lines.reduce((n, l) => n + L.catalog.price(l.id, l.size) * l.qty, 0);

  // Free shipping is judged on what is actually paid: pass any coupon `discount` (₪).
  function shipping(method = 'home', discount = 0) {
    if (!lines.length) return 0;
    if (subtotal() - discount >= L.SHIPPING.freeOver) return 0;
    return method === 'pickup' ? L.SHIPPING.pickup : L.SHIPPING.home;
  }

  const total = (method = 'home', discount = 0) => subtotal() - discount + shipping(method, discount);
  const freeShippingRemaining = (discount = 0) => Math.max(0, L.SHIPPING.freeOver - (subtotal() - discount));

  // Keep multiple tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    lines = load();
    L.bus.emit('cart:change', snapshot());
  });

  L.cart = { items, add, setQty, remove, clear, count, subtotal, shipping, total, freeShippingRemaining, MAX_QTY };
})();

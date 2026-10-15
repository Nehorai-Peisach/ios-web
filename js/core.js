/* LUMA: core utilities: DOM builder, event bus, storage, formatting. */
(() => {
  'use strict';
  const L = (window.Luma = window.Luma || {});

  /* ---------- DOM ---------- */
  const PROPS = new Set(['value', 'checked', 'selected', 'indeterminate', 'muted', 'inert']);

  function append(el, child) {
    if (child == null || child === false || child === true) return;
    if (Array.isArray(child)) { child.forEach((c) => append(el, c)); return; }
    if (child instanceof Node) { el.appendChild(child); return; }
    el.appendChild(document.createTextNode(String(child)));
  }

  function setStyle(el, style) {
    if (typeof style === 'string') { el.style.cssText = style; return; }
    for (const [k, v] of Object.entries(style)) {
      if (v == null || v === false) continue;
      if (k.startsWith('--') || k.includes('-')) el.style.setProperty(k, v);
      else el.style[k] = v;
    }
  }

  /**
   * h('button', {class:'btn', onClick, 'aria-label':'…'}, 'text', node, [more])
   * Attrs: class|className (string|array), style (string|object), html (innerHTML),
   * text, dataset (object), on<Event> handlers, ref(fn), data-* and aria-* or any attribute.
   */
  function h(tag, attrs, ...children) {
    const el = typeof tag === 'string' ? document.createElement(tag) : tag;
    if (attrs != null && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
      children.unshift(attrs);
      attrs = null;
    }
    let ref = null;
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class' || k === 'className') {
          el.className = Array.isArray(v) ? v.filter(Boolean).join(' ') : v;
        } else if (k === 'style') setStyle(el, v);
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k === 'ref' && typeof v === 'function') ref = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (PROPS.has(k)) el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    append(el, children);
    if (ref) ref(el);
    return el;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Event bus ---------- */
  const listeners = new Map();
  const bus = {
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
      return () => listeners.get(evt)?.delete(fn);
    },
    emit(evt, data) {
      const set = listeners.get(evt);
      if (!set) return;
      [...set].forEach((fn) => {
        try { fn(data); } catch (err) { console.error(`[bus] ${evt}`, err); }
      });
    },
  };

  /* ---------- Storage (never throws; in-memory fallback when localStorage is unavailable) ---------- */
  const memory = new Map(); // key → JSON string, used once a localStorage write has failed
  const storage = {
    get(key, fallback = null) {
      try {
        const raw = memory.has(key) ? memory.get(key) : window.localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      try { window.localStorage.setItem(key, raw); memory.delete(key); return true; } catch { memory.set(key, raw); return false; }
    },
    remove(key) {
      memory.delete(key);
      try { window.localStorage.removeItem(key); } catch { /* ignore */ }
    },
  };

  /* ---------- Formatting ---------- */
  const priceFmt = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
  const numFmt = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 1 });
  const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
  const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  const fmt = {
    price: (n) => priceFmt.format(Math.round(Number(n) || 0)),
    number: (n) => numFmt.format(n),
    grams(g) {
      if (g == null || isNaN(g)) return '';
      return g >= 1000 ? `${numFmt.format(g / 1000)} ק״ג` : `${Math.round(g)} ג׳`;
    },
    /** Business-day delivery estimate (Fri/Sat skipped) → "יום ג׳, 21 באוקטובר". */
    deliveryDate(businessDays = 3, from = new Date()) {
      const d = new Date(from.getTime());
      let left = Math.max(0, businessDays | 0);
      if (left === 0) left = 1;
      while (left > 0) {
        d.setDate(d.getDate() + 1);
        const wd = d.getDay();
        if (wd !== 5 && wd !== 6) left--;
      }
      return `יום ${DAYS[d.getDay()]}, ${d.getDate()} ב${MONTHS[d.getMonth()]}`;
    },
  };

  /* ---------- Environment ---------- */
  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {} });
  const reducedMotion = () => mq('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => mq('(min-width: 1068px)').matches;

  function haptic(ms = 8) {
    try {
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
      navigator.vibrate?.(ms);
    } catch { /* unsupported */ }
  }

  /* ---------- Small helpers ---------- */
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function debounce(fn, ms = 120) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  let uidN = 0;
  const uid = (prefix = 'l') => `${prefix}-${(++uidN).toString(36)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- View registry (consumed by app.js; views register at load) ---------- */
  const defs = [];
  function compile(pattern) {
    const keys = [];
    const src = pattern
      .replace(/\/+$/, '')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
    return { re: new RegExp(`^${src}/?$`), keys };
  }
  const views = {
    define(name, def) {
      if (!def || typeof def.render !== 'function') throw new Error(`View "${name}" needs render(ctx)`);
      const entry = { name, tab: null, back: false, hideTabBar: false, title: '', ...def, ...compile(def.route || `/${name}`) };
      const i = defs.findIndex((d) => d.name === name);
      if (i >= 0) defs.splice(i, 1, entry); else defs.push(entry);
      return entry;
    },
    get: (name) => defs.find((d) => d.name === name),
    list: () => defs.slice(),
    _defs: defs,
  };

  Object.assign(L, {
    views,
    h, $, $$, bus, storage, fmt,
    mq, reducedMotion, isDesktop, haptic,
    clamp, debounce, uid, esc,
    SHIPPING: Object.freeze({ freeOver: 249, home: 29, pickup: 19 }),
  });
})();

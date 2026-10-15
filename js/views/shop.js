/* LUMA — Store: shared helpers (L.store) + Shop view (#/shop).
   shop.js loads first of the store views, so helpers used by product/bag/checkout live here. */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;

  /* =====================================================================
     Shared store helpers
     ===================================================================== */
  const COUPON_KEY = 'luma.coupon';
  const GIFT_KEY = 'luma.giftWrap';
  const ORDER_KEY = 'luma.lastOrder';
  const COUPONS = { LUMA10: { code: 'LUMA10', pct: 10, label: '10% הנחה' } };

  const FALLBACK_EASE = 'cubic-bezier(.32,.72,0,1)';
  const easeCache = {};
  /** Spring easing usable by WAAPI (falls back when linear() is unsupported). */
  function ease(name = 'smooth') {
    if (easeCache[name]) return easeCache[name];
    const v = getComputedStyle(document.documentElement).getPropertyValue(`--spring-${name}`).trim();
    const ok = v && window.CSS?.supports?.('transition-timing-function', v);
    easeCache[name] = ok ? v : FALLBACK_EASE;
    return easeCache[name];
  }

  /** Safe Element.animate (no-op under reduced motion or when unsupported). */
  function animate(el, frames, opts) {
    if (!el || typeof el.animate !== 'function' || L.reducedMotion()) return null;
    try { return el.animate(frames, opts); } catch { return null; }
  }

  const priceEl = (n, cls) => h('bdi', { class: cls || null }, L.fmt.price(n));

  function per100(size) {
    if (!size || !size.grams) return '';
    return `${L.fmt.price((size.price / size.grams) * 100)} ל־100 ג׳`;
  }

  function variantText(product, shade, sizeId) {
    const parts = [];
    if (shade && product.shades && product.shades.length > 1) parts.push(L.catalog.shade(shade)?.name);
    if (product.sizes.length > 1 || product.sizes[0].grams) parts.push(L.catalog.size(product, sizeId)?.label);
    return parts.filter(Boolean).join(' · ');
  }

  function thumb(product, shade, cls = 'st-thumb') {
    const box = h('span', { class: cls, 'aria-hidden': 'true' });
    box.append(L.ui.art(product, { shade, variant: 'thumb' }));
    return box;
  }

  const coupon = {
    get() {
      const c = L.storage.get(COUPON_KEY, null);
      return c && COUPONS[c] ? COUPONS[c] : null;
    },
    check(code) {
      const c = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
      return COUPONS[c] || null;
    },
    set(code) {
      if (code) L.storage.set(COUPON_KEY, code); else L.storage.remove(COUPON_KEY);
      L.bus.emit('store:change', { coupon: code || null });
    },
  };

  const gift = {
    get: () => !!L.storage.get(GIFT_KEY, false),
    set(v) { L.storage.set(GIFT_KEY, !!v); L.bus.emit('store:change', { gift: !!v }); },
  };

  /** Coupon discount (₪) on an amount — the bag's, or the bag's plus an item about to be added. */
  const discountOn = (amount) => {
    const c = coupon.get();
    return c ? Math.round((amount * c.pct) / 100) : 0;
  };

  function totals(method = 'home') {
    const subtotal = L.cart.subtotal();
    const c = coupon.get();
    const discount = c ? discountOn(subtotal) : 0;
    const shipping = L.cart.shipping(method, discount);
    return {
      count: L.cart.count(),
      subtotal,
      discount,
      coupon: c,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
      freeRemaining: L.cart.freeShippingRemaining(discount),
    };
  }

  // Curated "complete the set" pairings.
  const RELATED = {
    classic: ['tools', 'tray', 'refill'],
    quartet: ['tray', 'tools', 'jar'],
    midnight: ['classic', 'jar', 'tray'],
    refill: ['tray', 'tools', 'classic'],
    tools: ['classic', 'tray', 'quartet'],
    tray: ['classic', 'tools', 'refill'],
    jar: ['mini', 'giftbox', 'classic'],
    mini: ['jar', 'giftbox', 'quartet'],
    giftbox: ['tray', 'quartet', 'mini'],
  };
  const related = (id) => (RELATED[id] || ['classic', 'giftbox', 'jar']).filter((x) => x !== id).slice(0, 3);

  /** A small art thumbnail flies from `fromEl` into the bag tab. */
  function flyToBag(fromEl, product, shade) {
    if (!fromEl || L.reducedMotion()) return;
    const tab = document.querySelector('.tab[data-tab="bag"]');
    let target = tab && tab.offsetWidth && getComputedStyle(tab.closest('.tabbar-track') || tab).opacity !== '0' ? tab : null;
    if (!target) target = document.querySelector('.tabbar') || null;
    if (!target) return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const size = Math.min(a.width, a.height, 120);
    const fly = h('div', {
      class: 'st-fly', 'aria-hidden': 'true',
      style: { width: `${size}px`, height: `${size}px`, left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px` },
    }, L.ui.art(product, { shade, variant: 'thumb' }));
    document.body.append(fly);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = animate(fly, [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(.62)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.16)`, opacity: 0.2 },
    ], { duration: 720, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
    if (anim) anim.finished.finally(() => fly.remove()).catch(() => {}); else fly.remove();
  }

  const itemsText = (n) => (n === 1 ? 'פריט אחד' : `${n} פריטים`);

  L.store = {
    itemsText, discountOn, ease, animate, priceEl, per100, variantText, thumb, coupon, gift, totals, related, flyToBag,
    lastOrder: { get: () => L.storage.get(ORDER_KEY, null), set: (o) => L.storage.set(ORDER_KEY, o) },
  };

  /* =====================================================================
     Shop view
     ===================================================================== */
  const PROMO_AT = 4;

  function promoTile() {
    const art = h('div', { class: 'shop-promo-art' }, L.ui.art('giftbox', { variant: 'card' }));
    return h('a', { class: 'shop-promo', href: '#/product/giftbox', 'data-key': 'promo' },
      h('div', { class: 'shop-promo-text' },
        h('span', { class: 'shop-promo-eyebrow' }, L.ui.icon('gift', { size: 16 }), 'קופסת מתנה'),
        h('h2', { class: 'shop-promo-title' }, 'מתנה שנוצצת.'),
        h('p', { class: 'shop-promo-body' }, '900 ג׳ חול, סט כלים וכרטיס ברכה בכתב יד — באריזה ממותגת.'),
        h('span', { class: 'shop-promo-cta' }, 'לקופסת המתנה', L.ui.icon('forward', { size: 16 }))),
      art);
  }

  function trustStrip() {
    const item = (icon, title, text) => h('li', { class: 'shop-trust-item' },
      h('span', { class: 'shop-trust-icon' }, L.ui.icon(icon, { size: 22 })),
      h('strong', null, title), h('span', null, text));
    return h('ul', { class: 'shop-trust', role: 'list' },
      item('truck', 'משלוח חינם', `בהזמנה מעל ${L.fmt.price(L.SHIPPING.freeOver)}. יוצא באותו יום עד 14:00.`),
      item('returnBox', '14 ימי החזרה', 'לא התאהבתם? מחזירים באריזה סגורה.'),
      item('lock', 'תשלום מאובטח', 'אשראי עד 3 תשלומים ללא ריבית, Bit ו־Apple Pay.'));
  }

  L.views.define('shop', {
    route: '/shop',
    title: 'חנות',
    tab: 'shop',
    render(ctx) {
      const validCat = (c) => L.catalog.categories.some((x) => x.id === c);
      let cat = validCat(ctx.query.cat) ? ctx.query.cat : 'all';
      let shade = L.catalog.shade(ctx.query.shade) ? ctx.query.shade : null;

      const cards = new Map();
      const cardFor = (p) => {
        const k = `${p.id}|${shade || ''}`;
        if (!cards.has(k)) {
          const el = L.ui.productCard(p, { shade: shade || undefined });
          el.dataset.key = p.id;
          cards.set(k, el);
        }
        return cards.get(k);
      };
      let promo = null;

      const grid = h('div', { class: 'pgrid shop-grid', 'aria-live': 'off' });
      const emptyBox = h('div', { class: 'shop-empty', hidden: true });
      const filterRow = h('div', { class: 'shop-filter', hidden: true });

      function list() {
        let items = L.catalog.byCategory(cat);
        if (shade) items = items.filter((p) => p.shades?.includes(shade));
        return items;
      }

      function nodes(items) {
        const out = items.map(cardFor);
        if (!shade && (cat === 'all' || cat === 'gifts')) {
          promo = promo || promoTile();
          // Wider layouts: the promo moves to the end and fills the last row.
          const fill = (cols) => String(cols - (items.length % cols || 0) || cols);
          promo.style.setProperty('--span-3', fill(3));
          promo.style.setProperty('--span-4', fill(4));
          out.splice(cat === 'all' ? Math.min(PROMO_AT, out.length) : out.length, 0, promo);
        }
        return out;
      }

      function renderGrid(animated) {
        const items = list();
        const first = new Map();
        if (animated) Array.from(grid.children).forEach((el) => first.set(el.dataset.key, el.getBoundingClientRect()));
        const next = nodes(items);
        grid.replaceChildren(...next);
        grid.hidden = !items.length;
        emptyBox.hidden = !!items.length;
        if (!items.length) {
          emptyBox.replaceChildren(L.ui.empty({
            icon: 'sparkle',
            title: 'אין כאן מוצרים בגוון הזה',
            text: `ב${L.catalog.categories.find((c) => c.id === cat)?.name || 'קטגוריה'} אין עדיין מוצר בגוון ${L.catalog.shade(shade)?.name || ''}. אפשר להציג את כל הגוונים.`,
            action: { label: 'הצגת כל הגוונים', variant: 'tinted', onClick: () => setShade(null) },
          }));
        }
        if (!animated) return;
        next.forEach((el, i) => {
          const r0 = first.get(el.dataset.key);
          const r1 = el.getBoundingClientRect();
          if (r0) {
            const dx = r0.left - r1.left;
            const dy = r0.top - r1.top;
            if (Math.abs(dx) + Math.abs(dy) > 1) {
              animate(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 560, easing: ease('smooth') });
            }
          } else {
            animate(el, [{ opacity: 0, transform: 'translateY(14px) scale(.96)' }, { opacity: 1, transform: 'none' }],
              { duration: 520, delay: Math.min(i, 8) * 28, easing: ease('smooth'), fill: 'backwards' });
          }
        });
      }

      function keepGridInView() {
        const bar = seg.closest('.shop-bar');
        const stuckTop = bar ? bar.getBoundingClientRect().bottom : 0;
        const gTop = grid.getBoundingClientRect().top;
        if (gTop < stuckTop) window.scrollBy({ top: gTop - stuckTop - 12, behavior: 'instant' });
      }

      function announce() {
        const n = list().length;
        L.ui.announce(n === 1 ? 'מוצר אחד' : `${n} מוצרים`);
      }

      function setCat(id) {
        cat = id;
        L.router.setQuery({ cat: id === 'all' ? null : id });
        keepGridInView();
        renderGrid(true);
        announce();
      }

      function setShade(id) {
        shade = id;
        L.router.setQuery({ shade: id });
        renderFilter();
        renderGrid(true);
        announce();
      }

      function renderFilter() {
        filterRow.hidden = !shade;
        if (!shade) { filterRow.replaceChildren(); return; }
        const s = L.catalog.shade(shade);
        filterRow.replaceChildren(h('button', {
          type: 'button', class: 'shop-filter-chip',
          'aria-label': `הסרת הסינון לפי גוון ${s.name}`,
          onClick: () => setShade(null),
        },
        h('span', { class: 'shop-filter-dot', style: { background: L.ui.swatchBg(shade) } }),
        h('span', null, 'גוון: ', h('strong', null, s.name)),
        L.ui.icon('close', { size: 16 })));
      }

      const seg = L.ui.segmented({
        items: L.catalog.categories.map((c) => ({ id: c.id, label: c.name })),
        value: cat,
        ariaLabel: 'קטגוריות',
        onChange: setCat,
      });

      renderFilter();
      renderGrid(false);

      ctx.el.append(h('div', { class: 'container shop' },
        L.ui.largeTitle('חנות', 'חול יהלומים ואביזרים'),
        h('div', { class: 'shop-bar' }, seg),
        filterRow,
        grid,
        emptyBox,
        trustStrip()));
    },
  });
})();

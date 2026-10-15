/* LUMA — Store: Bag (#/bag). */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;
  const S = () => L.store;
  const RECS = ['classic', 'giftbox', 'quartet', 'jar', 'tools', 'mini'];

  /* ---------- Free-shipping meter ---------- */
  function shippingMeter() {
    const fill = h('span', { class: 'bag-meter-fill' });
    const text = h('p', { class: 'bag-meter-text' });
    const icon = h('span', { class: 'bag-meter-icon' });
    const bar = h('div', { class: 'bag-meter-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(L.SHIPPING.freeOver), 'aria-label': 'התקדמות למשלוח חינם' }, fill);
    const el = h('div', { class: 'bag-meter' }, h('div', { class: 'bag-meter-head' }, icon, text), bar);
    let wasFree = null;
    el.update = () => {
      const t = S().totals('home');
      const sub = t.subtotal - t.discount; // free shipping counts what is paid after the coupon
      const left = t.freeRemaining;
      const free = left === 0;
      fill.style.transform = `scaleX(${Math.min(1, sub / L.SHIPPING.freeOver)})`;
      bar.setAttribute('aria-valuenow', String(Math.min(sub, L.SHIPPING.freeOver)));
      el.classList.toggle('is-free', free);
      icon.innerHTML = L.icon(free ? 'check' : 'truck', { filled: free, size: 22 });
      text.replaceChildren(...(free
        ? ['מגיע לכם משלוח חינם ✓']
        : ['עוד ', h('bdi', null, L.fmt.price(left)), ' למשלוח חינם']));
      if (wasFree === false && free) S().animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 600, easing: S().ease('bouncy') });
      wasFree = free;
    };
    return el;
  }

  /* ---------- Line item (with swipe-to-delete on touch) ---------- */
  function lineItem(it, onRemove) {
    const p = it.product;
    const href = `#/product/${p.id}${it.shade && p.shades?.length > 1 ? `?shade=${it.shade}` : ''}`;
    const price = h('bdi', { class: 'bag-line-price' });
    const each = h('span', { class: 'bag-line-each' });
    const stepper = L.ui.stepper({
      value: it.qty, min: 1, max: L.cart.MAX_QTY || 10, size: 'sm', label: `כמות עבור ${p.name}`,
      onChange: (v) => L.cart.setQty(it.key, v),
    });
    const removeBtn = h('button', { type: 'button', class: 'bag-line-remove', 'aria-label': `הסרת ${p.name} מהסל`, onClick: () => onRemove(el) },
      L.ui.icon('trash', { size: 20 }));
    const content = h('div', { class: 'bag-line-content' },
      h('a', { class: 'bag-thumb', href, tabindex: '-1', 'aria-hidden': 'true' }, L.ui.art(p, { shade: it.shade, variant: 'thumb' })),
      h('div', { class: 'bag-line-main' },
        h('div', { class: 'bag-line-top' },
          h('a', { class: 'bag-line-name', href }, p.name),
          price),
        h('p', { class: 'bag-line-variant' }, S().variantText(p, it.shade, it.size) || p.short, each),
        h('div', { class: 'bag-line-actions' }, stepper, removeBtn)));
    const del = h('button', { type: 'button', class: 'bag-line-del', tabindex: '-1', 'aria-hidden': 'true', onClick: () => onRemove(el) },
      L.ui.icon('trash', { size: 22 }), h('span', null, 'מחיקה'));
    const el = h('li', { class: 'bag-line', 'data-key': it.key }, del, content);

    el.update = (line) => {
      price.textContent = L.fmt.price(line.lineTotal);
      each.textContent = line.qty > 1 ? ` · ${L.fmt.price(line.unitPrice)} ליחידה` : '';
      if (stepper.getValue() !== line.qty) stepper.setValue(line.qty);
    };
    el.update(it);
    el.line = it;

    // Swipe toward the leading edge reveals "delete" at the trailing edge (RTL aware).
    let drag = null;
    let open = false;
    const REVEAL = 92;
    const sign = () => (getComputedStyle(el).direction === 'rtl' ? 1 : -1);
    const setX = (x, anim) => {
      content.style.transition = anim ? `transform .5s ${S().ease('smooth')}` : 'none';
      content.style.transform = x ? `translateX(${x}px)` : '';
      del.style.opacity = String(Math.min(1, Math.abs(x) / REVEAL));
    };
    content.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || e.target.closest('button, .stepper')) return;
      drag = { x0: e.clientX, y0: e.clientY, dx: 0, locked: null, base: open ? sign() * REVEAL : 0 };
    });
    content.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (drag.locked == null && Math.abs(dx) + Math.abs(dy) > 8) drag.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.locked !== 'x') return;
      content.setPointerCapture?.(e.pointerId);
      let x = drag.base + dx;
      if (x * sign() < 0) x *= 0.2;                         // resist the wrong direction
      drag.dx = x;
      setX(x, false);
    });
    const end = () => {
      if (!drag) return;
      const { dx, locked } = drag;
      drag = null;
      if (locked !== 'x') return;
      const dist = dx * sign();
      if (dist > el.offsetWidth * 0.55) { onRemove(el); return; }
      open = dist > REVEAL * 0.6;
      setX(open ? sign() * REVEAL : 0, true);
      if (open) L.haptic(6);
    };
    content.addEventListener('pointerup', end);
    content.addEventListener('pointercancel', end);
    content.addEventListener('click', (e) => { if (open) { e.preventDefault(); open = false; setX(0, true); } }, true);
    el.close = () => { if (open) { open = false; setX(0, true); } };
    return el;
  }

  /* ---------- Coupon (collapsed by default) ---------- */
  function couponBox(onChange) {
    const id = L.uid('coupon');
    const input = h('input', {
      id, class: 'bag-coupon-input', type: 'text', placeholder: 'קוד קופון', autocomplete: 'off', autocapitalize: 'characters',
      spellcheck: 'false', enterkeyhint: 'done', dir: 'ltr', 'aria-describedby': `${id}-msg`,
    });
    const msg = h('p', { class: 'bag-coupon-msg', id: `${id}-msg`, 'aria-live': 'polite' });
    const apply = L.ui.button('החלה', { variant: 'tinted', size: 'md', type: 'submit' });
    const form = h('form', { class: 'bag-coupon-form', novalidate: true },
      h('label', { class: 'visually-hidden', for: id }, 'קוד קופון'), input, apply);
    const panel = h('div', { class: 'bag-coupon-panel', id: `${id}-p` }, h('div', { class: 'bag-coupon-inner' }, form, msg));
    const toggle = h('button', { type: 'button', class: 'bag-coupon-toggle', 'aria-expanded': 'false', 'aria-controls': `${id}-p` },
      L.ui.icon('tag', { size: 20 }), h('span', null, 'יש לי קוד קופון'), L.ui.icon('chevronDown', { size: 18 }));
    const applied = h('div', { class: 'bag-coupon-applied' });
    const el = h('div', { class: 'bag-coupon' }, toggle, panel, applied);

    const setOpen = (open) => {
      el.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.inert = !open;
      if (open) setTimeout(() => input.focus({ preventScroll: true }), 220);
    };
    toggle.addEventListener('click', () => setOpen(!el.classList.contains('is-open')));
    input.addEventListener('input', () => { el.classList.remove('has-error'); msg.textContent = ''; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) { el.classList.add('has-error'); msg.textContent = 'הקלידו קוד קופון ואז „החלה”.'; input.focus(); return; }
      const c = S().coupon.check(val);
      if (!c) {
        el.classList.add('has-error');
        msg.textContent = `הקוד „${val}” לא מוכר לנו. בדקו את האיות ונסו שוב.`;
        S().animate(form, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 380 });
        L.haptic(20);
        input.focus();
        return;
      }
      S().coupon.set(c.code);
      input.value = '';
      setOpen(false);
      L.haptic(10);
      L.ui.toast('הקופון הופעל', { icon: 'tag', subtitle: `${c.code} · ${c.label}` });
      onChange();
    });

    el.update = () => {
      const c = S().coupon.get();
      toggle.hidden = !!c;
      if (c) setOpen(false);
      applied.hidden = !c;
      applied.replaceChildren(...(c ? [
        h('span', { class: 'bag-coupon-chip' }, L.ui.icon('tag', { size: 16 }), h('bdi', { dir: 'ltr' }, c.code), h('span', null, `· ${c.label}`)),
        L.ui.button('הסרה', { variant: 'plain', size: 'sm', ariaLabel: `הסרת הקופון ${c.code}`, onClick: () => { S().coupon.set(null); onChange(); } }),
      ] : []));
    };
    setOpen(false);
    return el;
  }

  /* ---------- Switch row ---------- */
  function giftRow(onChange) {
    const id = L.uid('gift');
    const input = h('input', { id, type: 'checkbox', role: 'switch', class: 'st-switch', checked: S().gift.get() });
    input.addEventListener('change', () => { S().gift.set(input.checked); L.haptic(6); onChange(); });
    return h('label', { class: 'bag-gift', for: id },
      h('span', { class: 'bag-gift-icon' }, L.ui.icon('gift', { size: 22 })),
      h('span', { class: 'bag-gift-text' }, h('strong', null, 'אריזת מתנה + כרטיס ברכה'), h('span', null, 'קופסה ממותגת וסרט סאטן · ללא עלות')),
      input);
  }

  /* ---------- Summary ---------- */
  function summaryBox() {
    const rows = h('dl', { class: 'st-sum' });
    const el = h('div', { class: 'bag-summary-card' }, rows);
    el.update = () => {
      const t = S().totals('home');
      const row = (k, v, cls) => h('div', { class: ['st-sum-row', cls] }, h('dt', null, k), h('dd', null, v));
      rows.replaceChildren(...[
        row(`סכום ביניים (${S().itemsText(t.count)})`, S().priceEl(t.subtotal)),
        t.coupon ? row(`הנחה · ${t.coupon.code}`, S().priceEl(-t.discount), 'is-discount') : null,
        row('משלוח עד הבית', t.shipping ? S().priceEl(t.shipping) : h('span', { class: 'st-free' }, 'חינם')),
        S().gift.get() ? row('אריזת מתנה', h('span', { class: 'st-free' }, 'חינם')) : null,
        row('סה״כ כולל מע״מ', S().priceEl(t.total), 'is-total')].filter(Boolean));
    };
    return el;
  }

  /* ---------- Recommendations ---------- */
  function recs(title, exclude = []) {
    const ids = RECS.filter((id) => !exclude.includes(id)).slice(0, 4);
    if (!ids.length) return null;
    return h('section', { class: 'bag-recs', 'aria-label': title },
      h('h2', { class: 'st-h2' }, title),
      h('div', { class: 'st-hscroll', style: { '--cols': String(Math.max(3, ids.length)) } }, ids.map((id) => L.ui.productCard(id))));
  }

  L.views.define('bag', {
    route: '/bag',
    title: 'סל',
    tab: 'bag',
    render(ctx) {
      const root = h('div', { class: 'container bag' });
      ctx.el.append(root);
      let built = null; // DOM of the filled state
      let io = null;

      function buildEmpty() {
        built = null;
        io?.disconnect();
        ctx.setAccessory(null);
        root.replaceChildren(
          L.ui.largeTitle('סל'),
          h('div', { class: 'bag-empty' }, L.ui.empty({
            icon: 'bag', title: 'הסל ריק',
            text: 'בואו נמלא אותו בנצנוץ.',
            action: { label: 'לחנות', href: '#/shop' },
          })),
          recs('אולי תאהבו'));
      }

      function removeLine(row) {
        const it = row.line;
        const done = () => {
          L.cart.remove(it.key);
          L.ui.toast('הוסר מהסל', {
            icon: 'trash',
            subtitle: it.product.name,
            duration: 4200,
            action: { label: 'ביטול', onClick: () => L.cart.add(it.id, { shade: it.shade, size: it.size, qty: it.qty }) },
          });
        };
        L.haptic(10);
        const a = S().animate(row, [
          { opacity: 1, height: `${row.offsetHeight}px` },
          { opacity: 0, height: '0px', paddingBlock: '0px' },
        ], { duration: 340, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
        if (a) a.finished.then(done, done); else done();
      }

      function buildFilled() {
        const lines = h('ul', { class: 'bag-lines', role: 'list' });
        const meter = shippingMeter();
        const summary = summaryBox();
        const coupon = couponBox(() => update());
        const checkoutBtn = L.ui.button('מעבר לתשלום', { variant: 'prominent', size: 'lg', full: true, href: '#/checkout', className: 'bag-checkout' });
        const applePay = L.ui.button('', {
          variant: 'applepay', size: 'lg', full: true, ariaLabel: 'תשלום ב־Apple Pay',
          onClick: () => (L.store.expressPay ? L.store.expressPay('applepay') : L.router.go('#/checkout')),
        });
        const subtitle = h('p', { class: 'large-title-sub' });
        const title = h('header', { class: 'large-title-group' },
          h('h1', { class: 'large-title t-large-title', 'data-large-title': '', tabindex: '-1' }, 'סל'), subtitle);

        const aside = h('aside', { class: 'bag-aside', 'aria-label': 'סיכום הזמנה' },
          h('h2', { class: 'st-h2 bag-aside-title' }, 'סיכום'),
          summary,
          h('div', { class: 'bag-ctas' }, applePay, checkoutBtn),
          h('p', { class: 'st-fine' }, L.ui.icon('lock', { size: 14 }), 'תשלום מאובטח · ללא הרשמה · עד 3 תשלומים ללא ריבית'),
          coupon);
        const main = h('div', { class: 'bag-main' },
          meter,
          lines,
          h('div', { class: 'bag-card' }, giftRow(() => update())));
        const recsEl = recs('אולי תאהבו גם', L.cart.items().map((i) => i.id));
        root.replaceChildren(...[title, h('div', { class: 'bag-layout' }, main, aside), recsEl].filter(Boolean));

        const accBtn = L.ui.button('', { variant: 'prominent', full: true, href: '#/checkout', icon: 'lock', className: 'bag-acc' });
        let accOn = false;
        const setAcc = (on) => { if (on !== accOn) { accOn = on; ctx.setAccessory(on ? accBtn : null); } };
        io?.disconnect();
        if ('IntersectionObserver' in window) {
          io = new IntersectionObserver(([e]) => setAcc(!e.isIntersecting && e.boundingClientRect.top > 0), { rootMargin: '0px 0px -80px 0px' });
          io.observe(checkoutBtn);
        } else setAcc(true);

        built = { lines, meter, summary, coupon, subtitle, accBtn, rows: new Map() };
      }

      function update() {
        const items = L.cart.items();
        if (!items.length) { if (built || !root.firstChild) buildEmpty(); return; }
        if (!built) buildFilled();
        const b = built;
        const seen = new Set();
        items.forEach((it) => {
          seen.add(it.key);
          let row = b.rows.get(it.key);
          if (!row) {
            row = lineItem(it, removeLine);
            b.rows.set(it.key, row);
            b.lines.append(row);
            if (root.isConnected && b.rows.size > 1) S().animate(row, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: S().ease('smooth') });
          }
          row.line = it;
          row.update(it);
        });
        b.rows.forEach((row, key) => { if (!seen.has(key)) { row.remove(); b.rows.delete(key); } });
        const t = S().totals('home');
        b.subtitle.replaceChildren(S().itemsText(t.count), ' · ', h('bdi', null, L.fmt.price(t.total)));
        b.meter.update();
        b.summary.update();
        b.coupon.update();
        b.accBtn.setLabel(`מעבר לתשלום · ${L.fmt.price(t.total)}`);
      }

      update();
      ctx.onCleanup(L.bus.on('cart:change', update));
      ctx.onCleanup(L.bus.on('store:change', update));
      ctx.onCleanup(() => io?.disconnect());
    },
  });
})();

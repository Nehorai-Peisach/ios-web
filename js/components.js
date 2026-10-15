/* LUMA — UI components (L.ui.*). Native iOS 26 feel: glass only on controls. */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;

  /* ---------- helpers ---------- */
  const tpl = document.createElement('template');
  function svg(name, opts) {
    tpl.innerHTML = L.icon(name, opts);
    return tpl.content.firstElementChild || document.createTextNode('');
  }
  const textOf = (v) => (v instanceof Node ? v : document.createTextNode(String(v ?? '')));
  const sizeHint = (s) => (s.grams ? `${L.fmt.price((s.price / s.grams) * 100)} ל־100 ג׳` : '');

  // Glass touch glow follows the finger.
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest?.('.glass-press');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${e.clientX - r.left}px`);
    el.style.setProperty('--gy', `${e.clientY - r.top}px`);
  }, { passive: true, capture: true });

  // Screen-reader announcements.
  function announce(text) {
    let live = document.getElementById('live');
    if (!live) {
      live = h('div', { id: 'live', class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 40);
  }

  /* ---------- Art (defensive: art.js may be missing) ---------- */
  function fallbackArt(product, shadeId, variant) {
    const s = L.catalog.shade(shadeId || product?.defaultShade || 'amethyst') || L.catalog.shades[0];
    return h('div', {
      class: `art art--fallback art--${variant || 'card'}`,
      'aria-hidden': 'true',
      style: {
        '--s-base': s.base, '--s-deep': s.deep, '--s-light': s.light, '--s-glitter': s.glitter,
      },
    }, h('span', { class: 'art-fallback-blob' }));
  }

  function art(productOrId, opts = {}) {
    const p = typeof productOrId === 'string' ? L.catalog.get(productOrId) : productOrId;
    const o = { variant: 'card', ...opts };
    if (L.art && typeof L.art.product === 'function') {
      try {
        const el = L.art.product(p, o);
        if (el instanceof Element) return el;
      } catch (err) { console.warn('[ui.art] art.js failed, using placeholder', err); }
    }
    return fallbackArt(p, o.shade, o.variant);
  }

  function swatchBg(id) {
    if (L.art && typeof L.art.swatch === 'function') {
      try { const v = L.art.swatch(id); if (v) return v; } catch { /* fall through */ }
    }
    const s = L.catalog.shade(id) || L.catalog.shades[0];
    return `radial-gradient(circle at 32% 28%, ${s.glitter} 0 6%, transparent 7%),
            radial-gradient(circle at 68% 62%, ${s.glitter}cc 0 4%, transparent 5%),
            radial-gradient(circle at 30% 30%, ${s.light}, ${s.base} 52%, ${s.deep})`;
  }

  /* ---------- Buttons ---------- */
  function button(label, o = {}) {
    const { variant = 'filled', size = 'md', icon, full, onClick, href, ariaLabel, type = 'button', disabled, className, iconEnd } = o;
    const isLink = !!href;
    const cls = ['btn', `btn--${variant}`, `btn--${size}`, full && 'btn--full', className];
    if (variant === 'glass') cls.push('glass', 'glass-press');
    if (variant === 'prominent-glass') cls.push('glass', 'glass--prominent', 'glass-press');
    const el = h(isLink ? 'a' : 'button', {
      class: cls,
      href: isLink ? href : null,
      type: isLink ? null : type,
      disabled: !isLink && disabled ? true : null,
      'aria-disabled': isLink && disabled ? 'true' : null,
      'aria-label': ariaLabel || null,
      onClick: onClick ? (e) => { if (!el.disabled) onClick(e); } : null,
    });

    if (variant === 'applepay') {
      if (label) el.append(h('span', { class: 'btn-label applepay-prefix' }, label));
      el.append(
        h('span', { class: 'applepay-mark', dir: 'ltr', 'aria-hidden': 'true' }, svg('apple', { size: 20 }), h('span', null, 'Pay')),
        h('span', { class: 'visually-hidden' }, 'Apple Pay'),
      );
    } else {
      if (icon && !iconEnd) el.append(svg(icon, { size: size === 'sm' ? 18 : 20 }));
      if (label != null && label !== '') el.append(h('span', { class: 'btn-label' }, textOf(label)));
      if (icon && iconEnd) el.append(svg(icon, { size: size === 'sm' ? 18 : 20 }));
    }

    el.setLabel = (text) => {
      let lab = el.querySelector('.btn-label');
      if (!lab) {
        lab = h('span', { class: 'btn-label' });
        const end = iconEnd ? el.querySelector('svg') : null;
        el.insertBefore(lab, end);
      }
      lab.textContent = text;
    };
    el.setDisabled = (v) => {
      if (isLink) el.setAttribute('aria-disabled', v ? 'true' : 'false');
      else el.disabled = !!v;
    };
    return el;
  }

  function iconButton(icon, o = {}) {
    const { ariaLabel, onClick, variant = 'glass', filled = false, size = 'md', href, className, badge } = o;
    const cls = ['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className];
    if (variant === 'glass') cls.push('glass', 'glass-press');
    if (variant === 'clear') cls.push('glass', 'glass--clear', 'glass-press');
    if (variant === 'prominent') cls.push('glass', 'glass--prominent', 'glass-press');
    const el = h(href ? 'a' : 'button', {
      class: cls,
      href: href || null,
      type: href ? null : 'button',
      'aria-label': ariaLabel || icon,
      onClick: onClick || null,
    }, svg(icon, { filled, size: size === 'sm' ? 20 : 22 }));
    if (badge != null) el.append(h('span', { class: 'icon-btn-badge' }, badge));
    el.setIcon = (name, opts) => { el.querySelector('svg')?.replaceWith(svg(name, { size: size === 'sm' ? 20 : 22, ...opts })); };
    return el;
  }

  /* ---------- Stepper (numeric: never mirrored) ---------- */
  function stepper(o = {}) {
    let { value = 1 } = o;
    const { min = 1, max = 10, onChange, label = 'כמות', size = 'md' } = o;
    const minus = h('button', { type: 'button', class: 'stepper-btn', 'aria-label': 'הפחתת כמות' }, svg('minus', { size: 20 }));
    const plus = h('button', { type: 'button', class: 'stepper-btn', 'aria-label': 'הוספת כמות' }, svg('plus', { size: 20 }));
    const out = h('output', { class: 'stepper-value', 'aria-live': 'polite' });
    const el = h('div', { class: `stepper stepper--${size}`, role: 'group', 'aria-label': label, dir: 'ltr' }, minus, out, plus);

    function sync() {
      out.textContent = String(value);
      minus.disabled = value <= min;
      plus.disabled = value >= max;
    }
    function set(v, fire) {
      const next = L.clamp(Math.round(v), min, max);
      if (next === value) return;
      const dir = next > value ? 'up' : 'down';
      value = next;
      sync();
      out.dataset.dir = dir;
      out.classList.remove('is-bump');
      void out.offsetWidth;
      out.classList.add('is-bump');
      if (fire) { L.haptic(); onChange?.(value); }
    }
    minus.addEventListener('click', () => set(value - 1, true));
    plus.addEventListener('click', () => set(value + 1, true));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); set(value + 1, true); }
      if (e.key === 'ArrowDown') { e.preventDefault(); set(value - 1, true); }
    });
    value = L.clamp(value, min, max);
    sync();
    el.setValue = (v) => set(v, false);
    el.getValue = () => value;
    return el;
  }

  /* ---------- Segmented control (sliding pill, snappy spring) ---------- */
  function segmented(o = {}) {
    const { items = [], onChange, glass = true, ariaLabel = '', size = 'md' } = o;
    let value = o.value ?? items[0]?.id;
    const pill = h('span', { class: 'seg-pill', 'aria-hidden': 'true' });
    const el = h('div', {
      class: ['seg', `seg--${size}`, glass ? 'seg--glass glass' : 'seg--solid'],
      role: 'radiogroup',
      'aria-label': ariaLabel || null,
      style: { '--seg-n': items.length },
    }, pill);
    const btns = items.map((it) =>
      h('button', {
        type: 'button', class: 'seg-item', role: 'radio', 'data-id': it.id,
        onClick: () => select(it.id, true),
      }, h('span', { class: 'seg-label' }, it.label)));
    el.append(...btns);

    let placed = false;
    function place() {
      const b = btns.find((x) => x.dataset.id === String(value));
      if (!b || !b.offsetWidth) return;
      el.style.setProperty('--pill-x', `${b.offsetLeft}px`);
      el.style.setProperty('--pill-w', `${b.offsetWidth}px`);
      if (!placed) {
        placed = true;
        requestAnimationFrame(() => el.classList.add('is-ready'));
      }
    }
    function sync() {
      btns.forEach((b) => {
        const on = b.dataset.id === String(value);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        b.classList.toggle('is-selected', on);
      });
      place();
    }
    function select(id, fire) {
      if (String(id) === String(value)) return;
      value = items.find((it) => String(it.id) === String(id))?.id ?? value;
      sync();
      if (fire) { L.haptic(); onChange?.(value); }
    }
    el.addEventListener('keydown', (e) => {
      const rtl = getComputedStyle(el).direction === 'rtl';
      const keys = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, Home: -99, End: 99 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const i = items.findIndex((it) => String(it.id) === String(value));
      const next = items[L.clamp(i + keys[e.key], 0, items.length - 1)];
      select(next.id, true);
      btns.find((b) => b.dataset.id === String(next.id))?.focus();
    });
    if ('ResizeObserver' in window) {
      // Removal from the DOM reports a 0×0 box: that is our cue to let go of the observer.
      let attached = false;
      const ro = new ResizeObserver(() => {
        if (el.isConnected) { attached = true; place(); } else if (attached) ro.disconnect();
      });
      ro.observe(el);
    }
    document.fonts?.ready?.then(place);
    sync();
    el.setValue = (id) => select(id, false);
    el.getValue = () => value;
    return el;
  }

  /* ---------- Chips (size selection) ---------- */
  function chips(o = {}) {
    const { items = [], onChange, ariaLabel = 'גודל' } = o;
    let value = o.value ?? items.find((i) => !i.disabled)?.id;
    const el = h('div', { class: 'chips', role: 'radiogroup', 'aria-label': ariaLabel });
    const btns = items.map((it) => h('button', {
      type: 'button', class: 'chip', role: 'radio', 'data-id': it.id,
      'aria-disabled': it.disabled ? 'true' : null,
      onClick: () => { if (!it.disabled) select(it.id, true); },
    },
    h('span', { class: 'chip-label' }, it.label),
    it.sub ? h('span', { class: 'chip-sub' }, it.sub) : null));
    el.append(...btns);
    function sync() {
      btns.forEach((b) => {
        const on = b.dataset.id === String(value);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
    }
    function select(id, fire) {
      if (String(id) === String(value)) return;
      value = id;
      sync();
      if (fire) { L.haptic(); onChange?.(value); }
    }
    el.addEventListener('keydown', (e) => {
      const rtl = getComputedStyle(el).direction === 'rtl';
      const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const enabled = items.filter((i) => !i.disabled);
      const i = enabled.findIndex((it) => String(it.id) === String(value));
      const next = enabled[L.clamp(i + step, 0, enabled.length - 1)];
      select(next.id, true);
      btns.find((b) => b.dataset.id === String(next.id))?.focus();
    });
    sync();
    el.setValue = (id) => select(id, false);
    el.getValue = () => value;
    return el;
  }

  /* ---------- Swatches (round, with shade name in text) ---------- */
  function swatches(o = {}) {
    const { shades = [], onChange, showName = true, size = 'md' } = o;
    let value = o.value ?? shades[0];
    const name = h('strong', { class: 'swatches-name' });
    const row = h('div', { class: 'swatches-row', role: 'radiogroup', 'aria-label': 'גוון' });
    const el = h('div', { class: `swatches swatches--${size}` },
      showName ? h('div', { class: 'swatches-head' }, h('span', { class: 'swatches-caption' }, 'גוון: '), name) : null,
      row);
    const btns = shades.map((id) => {
      const s = L.catalog.shade(id);
      return h('button', {
        type: 'button', class: 'swatch', role: 'radio', 'data-id': id,
        'aria-label': s?.name || id, title: s?.name || id,
        onClick: () => select(id, true),
      }, h('span', { class: 'swatch-dot', style: { background: swatchBg(id) } }));
    });
    row.append(...btns);
    function sync() {
      btns.forEach((b) => {
        const on = b.dataset.id === value;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
      name.textContent = L.catalog.shade(value)?.name || '';
    }
    function select(id, fire) {
      if (id === value) return;
      value = id;
      sync();
      if (fire) { L.haptic(); onChange?.(value); }
    }
    row.addEventListener('keydown', (e) => {
      const rtl = getComputedStyle(row).direction === 'rtl';
      const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const i = shades.indexOf(value);
      const next = shades[L.clamp(i + step, 0, shades.length - 1)];
      select(next, true);
      btns.find((b) => b.dataset.id === next)?.focus();
    });
    sync();
    el.setValue = (id) => select(id, false);
    el.getValue = () => value;
    return el;
  }

  /* ---------- Accordion (inset grouped) ---------- */
  function accordion(items = []) {
    const el = h('div', { class: 'accordion' });
    items.forEach((it) => {
      const id = L.uid('acc');
      const content = typeof it.content === 'string' ? h('p', { class: 'acc-text' }, it.content) : it.content;
      const panel = h('div', { class: 'acc-panel', id: `${id}-p`, role: 'region', 'aria-labelledby': `${id}-b` },
        h('div', { class: 'acc-inner' }, h('div', { class: 'acc-content' }, content)));
      const btn = h('button', {
        type: 'button', class: 'acc-btn', id: `${id}-b`, 'aria-controls': `${id}-p`,
      }, h('span', { class: 'acc-title' }, it.title), svg('chevronDown', { size: 20 }));
      const item = h('div', { class: 'acc-item' }, h('h3', { class: 'acc-h' }, btn), panel);
      const setOpen = (open) => {
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.inert = !open;
      };
      btn.addEventListener('click', () => setOpen(!item.classList.contains('is-open')));
      setOpen(!!it.open);
      el.append(item);
    });
    return el;
  }

  /* ---------- Grouped list (iOS 26 inset grouped) ---------- */
  function rowIcon(icon) {
    if (!icon) return null;
    if (icon instanceof Node) return h('span', { class: 'glist-icon' }, icon);
    return h('span', { class: 'glist-icon' }, svg(icon, { size: 20 }));
  }

  function groupedRow(r) {
    const interactive = !!(r.href || r.onClick);
    const chevron = r.chevron ?? !!r.href;
    const tag = r.href ? 'a' : r.onClick ? 'button' : 'div';
    return h(tag, {
      class: ['glist-row', interactive && 'is-interactive', r.icon && 'has-icon', r.destructive && 'is-destructive'],
      href: r.href || null,
      type: tag === 'button' ? 'button' : null,
      onClick: r.onClick || null,
    },
    rowIcon(r.icon),
    h('span', { class: 'glist-text' },
      h('span', { class: 'glist-title' }, textOf(r.title)),
      r.subtitle ? h('span', { class: 'glist-sub' }, textOf(r.subtitle)) : null),
    r.value != null ? h('span', { class: 'glist-value' }, textOf(r.value)) : null,
    r.accessory || null,
    chevron ? h('span', { class: 'glist-chevron' }, svg('forward', { size: 18 })) : null);
  }

  function groupedList(sections = []) {
    const el = h('div', { class: 'glist' });
    sections.forEach((sec) => {
      const hid = sec.header ? L.uid('gh') : null;
      el.append(h('section', { class: 'glist-section', 'aria-labelledby': hid },
        sec.header ? h('h2', { class: 'glist-header', id: hid }, textOf(sec.header)) : null,
        h('div', { class: 'glist-card' }, (sec.rows || []).map(groupedRow)),
        sec.footer ? h('p', { class: 'glist-footer' }, textOf(sec.footer)) : null));
    });
    return el;
  }

  /* ---------- Sheet ---------- */
  const openSheets = [];
  const overlayRoot = () => document.getElementById('overlays') || document.body;
  const shellRoot = () => document.getElementById('shell');
  const isWide = () => L.mq('(min-width: 734px)').matches;

  function sheet(o = {}) {
    const { title, content, cancel, done, onClose, ariaLabel } = o;
    let detent = o.detent === 'large' ? 'large' : 'medium';
    const prevFocus = document.activeElement;
    const titleId = L.uid('sheet');

    const dim = h('div', { class: 'sheet-dim' });
    const panel = h('section', {
      class: 'sheet glass glass--thick',
      role: 'dialog', 'aria-modal': 'true',
      'aria-labelledby': title ? titleId : null,
      'aria-label': title ? null : (ariaLabel || 'חלונית'),
      tabindex: '-1',
    });
    const grabber = h('div', { class: 'sheet-grabber', 'aria-hidden': 'true' });

    const lead = h('div', { class: 'sheet-lead' });
    const trail = h('div', { class: 'sheet-trail' });
    if (cancel) {
      lead.append(h('button', { type: 'button', class: 'sheet-text-btn', onClick: () => close('cancel') }, cancel));
    } else if (!done) {
      lead.append(iconButton('close', { variant: 'fill', size: 'md', ariaLabel: 'סגירה', onClick: () => close('close') }));
    }
    if (done) {
      const dbtn = h('button', { type: 'button', class: 'sheet-done-btn' }, done.label || 'סיום');
      dbtn.addEventListener('click', (e) => {
        const r = done.onClick?.(e, apiRef);
        if (r !== false) close('done');
      });
      trail.append(dbtn);
    }
    const header = h('header', { class: 'sheet-header' }, lead,
      title ? h('h2', { class: 'sheet-title', id: titleId }, title) : h('span', { class: 'sheet-title' }),
      trail);
    const body = h('div', { class: 'sheet-body' }, content || null);
    panel.append(grabber, header, body);

    const layer = h('div', { class: 'sheet-layer', 'data-detent': detent, 'data-state': 'closed' }, dim, panel);
    overlayRoot().append(layer);
    const apiRef = { el: layer, panel, body, close, setDetent };

    /* open */
    openSheets.push(apiRef);
    document.documentElement.classList.add('is-locked');
    const shell = shellRoot();
    if (shell) shell.inert = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      layer.dataset.state = 'open';
      panel.focus({ preventScroll: true });
    }));

    let closed = false;
    function close(reason = 'close') {
      if (closed) return;
      closed = true;
      layer.dataset.state = 'closing';
      panel.style.transform = '';
      dim.style.opacity = '';
      const idx = openSheets.indexOf(apiRef);
      if (idx >= 0) openSheets.splice(idx, 1);
      document.removeEventListener('keydown', onKey, true);
      const finish = () => {
        layer.remove();
        if (!openSheets.length) {
          document.documentElement.classList.remove('is-locked');
          if (shell) shell.inert = false;
        }
        // On navigation the router focuses the new page's title — don't steal it back.
        if (reason !== 'route' && prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
        onClose?.(reason);
      };
      setTimeout(finish, L.reducedMotion() ? 160 : 420);
    }

    function setDetent(d) {
      detent = d === 'large' ? 'large' : 'medium';
      layer.dataset.detent = detent;
    }

    /* keyboard: Esc + focus trap */
    function onKey(e) {
      if (openSheets[openSheets.length - 1] !== apiRef) return;
      if (e.key === 'Escape') { e.preventDefault(); close('escape'); return; }
      if (e.key !== 'Tab') return;
      const f = L.$$('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', panel)
        .filter((x) => x.tabIndex >= 0 && x.offsetParent !== null && !x.closest('[inert]'));
      if (!f.length) { e.preventDefault(); panel.focus(); return; }
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    dim.addEventListener('click', () => close('dim'));

    /* swipe: down to dismiss, up to expand */
    let drag = null;
    function onDown(e) {
      if (isWide() || e.button > 0 || e.target.closest('button, a, input, select, textarea')) return;
      drag = { y0: e.clientY, y: e.clientY, t: performance.now(), v: 0, h: panel.offsetHeight };
      panel.setPointerCapture(e.pointerId);
      layer.classList.add('is-dragging');
    }
    function onMove(e) {
      if (!drag) return;
      const now = performance.now();
      drag.v = (e.clientY - drag.y) / Math.max(1, now - drag.t);
      drag.y = e.clientY;
      drag.t = now;
      let dy = e.clientY - drag.y0;
      if (dy < 0) dy = detent === 'medium' ? dy * 0.35 : dy * 0.12; // rubber band
      panel.style.transform = `translateY(${dy}px)`;
      dim.style.opacity = String(L.clamp(1 - dy / drag.h, 0, 1));
    }
    function onUp() {
      if (!drag) return;
      const dy = drag.y - drag.y0;
      const v = drag.v;
      drag = null;
      layer.classList.remove('is-dragging');
      panel.style.transform = '';
      dim.style.opacity = '';
      if (dy < -48 && detent === 'medium') { setDetent('large'); L.haptic(); return; }
      if (dy > 110 || v > 0.55) {
        if (detent === 'large' && dy < panel.offsetHeight * 0.45 && v < 1.2) setDetent('medium');
        else close('swipe');
      }
    }
    panel.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sheet-grabber, .sheet-header') || (body.scrollTop <= 0 && e.target.closest('.sheet-drag'))) onDown(e);
    });
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerup', onUp);
    panel.addEventListener('pointercancel', onUp);

    return apiRef;
  }
  sheet.closeAll = () => openSheets.slice().forEach((s) => s.close('route'));

  /* ---------- Toast (floating glass capsule at the top) ---------- */
  let currentToast = null;
  // Keyboard: Alt+T jumps to the open toast's action (it lives outside the page's tab order).
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || e.code !== 'KeyT' || !currentToast?.action) return;
    e.preventDefault();
    currentToast.returnFocus = document.activeElement;
    currentToast.action.focus();
  });

  function toast(text, o = {}) {
    const { icon = 'check', action, subtitle } = o;
    // Toasts with an action stay long enough to be reached (WCAG 2.2.1).
    const duration = Math.max(o.duration ?? 2600, action ? 6000 : 0);
    currentToast?.close(true);
    let root = document.getElementById('toasts');
    if (!root) { root = h('div', { id: 'toasts', class: 'toasts' }); document.body.append(root); }

    const actionBtn = action ? h('button', {
      type: 'button', class: 'toast-action', 'aria-keyshortcuts': 'Alt+T',
      onClick: () => { close(); action.onClick?.(); },
    }, action.label) : null;
    const el = h('div', { class: 'toast glass', 'data-state': 'enter' },
      icon ? h('span', { class: 'toast-icon' }, svg(icon, { size: 18 })) : null,
      h('span', { class: 'toast-text' },
        h('span', { class: 'toast-title' }, text),
        subtitle ? h('span', { class: 'toast-sub' }, subtitle) : null),
      actionBtn);
    root.append(el);
    announce([text, subtitle, action && `לפעולה „${action.label}”: Alt+T`].filter(Boolean).join('. '));
    requestAnimationFrame(() => requestAnimationFrame(() => { el.dataset.state = 'open'; }));

    // Hover or keyboard focus pauses the timer; leaving restarts a short one.
    let timer = setTimeout(close, duration);
    const pause = () => clearTimeout(timer);
    const resume = () => { clearTimeout(timer); timer = setTimeout(close, 1400); };
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', (e) => { if (!el.contains(e.relatedTarget)) resume(); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });

    // Swipe up to dismiss.
    let y0 = null;
    el.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) y0 = e.clientY; });
    el.addEventListener('pointermove', (e) => { if (y0 != null && e.clientY - y0 < -12) { y0 = null; close(); } });
    el.addEventListener('pointerup', () => { y0 = null; });

    let gone = false;
    function close(instant) {
      if (gone) return;
      gone = true;
      clearTimeout(timer);
      el.dataset.state = 'leave';
      if (el.contains(document.activeElement)) {
        const back = handle.returnFocus;
        if (back && back.isConnected) back.focus({ preventScroll: true }); else document.activeElement.blur();
      }
      setTimeout(() => el.remove(), instant ? 220 : 420);
      if (currentToast === handle) currentToast = null;
    }
    const handle = { el, close, action: actionBtn };
    currentToast = handle;
    return handle;
  }

  /* ---------- Badge, large title, empty ---------- */
  function badge(text, o = {}) {
    const tone = o.tone || (/מוגבלת/.test(text) ? 'limited' : 'accent');
    return h('span', { class: `badge badge--${tone}` }, text);
  }

  function largeTitle(text, subtitle) {
    const h1 = h('h1', { class: 'large-title t-large-title', 'data-large-title': '', tabindex: '-1' }, textOf(text));
    if (!subtitle) return h1;
    return h('header', { class: 'large-title-group' }, h1, h('p', { class: 'large-title-sub' }, textOf(subtitle)));
  }

  function empty(o = {}) {
    const { icon = 'sparkle', title, text, action } = o;
    let act = null;
    if (action instanceof Node) act = action;
    else if (action) act = button(action.label, { variant: action.variant || 'prominent', size: 'lg', href: action.href, onClick: action.onClick });
    return h('div', { class: 'empty' },
      h('div', { class: 'empty-icon' }, svg(icon, { size: 40 })),
      title ? h('h2', { class: 'empty-title' }, title) : null,
      text ? h('p', { class: 'empty-text' }, text) : null,
      act ? h('div', { class: 'empty-action' }, act) : null);
  }

  /* ---------- Variant sheet (quick add) ---------- */
  function toastAdded(p, line) {
    if (line && line.added < line.requested) {
      toast(line.added ? `נוספו ${line.added} יחידות בלבד` : 'הכמות המרבית כבר בסל', {
        icon: 'info',
        subtitle: `אפשר עד ${L.cart.MAX_QTY} יחידות מכל פריט`,
        action: { label: 'לסל', onClick: () => L.router?.go('#/bag') },
      });
      return;
    }
    const shadeName = line?.shade && p.shades?.length > 1 ? ` · ${L.catalog.shade(line.shade)?.name}` : '';
    toast('נוסף לסל', {
      icon: 'check',
      subtitle: `${p.name}${shadeName}`,
      action: { label: 'לסל', onClick: () => L.router?.go('#/bag') },
    });
  }

  function variantSheet(product, o = {}) {
    const p = typeof product === 'string' ? L.catalog.get(product) : product;
    let shade = o.shade && p.shades?.includes(o.shade) ? o.shade : p.defaultShade;
    let size = o.size || p.sizes[0].id;
    let qty = 1;

    const thumb = h('div', { class: 'vsheet-thumb' }, art(p, { shade, variant: 'thumb' }));
    const priceEl = h('span', { class: 'vsheet-price' });
    const addBtn = button('', { variant: 'prominent', size: 'lg', full: true, icon: 'bag' });
    const refresh = () => {
      const unit = L.catalog.price(p, size);
      priceEl.textContent = L.fmt.price(unit);
      addBtn.setLabel(`הוספה לסל · ${L.fmt.price(unit * qty)}`);
    };

    const parts = [
      h('div', { class: 'vsheet-head' }, thumb,
        h('div', { class: 'vsheet-meta' },
          h('h2', { class: 'vsheet-name' }, p.name),
          h('p', { class: 'vsheet-short' }, p.short),
          priceEl)),
    ];
    if (p.shades && p.shades.length > 1) {
      parts.push(h('div', { class: 'vsheet-field' }, swatches({
        shades: p.shades, value: shade,
        onChange: (id) => { shade = id; thumb.replaceChildren(art(p, { shade, variant: 'thumb' })); },
      })));
    }
    if (p.sizes.length > 1) {
      parts.push(h('div', { class: 'vsheet-field' },
        h('div', { class: 'vsheet-label' }, 'גודל'),
        chips({
          items: p.sizes.map((s) => ({ id: s.id, label: s.label, sub: sizeHint(s) })),
          value: size,
          onChange: (id) => { size = id; refresh(); },
        })));
    }
    parts.push(h('div', { class: 'vsheet-field vsheet-qty' },
      h('div', { class: 'vsheet-label' }, 'כמות'),
      stepper({ value: 1, min: 1, max: 10, onChange: (v) => { qty = v; refresh(); } })));
    parts.push(h('div', { class: 'vsheet-cta' }, addBtn));
    refresh();

    const s = sheet({ content: h('div', { class: 'vsheet' }, parts), detent: 'medium', ariaLabel: p.name });
    addBtn.addEventListener('click', () => {
      const line = L.cart.add(p.id, { shade, size, qty });
      L.haptic(12);
      s.close('done');
      toastAdded(p, line);
    });
    return s;
  }

  /* ---------- Product card (SOLID) ---------- */
  function clearMorphNames(except) {
    L.$$('[data-morph]').forEach((n) => { if (n !== except) { n.style.viewTransitionName = ''; delete n.dataset.morph; } });
  }

  function productCard(product, o = {}) {
    const p = typeof product === 'string' ? L.catalog.get(product) : product;
    if (!p) return h('div');
    let shade = o.shade && p.shades?.includes(o.shade) ? o.shade : p.defaultShade;
    const multiShade = !!(p.shades && p.shades.length > 1);
    const needsSheet = multiShade || p.sizes.length > 1;
    const href = () => `#/product/${p.id}${multiShade && shade ? `?shade=${shade}` : ''}`;

    const media = h('div', { class: 'pcard-media' });
    const setArt = () => {
      const a = art(p, { shade, variant: 'card' });
      a.classList.add('pcard-art');
      const old = media.querySelector('.pcard-art');
      if (old) old.replaceWith(a);
      else media.prepend(a);
    };

    const link = h('a', { class: 'pcard-link', href: href() }, p.name);
    link.addEventListener('click', () => {
      const a = media.querySelector('.pcard-art');
      if (!a) return;
      clearMorphNames(a);
      a.style.viewTransitionName = `art-${p.id}`;
      a.dataset.morph = p.id;
    });

    const priceText = p.sizes.length > 1 ? `החל מ־${L.fmt.price(L.catalog.priceFrom(p))}` : L.fmt.price(L.catalog.priceFrom(p));
    const add = h('button', {
      type: 'button', class: 'pcard-add glass glass-press',
      'aria-label': `הוספה מהירה לסל: ${p.name}`,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        L.haptic();
        if (needsSheet) { variantSheet(p, { shade }); return; }
        const line = L.cart.add(p.id, { shade, size: p.sizes[0].id, qty: 1 });
        toastAdded(p, line);
      },
    }, svg('plus', { size: 20 }));

    if (p.badge) media.append(h('span', { class: 'pcard-badge' }, badge(p.badge)));
    media.append(add);
    setArt();

    let dots = null;
    if (multiShade) {
      dots = h('div', { class: 'pcard-dots', role: 'radiogroup', 'aria-label': `גוון עבור ${p.name}` });
      p.shades.forEach((id) => {
        const s = L.catalog.shade(id);
        dots.append(h('button', {
          type: 'button', class: 'pcard-dot', role: 'radio', 'data-id': id,
          'aria-label': s.name, title: s.name,
          'aria-checked': id === shade ? 'true' : 'false',
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (shade === id) return;
            shade = id;
            L.$$('.pcard-dot', dots).forEach((d) => d.setAttribute('aria-checked', d.dataset.id === id ? 'true' : 'false'));
            link.href = href();
            setArt();
            L.haptic(4);
          },
        }, h('span', { style: { background: swatchBg(id) } })));
      });
    }

    const el = h('article', {
      class: ['pcard', o.compact && 'pcard--compact'],
      'data-id': p.id,
    },
    media,
    h('div', { class: 'pcard-body' },
      h('h3', { class: 'pcard-name' }, link),
      o.showShort ? h('p', { class: 'pcard-short' }, p.short) : null,
      h('div', { class: 'pcard-foot' },
        h('span', { class: 'pcard-price' }, priceText),
        dots)));
    el.setShade = (id) => { if (p.shades?.includes(id)) { shade = id; link.href = href(); setArt(); } };
    return el;
  }

  L.ui = {
    button, iconButton, stepper, segmented, chips, swatches, accordion, groupedList,
    sheet, toast, productCard, largeTitle, badge, empty,
    // extras
    variantSheet, art, swatchBg, icon: svg, announce, toastAdded,
  };
})();

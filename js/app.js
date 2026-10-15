/* LUMA — app shell: view registry, hash router, top bar, floating glass tab bar,
   search, tab-bar accessory, settings, view transitions. Boots on DOMContentLoaded. */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;
  const icon = (n, o) => L.ui.icon(n, o);
  const root = document.documentElement;

  // View registry lives in core.js (views register before app.js loads).
  const defs = L.views._defs;

  /* =====================================================================
     Shell DOM
     ===================================================================== */
  const TABS = [
    { id: 'home', label: 'בית', icon: 'home', href: '#/' },
    { id: 'shop', label: 'חנות', icon: 'shop', href: '#/shop' },
    { id: 'bag', label: 'סל', icon: 'bag', href: '#/bag' },
  ];

  const S = {}; // shell element refs

  function buildShell() {
    const shell = document.getElementById('shell') || document.body.appendChild(h('div', { id: 'shell' }));
    S.main = document.getElementById('main') || shell.appendChild(h('main', { id: 'main', tabindex: '-1' }));

    S.edgeTop = h('div', { class: 'edge edge-top', 'aria-hidden': 'true' });
    S.edgeBottom = h('div', { class: 'edge edge-bottom', 'aria-hidden': 'true' });

    // Top bar
    S.backBtn = L.ui.iconButton('back', { ariaLabel: 'חזרה', onClick: () => back() });
    S.backBtn.classList.add('topbar-back');
    S.settingsBtn = L.ui.iconButton('appearance', { ariaLabel: 'תצוגה', onClick: openSettings });
    S.lead = h('div', { class: 'topbar-lead' }, S.backBtn);
    S.trail = h('div', { class: 'topbar-trail' }, S.settingsBtn);
    S.titleText = h('span', { class: 'topbar-title-text' });
    S.title = h('div', { class: 'topbar-title', 'aria-hidden': 'true' }, S.titleText);
    S.topbar = h('header', { class: 'topbar' }, S.lead, S.title, S.trail);

    // Tab bar
    S.pill = h('span', { class: 'tabbar-pill', 'aria-hidden': 'true' });
    S.tabs = TABS.map((t) => h('a', {
      class: 'tab', href: t.href, 'data-tab': t.id,
      onClick: (e) => onTabClick(e, t),
    },
    h('span', { class: 'tab-icon' }, icon(t.icon), icon(t.icon, { filled: true }),
      t.id === 'bag' ? h('span', { class: 'tab-badge', 'aria-hidden': 'true' }) : null),
    h('span', { class: 'tab-label' }, t.label)));
    S.track = h('div', { class: 'tabbar-track' }, S.pill, ...S.tabs);
    S.mini = h('button', { type: 'button', class: 'tabbar-mini', tabindex: '-1', 'aria-hidden': 'true', onClick: onMiniClick });
    S.tabbar = h('nav', { class: 'tabbar glass', 'aria-label': 'ניווט ראשי' }, S.track, S.mini);

    // Search: round glass button that morphs into a field
    S.searchInput = h('input', {
      class: 'searchbox-input', type: 'search', placeholder: 'חיפוש בחנות',
      'aria-label': 'חיפוש מוצרים', enterkeyhint: 'search', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
    });
    S.searchBtn = h('button', { type: 'button', class: 'searchbox-btn', 'aria-label': 'חיפוש', onClick: openSearch }, icon('search', { size: 24 }));
    S.searchClear = h('button', { type: 'button', class: 'searchbox-clear', 'aria-label': 'ניקוי החיפוש', onClick: clearSearch }, icon('clear', { size: 22 }));
    const glyph = h('span', { class: 'searchbox-glyph', 'aria-hidden': 'true', html: L.icon('search', { size: 20 }) });
    S.searchbox = h('div', { class: 'searchbox glass', role: 'search' }, glyph, S.searchBtn, S.searchInput, S.searchClear);

    // Accessory (iOS 26 bottom accessory)
    S.accessory = h('div', { class: 'dock-accessory glass', 'aria-hidden': 'true' });

    S.dock = h('div', { class: 'dock' }, S.accessory, S.tabbar, S.searchbox);

    shell.prepend(S.edgeTop);
    shell.append(S.edgeBottom, S.topbar, S.dock);
    S.shell = shell;
  }

  /* =====================================================================
     Settings: theme + glass opacity (persisted)
     ===================================================================== */
  const SETTINGS_KEY = 'luma.settings';
  const settings = Object.assign({ theme: 'auto', glassAlpha: null }, L.storage.get(SETTINGS_KEY, {}));

  /** Browser chrome colour follows the in-app override, not only the system scheme. */
  function syncThemeColor(theme) {
    L.$$('meta[name="theme-color"]').forEach((m) => {
      const dark = theme === 'dark' || (theme !== 'light' && /dark/.test(m.media));
      m.setAttribute('content', dark ? '#000000' : '#FFFFFF');
    });
  }
  function applyTheme(theme, animate) {
    const apply = () => {
      if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
      else delete root.dataset.theme;
      syncThemeColor(theme);
    };
    if (animate && document.startViewTransition && !L.reducedMotion()) {
      root.dataset.nav = 'theme';
      const vt = document.startViewTransition(apply);
      vt.finished.finally(() => { if (root.dataset.nav === 'theme') delete root.dataset.nav; });
      vt.ready?.catch(() => {});
    } else apply();
  }
  function applyGlass(alpha) {
    if (typeof alpha === 'number') root.style.setProperty('--glass-alpha', alpha.toFixed(2));
    else root.style.removeProperty('--glass-alpha');
  }
  function saveSettings() {
    L.storage.set(SETTINGS_KEY, settings);
    L.bus.emit('settings:change', { ...settings });
  }
  const currentAlpha = () => parseFloat(getComputedStyle(root).getPropertyValue('--glass-alpha')) || 0.34;

  function openSettings() {
    const range = h('input', {
      type: 'range', class: 'glass-range', min: '0.18', max: '0.85', step: '0.01',
      'aria-label': 'שקיפות זכוכית',
    });
    const syncRange = () => {
      const a = settings.glassAlpha ?? currentAlpha();
      range.value = String(a);
      range.style.setProperty('--p', `${((a - 0.18) / 0.67) * 100}%`);
      range.setAttribute('aria-valuetext', a < 0.35 ? 'שקוף' : a > 0.65 ? 'מעומעם' : 'מאוזן');
    };
    range.addEventListener('input', () => {
      settings.glassAlpha = Math.round(parseFloat(range.value) * 100) / 100;
      applyGlass(settings.glassAlpha);
      syncRange();
      resetBtn.hidden = false;
    });
    range.addEventListener('change', saveSettings);

    const theme = L.ui.segmented({
      items: [{ id: 'auto', label: 'אוטומטי' }, { id: 'light', label: 'בהיר' }, { id: 'dark', label: 'כהה' }],
      value: settings.theme, glass: false, ariaLabel: 'מראה',
      onChange: (v) => {
        settings.theme = v;
        applyTheme(v, true);
        saveSettings();
        requestAnimationFrame(syncRange);
      },
    });

    const resetBtn = L.ui.button('איפוס לברירת המחדל', {
      variant: 'plain', size: 'sm',
      onClick: () => {
        settings.glassAlpha = null;
        applyGlass(null);
        syncRange();
        saveSettings();
        resetBtn.hidden = true;
      },
    });
    resetBtn.hidden = settings.glassAlpha == null;

    const preview = h('div', { class: 'glass-preview', 'aria-hidden': 'true' },
      h('div', { class: 'glass-preview-bar glass' },
        h('span', { class: 'glass-preview-tab is-on', html: L.icon('home', { filled: true, size: 22 }) }),
        h('span', { class: 'glass-preview-tab', html: L.icon('shop', { size: 22 }) }),
        h('span', { class: 'glass-preview-tab', html: L.icon('bag', { size: 22 }) })),
      h('div', { class: 'glass-preview-dot glass', html: L.icon('search', { size: 20 }) }));

    const content = h('div', { class: 'settings' },
      h('section', { class: 'settings-group' },
        h('h3', { class: 'glist-header' }, 'מראה'),
        h('div', { class: 'glist-card settings-card' }, theme)),
      h('section', { class: 'settings-group' },
        h('h3', { class: 'glist-header' }, 'שקיפות זכוכית'),
        h('div', { class: 'glist-card settings-card' },
          preview,
          h('div', { class: 'settings-slider' },
            h('span', { class: 'settings-slider-end' }, 'שקוף'),
            range,
            h('span', { class: 'settings-slider-end' }, 'מעומעם'))),
        h('p', { class: 'glist-footer' }, 'כמו ב־iOS 27: בחרו כמה שקופה תהיה הזכוכית של הכפתורים והסרגלים. ההגדרה נשמרת במכשיר הזה.'),
        h('div', { class: 'settings-reset' }, resetBtn)));

    syncRange();
    L.ui.sheet({ title: 'תצוגה', content, detent: 'medium', done: { label: 'סיום' } });
  }

  /* =====================================================================
     Router
     ===================================================================== */
  const SCROLL_KEY = 'luma.scroll';
  let current = null;          // { def, params, query, hash, el, cleanups }
  let entryIdx = 0;
  let maxIdx = 0;
  let renderedHash = null;
  let activeVT = null;
  let booted = false;
  const scrollPos = new Map(Object.entries(sessionGet(SCROLL_KEY, {})).map(([k, v]) => [Number(k), v]));
  const tabLast = { home: '#/', shop: '#/shop', bag: '#/bag' };
  let lastTab = 'home';
  let lastProductId = null;

  function sessionGet(key, fb) { try { return JSON.parse(sessionStorage.getItem(key)) ?? fb; } catch { return fb; } }
  function sessionSet(key, v) { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }

  function normalizeHash(path) {
    let p = String(path || '').trim();
    if (p.startsWith('#')) p = p.slice(1);
    if (!p.startsWith('/')) p = `/${p}`;
    return `#${p}`;
  }
  function parse(hash = location.hash) {
    const raw = normalizeHash(hash || '#/').slice(1);
    const qi = raw.indexOf('?');
    const path = qi >= 0 ? raw.slice(0, qi) : raw;
    const query = Object.fromEntries(new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : ''));
    return { path: path || '/', query, hash: `#${raw}` };
  }
  function match(path) {
    for (const def of defs) {
      const m = def.re.exec(path);
      if (m) {
        const params = {};
        def.keys.forEach((k, i) => { try { params[k] = decodeURIComponent(m[i + 1]); } catch { params[k] = m[i + 1]; } });
        return { def, params };
      }
    }
    return { def: notFoundDef, params: {} };
  }
  /** Hashes compare decoded: '#/search?q=לבנדר' and its percent-encoded twin are the same page. */
  const sameHash = (a, b) => {
    const canon = (x) => { try { return decodeURI(String(x || '')); } catch { return String(x || ''); } };
    return canon(a) === canon(b);
  };
  const isAppHash = (hash) => !hash || hash === '#' || hash.startsWith('#/');

  function saveScroll() {
    scrollPos.set(entryIdx, window.scrollY);
    sessionSet(SCROLL_KEY, Object.fromEntries(scrollPos));
  }

  function go(path, opts = {}) {
    const hash = normalizeHash(path);
    if (opts.replace) {
      try { history.replaceState({ lumaIdx: entryIdx }, '', hash); } catch { location.replace(hash); return; }
      navigate('none', { keepScroll: false, focus: true });
      return;
    }
    if (sameHash(hash, renderedHash)) { scrollToTop(); return; }
    saveScroll();
    try {
      maxIdx += 1;
      history.pushState({ lumaIdx: maxIdx }, '', hash);
      entryIdx = maxIdx;
      sessionSet('luma.maxIdx', maxIdx);
      navigate('forward');
    } catch {
      location.hash = hash; // hashchange/popstate picks it up
    }
  }

  function back() {
    if (entryIdx > 0 && history.length > 1) { history.back(); return; }
    const parent = current?.def?.parent
      || (current?.def?.tab && tabRoot(current.def.tab) !== renderedHash ? tabRoot(current.def.tab) : '#/');
    go(parent, { replace: true });
  }
  const tabRoot = (tab) => TABS.find((t) => t.id === tab)?.href || '#/';

  /** Update the query string in place (no new history entry, no re-render). */
  function setQuery(obj, { replace = true } = {}) {
    const { path, query } = parse();
    const next = { ...(replace ? query : {}), ...obj };
    Object.keys(next).forEach((k) => (next[k] == null || next[k] === '') && delete next[k]);
    const qs = new URLSearchParams(next).toString();
    const hash = `#${path}${qs ? `?${qs}` : ''}`;
    try { history.replaceState(history.state, '', hash); } catch { /* file:// edge cases */ }
    renderedHash = hash;
    if (current) current.query = next;
    tabLastUpdate();
  }

  function onPop(e) {
    if (!isAppHash(location.hash)) return;
    if (sameHash(location.hash, renderedHash)) {
      // Same URL re-entered (e.g. from the address bar): tag the new entry so back/forward can restore it.
      if (history.state?.lumaIdx == null) { try { history.replaceState({ lumaIdx: entryIdx }, ''); } catch { /* ignore */ } }
      return;
    }
    const idx = e?.state?.lumaIdx ?? history.state?.lumaIdx;
    saveScroll();
    let dir = 'forward';
    if (idx == null) {
      maxIdx += 1;
      try { history.replaceState({ lumaIdx: maxIdx }, ''); } catch { /* ignore */ }
      entryIdx = maxIdx;
    } else {
      dir = idx < entryIdx ? 'back' : 'forward';
      entryIdx = idx;
      maxIdx = Math.max(maxIdx, idx);
    }
    navigate(dir, { restore: idx != null });
  }

  /* ---------- Navigation + transitions ---------- */
  function navType(prev, next, dir) {
    if (!prev || dir === 'none') return 'none';
    if (prev.def === next.def && JSON.stringify(prev.params) === JSON.stringify(next.params)) return 'none';
    if (next.def.name === 'search' || prev.def.name === 'search') return 'fade';
    const prevRoot = !prev.def.back;
    const nextRoot = !next.def.back;
    if (prevRoot && nextRoot) return 'tab';
    return dir === 'back' ? 'back' : 'forward';
  }

  let navSeq = 0;
  function navigate(dir, opts = {}) {
    // Only the latest navigation may mount: a pending view-transition callback from an
    // earlier one (two go() calls in one frame) must not overwrite it.
    const seq = ++navSeq;
    const loc = parse();
    const next = { ...match(loc.path), query: loc.query, hash: loc.hash };
    const type = navType(current, next, dir);
    renderedHash = loc.hash; // claim early: VT runs the update async
    const restoreY = opts.restore ? (scrollPos.get(entryIdx) ?? 0) : 0;
    const keepScroll = type === 'none' && current && opts.keepScroll !== false;
    const prevDef = current?.def;

    const update = () => {
      if (seq !== navSeq) return;
      mount(next);
      if (!keepScroll) window.scrollTo({ top: restoreY, left: 0, behavior: 'instant' });
      lastY = window.scrollY;
      // Morph back into the card we came from.
      if (type === 'back' && prevDef?.name === 'product' && lastProductId) {
        const art = current.el.querySelector(`.pcard[data-id="${CSS.escape(lastProductId)}"] .pcard-art`);
        if (art && !document.querySelector('[data-morph]')) {
          art.style.viewTransitionName = `art-${lastProductId}`;
          art.dataset.morph = lastProductId;
        }
      }
    };

    activeVT?.skipTransition?.();
    const canVT = typeof document.startViewTransition === 'function' && !L.reducedMotion() && booted && type !== 'none';
    const focusType = opts.focus && booted ? 'replace' : type; // a replaced page still moves focus
    if (!canVT) { update(); afterNav(focusType); return; }

    root.dataset.nav = type;
    let vt;
    try { vt = document.startViewTransition(update); } catch { update(); afterNav(focusType); return; }
    activeVT = vt;
    vt.ready.catch(() => {});
    vt.updateCallbackDone.then(() => { if (seq === navSeq) afterNav(type); }, () => {});
    vt.finished.finally(() => {
      if (activeVT === vt) { activeVT = null; delete root.dataset.nav; }
      L.$$('[data-morph]').forEach((n) => { n.style.viewTransitionName = ''; delete n.dataset.morph; });
    });
  }

  function afterNav(type) {
    if (!booted || type === 'none' || current?.def?.name === 'search') return;
    const h1 = current?.el?.querySelector('[data-large-title], h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    } else S.main.focus({ preventScroll: true });
  }

  function teardown(view) {
    if (!view) return;
    view.cleanups.forEach((fn) => { try { fn(); } catch (err) { console.error('[cleanup]', err); } });
    view.cleanups.length = 0;
  }

  function mount(next) {
    const prev = current;
    teardown(prev);
    L.ui.sheet.closeAll?.();
    if (prev?.def?.name === 'product') lastProductId = prev.params.id;

    const def = next.def;
    const el = h('section', { class: 'view', 'data-view': def.name });
    const cleanups = [];
    current = { def, params: next.params, query: next.query, hash: next.hash, el, cleanups };
    renderedHash = next.hash;

    // Reset shell chrome for the new view.
    setBack(!!def.back);
    setTitle(resolveTitle(def, next.params, next.query));
    setTopActions(null);
    setAccessory(null);
    setTabBarHidden(!!def.hideTabBar);
    if (def.tab) lastTab = def.tab;
    setActiveTab(def.tab || (def.name === 'search' ? null : lastTab));
    setSearchMode(def.name === 'search');
    setMin(false);
    tabLastUpdate();

    const ctx = {
      el,
      params: next.params,
      query: next.query,
      setTitle,
      setAccessory,
      setTopActions,
      onCleanup: (fn) => { if (typeof fn === 'function') cleanups.push(fn); },
      go,
    };
    S.main.replaceChildren(el);
    try {
      def.render(ctx);
    } catch (err) {
      console.error(`[view:${def.name}]`, err);
      el.replaceChildren(h('div', { class: 'container' }, L.ui.empty({
        icon: 'info', title: 'משהו השתבש', text: 'לא הצלחנו להציג את הדף. נסו שוב בעוד רגע.',
        action: { label: 'לדף הבית', href: '#/' },
      })));
    }
    L.bus.emit('route:change', { name: def.name, params: next.params, query: next.query });
    observeLargeTitle();
    requestAnimationFrame(onScroll);
  }

  function tabLastUpdate() {
    if (!current) return;
    const tab = current.def.tab;
    // Transient pages (checkout, order confirmation) are never where a tab tap should return to.
    if (tab && tabLast[tab] !== undefined && current.def.remember !== false) tabLast[tab] = renderedHash;
  }

  function resolveTitle(def, params, query) {
    try { return typeof def.title === 'function' ? def.title(params, query) : def.title || ''; } catch { return ''; }
  }

  /* =====================================================================
     Shell controls
     ===================================================================== */
  function setTitle(text) {
    S.titleText.textContent = text || '';
    document.title = text ? `${text} · לוּמָה` : 'לוּמָה — חול יהלומים';
  }
  function setBack(show) {
    S.backBtn.hidden = !show;
    S.topbar.classList.toggle('has-back', !!show);
  }
  function setTopActions(nodes) {
    const list = nodes == null ? [S.settingsBtn] : (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    S.trail.replaceChildren(...list);
  }
  function setAccessory(node) {
    const on = !!node;
    if (on) S.accessory.replaceChildren(node);
    S.accessory.setAttribute('aria-hidden', on ? 'false' : 'true');
    S.accessory.inert = !on;
    S.dock.classList.toggle('has-accessory', on);
    root.classList.toggle('has-accessory', on);
    if (!on) setTimeout(() => { if (!S.dock.classList.contains('has-accessory')) S.accessory.replaceChildren(); }, 400);
  }
  function setTabBarHidden(hidden) {
    S.dock.classList.toggle('no-tabbar', hidden);
    root.classList.toggle('no-tabbar', hidden);
    S.tabbar.inert = hidden;
    S.searchbox.inert = hidden;
  }

  function setActiveTab(id) {
    S.tabs.forEach((a) => {
      const on = a.dataset.tab === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const tab = TABS.find((t) => t.id === (id || lastTab)) || TABS[0];
    S.mini.innerHTML = L.icon(tab.icon, { filled: true, size: 26 });
    S.mini.setAttribute('aria-label', tab.label);
    placePill();
  }

  let pillReady = false;
  function placePill() {
    const a = S.tabs.find((t) => t.classList.contains('is-active'));
    S.track.classList.toggle('has-active', !!a);
    if (!a || !a.offsetWidth) return;
    S.track.style.setProperty('--pill-x', `${a.offsetLeft}px`);
    S.track.style.setProperty('--pill-w', `${a.offsetWidth}px`);
    if (!pillReady) { pillReady = true; requestAnimationFrame(() => requestAnimationFrame(() => S.track.classList.add('is-ready'))); }
  }

  function onTabClick(e, t) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    if (S.dock.classList.contains('is-min')) { setMin(false); return; }
    L.haptic(6);
    const active = current?.def?.tab === t.id && current?.def?.name !== 'search';
    if (active) {
      if (renderedHash !== t.href) go(t.href);    // pop to root
      else scrollToTop();
      return;
    }
    go(tabLast[t.id] || t.href);
  }
  function onMiniClick() {
    if (searchMode) { leaveSearch(); return; }
    setMin(false);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: L.reducedMotion() ? 'instant' : 'smooth' });
  }

  /* ---------- Bag badge ---------- */
  let lastCount = -1;
  function updateBadge() {
    const n = L.cart.count();
    const badge = S.tabs.find((a) => a.dataset.tab === 'bag')?.querySelector('.tab-badge');
    const bagTab = S.tabs.find((a) => a.dataset.tab === 'bag');
    if (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.hidden = n === 0;
    }
    bagTab?.setAttribute('aria-label', n ? `סל, ${n} פריטים` : 'סל');
    if (lastCount >= 0 && n > lastCount && bagTab) {
      bagTab.classList.remove('is-bump');
      void bagTab.offsetWidth;
      bagTab.classList.add('is-bump');
    }
    lastCount = n;
  }

  /* ---------- Minimize on scroll ---------- */
  let isMin = false;
  let lastY = 0;
  let travel = 0;
  let ticking = false;
  const desktopMQ = L.mq('(min-width: 1068px)');

  function setMin(min) {
    if (min === isMin) return;
    isMin = min;
    S.dock.classList.toggle('is-min', min);
    syncDockA11y();
  }
  /** Collapsed tabs (minimized / search on phones) are invisible: hide them from focus and AT,
      and expose the round "mini" button that stands in for them. */
  function syncDockA11y() {
    const collapsed = (isMin || searchMode) && !desktopMQ.matches;
    S.track.inert = collapsed;
    S.mini.tabIndex = collapsed ? 0 : -1;
    S.mini.setAttribute('aria-hidden', collapsed ? 'false' : 'true');
  }

  function onScroll() {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    S.edgeTop.classList.toggle('is-on', y > 2);
    S.edgeBottom.classList.toggle('is-on', max > 8 && y < max - 4);
    if (!hasLargeTitle) S.topbar.classList.toggle('show-title', y > 36);

    const dy = y - lastY;
    lastY = y;
    if (desktopMQ.matches || searchMode || S.dock.classList.contains('no-tabbar')) { setMin(false); return; }
    travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
    if (y < 60) setMin(false);
    else if (travel > 24) setMin(true);
    else if (travel < -28) setMin(false);
  }
  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }

  /* ---------- Inline title (large title collapse) ---------- */
  let titleIO = null;
  let hasLargeTitle = false;
  function observeLargeTitle() {
    titleIO?.disconnect();
    S.topbar.classList.remove('show-title');
    const lt = current?.el?.querySelector('[data-large-title]');
    hasLargeTitle = !!lt;
    if (!lt || !('IntersectionObserver' in window)) return;
    const topSpace = Math.round(S.topbar.getBoundingClientRect().height) || 56;
    titleIO = new IntersectionObserver(([entry]) => {
      // Views may rebuild their header (e.g. the bag going empty → filled): follow the new one.
      if (!entry.target.isConnected) { observeLargeTitle(); return; }
      const under = !entry.isIntersecting && entry.boundingClientRect.top < topSpace;
      S.topbar.classList.toggle('show-title', under);
    }, { rootMargin: `-${topSpace}px 0px 0px 0px`, threshold: 0 });
    titleIO.observe(lt);
  }

  /* =====================================================================
     Search
     ===================================================================== */
  let searchMode = false;
  let searchQuery = '';
  let searchView = null; // { update(q) }

  function setSearchMode(on) {
    searchMode = on;
    S.dock.classList.toggle('is-search', on);
    S.searchBtn.tabIndex = on ? -1 : 0;
    S.searchBtn.setAttribute('aria-hidden', on ? 'true' : 'false');
    S.searchInput.tabIndex = on ? 0 : -1;
    syncDockA11y();
    if (on) S.mini.setAttribute('aria-label', `סגירת החיפוש וחזרה ל${TABS.find((t) => t.id === lastTab)?.label || 'בית'}`);
    if (!on) { S.searchInput.blur(); searchView = null; }
    syncClear();
  }

  function openSearch() {
    // Focus synchronously inside the tap so iOS raises the keyboard.
    S.searchInput.focus({ preventScroll: true });
    if (!searchMode) go(searchQuery ? `#/search?q=${encodeURIComponent(searchQuery)}` : '#/search');
  }
  function leaveSearch() {
    S.searchInput.blur();
    go(tabLast[lastTab] || '#/');
  }
  function clearSearch() {
    S.searchInput.value = '';
    onSearchInput();
    S.searchInput.focus();
  }
  function syncClear() {
    S.searchClear.hidden = !(searchMode && S.searchInput.value);
  }
  const pushQuery = L.debounce((q) => { if (searchMode) setQuery({ q }); }, 250);
  function onSearchInput() {
    searchQuery = S.searchInput.value;
    syncClear();
    searchView?.update(searchQuery);
    pushQuery(searchQuery.trim());
  }

  const SUGGESTIONS = ['אמטיסט', 'לבנדר', 'חצות', 'מתנה', 'צנצנת', 'כלים', 'מילוי'];
  const POPULAR = ['classic', 'giftbox', 'quartet', 'jar'];

  function renderSearch(ctx) {
    // The field may already hold text typed while the transition was running.
    const q = ctx.query.q || S.searchInput.value || '';
    searchQuery = q;
    S.searchInput.value = q;
    syncClear();

    const results = h('div', { class: 'search-results' });
    const wrap = h('div', { class: 'container search-view' }, L.ui.largeTitle('חיפוש'), results);
    ctx.el.append(wrap);

    function suggestions() {
      return h('div', { class: 'search-block' },
        h('h2', { class: 'search-heading' }, 'הצעות'),
        h('div', { class: 'search-suggest' }, SUGGESTIONS.map((s) => h('button', {
          type: 'button', class: 'search-chip',
          onClick: () => { S.searchInput.value = s; onSearchInput(); },
        }, icon('search', { size: 16 }), h('span', null, s)))),
        h('h2', { class: 'search-heading' }, 'פופולרי עכשיו'),
        h('div', { class: 'pgrid' }, POPULAR.map((id) => L.ui.productCard(id))));
    }

    function update(query) {
      const term = (query || '').trim();
      if (!term) { results.replaceChildren(suggestions()); return; }
      const found = L.catalog.search(term);
      if (!found.length) {
        results.replaceChildren(L.ui.empty({
          icon: 'search',
          title: `אין תוצאות עבור „${term}”`,
          text: 'נסו מילה אחרת, או שם של גוון — למשל „לבנדר” או „חצות”.',
        }));
        L.ui.announce('אין תוצאות');
        return;
      }
      results.replaceChildren(
        h('p', { class: 'search-count' }, found.length === 1 ? 'תוצאה אחת' : `${found.length} תוצאות`),
        h('div', { class: 'pgrid' }, found.map((p) => L.ui.productCard(p))));
      L.ui.announce(found.length === 1 ? 'נמצאה תוצאה אחת' : `נמצאו ${found.length} תוצאות`);
    }

    searchView = { update };
    update(q);
    ctx.onCleanup(() => { if (searchView?.update === update) searchView = null; });
    // A direct tap already focused the field (keyboard up on iOS); cover deep links too.
    if (document.activeElement !== S.searchInput) S.searchInput.focus({ preventScroll: true });
  }

  /* =====================================================================
     Built-in views: search, not-found
     ===================================================================== */
  L.views.define('search', { route: '/search', title: 'חיפוש', tab: null, render: renderSearch });

  const notFoundDef = {
    name: 'notfound', title: 'לא נמצא', tab: null, back: true,
    render(ctx) {
      ctx.el.append(h('div', { class: 'container' }, L.ui.empty({
        icon: 'sparkle', title: 'הדף לא נמצא', text: 'אולי הקישור השתנה. בואו נחזור למשהו מנצנץ.',
        action: { label: 'לחנות', href: '#/shop' },
      })));
    },
  };

  /* =====================================================================
     Keyboard (virtual) offset + global listeners
     ===================================================================== */
  function trackKeyboard() {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      S.dock.style.setProperty('--kb', `${kb > 60 ? kb : 0}px`);
    };
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
  }

  function bindGlobal() {
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', () => { placePill(); requestScroll(); });
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', () => onPop({ state: history.state }));
    desktopMQ.addEventListener?.('change', () => { setMin(false); syncDockA11y(); requestAnimationFrame(placePill); observeLargeTitle(); });
    if ('ResizeObserver' in window) new ResizeObserver(placePill).observe(S.track);
    document.fonts?.ready?.then(placePill);

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (href === '#main' || href === '#') {
        e.preventDefault();
        S.main.focus();
        return;
      }
      if (!href.startsWith('#/')) return;
      e.preventDefault();
      go(href);
    });

    S.searchInput.addEventListener('input', onSearchInput);
    S.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); if (S.searchInput.value) clearSearch(); else leaveSearch(); }
      if (e.key === 'Enter') { e.preventDefault(); S.searchInput.blur(); }
    });

    L.bus.on('cart:change', updateBadge);
    trackKeyboard();
  }

  /* =====================================================================
     Boot
     ===================================================================== */
  function boot() {
    if (booted) return;
    buildShell();
    applyGlass(settings.glassAlpha);
    syncThemeColor(settings.theme);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    if (!isAppHash(location.hash) || !location.hash || location.hash === '#') {
      try { history.replaceState(history.state, '', '#/'); } catch { location.replace('#/'); }
    }
    const st = history.state;
    if (st && typeof st.lumaIdx === 'number') {
      entryIdx = st.lumaIdx;
      maxIdx = Math.max(entryIdx, sessionGet('luma.maxIdx', 0));
    } else {
      maxIdx = sessionGet('luma.maxIdx', 0);
      entryIdx = 0;
      try { history.replaceState({ lumaIdx: 0 }, ''); } catch { /* ignore */ }
    }

    bindGlobal();
    updateBadge();
    navigate('none', { restore: true });
    booted = true;
    requestAnimationFrame(() => root.classList.add('is-booted'));
  }

  L.router = { go, back, current: () => (current ? { name: current.def.name, params: current.params, query: current.query, hash: renderedHash } : null), setQuery };
  L.shell = { openSettings, setMin, openSearch };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

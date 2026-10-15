/* LUMA: Store: Product detail (#/product/:id?shade=). */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;
  const S = () => L.store;

  const SAND_SAFETY = 'לא רעיל וללא אלרגנים ידועים. מתאים מגיל 3, בהשגחת מבוגר. לא למאכל. מומלץ לסגור את האריזה אחרי המשחק כדי לשמור על הרכות.';
  const SAFETY = {
    tools: 'פלסטיק ממוחזר ללא BPA. כולל חלקים קטנים. מתאים מגיל 3, בהשגחת מבוגר.',
    tray: 'עץ טבעי בגימור שמן צמחי. ייתכנו הבדלי גוון וטקסטורה בין מגש למגש, וזה חלק מהיופי. לא לשימוש עם מזון.',
  };
  const PACK_KEYS = ['אריזה', 'מידות', 'מידות הקופסה', 'מידות הצנצנת', 'תכולה'];

  function shipCopy() {
    const f = L.fmt.price;
    return h('div', { class: 'pdp-acc-ship' },
      h('p', null, `משלוח עד הבית: 2–5 ימי עסקים, ${f(L.SHIPPING.home)}, וחינם בהזמנה מעל ${f(L.SHIPPING.freeOver)}.`),
      h('p', null, `נקודת איסוף: ${f(L.SHIPPING.pickup)}. הזמנות עד 14:00 יוצאות באותו יום עסקים.`),
      h('p', null, 'החזרה תוך 14 יום מקבלת המוצר, באריזה סגורה. ההחזר מתבצע לאמצעי התשלום המקורי.'));
  }

  function specTable(p) {
    return h('dl', { class: 'pdp-specs' }, p.specs.map(([k, v]) => h('div', { class: 'pdp-spec' }, h('dt', null, k), h('dd', null, v))));
  }

  function stars(rating) {
    const full = Math.round(rating);
    return h('span', { class: 'pdp-stars', 'aria-hidden': 'true' },
      Array.from({ length: 5 }, (_, i) => L.ui.icon('star', { filled: i < full, size: 15 })));
  }

  /** Ships-today hint (Sun–Thu before 14:00). */
  function dispatchHint() {
    const now = new Date();
    const d = now.getDay();
    if (d <= 4 && now.getHours() < 14) return 'הזמינו עד 14:00 והחבילה יוצאת היום';
    return 'החבילה תצא ביום העסקים הבא';
  }

  function notFound(ctx) {
    ctx.setTitle('המוצר לא נמצא');
    ctx.el.append(h('div', { class: 'container' },
      L.ui.empty({
        icon: 'search', title: 'המוצר לא נמצא',
        text: 'ייתכן שהקישור השתנה או שהמוצר כבר לא זמין. הנה כמה מהאהובים שלנו.',
        action: { label: 'לחנות', href: '#/shop' },
      }),
      h('div', { class: 'pgrid' }, ['classic', 'giftbox', 'quartet', 'jar'].map((id) => L.ui.productCard(id)))));
  }

  L.views.define('product', {
    route: '/product/:id',
    title: (p) => L.catalog.get(p.id)?.name || 'מוצר',
    tab: 'shop',
    back: true,
    parent: '#/shop',
    render(ctx) {
      const p = L.catalog.get(ctx.params.id);
      if (!p) { notFound(ctx); return; }

      const multiShade = !!(p.shades && p.shades.length > 1);
      let shade = p.shades?.includes(ctx.query.shade) ? ctx.query.shade : p.defaultShade;
      let size = p.sizes[0].id;
      let qty = 1;
      const unit = () => L.catalog.price(p, size);
      const sizeObj = () => L.catalog.size(p, size);
      const cat = L.catalog.categories.find((c) => c.id === p.category);

      /* ---------------- Gallery ---------------- */
      const heroArt = L.ui.art(p, { shade, variant: 'hero', alt: p.name });
      heroArt.classList.add('pdp-hero-art');
      heroArt.style.viewTransitionName = `art-${p.id}`;

      const slides = [];
      const slide = (cls, label, ...kids) => {
        const el = h('div', { class: `pdp-slide ${cls}`, role: 'group', 'aria-roledescription': 'שקופית', 'aria-label': label }, ...kids);
        slides.push(el);
        return el;
      };
      slide('pdp-slide--hero', p.name, heroArt);

      // Macro: the living sand field (lazy, non-interactive so swipes still scroll).
      const macroBox = h('div', { class: 'pdp-macro' });
      let stage = null;
      const sandShade = () => shade || 'amethyst';
      slide('pdp-slide--macro', 'תקריב של החול', macroBox,
        h('span', { class: 'pdp-cap' }, L.ui.icon('sparkle', { size: 14 }), 'תקריב · נצנוץ יהלומי'));
      function ensureStage() {
        if (stage || !L.art?.sandStage) return;
        try { stage = L.art.sandStage(macroBox, { shade: sandShade(), interactive: false }); } catch (err) { console.warn('[pdp] sandStage', err); }
      }

      // Scale & packaging.
      const pack = p.specs.find(([k]) => PACK_KEYS.includes(k));
      const scaleArt = L.ui.art(p, { shade, variant: 'card' });
      const scaleLabel = h('span', { class: 'pdp-scale-label' });
      slide('pdp-slide--scale', 'מידות ואריזה',
        h('div', { class: 'pdp-scale' },
          h('div', { class: 'pdp-scale-art' }, scaleArt),
          h('div', { class: 'pdp-scale-rule', 'aria-hidden': 'true' }, h('i'), scaleLabel, h('i'))),
        pack ? h('span', { class: 'pdp-cap pdp-cap--light' }, `${pack[0]}: ${pack[1]}`) : null);

      // Shade lineup (multi-shade products only).
      const lineupBtns = [];
      if (multiShade) {
        slide('pdp-slide--lineup', 'כל הגוונים',
          h('div', { class: 'pdp-lineup' }, p.shades.map((id) => {
            const b = h('button', {
              type: 'button', class: 'pdp-lineup-item', 'data-id': id,
              'aria-label': `בחירת גוון ${L.catalog.shade(id).name}`,
              onClick: () => setShade(id, true),
            }, h('span', { class: 'pdp-lineup-art' }, L.ui.art(p, { shade: id, variant: 'thumb' })), h('span', { class: 'pdp-lineup-name' }, L.catalog.shade(id).name));
            lineupBtns.push(b);
            return b;
          })),
          h('span', { class: 'pdp-cap pdp-cap--light' }, 'ארבעה גוונים. עולם אחד.'));
      }
      slides.forEach((s, i) => s.setAttribute('aria-label', `${s.getAttribute('aria-label')} (${i + 1} מתוך ${slides.length})`));

      const track = h('div', { class: 'pdp-track', tabindex: '0', 'aria-label': 'גלריית תמונות. החליקו או השתמשו בחיצים.' }, slides);
      const dots = h('div', { class: 'pdp-dots', role: 'group', 'aria-label': 'בחירת תמונה' },
        slides.map((_, i) => h('button', { type: 'button', class: 'pdp-dot', 'aria-label': `תמונה ${i + 1} מתוך ${slides.length}`, onClick: () => goSlide(i) }, h('span'))));
      const prevBtn = L.ui.iconButton('back', { ariaLabel: 'התמונה הקודמת', className: 'pdp-nav pdp-nav--prev', size: 'sm', onClick: () => goSlide(index - 1) });
      const nextBtn = L.ui.iconButton('forward', { ariaLabel: 'התמונה הבאה', className: 'pdp-nav pdp-nav--next', size: 'sm', onClick: () => goSlide(index + 1) });
      const gallery = h('div', { class: 'pdp-gallery' }, h('div', { class: 'pdp-stage' }, track, prevBtn, nextBtn), dots);

      let index = 0;
      const rtl = () => getComputedStyle(track).direction === 'rtl';
      const step = () => (slides[1] ? Math.abs(slides[1].offsetLeft - slides[0].offsetLeft) : track.clientWidth) || 1;
      function syncDots() {
        L.$$('.pdp-dot', dots).forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
        prevBtn.hidden = index === 0;
        nextBtn.hidden = index === slides.length - 1;
        slides.forEach((s, i) => { s.inert = i !== index; });
      }
      function goSlide(i) {
        index = L.clamp(i, 0, slides.length - 1);
        if (index === 1) ensureStage();
        track.scrollTo({ left: (rtl() ? -1 : 1) * index * step(), behavior: L.reducedMotion() ? 'instant' : 'smooth' });
        syncDots();
      }
      const onTrackScroll = () => {
        const i = Math.round(Math.abs(track.scrollLeft) / step());
        if (track.scrollLeft !== 0) ensureStage();
        if (i !== index) { index = L.clamp(i, 0, slides.length - 1); syncDots(); }
      };
      track.addEventListener('scroll', onTrackScroll, { passive: true });
      track.addEventListener('keydown', (e) => {
        const dir = { ArrowLeft: rtl() ? 1 : -1, ArrowRight: rtl() ? -1 : 1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        goSlide(index + dir);
      });
      syncDots();
      ctx.onCleanup(() => stage?.destroy?.());

      /* ---------------- Buy box ---------------- */
      const title = h('h1', { class: 'pdp-title', 'data-large-title': '', tabindex: '-1' }, p.name);
      const priceNow = h('bdi', { class: 'pdp-price' });
      const priceUnit = h('span', { class: 'pdp-price-unit' });
      const addBtn = L.ui.button('', { variant: 'prominent', size: 'lg', full: true, className: 'pdp-add' });

      let swatches = null;
      if (multiShade) swatches = L.ui.swatches({ shades: p.shades, value: shade, onChange: (id) => setShade(id, false) });

      let chips = null;
      if (p.sizes.length > 1) {
        chips = L.ui.chips({
          ariaLabel: 'גודל',
          value: size,
          items: p.sizes.map((s) => ({
            id: s.id, label: s.label,
            sub: [h('bdi', { class: 'pdp-chip-price' }, L.fmt.price(s.price)), s.grams ? h('span', { class: 'pdp-chip-unit' }, per100(s)) : null],
          })),
          onChange: (id) => { size = id; refresh(); },
        });
      }
      function per100(s) { return S().per100(s); }

      const stepper = L.ui.stepper({ value: 1, min: 1, max: L.cart.MAX_QTY || 10, label: 'כמות', onChange: (v) => { qty = v; refresh(); } });

      const lowStock = p.stock <= 20;
      const stockNote = lowStock ? h('p', { class: 'pdp-stock' }, h('span', { class: 'pdp-stock-dot', 'aria-hidden': 'true' }),
        p.limited ? `מהדורה ממוספרת · נשארו ${p.stock} יחידות` : `נשארו ${p.stock} יחידות במלאי`) : null;

      const freeLine = h('span', { class: 'pdp-deliver-sub' });
      const delivery = h('div', { class: 'pdp-deliver' },
        h('span', { class: 'pdp-deliver-icon' }, L.ui.icon('truck', { size: 22 })),
        h('div', { class: 'pdp-deliver-text' },
          h('strong', null, 'מגיע עד ', h('bdi', null, L.fmt.deliveryDate(5))),
          h('span', { class: 'pdp-deliver-sub' }, dispatchHint()),
          freeLine));

      const trust = h('ul', { class: 'pdp-trust', role: 'list' },
        [['truck', 'משלוח חינם', `מעל ${L.fmt.price(L.SHIPPING.freeOver)}`], ['returnBox', '14 ימי החזרה', 'באריזה סגורה'], ['lock', 'תשלום מאובטח', 'כולל Apple Pay']]
          .map(([ic, t, s]) => h('li', null, h('span', { class: 'pdp-trust-icon' }, L.ui.icon(ic, { size: 22 })), h('strong', null, t), h('span', null, s))));

      const highlights = h('ul', { class: 'pdp-highlights', role: 'list' },
        p.highlights.map((t) => h('li', null, h('span', { class: 'pdp-hl-icon' }, L.ui.icon('sparkle', { size: 18 })), h('span', null, t))));

      const accordion = L.ui.accordion([
        { title: 'תיאור', content: p.description, open: true },
        { title: 'מפרט', content: specTable(p) },
        { title: 'בטיחות ותקנים', content: SAFETY[p.id] || SAND_SAFETY },
        { title: 'משלוחים והחזרות', content: shipCopy() },
      ]);

      const crumb = h('nav', { class: 'pdp-crumb', 'aria-label': 'מיקום' },
        h('a', { href: '#/shop' }, 'חנות'), L.ui.icon('forward', { size: 14 }),
        h('a', { href: `#/shop?cat=${p.category}` }, cat?.name || ''));

      const info = h('div', { class: 'pdp-info' },
        crumb,
        p.badge ? h('div', { class: 'pdp-badge' }, L.ui.badge(p.badge)) : null,
        title,
        h('p', { class: 'pdp-short' }, p.short),
        h('p', { class: 'pdp-rating' }, stars(p.rating),
          h('span', null, h('bdi', null, L.fmt.number(p.rating)), ' · ', `${p.reviews} ביקורות`),
          h('span', { class: 'visually-hidden' }, `דירוג ${p.rating} מתוך 5`)),
        h('div', { class: 'pdp-price-row' }, priceNow, h('span', { class: 'pdp-vat' }, 'כולל מע״מ'), priceUnit),
        h('div', { class: 'pdp-options' },
          swatches ? h('div', { class: 'pdp-field' }, swatches) : (p.shades?.length === 1
            ? h('p', { class: 'pdp-static' }, 'גוון: ', h('strong', null, L.catalog.shade(p.shades[0]).name)) : null),
          chips ? h('div', { class: 'pdp-field' }, h('div', { class: 'pdp-label' }, 'גודל'), chips)
            : h('p', { class: 'pdp-static' }, p.sizes[0].grams ? 'משקל: ' : 'גודל: ', h('strong', null, p.sizes[0].label))),
        h('div', { class: 'pdp-buy' }, stepper, addBtn),
        stockNote,
        delivery,
        trust,
        h('section', { class: 'pdp-section', 'aria-labelledby': `hl-${p.id}` },
          h('h2', { class: 'pdp-h2', id: `hl-${p.id}` }, 'למה תאהבו את זה'), highlights),
        accordion);

      /* ---------------- Cross-sell ---------------- */
      const xsell = h('section', { class: 'pdp-xsell', 'aria-labelledby': `xs-${p.id}` },
        h('h2', { class: 'pdp-h2', id: `xs-${p.id}` }, 'השלימו את הסט'),
        h('div', { class: 'pdp-xsell-row' }, S().related(p.id).map((id) => L.ui.productCard(id, { shade: L.catalog.get(id)?.shades?.includes(shade) ? shade : undefined })),
          h('a', { class: 'pdp-xsell-more', href: '#/shop' },
            h('span', { class: 'pdp-xsell-more-icon' }, L.ui.icon('shop', { size: 26 })),
            h('strong', null, 'לכל המוצרים'),
            h('span', null, `${L.catalog.products.length} מוצרים, ארבעה גוונים`),
            h('span', { class: 'pdp-xsell-more-go' }, L.ui.icon('forward', { size: 18 })))));

      ctx.el.append(h('div', { class: 'container pdp' }, h('div', { class: 'pdp-grid' }, gallery, info), xsell));

      /* ---------------- Accessory (bottom bar) ---------------- */
      const accThumb = S().thumb(p, shade, 'pdp-acc-thumb');
      const accPrice = h('bdi', { class: 'pdp-acc-price' });
      const accVariant = h('span', { class: 'pdp-acc-variant' });
      const accBtn = h('button', { type: 'button', class: 'pdp-acc', onClick: () => add(accThumb) },
        accThumb,
        h('span', { class: 'pdp-acc-text' }, h('span', { class: 'pdp-acc-title' }, 'הוספה לסל'), accVariant),
        h('span', { class: 'pdp-acc-cta' }, L.ui.icon('plus', { size: 18 }), accPrice));

      // Show the accessory only while the inline button is out of view (no duplicate CTAs).
      let accOn = false;
      const setAcc = (on) => { if (on !== accOn) { accOn = on; ctx.setAccessory(on ? accBtn : null); } };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([e]) => setAcc(!e.isIntersecting), { rootMargin: '-60px 0px -90px 0px' });
        io.observe(addBtn);
        ctx.onCleanup(() => io.disconnect());
      } else setAcc(true);

      /* ---------------- State ---------------- */
      function refresh() {
        const u = unit();
        priceNow.textContent = L.fmt.price(u);
        const hint = per100(sizeObj());
        priceUnit.textContent = hint ? `· ${hint}` : '';
        const total = u * qty;
        addBtn.setLabel(`הוספה לסל · ${L.fmt.price(total)}`);
        accPrice.textContent = L.fmt.price(total);
        const vt = S().variantText(p, shade, size);
        accVariant.textContent = qty > 1 ? `${vt ? `${vt} · ` : ''}${qty} יח׳` : (vt || p.short);
        accBtn.setAttribute('aria-label', `הוספה לסל: ${p.name}${vt ? `, ${vt}` : ''}, ${qty} יחידות, ${L.fmt.price(total)}`);
        const after = L.cart.subtotal() + total;
        const remaining = Math.max(0, L.SHIPPING.freeOver - (after - S().discountOn(after)));
        freeLine.textContent = remaining > 0
          ? `עוד ${L.fmt.price(remaining)} בסל למשלוח חינם`
          : 'ההזמנה הזאת מגיעה במשלוח חינם ✓';
        freeLine.classList.toggle('is-free', remaining === 0);
        scaleLabel.textContent = sizeObj().label;
      }

      function setShade(id, fromLineup) {
        if (!id || id === shade) return;
        shade = id;
        if (fromLineup) swatches?.setValue(id);
        if (typeof heroArt.setShade === 'function') heroArt.setShade(id);
        if (typeof scaleArt.setShade === 'function') scaleArt.setShade(id);
        accThumb.replaceChildren(L.ui.art(p, { shade, variant: 'thumb' }));
        stage?.setShade?.(id);
        S().animate(heroArt, [{ opacity: 0.55, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: S().ease('smooth') });
        lineupBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'));
        L.router.setQuery({ shade: id === p.defaultShade ? null : id });
        L.ui.announce(`גוון ${L.catalog.shade(id).name}`);
        refresh();
      }
      lineupBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === shade ? 'true' : 'false'));

      let resetTimer = 0;
      function add(sourceEl) {
        const line = L.cart.add(p.id, { shade, size, qty });
        L.ui.toastAdded(p, line); // also explains when the per-item cap limited the amount
        if (!line.added) return;
        L.haptic(12);
        S().flyToBag(sourceEl === accThumb ? accThumb : (index === 0 ? heroArt : track), p, shade);
        addBtn.classList.add('is-added');
        addBtn.setLabel('נוסף לסל');
        accBtn.classList.add('is-added');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { addBtn.classList.remove('is-added'); accBtn.classList.remove('is-added'); refresh(); }, 1600);
      }
      addBtn.addEventListener('click', () => add(addBtn));
      ctx.onCleanup(() => clearTimeout(resetTimer));
      ctx.onCleanup(L.bus.on('cart:change', () => { if (!addBtn.classList.contains('is-added')) refresh(); }));

      refresh();
    },
  });
})();

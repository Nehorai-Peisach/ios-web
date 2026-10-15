/* LUMA: Store: Checkout (#/checkout), express-pay sheet, and order success (#/done/:orderId).
   Demo only: nothing is charged. */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;
  const S = () => L.store;

  const METHODS = {
    home: { id: 'home', title: 'משלוח עד הבית', icon: 'truck', days: 5, sub: () => `2–5 ימי עסקים · עד ${L.fmt.deliveryDate(5)}` },
    pickup: { id: 'pickup', title: 'נקודת איסוף', icon: 'mapPin', days: 4, sub: () => `2–4 ימי עסקים · עד ${L.fmt.deliveryDate(4)}` },
  };
  const PICKUP_POINTS = [
    { id: 'center', label: 'נקודת איסוף במרכז העיר' },
    { id: 'station', label: 'לוקר 24/7 בתחנה המרכזית' },
    { id: 'mall', label: 'דלפק איסוף בקניון העיר' },
  ];
  const EXPRESS = {
    applepay: { label: 'Apple Pay', card: 'Visa •••• 4242' },
    googlepay: { label: 'Google Pay', card: 'Mastercard •••• 4444' },
    bit: { label: 'Bit', card: 'חשבון Bit · 050-•••-4567' },
  };

  /* =====================================================================
     Orders
     ===================================================================== */
  function newOrderId() {
    return `LM-${String(Math.floor(100000 + Math.random() * 900000))}`;
  }

  function placeOrder(details) {
    const method = details.method || 'home';
    const t = S().totals(method);
    const order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      items: L.cart.items().map((it) => ({
        id: it.id, shade: it.shade, size: it.size, qty: it.qty, name: it.product.name,
        variant: S().variantText(it.product, it.shade, it.size), unitPrice: it.unitPrice, lineTotal: it.lineTotal,
      })),
      count: t.count, subtotal: t.subtotal, discount: t.discount, coupon: t.coupon?.code || null,
      shipping: t.shipping, total: t.total, method,
      deliveryBy: L.fmt.deliveryDate(METHODS[method].days),
      giftWrap: S().gift.get(),
      payment: details.payment,
      paymentLabel: details.paymentLabel,
      installments: details.installments,
      // Privacy: no email, phone or street address is persisted: only what the success page shows.
      firstName: (details.address?.name || '').trim().split(/\s+/)[0] || '',
      city: details.address?.city || '',
      pickup: details.address?.pickup || '',
    };
    S().lastOrder.set(order);
    L.cart.clear();
    S().coupon.set(null);
    S().gift.set(false);
    return order;
  }

  /* =====================================================================
     Express pay (demo sheet): also used by the bag's Apple Pay button
     ===================================================================== */
  function expressPay(kind = 'applepay') {
    if (!L.cart.count()) return;
    const x = EXPRESS[kind] || EXPRESS.applepay;
    const t = S().totals('home');
    const fromCheckout = L.router.current()?.name === 'checkout';
    const confirm = kind === 'applepay'
      ? L.ui.button('', { variant: 'applepay', size: 'lg', full: true, ariaLabel: `אישור תשלום ${L.fmt.price(t.total)} ב־Apple Pay` })
      : L.ui.button(`אישור תשלום · ${L.fmt.price(t.total)}`, { variant: 'prominent', size: 'lg', full: true, icon: 'lock' });
    const content = h('div', { class: 'xp' },
      L.ui.groupedList([{
        rows: [
          { icon: 'creditCard', title: 'אמצעי תשלום', subtitle: h('bdi', null, x.card) },
          { icon: 'truck', title: 'משלוח עד הבית', subtitle: `מגיע עד ${L.fmt.deliveryDate(5)}`, value: t.shipping ? S().priceEl(t.shipping) : 'חינם' },
          { icon: 'user', title: 'איש קשר', subtitle: h('bdi', null, 'demo@luma.co.il') },
        ],
      }]),
      h('dl', { class: 'st-sum xp-sum' },
        h('div', { class: 'st-sum-row is-total' }, h('dt', null, `לתשלום ל־LUMA (${S().itemsText(t.count)})`), h('dd', null, S().priceEl(t.total)))),
      h('div', { class: 'xp-cta' }, confirm),
      h('p', { class: 'st-fine st-fine--center' }, L.ui.icon('info', { size: 14 }), `הדגמה של ${x.label}. לא יתבצע חיוב אמיתי.`));
    let timer = 0;
    // Dismissing the sheet (cancel, swipe, Esc, route change) aborts a payment still "processing".
    const sheet = L.ui.sheet({ title: x.label, content, detent: 'medium', cancel: 'ביטול', onClose: () => clearTimeout(timer) });
    confirm.addEventListener('click', () => {
      if (timer) return;
      confirm.setDisabled(true);
      confirm.classList.add('is-busy');
      confirm.replaceChildren(h('span', { class: 'st-spinner', 'aria-hidden': 'true' }), h('span', { class: 'btn-label' }, 'מאשר תשלום…'));
      L.ui.announce('מעבד תשלום');
      timer = setTimeout(() => {
        if (!sheet.el.isConnected || sheet.el.dataset.state !== 'open') return;
        const order = placeOrder({
          payment: kind, paymentLabel: `${x.label} · ${x.card}`,
          contact: { email: 'demo@luma.co.il', phone: '050-1234567' },
          address: { name: 'לקוח/ה לדוגמה', city: 'תל אביב–יפו', street: 'רוטשילד 1' },
        });
        L.haptic(18);
        sheet.close('done');
        L.router.go(`#/done/${order.id}`, { replace: fromCheckout });
      }, 1300);
    });
  }

  /* =====================================================================
     Validation + formatting
     ===================================================================== */
  const digits = (v) => String(v || '').replace(/\D/g, '');
  function luhn(num) {
    let sum = 0;
    let dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = +num[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }
  function cardBrand(num) {
    if (/^4/.test(num)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^(36|38|30[0-5])/.test(num)) return 'Diners';
    return '';
  }
  const fmtCard = (v) => {
    const d = digits(v).slice(0, 19);
    if (/^3[47]/.test(d)) return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
    return d.replace(/(.{4})/g, '$1 ').trim();
  };
  const fmtExp = (v, deleting) => {
    let d = digits(v).slice(0, 4);
    if (d.length === 1 && +d > 1) d = `0${d}`;
    if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
    if (d.length === 2 && !deleting) return `${d}/`;
    return d;
  };
  function normPhone(v) {
    let d = digits(v);
    if (d.startsWith('972')) d = `0${d.slice(3)}`;
    return d;
  }
  const fmtPhone = (v) => {
    const d = normPhone(v);
    if (/^0[57]\d{8}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3)}`;
    if (/^0[2-9]\d{7}$/.test(d)) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return v;
  };

  const RULES = {
    email: (v) => {
      if (!v) return 'נא להזין כתובת אימייל. לשם נשלח את אישור ההזמנה';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'כתובת האימייל לא נראית תקינה, למשל name@example.com';
      return null;
    },
    phone: (v) => {
      if (!v) return 'נא להזין מספר טלפון. השליח יתקשר לתאם';
      const d = normPhone(v);
      if (!/^0[57]\d{8}$/.test(d) && !/^0[2-9]\d{7}$/.test(d)) return 'מספר הטלפון לא תקין, למשל 050-1234567';
      return null;
    },
    name: (v) => {
      if (!v) return 'נא להזין שם מלא';
      if (v.trim().split(/\s+/).length < 2) return 'נא להזין שם פרטי ושם משפחה';
      return null;
    },
    city: (v) => (v ? (v.length < 2 ? 'שם העיר קצר מדי' : null) : 'נא להזין עיר או יישוב'),
    street: (v) => {
      if (!v) return 'נא להזין רחוב ומספר בית';
      if (!/\d/.test(v)) return 'חסר מספר בית, למשל הרצל 12';
      return null;
    },
    pickup: (v) => (v ? null : 'נא לבחור נקודת איסוף'),
    card: (v) => {
      const d = digits(v);
      if (!d) return 'נא להזין מספר כרטיס';
      if (d.length < 13) return 'מספר הכרטיס קצר מדי. בדקו שהזנתם את כל הספרות';
      if (!luhn(d)) return 'מספר הכרטיס לא תקין. בדקו את הספרות';
      return null;
    },
    exp: (v) => {
      const m = /^(\d{2})\/(\d{2})$/.exec(v || '');
      if (!v) return 'נא להזין תוקף';
      if (!m) return 'נא להזין תוקף בפורמט MM/YY';
      const mm = +m[1];
      const yy = 2000 + +m[2];
      if (mm < 1 || mm > 12) return 'חודש התוקף לא תקין (01–12)';
      const now = new Date();
      if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) return 'תוקף הכרטיס עבר';
      if (yy > now.getFullYear() + 20) return 'שנת התוקף לא נראית תקינה';
      return null;
    },
    cvv: (v, form) => {
      const need = cardBrand(digits(form.card?.value)) === 'Amex' ? 4 : 3;
      if (!v) return `נא להזין ${need} ספרות מגב הכרטיס`;
      if (digits(v).length !== need) return `קוד האבטחה צריך ${need} ספרות`;
      return null;
    },
  };

  /* =====================================================================
     Form building blocks (iOS inset grouped)
     ===================================================================== */
  function field(o) {
    const id = L.uid('f');
    const tag = o.tag || 'input';
    const attrs = {
      id, name: o.name, class: 'co-input',
      autocomplete: o.autocomplete || 'off', 'aria-describedby': `${id}-err`,
      placeholder: o.placeholder || null, dir: o.dir || null,
      required: o.optional ? null : true, 'aria-required': o.optional ? null : 'true',
      maxlength: o.maxlength || null,
    };
    if (tag === 'input') Object.assign(attrs, { type: o.type || 'text', inputmode: o.inputmode || null, enterkeyhint: o.enterkeyhint || 'next', autocapitalize: o.autocapitalize || null, spellcheck: o.spellcheck ?? null });
    const input = h(tag, attrs, tag === 'select' ? o.options : null);
    const err = h('p', { class: 'co-err', id: `${id}-err`, 'aria-live': 'polite' });
    const row = h('div', { class: ['co-field', o.className], 'data-name': o.name },
      h('label', { class: 'co-label', for: id }, o.label, o.optional ? h('span', { class: 'co-opt' }, ' (לא חובה)') : null),
      h('div', { class: 'co-control' }, input, o.end || null),
      err);
    return { row, input, err, name: o.name, rule: o.rule };
  }

  function card(header, rows, footer, opts = {}) {
    const hid = L.uid('sec');
    return h('section', { class: ['co-section', opts.className], 'aria-labelledby': hid },
      h('h2', { class: 'glist-header', id: hid }, header),
      h('div', { class: 'co-card' }, rows),
      footer ? h('p', { class: 'glist-footer' }, footer) : null);
  }

  /* =====================================================================
     Checkout view
     ===================================================================== */
  L.views.define('checkout', {
    route: '/checkout',
    title: 'תשלום',
    tab: 'bag',
    back: true,
    hideTabBar: true,
    parent: '#/bag',
    remember: false,  // never the bag tab's remembered page
    render(ctx) {
      ctx.el.classList.add('on-grouped');
      const wrap = h('div', { class: 'container co' });
      ctx.el.append(wrap);

      if (!L.cart.count()) {
        wrap.append(L.ui.largeTitle('תשלום'), L.ui.empty({
          icon: 'bag', title: 'אין עדיין מה לשלם',
          text: 'הסל ריק. בואו נמלא אותו בנצנוץ ונחזור לכאן.',
          action: { label: 'לחנות', href: '#/shop' },
        }));
        return;
      }

      let method = 'home';
      let busy = false;
      const F = {};
      const add = (f) => { F[f.name] = f; return f; };

      /* ---------- Summary (collapsible on mobile, sticky aside on desktop) ---------- */
      const sumTotal = h('bdi', { class: 'co-sum-total' });
      const sumCount = h('span', { class: 'co-sum-count' });
      const sumItems = h('ul', { class: 'co-sum-items', role: 'list' });
      const sumRows = h('dl', { class: 'st-sum' });
      const sumId = L.uid('sum');
      const sumToggle = h('button', { type: 'button', class: 'co-sum-toggle', 'aria-expanded': 'false', 'aria-controls': sumId },
        h('span', { class: 'co-sum-icon' }, L.ui.icon('bag', { size: 20 })),
        h('span', { class: 'co-sum-label' }, h('strong', null, 'סיכום ההזמנה'), sumCount),
        sumTotal,
        h('span', { class: 'co-sum-chev' }, L.ui.icon('chevronDown', { size: 18 })));
      const summary = h('aside', { class: 'co-sum', 'aria-label': 'סיכום ההזמנה' },
        sumToggle,
        h('div', { class: 'co-sum-panel', id: sumId }, h('div', { class: 'co-sum-inner' }, sumItems, sumRows,
          h('a', { class: 'co-sum-edit', href: '#/bag' }, 'עריכת הסל'))));
      sumToggle.addEventListener('click', () => {
        const open = !summary.classList.contains('is-open');
        summary.classList.toggle('is-open', open);
        sumToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      const renderItems = () => sumItems.replaceChildren(...L.cart.items().map((it) => h('li', { class: 'co-sum-item' },
        h('span', { class: 'co-sum-thumb' }, L.ui.art(it.product, { shade: it.shade, variant: 'thumb' }),
          h('span', { class: 'co-sum-qty', 'aria-label': `כמות ${it.qty}` }, it.qty)),
        h('span', { class: 'co-sum-name' }, h('strong', null, it.product.name),
          h('span', null, S().variantText(it.product, it.shade, it.size))),
        S().priceEl(it.lineTotal, 'co-sum-price'))));
      renderItems();

      /* ---------- Express ---------- */
      const xBtn = (kind, label, cls) => h('button', {
        type: 'button', class: `co-x co-x--${kind} ${cls || ''}`, 'aria-label': `תשלום מהיר ב־${label}`, onClick: () => expressPay(kind),
      }, kind === 'applepay'
        ? h('span', { class: 'applepay-mark', dir: 'ltr', 'aria-hidden': 'true' }, L.ui.icon('apple', { size: 18 }), h('span', null, 'Pay'))
        : h('span', { dir: 'ltr', 'aria-hidden': 'true' }, label));
      const express = h('section', { class: 'co-express', 'aria-label': 'תשלום מהיר' },
        h('div', { class: 'co-x-row' }, xBtn('applepay', 'Apple Pay'), xBtn('googlepay', 'Google Pay'), xBtn('bit', 'bit')),
        h('p', { class: 'co-or' }, h('span', null, 'או מלאו את הפרטים')));

      /* ---------- Contact ---------- */
      add(field({ name: 'email', label: 'אימייל', type: 'email', autocomplete: 'email', inputmode: 'email', autocapitalize: 'off', spellcheck: 'false', dir: 'ltr', placeholder: 'name@example.com', rule: RULES.email }));
      add(field({ name: 'phone', label: 'טלפון נייד', type: 'tel', autocomplete: 'tel-national', inputmode: 'tel', dir: 'ltr', placeholder: '050-1234567', rule: RULES.phone, format: fmtPhone }));

      /* ---------- Delivery method ---------- */
      const mPrice = {};
      const radio = (m) => {
        const id = L.uid('m');
        mPrice[m.id] = h('span', { class: 'co-radio-price' });
        const input = h('input', { type: 'radio', name: 'method', value: m.id, id, class: 'co-radio-input', checked: m.id === method });
        input.addEventListener('change', () => { if (input.checked) setMethod(m.id); });
        return h('label', { class: 'co-radio', for: id }, input,
          h('span', { class: 'co-radio-icon' }, L.ui.icon(m.icon, { size: 22 })),
          h('span', { class: 'co-radio-text' }, h('strong', null, m.title), h('span', null, m.sub())),
          mPrice[m.id],
          h('span', { class: 'co-radio-check', 'aria-hidden': 'true' }, L.ui.icon('check', { size: 20 })));
      };
      const methodSet = h('fieldset', { class: 'co-section co-methods' },
        h('legend', { class: 'glist-header' }, 'אופן משלוח'),
        h('div', { class: 'co-card' }, radio(METHODS.home), radio(METHODS.pickup)),
        h('p', { class: 'glist-footer co-free-note' }));

      /* ---------- Address ---------- */
      add(field({ name: 'name', label: 'שם מלא', autocomplete: 'name', autocapitalize: 'words', placeholder: 'שם פרטי ושם משפחה', rule: RULES.name }));
      add(field({ name: 'city', label: 'עיר', autocomplete: 'address-level2', placeholder: 'למשל תל אביב–יפו', rule: RULES.city }));
      add(field({ name: 'street', label: 'רחוב ומספר', autocomplete: 'address-line1', placeholder: 'למשל הרצל 12', rule: RULES.street, className: 'only-home' }));
      add(field({ name: 'apt', label: 'דירה / קומה', autocomplete: 'address-line2', optional: true, placeholder: 'למשל דירה 4, קומה 2', className: 'only-home' }));
      add(field({ name: 'notes', label: 'הערות לשליח', optional: true, placeholder: 'קוד לבניין, להשאיר ליד הדלת…', className: 'only-home' }));
      add(field({
        name: 'pickup', label: 'נקודת איסוף', tag: 'select', rule: RULES.pickup, className: 'only-pickup co-field--select',
        options: [h('option', { value: '' }, 'בחרו נקודה…'), ...PICKUP_POINTS.map((pp) => h('option', { value: pp.id }, pp.label))],
        end: h('span', { class: 'co-select-chev', 'aria-hidden': 'true' }, L.ui.icon('chevronDown', { size: 18 })),
      }));
      const addrHeader = h('h2', { class: 'glist-header' }, 'כתובת למשלוח');
      const addrSection = h('section', { class: 'co-section' }, addrHeader,
        h('div', { class: 'co-card' }, F.name.row, F.city.row, F.street.row, F.apt.row, F.notes.row, F.pickup.row));

      /* ---------- Payment ---------- */
      const brand = h('span', { class: 'co-brand', 'aria-live': 'polite' });
      add(field({ name: 'card', label: 'מספר כרטיס', type: 'text', autocomplete: 'cc-number', inputmode: 'numeric', dir: 'ltr', placeholder: '1234 5678 9012 3456', maxlength: 23, rule: RULES.card, format: fmtCard, end: brand }));
      add(field({ name: 'exp', label: 'תוקף', type: 'text', autocomplete: 'cc-exp', inputmode: 'numeric', dir: 'ltr', placeholder: 'MM/YY', maxlength: 5, rule: RULES.exp }));
      add(field({ name: 'cvv', label: 'CVV', type: 'text', autocomplete: 'cc-csc', inputmode: 'numeric', dir: 'ltr', placeholder: '123', maxlength: 4, enterkeyhint: 'done', rule: RULES.cvv }));
      const inst = h('select', { id: L.uid('inst'), class: 'co-input', name: 'installments' });
      const instRow = h('div', { class: 'co-field co-field--select' },
        h('label', { class: 'co-label', for: inst.id }, 'תשלומים'),
        h('div', { class: 'co-control' }, inst, h('span', { class: 'co-select-chev', 'aria-hidden': 'true' }, L.ui.icon('chevronDown', { size: 18 }))));
      const paySection = card('תשלום בכרטיס אשראי', [
        F.card.row,
        h('div', { class: 'co-split' }, F.exp.row, F.cvv.row),
        instRow,
      ], h('span', { class: 'co-demo' }, L.ui.icon('info', { size: 14 }), ' חנות הדגמה. לא יתבצע חיוב אמיתי. אפשר לנסות עם ', h('bdi', { dir: 'ltr' }, '4242 4242 4242 4242'), '.'));

      const giftNote = S().gift.get()
        ? h('p', { class: 'co-gift' }, L.ui.icon('gift', { size: 18 }), 'ההזמנה תגיע באריזת מתנה עם כרטיס ברכה.') : null;

      const submit = h('button', { type: 'submit', class: 'visually-hidden', tabindex: '-1' }, 'תשלום');
      const form = h('form', { class: 'co-form', novalidate: true, 'aria-label': 'פרטי הזמנה ותשלום' },
        express,
        card('פרטי קשר', [F.email.row, F.phone.row], 'נשלח אישור הזמנה ועדכוני משלוח. בלי ספאם.'),
        methodSet,
        addrSection,
        paySection,
        giftNote,
        h('p', { class: 'st-fine co-terms' }, L.ui.icon('lock', { size: 14 }), 'התשלום מוצפן ומאובטח. בלחיצה על „תשלום” אתם מאשרים את תנאי השימוש ומדיניות ההחזרות (14 יום).'),
        submit);

      wrap.append(
        L.ui.largeTitle('תשלום', 'בלי הרשמה · כמה פרטים וסיימנו'),
        h('div', { class: 'co-layout' }, summary, form));

      /* ---------- Pay button (accessory) ---------- */
      const payBtn = L.ui.button('', { variant: 'prominent', full: true, icon: 'lock', className: 'co-pay', onClick: () => onSubmit() });
      ctx.setAccessory(payBtn);

      /* ---------- Behaviour ---------- */
      const order = ['email', 'phone', 'name', 'city', 'street', 'apt', 'notes', 'pickup', 'card', 'exp', 'cvv'];
      const active = () => order.filter((n) => !F[n].row.hidden);

      function setError(f, msg) {
        f.err.textContent = msg || '';
        f.row.classList.toggle('has-error', !!msg);
        f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
      function check(f) {
        if (!f.rule) return null;
        const msg = f.rule(f.input.value.trim(), F);
        setError(f, msg);
        return msg;
      }

      Object.values(F).forEach((f) => {
        const inp = f.input;
        inp.addEventListener('blur', () => {
          if (f.name === 'phone' && inp.value) inp.value = fmtPhone(inp.value.trim());
          if (inp.value.trim() || f.row.classList.contains('has-error')) check(f);
          if (inp.value.trim() && !f.row.classList.contains('has-error') && f.rule) f.row.classList.add('is-valid');
        });
        inp.addEventListener('input', (e) => {
          f.row.classList.remove('is-valid');
          if (f.name === 'card') {
            const atEnd = inp.selectionStart === inp.value.length;
            inp.value = fmtCard(inp.value);
            if (atEnd) inp.setSelectionRange(inp.value.length, inp.value.length);
            const b = cardBrand(digits(inp.value));
            brand.textContent = b;
            brand.hidden = !b;
            F.cvv.input.maxLength = b === 'Amex' ? 4 : 3;
          }
          if (f.name === 'exp') inp.value = fmtExp(inp.value, e.inputType?.startsWith('delete'));
          if (f.name === 'cvv') inp.value = digits(inp.value).slice(0, 4);
          if (f.row.classList.contains('has-error')) check(f);
          // Auto-advance when a card field is complete.
          if (f.name === 'exp' && /^\d{2}\/\d{2}$/.test(inp.value) && !RULES.exp(inp.value)) F.cvv.input.focus();
          if (f.name === 'card' && !e.inputType?.startsWith('delete') && digits(inp.value).length === (cardBrand(digits(inp.value)) === 'Amex' ? 15 : 16) && !RULES.card(inp.value)) F.exp.input.focus();
        });
        if (inp.tagName === 'SELECT') inp.addEventListener('change', () => check(f));
      });
      brand.hidden = true;

      form.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.isComposing) return;
        const list = active();
        const i = list.indexOf(e.target.name);
        if (i < 0) return;
        e.preventDefault();
        if (i < list.length - 1) F[list[i + 1]].input.focus();
        else onSubmit();
      });
      form.addEventListener('submit', (e) => { e.preventDefault(); onSubmit(); });

      function setMethod(m) {
        method = m;
        const home = m === 'home';
        ['street', 'apt', 'notes'].forEach((n) => { F[n].row.hidden = !home; if (!home) setError(F[n], null); });
        F.pickup.row.hidden = home;
        if (home) setError(F.pickup, null);
        addrHeader.textContent = home ? 'כתובת למשלוח' : 'פרטי איסוף';
        L.haptic(6);
        update();
      }

      function update() {
        const t = S().totals(method);
        ['home', 'pickup'].forEach((m) => {
          const ship = L.cart.shipping(m, t.discount);
          mPrice[m].replaceChildren(ship ? S().priceEl(ship) : h('span', { class: 'st-free' }, 'חינם'));
        });
        L.$('.co-free-note', methodSet).textContent = t.freeRemaining > 0
          ? `עוד ${L.fmt.price(t.freeRemaining)} בסל, והמשלוח עלינו.`
          : `ההזמנה מעל ${L.fmt.price(L.SHIPPING.freeOver)}, אז המשלוח חינם בשתי האפשרויות.`;
        const row = (k, v, cls) => h('div', { class: ['st-sum-row', cls] }, h('dt', null, k), h('dd', null, v));
        sumRows.replaceChildren(...[
          row('סכום ביניים', S().priceEl(t.subtotal)),
          t.coupon ? row(`הנחה · ${t.coupon.code}`, S().priceEl(-t.discount), 'is-discount') : null,
          row(METHODS[method].title, t.shipping ? S().priceEl(t.shipping) : h('span', { class: 'st-free' }, 'חינם')),
          S().gift.get() ? row('אריזת מתנה', h('span', { class: 'st-free' }, 'חינם')) : null,
          row('סה״כ כולל מע״מ', S().priceEl(t.total), 'is-total')].filter(Boolean));
        sumTotal.textContent = L.fmt.price(t.total);
        sumCount.textContent = S().itemsText(t.count);
        const n = Math.min(3, Math.max(1, Math.floor(t.total / 100)));
        const prev = inst.value || '1';
        inst.replaceChildren(...[1, 2, 3].filter((k) => k <= n).map((k) => h('option', { value: String(k) },
          k === 1 ? `תשלום אחד · ${L.fmt.price(t.total)}` : `${k} תשלומים ללא ריבית · ${L.fmt.price(t.total / k)} לחודש`)));
        inst.value = Number(prev) <= n ? prev : '1';
        if (!busy) payBtn.setLabel(`תשלום ${L.fmt.price(t.total)}`);
      }

      function onSubmit() {
        if (busy) return;
        const bad = active().map((n) => F[n]).filter((f) => check(f));
        if (bad.length) {
          const first = bad[0];
          first.input.focus({ preventScroll: true });
          first.row.scrollIntoView({ block: 'center', behavior: L.reducedMotion() ? 'instant' : 'smooth' });
          L.ui.announce(bad.length === 1 ? `יש לתקן שדה אחד: ${first.err.textContent}` : `יש לתקן ${bad.length} שדות. ${first.err.textContent}`);
          L.haptic(24);
          S().animate(payBtn, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 380 });
          return;
        }
        busy = true;
        form.inert = true;
        payBtn.setDisabled(true);
        payBtn.classList.add('is-busy');
        payBtn.replaceChildren(h('span', { class: 'st-spinner', 'aria-hidden': 'true' }), h('span', { class: 'btn-label' }, 'מעבד תשלום…'));
        L.ui.announce('מעבד תשלום');
        const v = (n) => F[n].input.value.trim();
        const timer = setTimeout(() => {
          const pp = PICKUP_POINTS.find((x) => x.id === v('pickup'));
          const c = digits(v('card'));
          const o = placeOrder({
            method,
            payment: 'card',
            paymentLabel: `${cardBrand(c) || 'כרטיס'} •••• ${c.slice(-4)}`,
            installments: Number(inst.value) || 1,
            contact: { email: v('email'), phone: fmtPhone(v('phone')) },
            address: method === 'home'
              ? { name: v('name'), city: v('city'), street: v('street'), apt: v('apt'), notes: v('notes') }
              : { name: v('name'), city: v('city'), pickup: pp?.label },
          });
          L.haptic(18);
          L.router.go(`#/done/${o.id}`, { replace: true });
        }, 1500);
        ctx.onCleanup(() => clearTimeout(timer));
      }

      setMethod('home');
      // The bag can change elsewhere (another tab, undo toast): keep the summary and totals true.
      ctx.onCleanup(L.bus.on('cart:change', (snap) => {
        if (busy) return;
        if (!snap.count) { L.router.go('#/bag', { replace: true }); return; }
        renderItems();
        update();
      }));
      ctx.onCleanup(L.bus.on('store:change', () => { if (!busy) update(); }));
    },
  });

  /* =====================================================================
     Done view
     ===================================================================== */
  function celebration() {
    const sparks = Array.from({ length: 10 }, (_, i) => h('span', {
      class: 'done-spark',
      style: { '--a': `${i * 36 + (i % 2 ? 12 : 0)}deg`, '--r': `${i % 2 ? 78 : 96}px`, '--dl': `${0.45 + (i % 5) * 0.04}s`, '--s': i % 3 ? '.7' : '1' },
    }, L.ui.icon('sparkle', { filled: true, size: 18 })));
    return h('div', { class: 'done-badge', 'aria-hidden': 'true' },
      h('span', { class: 'done-glow' }),
      h('span', { class: 'done-mark', html: '<svg class="done-svg" viewBox="0 0 120 120" focusable="false"><circle class="done-disc" cx="60" cy="60" r="54"/><path class="done-check" d="M37 62.5 52.5 78 84 45.5"/></svg>' }),
      sparks);
  }

  L.views.define('done', {
    route: '/done/:orderId',
    title: 'ההזמנה התקבלה',
    tab: 'bag',
    remember: false,
    render(ctx) {
      const o = S().lastOrder.get();
      const wrap = h('div', { class: 'container done' });
      ctx.el.append(wrap);

      // Unknown or stale order id: never show a success that didn't happen.
      if (!o || o.id !== ctx.params.orderId) {
        ctx.setTitle('ההזמנה לא נמצאה');
        wrap.append(L.ui.largeTitle('ההזמנה לא נמצאה'), L.ui.empty({
          icon: 'search', title: 'אין לנו הזמנה כזאת',
          text: 'אולי הקישור ישן, או שההזמנה בוצעה בדפדפן אחר. אפשר להמשיך לגלוש בחנות.',
          action: { label: 'לחנות', href: '#/shop' },
        }));
        return;
      }

      ctx.el.classList.add('on-grouped');
      L.haptic(14);
      const first = o.firstName || '';
      wrap.append(
        h('div', { class: 'done-hero' },
          celebration(),
          h('h1', { class: 'done-title', 'data-large-title': '', tabindex: '-1' }, 'ההזמנה התקבלה'),
          h('p', { class: 'done-sub' }, first ? `תודה, ${first}! ` : 'תודה! ', 'אישור ההזמנה נשלח אליכם במייל.'),
          h('p', { class: 'done-id' }, 'מספר הזמנה ', h('bdi', { dir: 'ltr' }, ctx.params.orderId))));

      if (o.items?.length) {
        const isHome = o.method === 'home';
        const place = isHome ? o.city : [o.pickup, o.city].filter(Boolean).join(' · ');
        const info = L.ui.groupedList([{
          header: 'משלוח',
          rows: [
            { icon: 'clock', title: isHome ? 'מגיע עד' : 'מוכן לאיסוף עד', value: h('bdi', null, o.deliveryBy) },
            { icon: isHome ? 'truck' : 'mapPin', title: isHome ? 'משלוח עד הבית' : 'נקודת איסוף', subtitle: place || null },
            o.giftWrap ? { icon: 'gift', title: 'אריזת מתנה + כרטיס ברכה' } : null,
            { icon: 'creditCard', title: 'תשלום', subtitle: h('bdi', null, o.paymentLabel || ''), value: o.installments > 1 ? `${o.installments} תשלומים` : null },
          ].filter(Boolean),
        }]);
        const items = h('ul', { class: 'co-sum-items', role: 'list' }, o.items.map((it) => {
          const p = L.catalog.get(it.id);
          return h('li', { class: 'co-sum-item' },
            h('span', { class: 'co-sum-thumb' }, p ? L.ui.art(p, { shade: it.shade, variant: 'thumb' }) : null, h('span', { class: 'co-sum-qty' }, it.qty)),
            h('span', { class: 'co-sum-name' }, h('strong', null, it.name), h('span', null, it.variant || '')),
            S().priceEl(it.lineTotal, 'co-sum-price'));
        }));
        const row = (k, v, cls) => h('div', { class: ['st-sum-row', cls] }, h('dt', null, k), h('dd', null, v));
        const totals = h('dl', { class: 'st-sum' },
          row('סכום ביניים', S().priceEl(o.subtotal)),
          o.discount ? row(`הנחה · ${o.coupon}`, S().priceEl(-o.discount), 'is-discount') : null,
          row('משלוח', o.shipping ? S().priceEl(o.shipping) : h('span', { class: 'st-free' }, 'חינם')),
          row('שולם', S().priceEl(o.total), 'is-total'));
        wrap.append(h('div', { class: 'done-grid' },
          info,
          h('section', { class: 'done-order', 'aria-label': 'פריטים בהזמנה' },
            h('h2', { class: 'glist-header' }, `פריטים (${o.count})`),
            h('div', { class: 'co-card done-card' }, items, totals))));
      }

      wrap.append(
        h('div', { class: 'done-ctas' },
          L.ui.button('חזרה לחנות', { variant: 'prominent', size: 'lg', full: true, href: '#/shop' }),
          L.ui.button('לדף הבית', { variant: 'filled', size: 'lg', full: true, href: '#/' })),
        h('p', { class: 'st-fine st-fine--center' }, L.ui.icon('info', { size: 14 }), 'זו חנות הדגמה. לא בוצע חיוב ולא תישלח חבילה.'));
    },
  });

  L.store.expressPay = expressPay;
})();

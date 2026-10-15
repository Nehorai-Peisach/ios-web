/* LUMA: Home (landing). apple.com-style product storytelling:
   dark sand hero → features → sticky sensory chapter → shades → collection →
   specs & safety → reviews → FAQ → final CTA → fine print. */
(() => {
  'use strict';
  const L = window.Luma;
  const { h } = L;
  const root = document.documentElement;
  const svgIcon = (name, opts) => L.ui.icon(name, opts);

  const SHADE_IDS = ['amethyst', 'lavender', 'violet', 'midnight'];
  const SHADE_LINES = {
    amethyst: 'הקלאסי. סגול עשיר שמנצנץ כמו אבן חן באור של בוקר.',
    lavender: 'רך ובהיר, כמו שדה פורח בשעת דמדומים.',
    violet: 'עשיר ועמוק, עם ברק שמתגלה לאט, תנועה אחר תנועה.',
    midnight: 'הכי דרמטי. כמעט שחור, עם נצנוץ כסוף של כוכבים.',
  };
  /* Edge-fade colours per section tone (what sits under the top bar). */
  const EDGE = { hero: '#0b0512', dark: '#000', base: 'var(--home-base)', alt: 'var(--home-alt)' };

  /* ---------- small helpers ---------- */
  const shadeOf = (id) => L.catalog.shade(id) || L.catalog.shades[0];
  const smooth = (t) => t * t * (3 - 2 * t);
  const scrollBehavior = () => (L.reducedMotion() ? 'auto' : 'smooth');

  /** Mark an element for scroll-reveal; `i` staggers siblings. */
  function rv(el, i = 0) {
    el.classList.add('h-rv');
    el.style.setProperty('--i', i);
    return el;
  }

  function sectionHead(title, sub, o = {}) {
    return h('header', { class: ['h-head', o.start && 'h-head--start'] },
      o.eyebrow ? rv(h('p', { class: 'h-eyebrow' }, o.eyebrow)) : null,
      rv(h('h2', { class: 'h-title', id: o.id || null }, title), 1),
      sub ? rv(h('p', { class: 'h-sub' }, sub), 2) : null);
  }

  /** "a · b · c" that wraps between items, never inside one. */
  function trustLine(cls, items) {
    return h('p', { class: ['h-trust', cls] }, items.map((t, i) => [
      i ? h('span', { class: 'h-dot', 'aria-hidden': 'true' }, '·') : null,
      h('span', { class: 'h-trust-item' }, t)]));
  }
  /** Same promise, as icon + label pairs (wraps cleanly on narrow screens). */
  function trustIcons(cls, items) {
    return h('ul', { class: ['h-trust h-trust--icons', cls], role: 'list' }, items.map(([icon, t]) =>
      h('li', { class: 'h-trust-item' }, svgIcon(icon, { size: 20 }), h('span', null, t))));
  }

  function section(tone, cls, label, ...children) {
    return h('section', { class: ['h-sec'].concat(cls), 'data-tone': tone, 'aria-labelledby': label || null }, ...children);
  }

  /* =====================================================================
     1. Hero
     ===================================================================== */
  function buildHero(ctx, state) {
    const hint = h('p', { class: 'h-hint', 'aria-hidden': 'true' }, svgIcon('hand', { size: 18 }), h('span', null, 'געו בחול'));
    const shadeName = h('span', { class: 'h-picker-name', 'aria-live': 'polite' }, shadeOf('amethyst').name);
    const picker = h('div', { class: 'h-picker glass glass--clear glass--dim', role: 'radiogroup', 'aria-label': 'גוון החול', 'data-no-sand': '' });
    const dots = SHADE_IDS.map((id) => h('button', {
      type: 'button', class: 'h-picker-dot', role: 'radio', 'data-id': id,
      'aria-label': shadeOf(id).name, title: shadeOf(id).name,
      onClick: () => pick(id, true),
    }, h('span', { style: { background: L.ui.swatchBg(id) } })));
    picker.append(...dots, shadeName);

    function pick(id, user) {
      state.heroShade = id;
      dots.forEach((d) => {
        const on = d.dataset.id === id;
        d.setAttribute('aria-checked', on ? 'true' : 'false');
        d.tabIndex = on ? 0 : -1;
      });
      shadeName.textContent = shadeOf(id).name;
      state.stage?.setShade(id);
      if (user) L.haptic();
    }
    picker.addEventListener('keydown', (e) => {
      const step = { ArrowLeft: 1, ArrowRight: -1 }[e.key]; // RTL: left = next
      if (!step) return;
      e.preventDefault();
      const i = L.clamp(SHADE_IDS.indexOf(state.heroShade) + step, 0, SHADE_IDS.length - 1);
      pick(SHADE_IDS[i], true);
      dots[i].focus();
    });
    pick('amethyst', false);

    const toSense = () => {
      const target = ctx.el.querySelector('#h-sense');
      target?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    };

    const content = h('div', { class: 'h-hero-content' },
      h('p', { class: 'h-hero-brand h-in', style: { '--i': 0 } },
        h('span', { class: 'h-hero-logo', html: L.art?.logo ? L.art.logo({ size: 20 }) : 'LUMA' }),
        h('span', { class: 'h-hero-brand-sep', 'aria-hidden': 'true' }),
        h('span', null, 'חול יהלומים')),
      h('h1', { class: 'h-hero-title h-in', style: { '--i': 1 } }, 'יהלומים שאפשר לגעת בהם.'),
      h('p', { class: 'h-hero-sub h-in', style: { '--i': 2 } }, 'חול קינטי בגוון אמטיסט עם נצנוץ יהלומי. רך בידיים, שקט בראש.'),
      h('div', { class: 'h-hero-ctas h-in', style: { '--i': 3 } },
        L.ui.button('לחנות', { variant: 'prominent', size: 'lg', href: '#/shop' }),
        L.ui.button('איך זה מרגיש', { variant: 'plain', size: 'lg', icon: 'forward', iconEnd: true, onClick: toSense, className: 'h-link' })),
      trustLine('h-hero-trust h-in', [`משלוח חינם מעל ${L.fmt.price(L.SHIPPING.freeOver)}`, '14 ימי החזרה', 'מתאים מגיל 3']));
    content.lastChild.style.setProperty('--i', 4);

    const foot = h('div', { class: 'h-hero-foot h-in', style: { '--i': 5 } }, hint, picker);
    const hero = h('section', { class: 'h-hero', 'data-tone': 'hero', 'aria-label': 'לוּמָה · חול יהלומים' },
      h('div', { class: 'h-hero-scrim', 'aria-hidden': 'true' }), content, foot);

    // The hint retires after the first touch on the sand.
    const onFirstTouch = (e) => {
      if (e.target.closest('a,button,[data-no-sand]')) return;
      hero.classList.add('is-touched');
      hero.removeEventListener('pointerdown', onFirstTouch);
    };
    hero.addEventListener('pointerdown', onFirstTouch);
    ctx.onCleanup(() => hero.removeEventListener('pointerdown', onFirstTouch));

    state.hero = hero;
    state.heroContent = content;
    return hero;
  }

  function mountStage(ctx, state) {
    if (!L.art?.sandStage) { state.hero.classList.add('is-fallback'); return; }
    try {
      state.stage = L.art.sandStage(state.hero, { shade: state.heroShade, interactive: true });
      ctx.onCleanup(() => { state.stage?.destroy(); state.stage = null; });
    } catch (err) {
      console.warn('[home] sand stage unavailable', err);
      state.hero.classList.add('is-fallback');
    }
  }

  /* =====================================================================
     2. Features
     ===================================================================== */
  const FEATURES = [
    { icon: 'hand', title: 'לא נדבק לידיים', text: 'החול נאסף לעצמו ולא משאיר סימן על העור או על השולחן.' },
    { icon: 'sparkle', title: 'נצנוץ יהלומי', text: 'חלקיקי ברק עדינים שתופסים את האור מכל זווית.' },
    { icon: 'shield', title: 'בטוח לילדים', text: 'לא רעיל, נבדק ומתאים מגיל 3.' },
    { icon: 'drop', title: 'לא מתייבש', text: 'נשאר רך וגמיש גם אחרי חודשים, בלי להוסיף מים.' },
  ];
  function buildFeatures() {
    return section('base', 'h-features', 'h-features-t',
      h('div', { class: 'h-wrap' },
        sectionHead('כל מה שאוהבים בחול. בלי הבלגן.', 'רך כמו משי, נקי כמו שהשארתם אותו, ומנצנץ בכל פעם מחדש.', { id: 'h-features-t' }),
        h('ul', { class: 'h-tiles', role: 'list' }, FEATURES.map((f, i) => rv(h('li', { class: 'h-tile' },
          h('span', { class: 'h-tile-icon', 'aria-hidden': 'true' }, svgIcon(f.icon, { size: 26 })),
          h('h3', { class: 'h-tile-title' }, f.title),
          h('p', { class: 'h-tile-text' }, f.text)), i)))));
  }

  /* =====================================================================
     3. Sensory chapter: sticky stage, scroll-scrubbed scenes
     ===================================================================== */
  const STEPS = [
    { id: 'press', title: 'ללחוץ.', text: 'לוחצים, והחול נמס בין האצבעות.' },
    { id: 'cut', title: 'לחתוך.', text: 'חותכים, והחתך נקי ושקט.' },
    { id: 'pour', title: 'לשפוך.', text: 'משחררים, והוא נשפך לאט כמו משי.' },
  ];

  // Deterministic pseudo-random so the glitter never jumps between renders.
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  const MOUND = 'M46 292 C76 236 126 160 200 157 C274 160 324 236 354 292 Z';
  const moundTop = (x) => 157 + 136 * Math.pow(Math.abs(x - 200) / 154, 1.7);

  function glitter(seed, n) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = 62 + r() * 276;
      const top = moundTop(x) + 6;
      if (top > 286) continue;
      const y = top + r() * (288 - top);
      const big = r() > 0.82;
      if (big) {
        const s = 2.4 + r() * 2.6;
        out += `<path class="h-tw" style="--d:${(2.4 + r() * 2.6).toFixed(2)}s;--dl:${(-r() * 4).toFixed(2)}s" d="M${x.toFixed(1)} ${(y - s).toFixed(1)}l${(s * 0.22).toFixed(2)} ${(s * 0.78).toFixed(2)} ${(s * 0.78).toFixed(2)} ${(s * 0.22).toFixed(2)} -${(s * 0.78).toFixed(2)} ${(s * 0.22).toFixed(2)} -${(s * 0.22).toFixed(2)} ${(s * 0.78).toFixed(2)} -${(s * 0.22).toFixed(2)} -${(s * 0.78).toFixed(2)} -${(s * 0.78).toFixed(2)} -${(s * 0.22).toFixed(2)} ${(s * 0.78).toFixed(2)} -${(s * 0.22).toFixed(2)}z" fill="#fff"/>`;
      } else {
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + r() * 1.1).toFixed(2)}" fill="#F4E9FF" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
      }
    }
    return out;
  }

  function moundDefs(u) {
    return `<radialGradient id="${u}m" cx=".42" cy=".18" r=".95">
        <stop offset="0" stop-color="#D9BEFF"/><stop offset=".32" stop-color="#9A5CF0"/>
        <stop offset=".7" stop-color="#5E28B0"/><stop offset="1" stop-color="#2E0F68"/></radialGradient>
      <radialGradient id="${u}g" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#8E4DE8" stop-opacity=".55"/><stop offset="1" stop-color="#8E4DE8" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}s" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}sh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  }
  const moundBody = (u, seed) =>
    `<ellipse cx="200" cy="291" rx="154" ry="11" fill="#3A1680"/><path d="${MOUND}" fill="url(#${u}m)"/>
     <path d="M118 214 C150 176 176 166 200 165 C222 166 246 174 268 196 C236 182 214 178 200 178 C178 178 150 188 118 214Z" fill="url(#${u}sh)"/>
     ${glitter(seed, 70)}`;
  const backdrop = (u) =>
    `<ellipse cx="200" cy="232" rx="210" ry="150" fill="url(#${u}g)"/>
     <ellipse cx="200" cy="294" rx="176" ry="15" fill="url(#${u}s)"/>`;

  function scenePress(u) {
    // A fingertip's touch: a soft light lands on the mound, ripples out and leaves a print.
    const arcs = [10, 17, 24, 31].map((rx, i) =>
      `<ellipse cx="200" cy="171" rx="${rx}" ry="${(rx * 0.3).toFixed(1)}" fill="none" stroke="#E9DAFF" stroke-opacity="${(0.5 - i * 0.09).toFixed(2)}" stroke-width="1.1"/>`).join('');
    return `<svg viewBox="0 0 400 360" aria-hidden="true" focusable="false"><defs>${moundDefs(u)}
      <radialGradient id="${u}t" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#F1E6FF" stop-opacity=".55"/><stop offset="1" stop-color="#C9A2FF" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}d" cx=".5" cy=".4" r=".55"><stop offset="0" stop-color="#1E0646"/><stop offset=".65" stop-color="#3B1484"/><stop offset="1" stop-color="#6B33C7" stop-opacity="0"/></radialGradient></defs>
      ${backdrop(u)}
      <g class="h-squash">${moundBody(u, 11)}
        <g class="h-dent"><ellipse cx="200" cy="171" rx="40" ry="13" fill="url(#${u}d)"/>${arcs}
        <path d="M162 176 C178 188 222 188 238 176" fill="none" stroke="#F1E6FF" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/></g></g>
      <g class="h-ripples">${[0, 1, 2].map((i) => `<ellipse class="h-ripple" style="--k:${i}" cx="200" cy="171" rx="46" ry="14" fill="none" stroke="#fff" stroke-width="1.2"/>`).join('')}</g>
      <g class="h-touch"><circle cx="200" cy="150" r="46" fill="url(#${u}t)"/><circle cx="200" cy="150" r="22" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/></g>
      <g class="h-burst">${[[146, 150], [256, 146], [128, 186], [272, 182], [172, 126], [230, 122]].map(([x, y], i) =>
        `<path d="M${x} ${y - 5}l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z" fill="#fff" style="--k:${i}"/>`).join('')}</g>
    </svg>`;
  }

  function sceneCut(u) {
    return `<svg viewBox="0 0 400 360" aria-hidden="true" focusable="false"><defs>${moundDefs(u)}
      <clipPath id="${u}l"><rect x="0" y="0" width="200" height="360"/></clipPath>
      <clipPath id="${u}r"><rect x="200" y="0" width="200" height="360"/></clipPath>
      <linearGradient id="${u}face" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="292"><stop offset="0" stop-color="#E9DAFF"/><stop offset="1" stop-color="#7D45D6"/></linearGradient>
      <linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A8A99"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset="1" stop-color="#B9B9C8"/></linearGradient></defs>
      ${backdrop(u)}
      <g class="h-half h-half--l"><g clip-path="url(#${u}l)">${moundBody(u, 23)}</g>
        <path class="h-face" d="M199 160 L199 292" stroke="url(#${u}face)" stroke-width="2.4"/></g>
      <g class="h-half h-half--r"><g clip-path="url(#${u}r)">${moundBody(u, 23)}</g>
        <path class="h-face" d="M201 160 L201 292" stroke="url(#${u}face)" stroke-width="2.4"/></g>
      <g class="h-blade"><rect x="195" y="70" width="10" height="222" rx="3" fill="url(#${u}b)"/>
        <rect x="191" y="20" width="18" height="58" rx="7" fill="#2A2533"/><rect x="194" y="26" width="3" height="44" rx="1.5" fill="#fff" opacity=".25"/></g>
    </svg>`;
  }

  function scenePour(u) {
    const r = rng(7);
    const drops = Array.from({ length: 16 }, (_, i) =>
      `<circle class="h-drop" cx="${(196 + r() * 8).toFixed(1)}" cy="0" r="${(0.9 + r() * 1.4).toFixed(2)}" fill="${i % 3 ? '#E3CCFF' : '#fff'}" style="--dl:${(-(i / 16) * 1.3).toFixed(2)}s"/>`).join('');
    return `<svg viewBox="0 0 400 360" aria-hidden="true" focusable="false"><defs>${moundDefs(u)}
      <linearGradient id="${u}st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A2FF" stop-opacity="0"/><stop offset=".25" stop-color="#B07CFA"/><stop offset="1" stop-color="#8E4DE8"/></linearGradient></defs>
      ${backdrop(u)}
      <g class="h-grow">${moundBody(u, 41)}</g>
      <g class="h-stream"><path d="M196 -10 C196 60 197 110 197.5 170 L202.5 170 C203 110 204 60 204 -10Z" fill="url(#${u}st)"/>${drops}</g>
    </svg>`;
  }
  const SCENES = { press: scenePress, cut: sceneCut, pour: scenePour };

  function buildSensory(ctx, state) {
    const isStatic = L.reducedMotion();
    const STATIC_T = [0.85, 1, 0.6]; // the most telling frame of each moment
    const figures = STEPS.map((s, i) => h('figure', { class: 'h-scene', 'data-step': i, 'data-id': s.id, style: { '--t': isStatic ? STATIC_T[i] : 0 } },
      h('div', { class: 'h-scene-art', html: SCENES[s.id](L.uid('hs')) }),
      h('figcaption', { class: 'h-scene-cap' },
        h('span', { class: 'h-scene-num', 'aria-hidden': 'true' }, `0${i + 1}`),
        h('strong', { class: 'h-scene-title' }, s.title),
        h('span', { class: 'h-scene-text' }, s.text))));

    const bars = STEPS.map((s, i) => h('button', {
      type: 'button', class: 'h-prog-item', 'data-step': i,
      'aria-label': `שלב ${i + 1}: ${s.title.replace('.', '')}`,
      onClick: () => jumpTo(i),
    }, h('span', { class: 'h-prog-label' }, s.title.replace('.', '')), h('span', { class: 'h-prog-track' }, h('span', { class: 'h-prog-fill' }))));
    const progress = h('div', { class: 'h-prog', role: 'group', 'aria-label': 'שלבי ההרגשה' }, bars);

    const stage = h('div', { class: 'h-sense-stage', 'data-active': '0' },
      h('div', { class: 'h-sense-scenes' }, figures), isStatic ? null : progress);
    const track = h('div', { class: 'h-sense-track' }, stage);

    const sec = section('dark', ['h-sense', isStatic && 'is-static'], 'h-sense-t',
      h('div', { class: 'h-wrap h-sense-intro', id: 'h-sense' },
        sectionHead('הרגשה שאי אפשר להסביר. אפשר רק לגעת.',
          'כל תנועה מקבלת נצנוץ, וכל נשימה נעשית איטית יותר.', { id: 'h-sense-t', eyebrow: 'החוויה' })),
      track);

    function jumpTo(i) {
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const y = window.scrollY + r.top + total * ((i + 0.62) / STEPS.length);
      window.scrollTo({ top: y, behavior: scrollBehavior() });
    }

    let lastActive = -1;
    state.updateSense = () => {
      if (isStatic) return;
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return;
      const total = Math.max(1, r.height - vh);
      const p = L.clamp(-r.top / total, 0, 1);
      const n = STEPS.length;
      const active = Math.min(n - 1, Math.floor(p * n));
      figures.forEach((f, i) => {
        const t = L.clamp((p * n - i) / 0.78, 0, 1);
        f.style.setProperty('--t', smooth(t).toFixed(3));
      });
      bars.forEach((b, i) => b.style.setProperty('--f', L.clamp(p * n - i, 0, 1).toFixed(3)));
      if (active !== lastActive) {
        lastActive = active;
        stage.dataset.active = String(active);
        bars.forEach((b, i) => b.setAttribute('aria-current', i === active ? 'step' : 'false'));
      }
    };
    return sec;
  }

  /* =====================================================================
     4. Shades
     ===================================================================== */
  function buildShades() {
    let shade = 'amethyst';
    const art = L.ui.art('classic', { shade, variant: 'hero', alt: 'שקית חול יהלומים קלאסי' });
    const artWrap = h('div', { class: 'h-shade-art' }, h('div', { class: 'h-shade-glow', 'aria-hidden': 'true' }), art);
    const name = h('h3', { class: 'h-shade-name' }, shadeOf(shade).name);
    const line = h('p', { class: 'h-shade-line' }, SHADE_LINES[shade]);
    const cta = L.ui.button(`לקנות ב${shadeOf(shade).name}`, { variant: 'prominent', size: 'lg', href: `#/product/classic?shade=${shade}` });
    const all = L.ui.button('לכל הגוונים בחנות', { variant: 'plain', icon: 'forward', iconEnd: true, href: '#/shop?cat=sand', className: 'h-link' });

    const dots = L.ui.swatches({
      shades: SHADE_IDS, value: shade, showName: false, size: 'lg',
      onChange: (id) => {
        shade = id;
        artWrap.style.setProperty('--glow', shadeOf(id).base);
        artWrap.classList.remove('is-swap');
        void artWrap.offsetWidth; // restart the pulse
        artWrap.classList.add('is-swap');
        if (typeof art.setShade === 'function') art.setShade(id);
        else art.replaceWith(L.ui.art('classic', { shade: id, variant: 'hero' }));
        name.textContent = shadeOf(id).name;
        line.textContent = SHADE_LINES[id];
        cta.setLabel(`לקנות ב${shadeOf(id).name}`);
        cta.href = `#/product/classic?shade=${id}`;
        L.ui.announce?.(`${shadeOf(id).name}. ${SHADE_LINES[id]}`);
      },
    });
    artWrap.style.setProperty('--glow', shadeOf(shade).base);

    return section('alt', 'h-shades', 'h-shades-t',
      h('div', { class: 'h-wrap' },
        sectionHead('ארבעה גוונים. עולם אחד.', 'אמטיסט, לבנדר, סגול עמוק וחצות. בחרו אחד, או אספו את כולם.', { id: 'h-shades-t' }),
        h('div', { class: 'h-shade-grid' },
          rv(artWrap),
          rv(h('div', { class: 'h-shade-panel' },
            h('div', { class: 'h-shade-text', 'aria-live': 'off' }, name, line),
            dots,
            h('div', { class: 'h-shade-ctas' }, cta, all)), 1))));
  }

  /* =====================================================================
     5. Collection teaser
     ===================================================================== */
  function buildCollection() {
    const ids = ['classic', 'quartet', 'midnight', 'giftbox'].filter((id) => L.catalog.get(id));
    return section('base', 'h-collection', 'h-coll-t',
      h('div', { class: 'h-wrap' },
        h('div', { class: 'h-coll-head' },
          sectionHead('האוסף.', 'חול, אביזרים ומתנות. כל מה שצריך לרגע של שקט.', { id: 'h-coll-t', start: true }),
          rv(L.ui.button('לכל המוצרים', { variant: 'plain', icon: 'forward', iconEnd: true, href: '#/shop', className: 'h-link h-coll-all' }), 2))),
      h('div', { class: 'h-rail-wrap' },
        h('ul', { class: 'h-rail', role: 'list' }, ids.map((id, i) => rv(h('li', { class: 'h-rail-item' }, L.ui.productCard(id)), i)))));
  }

  /* =====================================================================
     6. Specs & safety
     ===================================================================== */
  function buildSpecs() {
    const specs = L.ui.groupedList([{
      header: 'מפרט',
      rows: [
        { icon: 'diamond', title: 'חומר', subtitle: 'חול קוורץ וסיליקון בדרגת צעצוע' },
        { icon: 'user', title: 'גיל', subtitle: h('span', null, h('bdi', { dir: 'ltr' }, '3+'), ' בהשגחת מבוגר') },
        { icon: 'sparkle', title: 'נצנוץ', subtitle: 'חלקיקי ברק עדינים' },
        { icon: 'box', title: 'משקל', subtitle: '450 ג׳ · 900 ג׳ · 2 ק״ג' },
        { icon: 'drop', title: 'ניקוי', subtitle: 'מטלית לחה. אין לשטוף במים.' },
      ],
    }]);
    const safety = L.ui.groupedList([{
      header: 'בטיחות',
      footer: 'החול נבדק בהתאם לדרישות תקן בטיחות לצעצועים. מתאים מגיל 3, בהשגחת מבוגר.',
      rows: [
        { icon: 'leaf', title: 'לא רעיל' },
        { icon: 'heart', title: 'ללא אלרגנים ידועים' },
        { icon: 'user', title: 'מומלץ להשגיח על ילדים צעירים' },
        { icon: 'info', title: 'לא למאכל' },
      ],
    }]);
    return section('alt', 'h-specs', 'h-specs-t',
      h('div', { class: 'h-wrap' },
        sectionHead('מפורט. בטוח. בדוק.', 'כל מה שחשוב לדעת לפני שפותחים את השקית הראשונה.', { id: 'h-specs-t' }),
        h('div', { class: 'h-specs-grid' }, rv(specs), rv(safety, 1))));
  }

  /* =====================================================================
     7. Testimonials (sample)
     ===================================================================== */
  const QUOTES = [
    { q: 'הילדה שלי לא מורידה ממנו את הידיים. ואני, אם להודות, גם לא.', who: 'נועה', where: 'תל אביב' },
    { q: 'הפכתי את הצנצנת לפריט עיצוב בסלון. כולם שואלים מאיפה.', who: 'דניאל', where: 'חיפה' },
    { q: 'הדבר הכי טוב לסוף יום ארוך. שקט, מנצנץ, מרגיע.', who: 'מיכל', where: 'ירושלים' },
  ];
  function buildReviews() {
    const rating = L.catalog.get('classic')?.rating || 4.9;
    const stars = h('span', { class: 'h-stars', 'aria-hidden': 'true' }, Array.from({ length: 5 }, () => svgIcon('star', { filled: true, size: 18 })));
    return section('base', 'h-reviews', 'h-rev-t',
      h('div', { class: 'h-wrap' },
        sectionHead('אהבה במגע ראשון.', null, { id: 'h-rev-t' }),
        rv(h('div', { class: 'h-rating' },
          h('span', { class: 'h-rating-num' }, h('bdi', null, L.fmt.number(rating))),
          h('span', { class: 'h-rating-meta' }, stars, h('span', null, 'דירוג ממוצע מתוך 5')),
          h('span', { class: 'visually-hidden' }, `דירוג ${rating} מתוך 5`)), 1),
        h('ul', { class: 'h-quotes', role: 'list' }, QUOTES.map((x, i) => rv(h('li', { class: 'h-quote' },
          h('blockquote', null, h('p', null, `״${x.q}״`)),
          h('p', { class: 'h-quote-who' }, h('strong', null, x.who), `, ${x.where}`)), i))),
        rv(h('p', { class: 'h-caption' }, 'ביקורות לדוגמה'))));
  }

  /* =====================================================================
     8. FAQ
     ===================================================================== */
  const FAQ = [
    ['האם החול בטוח לילדים?', 'החול לא רעיל ומתאים מגיל 3, בהשגחה. לא מיועד לאכילה.'],
    ['האם הוא מתייבש?', 'לא. הוא שומר על הרכות שלו. מומלץ לסגור את האריזה אחרי השימוש.'],
    ['איך מנקים אותו?', 'אוספים פירורים עם גוש חול, והוא מושך אותם אליו. אין לשטוף במים.'],
    ['כמה זמן לוקח משלוח?', `2–5 ימי עסקים עד הבית, או לנקודת איסוף. משלוח חינם בקנייה מעל ${L.fmt.price(L.SHIPPING.freeOver)}.`],
    ['אפשר להחזיר?', 'כן, תוך 14 יום מקבלת המוצר, באריזה סגורה.'],
    ['איזה גוון לבחור?', 'אמטיסט הוא הקלאסי. לבנדר רך ובהיר, סגול עמוק עשיר, וחצות הכי דרמטי. ואפשר גם את אוסף ארבעת הגוונים.'],
  ];
  function buildFaq() {
    return section('alt', 'h-faq', 'h-faq-t',
      h('div', { class: 'h-wrap h-wrap--narrow' },
        sectionHead('שאלות נפוצות.', null, { id: 'h-faq-t' }),
        rv(L.ui.accordion(FAQ.map(([title, content]) => ({ title, content }))), 1)));
  }

  /* =====================================================================
     9. Final CTA
     ===================================================================== */
  function buildFinal() {
    const art = L.ui.art('giftbox', { variant: 'hero' });
    return section('dark', 'h-final', 'h-final-t',
      h('div', { class: 'h-wrap h-final-inner' },
        rv(h('div', { class: 'h-final-art' }, art)),
        h('div', { class: 'h-final-copy' },
          rv(h('h2', { class: 'h-title', id: 'h-final-t' }, 'הרגע שלכם מתחיל בכף היד.'), 1),
          rv(trustIcons('h-final-trust', [['truck', `משלוח חינם מעל ${L.fmt.price(L.SHIPPING.freeOver)}`], ['returnBox', '14 ימי החזרה'], ['gift', 'אריזת מתנה']]), 2),
          rv(h('div', { class: 'h-final-ctas' }, L.ui.button('לחנות', { variant: 'prominent', size: 'lg', href: '#/shop' })), 3))));
  }

  /* =====================================================================
     10. Footer (fine print)
     ===================================================================== */
  const INFO = {
    'משלוחים': [
      `משלוח עד הבית: ${L.fmt.price(L.SHIPPING.home)}, תוך 2–5 ימי עסקים.`,
      `נקודת איסוף: ${L.fmt.price(L.SHIPPING.pickup)}.`,
      `משלוח חינם בהזמנה מעל ${L.fmt.price(L.SHIPPING.freeOver)}. הזמנות עד 14:00 יוצאות באותו יום עסקים.`,
    ],
    'החזרות': ['אפשר להחזיר מוצר תוך 14 יום מקבלתו, באריזה סגורה ושלמה.', 'הזיכוי יינתן באמצעי התשלום המקורי.'],
    'תקנון': ['זהו אתר הדגמה. לא מתבצעות בו רכישות אמיתיות ולא נגבה תשלום.', 'המחירים כוללים מע״מ ומוצגים לצורכי המחשה בלבד.'],
    'נגישות': ['האתר נבנה עם תמיכה בקוראי מסך, ניווט מקלדת, ניגודיות מוגברת והפחתת תנועה.', 'אפשר להתאים את שקיפות הזכוכית ואת ערכת הצבעים בהגדרות התצוגה.'],
    'צור קשר': ['זהו אתר הדגמה, ולכן אין בו שירות לקוחות פעיל.', 'תודה שעברתם לבקר.'],
  };
  function openInfo(title) {
    L.ui.sheet({
      title, detent: 'medium',
      content: h('div', { class: 'h-info' }, INFO[title].map((p) => h('p', null, p))),
    });
  }
  function buildFooter() {
    return h('footer', { class: 'h-footer', 'data-tone': 'alt' },
      h('div', { class: 'h-wrap' },
        h('div', { class: 'h-fine' },
          h('p', null, `המחירים כוללים מע״מ. משלוח חינם בהזמנה מעל ${L.fmt.price(L.SHIPPING.freeOver)}; עד הבית ${L.fmt.price(L.SHIPPING.home)}, לנקודת איסוף ${L.fmt.price(L.SHIPPING.pickup)}.`),
          h('p', null, 'החול מתאים מגיל 3 ובהשגחת מבוגר. לא למאכל. הביקורות באתר הן לדוגמה.'),
          h('p', null, 'האיורים באתר הם המחשה. הגוון בפועל עשוי להשתנות מעט בין מסכים.')),
        h('nav', { class: 'h-foot-nav', 'aria-label': 'מידע' },
          Object.keys(INFO).map((t) => h('button', { type: 'button', class: 'h-foot-link', onClick: () => openInfo(t) }, t))),
        h('div', { class: 'h-foot-bottom' },
          h('span', { class: 'h-foot-logo', html: L.art?.logo ? L.art.logo({ size: 16, variant: 'full' }) : 'LUMA' }),
          h('p', null, h('bdi', { dir: 'ltr' }, '© 2026 LUMA'), '. כל הזכויות שמורות.'),
          h('p', { class: 'h-foot-demo' }, 'אתר הדגמה'))));
  }

  /* =====================================================================
     Behaviour: reveal, scroll, adaptive chrome
     ===================================================================== */
  function setupReveal(ctx) {
    const items = L.$$('.h-rv', ctx.el);
    if (L.reducedMotion() || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
    ctx.el.classList.add('h-anim');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    ctx.onCleanup(() => io.disconnect());
  }

  /** Keeps the scroll-edge tint and the glass chrome in step with the section under it
      (iOS glass adapts light/dark to the content below). */
  function setupChrome(ctx) {
    const sections = L.$$('[data-tone]', ctx.el);
    let ios = [];
    const setTop = (tone) => {
      root.dataset.hTop = tone;
      root.style.setProperty('--edge-color', EDGE[tone] || 'var(--bg)');
    };
    const setBot = (tone) => { root.dataset.hBot = tone; };
    function build() {
      ios.forEach((io) => io.disconnect());
      if (!('IntersectionObserver' in window)) return;
      const vh = window.innerHeight;
      const topLine = Math.round((L.$('.topbar')?.getBoundingClientRect().height || 56) / 2);
      const botLine = vh - 44;
      const line = (y, cb) => {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) cb(e.target.dataset.tone); });
        }, { rootMargin: `${-y}px 0px ${-(vh - y - 1)}px 0px`, threshold: 0 });
        sections.forEach((s) => io.observe(s));
        return io;
      };
      ios = [line(topLine, setTop), line(botLine, setBot)];
    }
    setTop('hero');
    setBot('hero');
    build();
    const onResize = L.debounce(build, 200);
    window.addEventListener('resize', onResize);
    ctx.onCleanup(() => {
      ios.forEach((io) => io.disconnect());
      window.removeEventListener('resize', onResize);
      delete root.dataset.hTop;
      delete root.dataset.hBot;
      root.style.removeProperty('--edge-color');
    });
  }

  function setupScroll(ctx, state) {
    const reduced = L.reducedMotion();
    let ticking = false;
    let heroH = state.hero.offsetHeight || window.innerHeight;
    const frame = () => {
      ticking = false;
      state.updateSense?.(); // reads layout first, then writes: no forced reflow below
      const y = window.scrollY;
      if (!reduced && y < heroH * 1.1) {
        const k = Math.max(0, y) / heroH;
        state.heroContent.style.transform = `translate3d(0, ${(k * heroH * 0.28).toFixed(1)}px, 0) scale(${(1 - k * 0.06).toFixed(4)})`;
        state.heroContent.style.opacity = String(L.clamp(1 - k * 1.5, 0, 1).toFixed(3));
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    const onResize = L.debounce(() => { heroH = state.hero.offsetHeight || window.innerHeight; onScroll(); }, 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    requestAnimationFrame(frame);
    ctx.onCleanup(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    });
  }

  /* =====================================================================
     View
     ===================================================================== */
  L.views.define('home', {
    route: '/',
    title: 'לוּמָה',
    tab: 'home',
    render(ctx) {
      const state = { heroShade: 'amethyst', stage: null };
      ctx.el.append(
        buildHero(ctx, state),
        buildFeatures(),
        buildSensory(ctx, state),
        buildShades(),
        buildCollection(),
        buildSpecs(),
        buildReviews(),
        buildFaq(),
        buildFinal(),
        buildFooter());
      mountStage(ctx, state);
      setupReveal(ctx);
      setupChrome(ctx);
      setupScroll(ctx, state);
    },
  });
})();

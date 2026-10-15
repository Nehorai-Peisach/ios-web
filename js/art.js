/* LUMA: generated visuals: product illustrations (SVG), sand stage (canvas), swatches, logo.
   Every product image on the site comes from this file. Deterministic: the same product + shade
   always renders the same glitter. Classic script, attaches to window.Luma.art. */
(() => {
  'use strict';
  const L = (window.Luma = window.Luma || {});

  /* ================================================================== *
   *  Palette + lookups
   * ================================================================== */
  const SHADES = [
    { id: 'amethyst', name: 'אמטיסט', base: '#8E4DE8', deep: '#4B1E92', light: '#C9A2FF', glitter: '#F4E9FF' },
    { id: 'lavender', name: 'לבנדר', base: '#B79CFF', deep: '#7A5CCB', light: '#E6DCFF', glitter: '#FFFFFF' },
    { id: 'violet', name: 'סגול עמוק', base: '#5A1FB0', deep: '#2A0A63', light: '#8E5BEA', glitter: '#E3CCFF' },
    { id: 'midnight', name: 'חצות', base: '#2B1652', deep: '#120729', light: '#5A3C8F', glitter: '#E8ECFF' },
  ];
  const SHADE_EN = { amethyst: 'AMETHYST', lavender: 'LAVENDER', violet: 'DEEP VIOLET', midnight: 'MIDNIGHT' };
  const KINDS = ['pouch', 'set', 'jar', 'tools', 'tray', 'mini', 'box'];
  const KIND_OF = { classic: 'pouch', quartet: 'set', midnight: 'pouch', refill: 'pouch', tools: 'tools', tray: 'tray', jar: 'jar', mini: 'mini', giftbox: 'box' };
  const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Heebo',system-ui,sans-serif";

  function getShade(id) {
    let s = null;
    try { s = L.catalog && typeof L.catalog.shade === 'function' ? L.catalog.shade(id) : null; } catch (e) { s = null; }
    if (s && s.base && s.deep && s.light && s.glitter) return s;
    return SHADES.find((x) => x.id === id) || SHADES[0];
  }

  function resolveProduct(p) {
    if (typeof p === 'string') {
      let prod = null;
      try { prod = L.catalog && L.catalog.get ? L.catalog.get(p) : null; } catch (e) { prod = null; }
      if (prod) return { ...prod, kind: prod.kind || KIND_OF[prod.id] || 'pouch' };
      if (KINDS.includes(p)) return { id: p, kind: p };
      return { id: p, kind: KIND_OF[p] || 'pouch' };
    }
    if (p && typeof p === 'object') return { ...p, id: p.id || p.kind || 'item', kind: KINDS.includes(p.kind) ? p.kind : (KIND_OF[p.id] || 'pouch') };
    return { id: 'classic', kind: 'pouch' };
  }

  const reducedMotion = () => {
    try { return typeof L.reducedMotion === 'function' ? !!L.reducedMotion() : matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };

  /* ================================================================== *
   *  Small utils: hashing, seeded RNG, colour
   * ================================================================== */
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rngFrom(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hexRgb = (hex) => {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const rgba = (hex, a) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };
  const n1 = (v) => Math.round(v * 10) / 10;
  const n2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ================================================================== *
   *  Shared CSS (owned here: twinkle + layout of .art)
   * ================================================================== */
  function ensureStyle() {
    if (document.getElementById('luma-art-css')) return;
    const st = document.createElement('style');
    st.id = 'luma-art-css';
    st.textContent = `
.art{position:relative;display:block;width:100%;aspect-ratio:1/1;contain:layout paint;user-select:none;-webkit-user-select:none}
.art>svg{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.art .tw{transform-box:fill-box;transform-origin:center;animation:luma-tw var(--d,3.4s) ease-in-out var(--dl,0s) infinite both}
@keyframes luma-tw{0%,100%{opacity:.18;transform:scale(.45)}45%{opacity:1;transform:scale(1)}60%{opacity:.9;transform:scale(.92)}}
@media (prefers-reduced-motion:reduce){.art .tw{animation:none}}`;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ================================================================== *
   *  SVG building context
   * ================================================================== */
  const DETAIL = {
    thumb: { specks: 0.4, glints: 0.55, grain: false, text: false, tw: false, glintScale: 1.35 },
    card: { specks: 1, glints: 1, grain: true, text: true, tw: false, glintScale: 1 },
    hero: { specks: 1.7, glints: 1.45, grain: true, text: true, tw: true, glintScale: 0.95 },
  };
  let instance = 0;

  function makeCtx(product, shade, variant) {
    const p = 'la' + (++instance).toString(36);
    const seed = hashStr(product.id + '|' + product.kind + '|' + shade.id);
    let n = 0;
    const ctx = {
      p, shade, variant, product, seed,
      det: DETAIL[variant] || DETAIL.card,
      defs: [],
      id: (k) => `${p}${k}${(++n).toString(36)}`,
      rng: (salt) => rngFrom(seed ^ hashStr(String(salt))),
      cache: {},
    };
    return ctx;
  }

  const stopsMk = (stops) => stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null && a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
  function grad(ctx, tag, attrs, stops) {
    const key = tag + attrs + JSON.stringify(stops);
    if (ctx.cache[key]) return ctx.cache[key];
    const id = ctx.id('g');
    ctx.defs.push(`<${tag} id="${id}"${attrs}>${stopsMk(stops)}</${tag}>`);
    return (ctx.cache[key] = `url(#${id})`);
  }
  const lin = (ctx, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, extra = '') =>
    grad(ctx, 'linearGradient', ` x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${extra}`, stops);
  const rad = (ctx, stops, cx = 0.5, cy = 0.5, r = 0.5, extra = '') =>
    grad(ctx, 'radialGradient', ` cx="${cx}" cy="${cy}" r="${r}"${extra}`, stops);
  function clipD(ctx, d, extra = '') {
    const id = ctx.id('c');
    ctx.defs.push(`<clipPath id="${id}"><path d="${d}"${extra}/></clipPath>`);
    return `url(#${id})`;
  }
  // Fine sand grain (light + dark speckle): one per art, cached
  function grainFilter(ctx) {
    if (ctx.cache.grain) return ctx.cache.grain;
    const id = ctx.id('f');
    const seed = ctx.seed % 997;
    ctx.defs.push(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="${seed}" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0" result="w"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 0 0 0 -3.35" result="hi"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 .1 0 0 0 0 .03 0 0 0 0 .22 -5 0 0 0 2.1" result="lo"/>
<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed + 7}" result="m"/>
<feColorMatrix in="m" type="matrix" values="0 0 0 0 .12 0 0 0 0 .04 0 0 0 0 .3 -1.4 0 0 0 .72" result="mot"/>
<feMerge><feMergeNode in="mot"/><feMergeNode in="lo"/><feMergeNode in="hi"/></feMerge>
</filter>`);
    ctx.cache.grain = id;
    return id;
  }
  function haloGrad(ctx, color) {
    const key = 'halo' + color;
    if (ctx.cache[key]) return ctx.cache[key];
    const id = ctx.id('h');
    ctx.defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity=".85"/><stop offset=".35" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    ctx.cache[key] = `url(#${id})`;
    return ctx.cache[key];
  }

  const dotD = (x, y, r) => `M${n1(x - r)} ${n1(y)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(2 * r)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-2 * r)} 0`;

  /* A camera-style glint: 4-point star + soft halo + hot core. */
  function glint(ctx, x, y, s, color, r) {
    const k = s * 0.085;
    const star = `M${n1(x)} ${n1(y - s)}L${n1(x + k)} ${n1(y - k)}L${n1(x + s)} ${n1(y)}L${n1(x + k)} ${n1(y + k)}L${n1(x)} ${n1(y + s)}L${n1(x - k)} ${n1(y + k)}L${n1(x - s)} ${n1(y)}L${n1(x - k)} ${n1(y - k)}Z`;
    const s2 = s * 0.42, k2 = s2 * 0.12;
    const diag = `M${n1(x - s2)} ${n1(y - s2)}L${n1(x + k2)} ${n1(y - k2 * 0)}L${n1(x + s2)} ${n1(y + s2)}L${n1(x - k2)} ${n1(y)}Z`;
    let m = `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(s * 0.62)}" fill="${haloGrad(ctx, color)}"/>`;
    m += `<path d="${star}" fill="${color}" opacity=".95"/>`;
    if (s > 6) m += `<path d="${diag}" fill="${color}" opacity=".45"/><path d="${diag}" transform="rotate(90 ${n1(x)} ${n1(y)})" fill="${color}" opacity=".45"/>`;
    m += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n2(Math.max(0.7, s * 0.12))}" fill="#fff"/>`;
    if (ctx.det.tw && r() < 0.7) {
      const d = (2.6 + r() * 3.4).toFixed(2), dl = (-r() * 6).toFixed(2);
      return `<g class="tw" style="--d:${d}s;--dl:${dl}s">${m}</g>`;
    }
    return `<g>${m}</g>`;
  }

  /* Glitter sand: base paint + grain + seeded specks + glints, clipped to `d`.
     o: {d, box:[x,y,w,h], fill | under, shade, salt, density, glints, glintSize, grain, over} */
  function sand(ctx, o) {
    const sh = o.shade || ctx.shade;
    const r = ctx.rng('sand:' + o.salt);
    const [x, y, w, h] = o.box;
    const det = ctx.det;
    let m = `<g clip-path="${clipD(ctx, o.d)}">`;
    m += o.under || `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="${o.fill}"/>`;
    const [yr, yg, yb] = hexRgb(sh.base);
    const bright = clamp(((0.2126 * yr + 0.7152 * yg + 0.0722 * yb) / 255 - 0.3) * 2.5, 0, 1);
    if (det.grain && o.grain !== 0) {
      m += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" filter="url(#${grainFilter(ctx)})" opacity="${n2((o.grain == null ? 0.55 : o.grain) * (1 - bright * 0.6))}"/>`;
    }
    if (o.over) m += o.over;
    // specks: grains in dark/light tones + glitter sparks. Encoded as round-capped zero-length
    // segments ("M x y h0"): far lighter markup than circles.
    const area = w * h;
    const k = ctx.k || 1;
    const count = Math.round((area / 70) * (o.density == null ? 1 : o.density) * det.specks * Math.max(0.3, k * k));
    const B = [
      [0.26, mix(mix(sh.deep, '#000000', 0.2), sh.base, bright * 0.35), 0.32 - bright * 0.12, 1.1, 2.4],
      [0.5, sh.light, 0.55, 0.9, 2],
      [0.78, sh.glitter, 0.55, 0.7, 1.4],
      [0.92, sh.glitter, 0.85, 1, 2],
      [0.975, '#ffffff', 1, 1.4, 2.6],
      [1, r() < 0.5 ? '#FFD9F4' : '#D3E6FF', 0.9, 1, 2],
    ];
    const paths = B.map(() => ['', '']);
    for (let i = 0; i < count; i++) {
      const px = x + r() * w, py = y + r() * h, t = r();
      let bi = 0;
      while (t > B[bi][0]) bi++;
      paths[bi][r() < 0.7 ? 0 : 1] += `M${n1(px)} ${n1(py)}h0`;
    }
    B.forEach((bk, i) => {
      for (let j = 0; j < 2; j++) {
        if (paths[i][j]) m += `<path d="${paths[i][j]}" stroke="${bk[1]}" stroke-opacity="${bk[2]}" stroke-width="${j ? bk[4] : bk[3]}" stroke-linecap="round" fill="none"/>`;
      }
    });
    // glints
    const gc = Math.max(o.glints === 0 ? 0 : 1, Math.round((area / 2300) * (o.glints == null ? 1 : o.glints) * det.glints * Math.max(0.35, k)));
    const gs = ((o.glintSize || 1) * det.glintScale) / Math.sqrt(k);
    for (let i = 0; i < gc; i++) {
      const gx = x + (0.04 + r() * 0.92) * w;
      const gy = y + (o.glintTop ? Math.pow(r(), 1.6) * 0.92 : 0.04 + r() * 0.92) * h;
      const size = (3 + Math.pow(r(), 2.6) * 10) * gs;
      m += glint(ctx, gx, gy, size, sh.glitter, r);
    }
    m += '</g>';
    return m;
  }

  function contactShadow(ctx, cx, cy, rx, ry, k = 1) {
    const g = rad(ctx, [[0, '#1a0b33', 0.34 * k], [0.5, '#1a0b33', 0.14 * k], [1, '#1a0b33', 0]]);
    const g2 = rad(ctx, [[0, '#0a0414', 0.55 * k], [1, '#0a0414', 0]]);
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${g}"/>` +
      `<ellipse cx="${n1(cx)}" cy="${n1(cy - ry * 0.12)}" rx="${n1(rx * 0.72)}" ry="${n1(ry * 0.38)}" fill="${g2}"/>`;
  }

  /* ================================================================== *
   *  Brand marks (shared by logo + embossing)
   * ================================================================== */
  // Faceted brilliant (24×24 box). [points, facet opacity]
  const GEM = [
    ['7,4 17,4 14.2,9 9.8,9', 0.5],
    ['7,4 9.8,9 2,9', 0.82],
    ['17,4 22,9 14.2,9', 0.36],
    ['2,9 9.8,9 12,22.5', 1],
    ['9.8,9 14.2,9 12,22.5', 0.62],
    ['14.2,9 22,9 12,22.5', 0.8],
  ];
  function gemMarkup(x, y, size, fill, op = 1) {
    const s = size / 24;
    return `<g transform="translate(${n1(x)} ${n1(y)}) scale(${n2(s)})">` +
      GEM.map(([pts, a]) => `<polygon points="${pts}" fill="${fill}" fill-opacity="${n2(a * op)}"/>`).join('') +
      `</g>`;
  }
  // Geometric "LUMA" wordmark as strokes. capH 100 units, width 378.
  const WORD_W = 378;
  function wordD(x0 = 0, y0 = 0, s = 1) {
    const X = (v) => n2(x0 + v * s), Y = (v) => n2(y0 + v * s), R = n2(35 * s);
    return `M${X(0)} ${Y(0)}V${Y(100)}H${X(54)}` +
      `M${X(84)} ${Y(0)}V${Y(65)}A${R} ${R} 0 0 0 ${X(154)} ${Y(65)}V${Y(0)}` +
      `M${X(186)} ${Y(100)}V${Y(0)}L${X(229)} ${Y(74)}L${X(272)} ${Y(0)}V${Y(100)}` +
      `M${X(300)} ${Y(100)}L${X(339)} ${Y(0)}L${X(378)} ${Y(100)}M${X(314.5)} ${Y(63)}H${X(363.5)}`;
  }
  function wordMarkup(cx, top, capH, stroke, weight = 9, extra = '') {
    const s = capH / 100;
    return `<path d="${wordD(cx - (WORD_W * s) / 2, top, s)}" fill="none" stroke="${stroke}" stroke-width="${n2(weight * s)}" stroke-linejoin="miter" stroke-miterlimit="2.2"${extra}/>`;
  }

  /* ================================================================== *
   *  Product pieces
   * ================================================================== */
  function pile(ctx, o) {
    // a soft kinetic-sand mound sitting on the surface. o:{x,y,w,h,shade,salt}
    const { x, y, w, h } = o;
    const sh = o.shade || ctx.shade;
    const r = ctx.rng('pile' + o.salt);
    const j = () => (r() - 0.5) * h * 0.18;
    const d = `M${n1(x - w / 2)} ${n1(y)}C${n1(x - w * 0.38)} ${n1(y - h * 0.25 + j())} ${n1(x - w * 0.24)} ${n1(y - h + j())} ${n1(x - w * 0.02)} ${n1(y - h)}` +
      `C${n1(x + w * 0.2)} ${n1(y - h + j())} ${n1(x + w * 0.36)} ${n1(y - h * 0.3 + j())} ${n1(x + w / 2)} ${n1(y)}Q${n1(x)} ${n1(y + h * 0.2)} ${n1(x - w / 2)} ${n1(y)}Z`;
    let m = contactShadow(ctx, x + w * 0.04, y + 1, w * 0.62, h * 0.32, 0.9);
    const fill = rad(ctx, [[0, mix(sh.light, sh.glitter, 0.25)], [0.35, sh.base], [0.8, sh.deep], [1, mix(sh.deep, '#000', 0.35)]], 0.38, 0.22, 0.85);
    m += sand(ctx, { d, box: [x - w / 2, y - h, w, h * 1.2], fill, shade: sh, salt: 'pile' + o.salt, density: 1.25, glints: 2.2, glintSize: 0.75, glintTop: true });
    // loose grains around the pile
    let grains = '';
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI, rr = w * (0.52 + r() * 0.35);
      grains += dotD(x + Math.cos(a) * rr * (r() < 0.5 ? -1 : 1), y + 1 + r() * h * 0.22, 0.45 + r() * 0.75);
    }
    m += `<path d="${grains}" fill="${sh.base}" opacity=".85"/>`;
    return m;
  }

  /* Stand-up pouch. Local coords: bottom centre (0,0), height 280, width ~216. */
  function pouch(ctx, o) {
    const sh = o.shade || ctx.shade;
    const s = o.s || 1;
    const variant = o.label || 'classic';
    const limited = variant === 'limited';
    const prevK = ctx.k; ctx.k = s * (prevK || 1);
    const body = mix(sh.deep, '#07040d', limited ? 0.66 : 0.52);
    const hi = mix(body, '#ffffff', 0.17), lo = mix(body, '#000000', 0.55);
    const outline = 'M-100 -280H100V-250C104 -205 110 -160 108 -112C106 -62 106 -30 104 -11Q103 0 91 0H-91Q-103 0 -104 -11C-106 -30 -106 -62 -108 -112C-110 -160 -104 -205 -100 -250Z';
    let m = `<g transform="translate(${n1(o.x)} ${n1(o.y)}) scale(${n2(s)})">`;
    m += `<path d="${outline}" fill="${lin(ctx, [[0, mix(hi, body, 0.45)], [0.09, hi], [0.36, body], [0.8, mix(body, lo, 0.55)], [1, lo]], 0, 0, 1, 0)}"/>`;
    m += `<g clip-path="${clipD(ctx, outline)}">`;
    m += `<rect x="-112" y="-282" width="224" height="284" fill="${lin(ctx, [[0, '#ffffff', 0.08], [0.22, '#ffffff', 0], [0.75, '#000000', 0], [1, '#000000', 0.4]])}"/>`;
    m += `<rect x="-86" y="-252" width="40" height="252" fill="${lin(ctx, [[0, '#ffffff', 0], [0.5, '#ffffff', 0.085], [1, '#ffffff', 0]], 0, 0, 1, 0)}"/>`;
    // heat-sealed top with crimp texture, zip, notches
    const crimpId = ctx.id('p');
    ctx.defs.push(`<pattern id="${crimpId}" width="2.6" height="10" patternUnits="userSpaceOnUse"><rect width="1.1" height="10" fill="#fff" opacity=".07"/></pattern>`);
    m += `<rect x="-112" y="-282" width="224" height="22" fill="${rgba('#ffffff', 0.035)}"/><rect x="-112" y="-282" width="224" height="22" fill="url(#${crimpId})"/>`;
    m += `<path d="M-112 -259.5H112" stroke="rgba(0,0,0,.35)" stroke-width="1"/><path d="M-112 -258.6H112" stroke="rgba(255,255,255,.07)" stroke-width=".8"/>`;
    m += `<path d="M-112 -246H112" stroke="rgba(0,0,0,.32)" stroke-width="2.2"/><path d="M-112 -244.2H112" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`;
    // side seals + gusset
    m += `<path d="M-95 -258C-98 -205 -103 -160 -101 -112C-99 -62 -99 -30 -97 -6M95 -258C98 -205 103 -160 101 -112C99 -62 99 -30 97 -6" stroke="rgba(0,0,0,.2)" stroke-width="1" fill="none"/>`;
    m += `<path d="M-106 -26Q0 -8 106 -26" stroke="rgba(0,0,0,.28)" stroke-width="1.4" fill="none"/><path d="M-106 -24.4Q0 -6.4 106 -24.4" stroke="rgba(255,255,255,.07)" stroke-width="1" fill="none"/>`;
    m += `</g>`;
    m += `<path d="M-100 -268l7 4l-7 4z" fill="${lo}"/><path d="M100 -268l-7 4l7 4z" fill="${lo}"/>`;
    // rim light (separates from dark cards)
    m += `<path d="M100 -250C104 -205 110 -160 108 -112C106 -62 106 -30 104 -11" stroke="${rgba(sh.light, 0.28)}" stroke-width="1.2" fill="none"/>`;
    m += `<path d="M-100 -279.4H100" stroke="${rgba('#ffffff', 0.22)}" stroke-width=".8"/>`;

    // embossed brand mark
    const tone = limited ? lin(ctx, [[0, '#F4F6FF'], [0.45, '#AEB4C8'], [0.7, '#E9ECF8'], [1, '#8F95AB']], 0, 0, 1, 1) : mix(body, '#ffffff', 0.3);
    const emb = (inner) => `<g transform="translate(0 .9)" opacity=".55">${inner('#000')}</g><g transform="translate(0 -.6)" opacity=".18">${inner('#fff')}</g>${inner(tone)}`;
    m += emb((c) => gemMarkup(-13, -238, 26, c));
    m += emb((c) => wordMarkup(0, -204, 17, c, 10));
    if (ctx.det.text && !o.noText) {
      const tag = limited ? 'LIMITED EDITION' : variant === 'refill' ? 'REFILL · DIAMOND SAND' : 'DIAMOND SAND';
      m += `<text x="0" y="-172" text-anchor="middle" font-family="${FONT}" font-size="7.2" font-weight="600" letter-spacing="2.6" fill="${limited ? '#C9CEE0' : mix(body, '#ffffff', 0.42)}">${tag}</text>`;
    }

    // window revealing glittering sand
    const win = 'M-56 -104A56 56 0 0 1 56 -104V-48Q56 -36 44 -36H-44Q-56 -36 -56 -48Z';
    m += `<path d="${win}" fill="${lin(ctx, [[0, mix(body, '#000', 0.35)], [0.6, mix(body, sh.deep, 0.5)], [1, mix(sh.deep, sh.base, 0.3)]])}"/>`;
    m += `<g clip-path="${clipD(ctx, win)}">`;
    const surf = 'M-62 -141C-38 -150 -12 -134 14 -139C34 -144 50 -142 62 -138V-30H-62Z';
    m += sand(ctx, {
      d: surf, box: [-62, -153, 124, 123], shade: sh, salt: 'win' + (o.salt || ''),
      fill: lin(ctx, [[0, mix(sh.light, sh.glitter, 0.3)], [0.12, sh.light], [0.35, sh.base], [1, sh.deep]]),
      density: 1.3, glints: 2.3, glintTop: true,
    });
    m += `<path d="M-62 -141C-38 -150 -12 -134 14 -139C34 -144 50 -142 62 -138" fill="none" stroke="${rgba(sh.glitter, 0.55)}" stroke-width="1.2"/>`;
    // film curvature: darker sides, inner top shadow
    m += `<rect x="-60" y="-162" width="120" height="130" fill="${lin(ctx, [[0, '#000', 0.42], [0.18, '#000', 0], [0.8, '#000', 0], [1, '#000', 0.5]], 0, 0, 1, 0)}"/>`;
    m += `</g>`;
    m += `<path d="${win}" fill="${lin(ctx, [[0, '#ffffff', 0.24], [0.32, '#ffffff', 0.04], [0.62, '#ffffff', 0], [1, '#ffffff', 0.07]], 0, 0, 1, 1)}"/>`;
    m += `<path d="${win}" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="2.4"/>`;
    m += `<path d="${win}" fill="none" stroke="${rgba('#ffffff', 0.16)}" stroke-width="1" transform="translate(.4 1.2)"/>`;
    m += `<path d="M-47 -108A47 47 0 0 1 -14 -150" stroke="rgba(255,255,255,.42)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    m += `<path d="M-48 -96V-64" stroke="rgba(255,255,255,.18)" stroke-width="1.5" stroke-linecap="round"/>`;
    if (ctx.det.text && o.showShade !== false) {
      m += `<text x="0" y="-16" text-anchor="middle" font-family="${FONT}" font-size="6.4" font-weight="600" letter-spacing="2.4" fill="${limited ? '#AEB4C8' : mix(body, '#ffffff', 0.34)}">${SHADE_EN[sh.id] || ''}</text>`;
    }
    if (limited) m += `<path d="M-100 -279.4H100" stroke="#D8DCEA" stroke-width="1.4" opacity=".7"/>`;
    m += `</g>`;
    ctx.k = prevK;
    return m;
  }

  /* Glass jar with cork. Local: bottom centre (0,0); body w 180, total h ~302. */
  function jar(ctx, o) {
    const sh = o.shade || ctx.shade;
    const s = o.s || 1;
    const salt = 'jar' + (o.salt || '');
    const r = ctx.rng(salt);
    const body = 'M-70 -252C-70 -240 -90 -237 -90 -214V-16Q-90 0 -74 0H74Q90 0 90 -16V-214C90 -237 70 -240 70 -252Z';
    const inner = 'M-64 -249C-64 -238 -84 -233 -84 -212V-22Q-84 -10 -71 -10H71Q84 -10 84 -22V-212C84 -233 64 -238 64 -249Z';
    const level = o.level == null ? -186 : o.level;
    const prevK = ctx.k; ctx.k = s * (prevK || 1);
    let m = `<g transform="translate(${n1(o.x)} ${n1(o.y)}) scale(${n2(s)})">`;
    // glass body tint (back wall)
    m += `<path d="${body}" fill="${lin(ctx, [[0, '#ffffff', 0.16], [0.3, '#ffffff', 0.05], [0.7, '#ffffff', 0.04], [1, '#ffffff', 0.12]], 0, 0, 1, 0)}"/>`;
    m += `<path d="${inner}" fill="${rgba(sh.deep, 0.08)}"/>`;
    // layered sand
    const sandD = `M-84 ${level}A84 12 0 0 0 84 ${level}V0H-84Z`;
    const cyl = (c) => lin(ctx, [[0, mix(c, '#000', 0.35)], [0.22, c], [0.55, mix(c, '#ffffff', 0.06)], [0.85, c], [1, mix(c, '#000', 0.42)]], 0, 0, 1, 0);
    const tones = o.layers === false
      ? [sh.base]
      : [mix(sh.light, sh.base, 0.35), sh.base, mix(sh.light, sh.base, 0.15), mix(sh.base, sh.deep, 0.45), mix(sh.light, sh.base, 0.3), sh.deep];
    const span = -level - 10;
    let under = `<rect x="-90" y="${level - 14}" width="180" height="${-level + 14}" fill="${cyl(tones[0])}"/>`;
    for (let i = 1; i < tones.length; i++) {
      const yy = level + (span * i) / tones.length + (r() - 0.5) * 8;
      const a = 3 + r() * 5, ph = r() * 6, f = 0.025 + r() * 0.03;
      let d = `M-92 ${n1(yy)}`;
      for (let xx = -92; xx <= 92; xx += 8) d += `L${xx} ${n1(yy + Math.sin(xx * f + ph) * a + Math.sin(xx * f * 2.7 + ph) * a * 0.3)}`;
      d += 'V4H-92Z';
      under += `<path d="${d}" fill="${cyl(tones[i])}"/>`;
    }
    m += `<g clip-path="${clipD(ctx, inner)}">`;
    m += sand(ctx, { d: sandD, box: [-90, level - 10, 180, -level + 10], under, shade: sh, salt, density: 1.05, glints: 1.5 });
    // top surface
    const top = `M-84 ${level}A84 12 0 0 1 84 ${level}A84 12 0 0 1 -84 ${level}Z`;
    m += sand(ctx, {
      d: top, box: [-84, level - 12, 168, 24], shade: sh, salt: salt + 't',
      fill: rad(ctx, [[0, sh.glitter], [0.3, sh.light], [1, sh.base]], 0.35, 0.3, 0.9), density: 1.5, glints: 3, glintSize: 0.7,
    });
    // refraction: dark edges where glass bends light
    const sandClip = ctx.id('c');
    ctx.defs.push(`<clipPath id="${sandClip}"><path d="${sandD}"/><path d="${top}"/></clipPath>`);
    m += `<rect clip-path="url(#${sandClip})" x="-90" y="${level - 14}" width="180" height="${-level + 14}" fill="${lin(ctx, [[0, '#0b0418', 0.55], [0.1, '#0b0418', 0.12], [0.24, '#0b0418', 0], [0.78, '#0b0418', 0], [0.92, '#0b0418', 0.2], [1, '#0b0418', 0.6]], 0, 0, 1, 0)}"/>`;
    m += `</g>`;
    // thick glass base: refracted, brighter sand band
    m += `<path d="M-89 -14Q-89 -1 -74 -1H74Q89 -1 89 -14V-10H-89Z" fill="${rgba(sh.light, 0.45)}"/>`;
    m += `<path d="M-84 -10.5H84" stroke="${rgba('#ffffff', 0.55)}" stroke-width="1"/>`;
    m += `<path d="M-86 -4H86" stroke="${rgba(sh.glitter, 0.25)}" stroke-width="2.5"/>`;
    // glass edges and thickness
    m += `<path d="${body}" fill="none" stroke="${rgba('#ffffff', 0.5)}" stroke-width="1.4"/>`;
    m += `<path d="${inner}" fill="none" stroke="${rgba('#ffffff', 0.14)}" stroke-width="1"/>`;
    m += `<path d="${body}" fill="none" stroke="${rgba('#1a0b33', 0.25)}" stroke-width=".8" transform="translate(.8 .8)"/>`;
    // specular streaks (key light top-left)
    m += `<rect x="-80" y="-214" width="9" height="196" rx="4.5" fill="${lin(ctx, [[0, '#ffffff', 0], [0.15, '#ffffff', 0.7], [0.75, '#ffffff', 0.45], [1, '#ffffff', 0]])}"/>`;
    m += `<rect x="-66" y="-206" width="3" height="170" rx="1.5" fill="${lin(ctx, [[0, '#ffffff', 0], [0.3, '#ffffff', 0.4], [1, '#ffffff', 0]])}"/>`;
    m += `<rect x="72" y="-206" width="5" height="180" rx="2.5" fill="${lin(ctx, [[0, '#ffffff', 0], [0.4, '#ffffff', 0.32], [1, '#ffffff', 0]])}"/>`;
    m += `<rect x="-36" y="-214" width="34" height="200" fill="${lin(ctx, [[0, '#ffffff', 0], [0.5, '#ffffff', 0.07], [1, '#ffffff', 0]], 0, 0, 1, 0)}"/>`;
    m += `<path d="M-84 -222C-80 -236 -70 -240 -66 -246" stroke="${rgba('#ffffff', 0.75)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    m += `<path d="M66 -246C72 -240 82 -234 85 -224" stroke="${rgba('#ffffff', 0.35)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    // neck lip
    m += `<rect x="-72" y="-263" width="144" height="11" rx="5.5" fill="${lin(ctx, [[0, '#ffffff', 0.35], [0.2, '#ffffff', 0.1], [0.8, '#ffffff', 0.06], [1, '#ffffff', 0.3]], 0, 0, 1, 0)}" stroke="${rgba('#ffffff', 0.45)}" stroke-width="1"/>`;
    // cork
    const corkD = 'M-64 -258L-68 -296Q-68 -301 -62 -301H62Q68 -301 68 -296L64 -258Z';
    m += `<path d="${corkD}" fill="${lin(ctx, [[0, '#B48A60'], [0.18, '#D8B78C'], [0.5, '#C29A6C'], [0.85, '#8E6A47'], [1, '#6E4F33']], 0, 0, 1, 0)}"/>`;
    let corkDots = '', corkLight = '';
    const cr = ctx.rng(salt + 'cork');
    const corkN = Math.round((ctx.variant === 'thumb' ? 40 : 190) * Math.max(0.3, ctx.k));
    for (let i = 0; i < corkN; i++) {
      const cx = -64 + cr() * 128, cy = -298 + cr() * 38;
      if (cr() < 0.55) corkDots += dotD(cx, cy, 0.35 + Math.pow(cr(), 2) * 1.4); else corkLight += dotD(cx, cy, 0.3 + cr() * 0.6);
    }
    m += `<path d="${corkDots}" fill="#6B4A2E" opacity=".42"/><path d="${corkLight}" fill="#F3E1C2" opacity=".45"/>`;
    m += `<ellipse cx="0" cy="-299" rx="66" ry="8.5" fill="${lin(ctx, [[0, '#E6CCA4'], [1, '#C7A275']], 0, 0, 1, 1)}"/>`;
    m += `<ellipse cx="0" cy="-299" rx="66" ry="8.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>`;
    if (ctx.variant !== 'thumb') m += `<g transform="translate(0 -299) scale(1 .36)">${gemMarkup(-9, -11, 18, '#6E4A2C', 0.6)}</g>`;
    m += `</g>`;
    ctx.k = prevK;
    return m;
  }

  /* ================================================================== *
   *  Compositions per kind  (viewBox 0 0 400 400)
   * ================================================================== */
  const KIND_DRAW = {
    pouch(ctx) {
      const id = ctx.product.id;
      const label = id === 'midnight' ? 'limited' : id === 'refill' ? 'refill' : 'classic';
      const sh = ctx.shade;
      const sc = label === 'refill' ? 1.04 : 1;
      let m = contactShadow(ctx, 186, 350, 138, 15);
      m += pouch(ctx, { x: 182, y: 350, s: sc, shade: sh, label, salt: id });
      m += pile(ctx, { x: 300, y: 362, w: 112, h: 34, shade: sh, salt: id });
      return m;
    },
    set(ctx) {
      // four shades in a gentle arc; outer pouches forward
      const order = [
        { id: 'violet', x: 162, y: 300, s: 0.43 },
        { id: 'lavender', x: 244, y: 300, s: 0.43 },
        { id: 'amethyst', x: 86, y: 326, s: 0.45 },
        { id: 'midnight', x: 318, y: 326, s: 0.45 },
      ];
      let m = contactShadow(ctx, 202, 330, 186, 18, 0.85);
      for (const p of order) {
        m += contactShadow(ctx, p.x + 3, p.y, 108 * p.s, 8, 0.85);
        m += pouch(ctx, { x: p.x, y: p.y, s: p.s, shade: getShade(p.id), label: p.id === 'midnight' ? 'limited' : 'classic', salt: 'set' + p.id, showShade: false, noText: true });
      }
      m += pile(ctx, { x: 202, y: 352, w: 96, h: 26, shade: getShade('amethyst'), salt: 'set' });
      return m;
    },
    jar(ctx) {
      let m = contactShadow(ctx, 202, 352, 112, 13);
      m += jar(ctx, { x: 200, y: 350, s: 1.02, shade: ctx.shade, salt: ctx.product.id });
      return m;
    },
    mini: drawMini,
    tools: drawTools,
    tray: drawTray,
    box: drawBox,
  };

  /* ---------- mini: three jars in a travel case ---------- */
  function drawMini(ctx) {
    const leather = '#2A1742', leatherHi = mix(leather, '#ffffff', 0.16), leatherLo = mix(leather, '#000', 0.5);
    const lining = mix(ctx.shade.deep, '#1a0b2e', 0.3);
    let m = contactShadow(ctx, 200, 344, 170, 18);
    // lid (open, upright behind)
    const lid = 'M58 196V96Q58 64 90 64H310Q342 64 342 96V196Z';
    m += `<path d="${lid}" fill="${lin(ctx, [[0, leatherHi], [0.5, leather], [1, leatherLo]], 0, 0, 1, 0.4)}"/>`;
    const lidIn = 'M70 196V100Q70 76 94 76H306Q330 76 330 100V196Z';
    m += `<path d="${lidIn}" fill="${lin(ctx, [[0, mix(lining, '#ffffff', 0.1)], [1, mix(lining, '#000', 0.35)]])}"/>`;
    m += `<path d="${lidIn}" fill="none" stroke="${rgba('#ffffff', 0.18)}" stroke-dasharray="4 3" stroke-width="1.1" transform="translate(0 0)"/>`;
    m += `<g opacity=".55">${wordMarkup(200, 108, 12, rgba('#ffffff', 0.45), 9)}</g>`;
    // base inner tray (seen from above)
    m += `<path d="M48 214Q48 196 66 196H334Q352 196 352 214V236H48Z" fill="${mix(lining, '#000', 0.45)}"/>`;
    // jars
    const shades = ['violet', 'amethyst', 'lavender'];
    const xs = [124, 200, 276];
    shades.forEach((id, i) => {
      m += jar(ctx, { x: xs[i], y: 262, s: 0.37, shade: getShade(id), salt: 'mini' + id, level: -200 });
    });
    // base front
    const front = 'M44 236H356V300Q356 334 322 334H78Q44 334 44 300Z';
    m += `<path d="${front}" fill="${lin(ctx, [[0, leatherHi], [0.12, mix(leatherHi, leather, 0.4)], [0.6, leather], [1, leatherLo]], 0, 0, 1, 0)}"/>`;
    m += `<path d="${front}" fill="${lin(ctx, [[0, '#ffffff', 0.1], [0.3, '#ffffff', 0], [1, '#000', 0.35]])}"/>`;
    m += `<path d="M54 244H346V298Q346 324 320 324H80Q54 324 54 298Z" fill="none" stroke="${rgba('#E6DCFF', 0.32)}" stroke-dasharray="4 3" stroke-width="1.2"/>`;
    m += `<path d="M44 236H356" stroke="${rgba('#ffffff', 0.28)}" stroke-width="1.4"/>`;
    // zip pull / foil mark
    m += gemMarkup(190, 268, 20, '#D9DDEA', 0.95);
    m += `<path d="M356 252V300Q356 334 322 334" fill="none" stroke="${rgba('#C9A2FF', 0.25)}" stroke-width="1.2"/>`;
    return m;
  }

  /* ---------- tools: flat lay of matte violet tools around a sand mound ---------- */
  function drawTools(ctx) {
    const sh = ctx.shade;
    const T = { hi: '#B39CF0', top: '#957AE0', mid: '#7A5CCB', side: '#5A3FA6', lo: '#43307F' };
    const blur = ctx.id('f');
    ctx.defs.push(`<filter id="${blur}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>`);
    const rimG = lin(ctx, [[0, T.hi], [0.45, T.top], [1, T.side]], 0, 0, 1, 1);
    let shadows = '', m = '';

    const star = (R, rr) => {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? rr : R;
        d += (i ? 'L' : 'M') + n1(Math.cos(a) * q) + ' ' + n1(Math.sin(a) * q);
      }
      return d + 'Z';
    };
    const hex = (R) => { let d = ''; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; d += (i ? 'L' : 'M') + n1(Math.cos(a) * R) + ' ' + n1(Math.sin(a) * R); } return d + 'Z'; };
    const gem = 'M-34 -11L-19 -29H19L34 -11L0 32Z';

    function cutter(d, x, y, rot, filled) {
      const tf = `translate(${x} ${y}) rotate(${rot})`;
      shadows += `<path d="${d}" transform="translate(${x + 7} ${y + 9}) rotate(${rot})" fill="none" stroke="#1d0d3a" stroke-width="10" stroke-linejoin="round" opacity=".5"/>`;
      let g = `<g transform="${tf}">`;
      if (filled) {
        g += sand(ctx, { d, box: [-46, -46, 92, 92], fill: rad(ctx, [[0, sh.light], [0.55, sh.base], [1, sh.deep]], 0.35, 0.3, 0.8), salt: 'cut' + x, density: 1.2, glints: 2.4, glintSize: 0.7 });
        g += `<path d="${d}" fill="none" stroke="${rgba('#12052a', 0.45)}" stroke-width="7" transform="translate(-1.5 -2)" clip-path="${clipD(ctx, d)}"/>`;
      } else {
        g += `<path d="${d}" fill="none" stroke="#120626" stroke-opacity=".22" stroke-width="10" transform="translate(-2.5 -3)" stroke-linejoin="round" clip-path="${clipD(ctx, d)}"/>`;
      }
      g += `<path d="${d}" fill="none" stroke="${T.side}" stroke-width="7.5" stroke-linejoin="round" transform="translate(1.6 2.4)"/>`;
      g += `<path d="${d}" fill="none" stroke="${rimG}" stroke-width="6.5" stroke-linejoin="round"/>`;
      g += `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity=".38" stroke-width=".9" stroke-linejoin="round" transform="translate(-.7 -1)"/>`;
      g += `</g>`;
      return g;
    }

    // sand mound with star imprint
    const r = ctx.rng('mound');
    let blob = '';
    for (let i = 0; i <= 36; i++) {
      const a = (i / 36) * Math.PI * 2, ph = r() * 0;
      const rr = 66 + Math.sin(a * 3 + 1.3) * 5 + Math.sin(a * 5 + 0.4) * 3 + ph;
      blob += (i ? 'L' : 'M') + n1(200 + Math.cos(a) * rr * 1.05) + ' ' + n1(206 + Math.sin(a) * rr * 0.95);
    }
    blob += 'Z';
    shadows += `<path d="${blob}" transform="translate(8 10)" fill="#1d0d3a" opacity=".45"/>`;
    let mound = sand(ctx, {
      d: blob, box: [126, 136, 150, 145], shade: sh, salt: 'mound',
      fill: rad(ctx, [[0, mix(sh.light, sh.glitter, 0.3)], [0.35, sh.base], [0.85, sh.deep], [1, mix(sh.deep, '#000', 0.3)]], 0.36, 0.3, 0.75),
      density: 1.2, glints: 1.8,
    });
    const imprint = star(26, 11.5);
    mound += `<g transform="translate(203 208)"><path d="${imprint}" fill="${rgba(sh.deep, 0.45)}"/>` +
      `<g clip-path="${clipD(ctx, imprint)}"><path d="${imprint}" fill="none" stroke="${rgba('#0d0420', 0.55)}" stroke-width="6" transform="translate(-2 -2.5)"/>` +
      `<path d="${imprint}" fill="none" stroke="${rgba(sh.glitter, 0.6)}" stroke-width="3" transform="translate(2 2.5)"/></g>` +
      `<path d="${imprint}" fill="none" stroke="${rgba(sh.glitter, 0.45)}" stroke-width="1" transform="translate(-.6 -.6)"/></g>`;

    m += cutter(star(40, 18), 108, 98, -8, true);
    m += cutter(hex(34), 202, 84, 0, false);
    m += cutter(gem, 296, 98, 8, false);

    // scoop (left, vertical) with heaped sand
    shadows += `<g transform="translate(83 260) rotate(-6)"><ellipse cx="0" cy="-30" rx="27" ry="33" fill="#1d0d3a" opacity=".5"/><rect x="-8" y="0" width="16" height="78" rx="8" fill="#1d0d3a" opacity=".5"/></g>`;
    m += `<g transform="translate(76 252) rotate(-6)">`;
    m += `<rect x="-7.5" y="0" width="15" height="80" rx="7.5" fill="${lin(ctx, [[0, T.hi], [0.4, T.top], [1, T.side]], 0, 0, 1, 0)}"/>`;
    m += `<rect x="-2" y="70" width="4" height="4" rx="2" fill="${T.lo}" opacity=".8"/>`;
    m += `<ellipse cx="0" cy="-30" rx="27" ry="33" fill="${rimG}"/>`;
    m += `<ellipse cx="0" cy="-30" rx="22" ry="28" fill="${rad(ctx, [[0, T.top], [0.7, T.mid], [1, T.lo]], 0.62, 0.68, 0.75)}"/>`;
    const heap = 'M-17 -34C-14 -50 14 -52 18 -36C21 -22 12 -10 0 -9C-13 -9 -20 -20 -17 -34Z';
    m += sand(ctx, { d: heap, box: [-22, -54, 44, 46], fill: rad(ctx, [[0, sh.light], [0.6, sh.base], [1, sh.deep]], 0.38, 0.3, 0.8), salt: 'heap', density: 1.4, glints: 3, glintSize: 0.6 });
    m += `<ellipse cx="0" cy="-30" rx="26.5" ry="32.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".9"/>`;
    m += `</g>`;

    // knife (right, vertical)
    shadows += `<g transform="translate(330 248) rotate(5)"><path d="M-11 -78Q0 -96 11 -78V20H-11Z" fill="#1d0d3a" opacity=".5"/><rect x="-8" y="20" width="16" height="64" rx="8" fill="#1d0d3a" opacity=".5"/></g>`;
    m += `<g transform="translate(322 240) rotate(5)">`;
    m += `<path d="M-11 -78Q-2 -98 11 -82V22H-11Z" fill="${lin(ctx, [[0, T.hi], [0.5, T.top], [0.52, T.mid], [1, T.side]], 0, 0, 1, 0)}"/>`;
    m += `<path d="M-11 -78Q-2 -98 11 -82" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>`;
    m += `<rect x="-8" y="22" width="16" height="66" rx="8" fill="${lin(ctx, [[0, T.top], [0.4, T.mid], [1, T.lo]], 0, 0, 1, 0)}"/>`;
    m += `<path d="M-11 22H11" stroke="${T.lo}" stroke-width="2"/>`;
    m += `</g>`;

    // roller (bottom, horizontal) with diamond knurl
    const knurl = ctx.id('p');
    ctx.defs.push(`<pattern id="${knurl}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="none" stroke="#2c1a5c" stroke-opacity=".35" stroke-width="1.2"/></pattern>`);
    shadows += `<rect x="128" y="318" width="160" height="32" rx="14" fill="#1d0d3a" opacity=".5"/>`;
    m += `<rect x="114" y="314" width="22" height="16" rx="6" fill="${lin(ctx, [[0, T.hi], [1, T.side]])}"/><rect x="264" y="314" width="22" height="16" rx="6" fill="${lin(ctx, [[0, T.hi], [1, T.side]])}"/>`;
    m += `<rect x="134" y="306" width="132" height="32" rx="12" fill="${lin(ctx, [[0, T.hi], [0.3, T.top], [0.75, T.side], [1, T.lo]])}"/>`;
    m += `<rect x="134" y="306" width="132" height="32" rx="12" fill="url(#${knurl})"/>`;
    m += `<rect x="140" y="310" width="120" height="3" rx="1.5" fill="#fff" opacity=".35"/>`;

    // loose glitter grains
    let grains = '';
    const gr = ctx.rng('grains');
    for (let i = 0; i < 26; i++) grains += dotD(150 + gr() * 120, 280 + gr() * 22, 0.7 + gr() * 1.2);
    m += `<path d="${grains}" fill="${sh.base}"/>`;

    return `<g filter="url(#${blur})">${shadows}</g>` + mound + m;
  }

  /* ---------- tray: oak tray, 3/4 view, raked sand ---------- */
  function drawTray(ctx) {
    const sh = ctx.shade;
    const FL = [84, 150], FR = [316, 150], NR = [370, 284], NL = [30, 284];
    const P = (q, u, v) => {
      const ax = q[0][0] + (q[1][0] - q[0][0]) * u, ay = q[0][1] + (q[1][1] - q[0][1]) * u;
      const bx = q[3][0] + (q[2][0] - q[3][0]) * u, by = q[3][1] + (q[2][1] - q[3][1]) * u;
      return [ax + (bx - ax) * v, ay + (by - ay) * v];
    };
    const outer = [FL, FR, NR, NL];
    const innerQ = [P(outer, 0.05, 0.085), P(outer, 0.95, 0.085), P(outer, 0.955, 0.915), P(outer, 0.045, 0.915)];
    const depth = (v) => 12 + v * 6;
    const sandQ = innerQ.map((p, i) => [p[0], p[1] + depth(i < 2 ? 0 : 1)]);
    const roundPoly = (pts, rr) => {
      let d = '';
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
        const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        const p1 = [p[0] + ((a[0] - p[0]) / la) * rr, p[1] + ((a[1] - p[1]) / la) * rr];
        const p2 = [p[0] + ((b[0] - p[0]) / lb) * rr, p[1] + ((b[1] - p[1]) / lb) * rr];
        d += `${i ? 'L' : 'M'}${n1(p1[0])} ${n1(p1[1])}Q${n1(p[0])} ${n1(p[1])} ${n1(p2[0])} ${n1(p2[1])}`;
      }
      return d + 'Z';
    };
    const TH = 24;
    let m = contactShadow(ctx, 200, 304, 196, 22);
    // front face
    const frontD = `M${NL[0] + 2} ${NL[1] - 4}L${NR[0] - 2} ${NR[1] - 4}L${NR[0] - 6} ${NR[1] + TH - 6}Q${NR[0] - 10} ${NR[1] + TH} ${NR[0] - 22} ${NR[1] + TH}H${NL[0] + 22}Q${NL[0] + 10} ${NL[1] + TH} ${NL[0] + 6} ${NL[1] + TH - 6}Z`;
    m += `<path d="${frontD}" fill="${lin(ctx, [[0, '#A97C52'], [0.5, '#9A6F48'], [1, '#6E4B2E']], 0, 0, 1, 0)}"/>`;
    m += `<path d="${frontD}" fill="${lin(ctx, [[0, '#000', 0], [1, '#000', 0.28]])}"/>`;
    let grainF = '';
    for (let i = 0; i < 6; i++) { const yy = NL[1] + 3 + i * 3.4; grainF += `M${NL[0] + 10} ${n1(yy)}C120 ${n1(yy + 2 + (i % 2) * 2)} 260 ${n1(yy - 2)} ${NR[0] - 10} ${n1(yy + 1)}`; }
    m += `<path d="${grainF}" fill="none" stroke="#5a3b22" stroke-opacity=".28" stroke-width=".8"/>`;
    // top rim
    const outerD = roundPoly(outer, 14);
    const innerD = roundPoly(innerQ, 9);
    m += `<path d="${outerD}" fill="${lin(ctx, [[0, '#E2C49B'], [0.5, '#D2AE80'], [1, '#B68C60']], 0, 0, 1, 1)}"/>`;
    let grainT = '';
    const gr = ctx.rng('wood');
    for (let i = 0; i < 18; i++) {
      const v = gr();
      const a = P(outer, 0, v), b = P(outer, 1, v);
      grainT += `M${n1(a[0])} ${n1(a[1])}C${n1(a[0] + 80)} ${n1(a[1] + (gr() - 0.5) * 6)} ${n1(b[0] - 80)} ${n1(b[1] + (gr() - 0.5) * 6)} ${n1(b[0])} ${n1(b[1])}`;
    }
    m += `<g clip-path="${clipD(ctx, outerD)}"><path d="${grainT}" fill="none" stroke="#8a6440" stroke-opacity=".22" stroke-width=".9"/></g>`;
    m += `<path d="${outerD}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`;
    // inner walls
    m += `<path d="${innerD}" fill="#B48A5F"/>`;
    m += `<g clip-path="${clipD(ctx, innerD)}">`;
    m += `<path d="M${innerQ[0][0]} ${innerQ[0][1]}L${innerQ[3][0]} ${innerQ[3][1]}L${sandQ[3][0]} ${sandQ[3][1]}L${sandQ[0][0]} ${sandQ[0][1]}Z" fill="#8C6440"/>`;
    m += `<path d="M${innerQ[1][0]} ${innerQ[1][1]}L${innerQ[2][0]} ${innerQ[2][1]}L${sandQ[2][0]} ${sandQ[2][1]}L${sandQ[1][0]} ${sandQ[1][1]}Z" fill="#C9A276"/>`;
    // sand bed
    const sandD = roundPoly(sandQ, 9);
    const [bx0, by0] = [Math.min(sandQ[3][0], sandQ[0][0]), sandQ[0][1]];
    const bw = Math.max(sandQ[2][0], sandQ[1][0]) - bx0, bh = sandQ[2][1] - by0;
    const sP = (u, v) => P(sandQ, u / 40, v / 30);
    // rake grooves in plane coords (40×30 cm), circle around a stone
    const C = [26, 12.5], RR = 8.6;
    let darkL = '', lightL = '';
    const line = (pts) => {
      if (pts.length < 2) return;
      let d1 = '', d2 = '';
      pts.forEach((p, i) => {
        const [x, y] = sP(p[0], p[1]);
        const w = 0.9 + (p[1] / 30) * 0.9;
        d1 += `${i ? 'L' : 'M'}${n1(x)} ${n1(y - w * 0.4)}`;
        d2 += `${i ? 'L' : 'M'}${n1(x)} ${n1(y + w * 0.9)}`;
      });
      darkL += d1; lightL += d2;
    };
    for (let v = 2.2; v < 29.5; v += 2.25) {
      let seg = [];
      for (let u = -0.5; u <= 40.5; u += 1) {
        const vv = v + Math.sin(u * 0.22 + v * 0.4) * 0.35;
        if (Math.hypot(u - C[0], (vv - C[1]) * 1.0) < RR + 0.6) { line(seg); seg = []; continue; }
        seg.push([u, vv]);
      }
      line(seg);
    }
    for (let rr = 3.4; rr <= RR; rr += 1.7) {
      const pts = [];
      for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push([C[0] + Math.cos(a) * rr, C[1] + Math.sin(a) * rr]); }
      line(pts);
    }
    const over = `<path d="${darkL}" fill="none" stroke="${rgba(mix(sh.deep, '#000', 0.4), 0.55)}" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<path d="${lightL}" fill="none" stroke="${rgba(sh.glitter, 0.42)}" stroke-width="1.1" stroke-linejoin="round"/>`;
    m += sand(ctx, {
      d: sandD, box: [bx0, by0 - 4, bw, bh + 8], shade: sh, salt: 'tray',
      fill: lin(ctx, [[0, mix(sh.light, sh.base, 0.45)], [0.45, sh.base], [1, mix(sh.base, sh.deep, 0.55)]], 0, 0, 0.35, 1),
      over, density: 0.75, glints: 1.1,
    });
    // inner shadow on the sand along far & left walls
    m += `<path d="${sandD}" fill="none" stroke="${rgba('#140626', 0.45)}" stroke-width="8" transform="translate(3 4)" clip-path="${clipD(ctx, sandD)}"/>`;
    // stone
    const [sx, sy] = sP(C[0], C[1]);
    m += `<ellipse cx="${n1(sx + 6)}" cy="${n1(sy + 6)}" rx="22" ry="9" fill="${rgba('#12051f', 0.5)}"/>`;
    m += `<path d="M${n1(sx - 21)} ${n1(sy + 2)}C${n1(sx - 22)} ${n1(sy - 12)} ${n1(sx + 18)} ${n1(sy - 15)} ${n1(sx + 21)} ${n1(sy - 1)}C${n1(sx + 23)} ${n1(sy + 8)} ${n1(sx - 18)} ${n1(sy + 11)} ${n1(sx - 21)} ${n1(sy + 2)}Z" fill="${rad(ctx, [[0, '#6a6175'], [0.5, '#3b3346'], [1, '#1f1a27']], 0.35, 0.25, 0.8)}"/>`;
    m += `<ellipse cx="${n1(sx - 7)}" cy="${n1(sy - 6)}" rx="7" ry="2.4" fill="#fff" opacity=".28"/>`;
    m += `</g>`;
    m += `<path d="${innerD}" fill="none" stroke="#6b4a2c" stroke-opacity=".5" stroke-width="1"/>`;
    m += `<path d="M${n1(innerQ[3][0] + 9)} ${n1(innerQ[3][1] + 0.6)}H${n1(innerQ[2][0] - 9)}" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>`;
    return m;
  }

  /* ---------- box: luxury gift box, lid propped behind, contents peeking ---------- */
  function drawBox(ctx) {
    const sh = ctx.shade;
    const box = '#2B173F', boxHi = mix(box, '#ffffff', 0.15), boxLo = mix(box, '#000', 0.42);
    // simple 3/4 projection: X right, Y up, Z back
    const O = [62, 326], W = 186, D = 108, H = 108;
    const P = (X, Y, Z) => [O[0] + X + Z * 0.72, O[1] + X * 0.12 - Y - Z * 0.33];
    const poly = (...pts) => 'M' + pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L') + 'Z';
    const A = P(0, H, 0), B = P(W, H, 0), E = P(W, H, D), G = P(0, H, D);
    const Ab = P(0, 0, 0), Bb = P(W, 0, 0), Eb = P(W, 0, D);
    let m = contactShadow(ctx, 214, 336, 184, 24);

    // lid leaning back on the rear rim
    const th = 0.36, LD = 114, LT = 22;
    const cs = Math.cos(th), sn = Math.sin(th);
    const F = (X, u, t = 0) => P(X, H + 4 + u * cs + t * sn, D + 4 + u * sn - t * cs);
    const l0 = F(-4, 0), l1 = F(W + 4, 0), l2 = F(W + 4, LD), l3 = F(-4, LD);
    m += `<path d="${poly(l2, F(W + 4, LD, -LT), F(-4, LD, -LT), l3)}" fill="${boxHi}"/>`;
    m += `<path d="${poly(l1, F(W + 4, 0, -LT), F(W + 4, LD, -LT), l2)}" fill="${boxLo}"/>`;
    m += `<path d="${poly(l0, l1, l2, l3)}" fill="${lin(ctx, [[0, mix(boxHi, box, 0.3)], [0.55, box], [1, mix(box, boxLo, 0.6)]], 0, 0, 1, 0.3)}"/>`;
    m += `<path d="${poly(l3, l2)}" stroke="#fff" stroke-opacity=".28" stroke-width="1.2" fill="none"/>`;
    // satin ribbon on the lid
    const ribV = lin(ctx, [[0, mix(sh.light, '#000', 0.18)], [0.4, sh.light], [0.52, mix(sh.light, '#ffffff', 0.62)], [0.66, sh.light], [1, mix(sh.light, '#000', 0.28)]], 0, 0, 1, 0);
    const ribH = lin(ctx, [[0, mix(sh.light, '#000', 0.22)], [0.45, mix(sh.light, '#ffffff', 0.5)], [1, mix(sh.light, '#000', 0.2)]]);
    const cx0 = W / 2 + 6;
    m += `<path d="${poly(F(cx0 - 10, 0), F(cx0 + 10, 0), F(cx0 + 10, LD), F(cx0 - 10, LD))}" fill="${ribV}"/>`;
    m += `<path d="${poly(F(-4, LD * 0.5 - 10), F(W + 4, LD * 0.5 - 10), F(W + 4, LD * 0.5 + 10), F(-4, LD * 0.5 + 10))}" fill="${ribH}"/>`;
    m += `<path d="${poly(F(W + 4, LD * 0.5 - 10), F(W + 4, LD * 0.5 - 10, -LT), F(W + 4, LD * 0.5 + 10, -LT), F(W + 4, LD * 0.5 + 10))}" fill="${mix(sh.light, '#000', 0.45)}"/>`;
    // bow
    const [bx, by] = F(cx0, LD * 0.5);
    const loop = lin(ctx, [[0, mix(sh.light, '#ffffff', 0.6)], [0.5, sh.light], [1, mix(sh.light, sh.deep, 0.55)]], 0, 0, 1, 1);
    const tail = lin(ctx, [[0, sh.light], [1, mix(sh.light, sh.deep, 0.5)]]);
    m += `<path d="M${n1(bx - 3)} ${n1(by + 3)}L${n1(bx - 22)} ${n1(by + 42)}L${n1(bx - 12)} ${n1(by + 37)}L${n1(bx - 8)} ${n1(by + 46)}L${n1(bx + 2)} ${n1(by + 4)}Z" fill="${tail}"/>`;
    m += `<path d="M${n1(bx + 3)} ${n1(by + 3)}L${n1(bx + 24)} ${n1(by + 38)}L${n1(bx + 14)} ${n1(by + 35)}L${n1(bx + 12)} ${n1(by + 45)}L${n1(bx - 1)} ${n1(by + 4)}Z" fill="${tail}"/>`;
    m += `<path d="M${n1(bx)} ${n1(by)}C${n1(bx - 16)} ${n1(by - 32)} ${n1(bx - 48)} ${n1(by - 22)} ${n1(bx - 42)} ${n1(by - 4)}C${n1(bx - 38)} ${n1(by + 9)} ${n1(bx - 14)} ${n1(by + 6)} ${n1(bx)} ${n1(by)}Z" fill="${loop}"/>`;
    m += `<path d="M${n1(bx)} ${n1(by)}C${n1(bx + 16)} ${n1(by - 32)} ${n1(bx + 48)} ${n1(by - 22)} ${n1(bx + 44)} ${n1(by - 4)}C${n1(bx + 40)} ${n1(by + 9)} ${n1(bx + 14)} ${n1(by + 6)} ${n1(bx)} ${n1(by)}Z" fill="${loop}"/>`;
    m += `<path d="M${n1(bx - 36)} ${n1(by - 10)}C${n1(bx - 30)} ${n1(by - 21)} ${n1(bx - 18)} ${n1(by - 21)} ${n1(bx - 9)} ${n1(by - 9)}" stroke="#fff" stroke-opacity=".55" fill="none" stroke-width="1.4" stroke-linecap="round"/>`;
    m += `<ellipse cx="${n1(bx)}" cy="${n1(by)}" rx="8.5" ry="7.5" fill="${lin(ctx, [[0, mix(sh.light, '#ffffff', 0.45)], [1, mix(sh.light, sh.deep, 0.35)]], 0, 0, 0.6, 1)}"/>`;

    // opening + inner walls
    m += `<path d="${poly(A, B, E, G)}" fill="${mix(box, '#000', 0.6)}"/>`;
    m += `<g clip-path="${clipD(ctx, poly(A, B, E, G))}">`;
    m += `<path d="${poly(G, E, P(W, H - 60, D), P(0, H - 60, D))}" fill="${lin(ctx, [[0, mix(box, '#ffffff', 0.1)], [1, mix(box, '#000', 0.3)]])}"/>`;
    m += `<path d="${poly(A, G, P(0, H - 60, D), P(0, H - 60, 0))}" fill="${mix(box, '#000', 0.2)}"/>`;
    m += `</g>`;
    // greeting card, tissue, scoop, pouch
    m += `<g transform="translate(${n1(G[0] - 14)} ${n1(G[1] + 2)}) rotate(-9)"><rect x="-24" y="-38" width="50" height="64" rx="2" fill="#FBF8F2"/>` +
      `<rect x="-24" y="-38" width="50" height="64" rx="2" fill="${lin(ctx, [[0, '#fff', 0], [1, '#3a2a10', 0.14]], 0, 0, 1, 1)}"/>` +
      gemMarkup(-5, -26, 11, '#B08D57', 0.95) + `<g opacity=".85">${wordMarkup(1, -9, 5.6, '#9B7B49', 11)}</g></g>`;
    const tissue = mix(sh.light, '#ffffff', 0.62), tissue2 = mix(sh.light, '#ffffff', 0.3);
    const t1 = P(8, H, 6), t2 = P(W - 6, H, 4);
    m += `<path d="M${n1(t1[0])} ${n1(t1[1])}L${n1(A[0] + 34)} ${n1(A[1] - 46)}L${n1(A[0] + 70)} ${n1(A[1] - 6)}L${n1(A[0] + 128)} ${n1(A[1] - 52)}L${n1(A[0] + 150)} ${n1(A[1] + 4)}L${n1(B[0] + 40)} ${n1(B[1] - 64)}L${n1(t2[0])} ${n1(t2[1])}Z" fill="${lin(ctx, [[0, tissue], [1, tissue2]], 0, 0, 0.5, 1)}" opacity=".96"/>`;
    m += `<path d="M${n1(A[0] + 34)} ${n1(A[1] - 46)}L${n1(A[0] + 48)} ${n1(A[1] + 8)}M${n1(A[0] + 128)} ${n1(A[1] - 52)}L${n1(A[0] + 120)} ${n1(A[1] + 12)}M${n1(B[0] + 40)} ${n1(B[1] - 64)}L${n1(B[0] + 8)} ${n1(B[1] - 4)}" stroke="${rgba(sh.deep, 0.16)}" stroke-width="1" fill="none"/>`;
    m += `<g transform="translate(${n1(E[0] - 40)} ${n1(E[1] + 8)}) rotate(14)">` +
      `<rect x="-6.5" y="-20" width="13" height="80" rx="6.5" fill="${lin(ctx, [[0, '#B39CF0'], [0.4, '#957AE0'], [1, '#5A3FA6']], 0, 0, 1, 0)}"/>` +
      `<ellipse cx="0" cy="-36" rx="19" ry="23" fill="${lin(ctx, [[0, '#B39CF0'], [1, '#5A3FA6']], 0, 0, 1, 1)}"/>` +
      `<ellipse cx="0" cy="-36" rx="15" ry="19" fill="${rad(ctx, [[0, '#957AE0'], [1, '#43307F']], 0.6, 0.66, 0.75)}"/>` +
      sand(ctx, { d: 'M-12 -40C-10 -52 10 -54 12 -42C14 -30 8 -22 0 -22C-9 -22 -14 -30 -12 -40Z', box: [-15, -55, 30, 34], fill: rad(ctx, [[0, sh.light], [0.6, sh.base], [1, sh.deep]], 0.38, 0.3, 0.8), salt: 'boxscoop', density: 1.4, glints: 3, glintSize: 0.55 }) +
      `</g>`;
    m += pouch(ctx, { x: 212, y: 300, s: 0.6, shade: sh, label: 'classic', salt: 'box', showShade: false, noText: true });

    // front + right faces
    m += `<path d="${poly(A, B, Bb, Ab)}" fill="${lin(ctx, [[0, boxHi], [0.3, mix(boxHi, box, 0.55)], [1, box]], 0, 0, 1, 0)}"/>`;
    m += `<path d="${poly(A, B, Bb, Ab)}" fill="${lin(ctx, [[0, '#ffffff', 0.05], [1, '#000', 0.32]])}"/>`;
    m += `<path d="${poly(B, E, Eb, Bb)}" fill="${lin(ctx, [[0, boxLo], [1, mix(boxLo, '#000', 0.35)]], 0, 0, 1, 0)}"/>`;
    // ribbon wrapping the base
    const rx = W * 0.5 + 6;
    m += `<path d="${poly(P(rx - 10, H, 0), P(rx + 10, H, 0), P(rx + 10, 0, 0), P(rx - 10, 0, 0))}" fill="${ribV}"/>`;
    m += `<path d="${poly(P(W, H * 0.5 + 10, 0), P(W, H * 0.5 + 10, D), P(W, H * 0.5 - 10, D), P(W, H * 0.5 - 10, 0))}" fill="${lin(ctx, [[0, mix(sh.light, '#000', 0.4)], [1, mix(sh.light, '#000', 0.55)]], 0, 0, 1, 0)}"/>`;
    m += `<path d="${poly(P(rx - 10, H, 0), P(rx - 10, 0, 0))}" stroke="#000" stroke-opacity=".18" fill="none"/>`;
    // foil mark
    const fm = P(W * 0.25, H * 0.55, 0);
    m += `<g transform="translate(${n1(fm[0])} ${n1(fm[1])}) skewY(6.8)">${gemMarkup(-10, -12, 20, '#E1E4F0', 0.92)}</g>`;
    const fw = P(W * 0.77, H * 0.5, 0);
    m += `<g transform="translate(${n1(fw[0])} ${n1(fw[1])}) skewY(6.8)">${wordMarkup(0, -5.5, 11, '#E1E4F0', 10, ' opacity=".92"')}</g>`;
    // edges / rim light
    m += `<path d="M${n1(A[0])} ${n1(A[1])}L${n1(B[0])} ${n1(B[1])}L${n1(E[0])} ${n1(E[1])}" stroke="#fff" stroke-opacity=".38" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`;
    m += `<path d="M${n1(B[0])} ${n1(B[1])}V${n1(Bb[1])}" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>`;
    m += `<path d="M${n1(E[0])} ${n1(E[1])}V${n1(Eb[1])}" stroke="${rgba(sh.light, 0.35)}" stroke-width="1"/>`;
    return m;
  }

  /* ================================================================== *
   *  Public: product art
   * ================================================================== */
  function renderSVG(product, shade, variant) {
    const ctx = makeCtx(product, shade, variant);
    const draw = KIND_DRAW[product.kind] || KIND_DRAW.pouch;
    const body = draw(ctx);
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><defs>${ctx.defs.join('')}</defs>${body}</svg>`;
  }

  function pickShade(product, shadeId) {
    if (shadeId) return getShade(shadeId);
    if (product.defaultShade) return getShade(product.defaultShade);
    if (product.id === 'midnight') return getShade('midnight');
    return getShade('amethyst');
  }

  function product(productOrId, opts = {}) {
    ensureStyle();
    const p = resolveProduct(productOrId);
    const variant = DETAIL[opts.variant] ? opts.variant : 'card';
    const el = document.createElement('div');
    el.className = `art art--${variant} art--${p.kind}`;
    el.dataset.kind = p.kind;
    if (opts.alt) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', opts.alt); } else el.setAttribute('aria-hidden', 'true');
    const paint = (shadeId) => {
      const shade = pickShade(p, shadeId);
      el.dataset.shade = shade.id;
      el.innerHTML = renderSVG(p, shade, variant);
    };
    paint(opts.shade);
    el.setShade = (id) => { if (id !== el.dataset.shade) paint(id); return el; };
    return el;
  }

  /* ================================================================== *
   *  Public: swatch
   * ================================================================== */
  function swatch(shadeId) {
    const s = getShade(shadeId);
    const g = s.glitter.replace('#', '%23');
    const stars = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
      `<path d="M13 9.5l.5 2.5 2.5.5-2.5.5-.5 2.5-.5-2.5-2.5-.5 2.5-.5z" fill="${g}"/>` +
      `<path d="M27 22l.35 1.7 1.7.35-1.7.35L27 26.1l-.35-1.7-1.7-.35 1.7-.35z" fill="${g}" opacity=".85"/>` +
      '<circle cx="22" cy="12" r=".7" fill="%23fff"/><circle cx="17" cy="27" r=".6" fill="%23fff" opacity=".8"/>' +
      '<circle cx="30" cy="15" r=".5" fill="%23fff" opacity=".7"/><circle cx="9" cy="21" r=".55" fill="%23fff" opacity=".75"/>' +
      '<circle cx="23" cy="32" r=".5" fill="%23fff" opacity=".6"/><circle cx="32" cy="27" r=".45" fill="%23fff" opacity=".55"/></svg>';
    return [
      `url("data:image/svg+xml,${stars.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E')}")`,
      `radial-gradient(circle at 32% 26%, ${rgba('#ffffff', 0.5)}, ${rgba('#ffffff', 0)} 34%)`,
      `conic-gradient(from 210deg at 50% 50%, ${rgba(s.light, 0)}, ${rgba(s.light, 0.38)} 12%, ${rgba(s.light, 0)} 24%, ${rgba(s.glitter, 0.22)} 42%, ${rgba(s.light, 0)} 55%, ${rgba(s.light, 0.3)} 74%, ${rgba(s.light, 0)} 88%)`,
      `radial-gradient(circle at 36% 30%, ${s.light} 0%, ${s.base} 46%, ${s.deep} 100%)`,
    ].join(', ');
  }

  /* ================================================================== *
   *  Public: logo
   * ================================================================== */
  function logo(opts = {}) {
    const size = opts.size || 28;
    const variant = opts.variant || 'full';
    const title = opts.title == null ? 'LUMA' : opts.title;
    const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
    const gem = GEM.map(([pts, a]) => `<polygon points="${pts}" fill="currentColor" fill-opacity="${a}"/>`).join('');
    const spark = '<path d="M23.2 .6l.45 1.75 1.75.45-1.75.45-.45 1.75-.45-1.75-1.75-.45 1.75-.45z" fill="currentColor"/>';
    if (variant === 'mark') {
      return `<svg ${a11y} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 24" width="${n1(size * 26 / 24)}" height="${size}" focusable="false">${gem}${spark}</svg>`;
    }
    const word = `<path d="${wordD(0, 0, 1)}" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="miter" stroke-miterlimit="2.2"/>`;
    if (variant === 'word') {
      return `<svg ${a11y} xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 390 112" width="${n1(size * 390 / 112)}" height="${size}" focusable="false">${word}</svg>`;
    }
    // full: emblem + wordmark. viewBox height 24; wordmark cap height 11.5
    const s = 11.5 / 100;
    const vbW = 33 + WORD_W * s + 1.2;
    return `<svg ${a11y} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(vbW)} 24" width="${n1(size * vbW / 24)}" height="${size}" focusable="false" style="overflow:visible">` +
      `${gem}${spark}<g transform="translate(33 6.6) scale(${s})">${word}</g></svg>`;
  }

  /* ================================================================== *
   *  Sand stage: full-bleed canvas macro of glitter sand
   * ================================================================== */
  function hh(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hh(xi, yi, s), b = hh(xi + 1, yi, s), c = hh(xi, yi + 1, s), d = hh(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; };

  // Luminance field (Uint8): studio light pool × dune shading × grain + baked glitter specks.
  function buildField(w, h, dpr) {
    const lum = new Uint8Array(w * h);
    const persp = (y) => 0.38 + 0.62 * (y / h);
    // plane v coordinate per row (integrated foreshortening)
    const vRow = new Float32Array(h);
    let acc = 0;
    for (let y = 0; y < h; y++) { acc += 1 / persp(y); vRow[y] = acc; }
    // coarse dune heightfield → shading
    const cs = Math.max(4, Math.round(5 * dpr));
    const cw = Math.ceil(w / cs) + 2, ch = Math.ceil(h / cs) + 2;
    const H = new Float32Array(cw * ch);
    const unit = 210 * dpr;
    for (let j = 0; j < ch; j++) {
      const Y = Math.min(h - 1, j * cs), p = persp(Y), vv = vRow[Y] / unit;
      for (let i = 0; i < cw; i++) {
        const uu = ((i * cs - w / 2) / p) / unit;
        H[j * cw + i] = vnoise(uu, vv, 11) * 0.62 + vnoise(uu * 2.3, vv * 2.3, 12) * 0.28 + vnoise(uu * 5.1, vv * 5.1, 13) * 0.1;
      }
    }
    const S = new Float32Array(cw * ch);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const l = H[j * cw + Math.max(0, i - 1)], r = H[j * cw + Math.min(cw - 1, i + 1)];
      const t = H[Math.max(0, j - 1) * cw + i], b = H[Math.min(ch - 1, j + 1) * cw + i];
      S[j * cw + i] = clamp(0.5 + ((l - r) * 0.55 + (t - b) * 0.85) * 2.4, 0, 1);
    }
    const c1 = 1.05 * dpr, c2 = 3.2 * dpr;
    for (let y = 0; y < h; y++) {
      const ny = y / h, p = persp(y), vv = vRow[y];
      const gy = y / cs, j0 = Math.floor(gy), fy = gy - j0;
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        // studio light: soft pool + top falloff + vignette
        const dx = (nx - 0.42) * 1.1, dy = ny - 0.58;
        let light = 0.16 + 0.9 * Math.exp(-(dx * dx) / 0.3 - (dy * dy) / 0.14);
        light *= 0.5 + 0.5 * Math.min(1, 0.25 + ny * 1.3);
        const ex = Math.min(nx, 1 - nx), ey = Math.min(ny, 1 - ny);
        light *= Math.min(1, 0.55 + Math.min(ex * 1.4, ey) * 2.6);
        // dunes
        const gx = x / cs, i0 = Math.floor(gx), fx = gx - i0;
        const k = j0 * cw + i0;
        const s0 = S[k] + (S[k + 1] - S[k]) * fx, s1 = S[k + cw] + (S[k + cw + 1] - S[k + cw]) * fx;
        const sh = s0 + (s1 - s0) * fy;
        // grain in plane coords (finer toward the horizon)
        const uu = (x - w / 2) / p;
        const g = hh(Math.floor(uu / c1), Math.floor(vv / c1), 3) * 0.4 + vnoise(uu / c2, vv / c2, 5) * 0.6;
        const val = light * (0.5 + 0.7 * sh) * (0.5 + 0.85 * g);
        lum[row + x] = (1 - Math.exp(-val * 1.6)) * 208;
      }
    }
    // baked glitter specks, brighter where light falls
    const rnd = rngFrom(0x5a17 + w * 31 + h);
    const count = Math.round(((w * h) / (70 * dpr * dpr)) * Math.pow(dpr, 1.5));
    for (let i = 0; i < count; i++) {
      const x = (rnd() * w) | 0, y = (rnd() * h) | 0;
      const nx = x / w, ny = y / h;
      const dx = (nx - 0.42) * 1.1, dy = ny - 0.58;
      const l = Math.exp(-(dx * dx) / 0.42 - (dy * dy) / 0.2);
      if (rnd() > 0.12 + l) continue;
      const v = Math.min(255, 150 + rnd() * 40 + l * 80);
      const idx = y * w + x;
      if (v > lum[idx]) lum[idx] = v;
      if (rnd() < 0.12 * dpr && x + 1 < w && y + 1 < h) {
        const v2 = v * 0.82;
        if (v2 > lum[idx + 1]) lum[idx + 1] = v2;
        if (v2 > lum[idx + w]) lum[idx + w] = v2;
      }
    }
    return lum;
  }

  function makeLUT(sh) {
    // keep bright shades (lavender) in the same "dark studio" key as the others
    const [lr, lg, lb] = hexRgb(sh.base);
    const Y = (0.2126 * lr + 0.7152 * lg + 0.0722 * lb) / 255;
    const k = clamp((Y - 0.3) * 1.5, 0, 0.42);
    const dk = (c) => mix(c, mix(sh.deep, '#000000', 0.5), k);
    const stops = [
      [0, '#030106'], [34, mix(sh.deep, '#000000', 0.72)], [80, dk(mix(sh.deep, '#000000', 0.3))],
      [122, dk(mix(sh.deep, sh.base, 0.45))], [158, dk(sh.base)], [190, dk(mix(sh.base, sh.light, 0.7))],
      [214, mix(sh.light, sh.glitter, 0.55)], [255, '#ffffff'],
    ];
    const lut = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let k = 0;
      while (k < stops.length - 2 && i > stops[k + 1][0]) k++;
      const [a, ca] = stops[k], [b, cb] = stops[k + 1];
      const t = clamp((i - a) / (b - a), 0, 1);
      const A = hexRgb(ca), B = hexRgb(cb);
      const r = A[0] + (B[0] - A[0]) * t, g = A[1] + (B[1] - A[1]) * t, bl = A[2] + (B[2] - A[2]) * t;
      lut[i] = (255 << 24) | ((bl & 255) << 16) | ((g & 255) << 8) | (r & 255);
    }
    return lut;
  }

  function colorize(lum, w, h, sh) {
    const c = mkCanvas(w, h);
    const cx = c.getContext('2d');
    const img = cx.createImageData(w, h);
    const out = new Uint32Array(img.data.buffer);
    const lut = makeLUT(sh);
    for (let i = 0, n = lum.length; i < n; i++) out[i] = lut[lum[i]];
    cx.putImageData(img, 0, 0);
    // shallow depth of field: blur the far (top) part
    let src = c, sw = w, shh = h;
    for (let k = 0; k < 3; k++) {
      const nc = mkCanvas(Math.max(1, sw >> 1), Math.max(1, shh >> 1));
      const nx = nc.getContext('2d');
      nx.imageSmoothingEnabled = true;
      nx.drawImage(src, 0, 0, nc.width, nc.height);
      src = nc; sw = nc.width; shh = nc.height;
    }
    const blur = mkCanvas(w, h);
    const bx = blur.getContext('2d');
    bx.imageSmoothingEnabled = true;
    bx.imageSmoothingQuality = 'high';
    bx.drawImage(src, 0, 0, w, h);
    bx.globalCompositeOperation = 'destination-in';
    const gr = bx.createLinearGradient(0, 0, 0, h * 0.42);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(0.55, 'rgba(0,0,0,.6)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    bx.fillStyle = gr;
    bx.fillRect(0, 0, w, h);
    cx.drawImage(blur, 0, 0);
    return c;
  }

  function glintSprite(color, size = 64) {
    const c = mkCanvas(size, size), x = c.getContext('2d'), m = size / 2;
    const [r, g, b] = hexRgb(color);
    let gr = x.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.07, `rgba(${r},${g},${b},.95)`);
    gr.addColorStop(0.22, `rgba(${r},${g},${b},.25)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, size, size);
    // cross flare
    const ray = (w, len, a) => {
      x.save(); x.translate(m, m); x.rotate(a);
      const lg = x.createLinearGradient(-len, 0, len, 0);
      lg.addColorStop(0, `rgba(${r},${g},${b},0)`);
      lg.addColorStop(0.5, 'rgba(255,255,255,.95)');
      lg.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = lg;
      x.beginPath(); x.moveTo(-len, 0); x.lineTo(0, -w); x.lineTo(len, 0); x.lineTo(0, w); x.closePath(); x.fill();
      x.restore();
    };
    ray(size * 0.03, m, 0);
    ray(size * 0.03, m, Math.PI / 2);
    ray(size * 0.016, m * 0.45, Math.PI / 4);
    ray(size * 0.016, m * 0.45, -Math.PI / 4);
    return c;
  }
  function bokehSprite(color, size = 64) {
    const c = mkCanvas(size, size), x = c.getContext('2d'), m = size / 2;
    const [r, g, b] = hexRgb(color);
    const gr = x.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, `rgba(${r},${g},${b},.28)`);
    gr.addColorStop(0.72, `rgba(${r},${g},${b},.36)`);
    gr.addColorStop(0.86, `rgba(${r},${g},${b},.5)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.beginPath(); x.arc(m, m, m, 0, Math.PI * 2); x.fill();
    return c;
  }
  function sheenSprite(color, size = 256) {
    const c = mkCanvas(size, size), x = c.getContext('2d'), m = size / 2;
    const [r, g, b] = hexRgb(color);
    const gr = x.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, `rgba(${r},${g},${b},.55)`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b},.18)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, size, size);
    return c;
  }

  function sandStage(container, opts = {}) {
    if (!container) throw new Error('sandStage: container required');
    const reduced = reducedMotion();
    const interactive = opts.interactive !== false;
    let shade = getShade(opts.shade || 'amethyst');
    const MAX_DPR = 2, MAX_PIX = 2.4e6, HEAL = 9000;

    const canvas = document.createElement('canvas');
    canvas.className = 'luma-sand-stage';
    canvas.setAttribute('aria-hidden', 'true');
    const stageBg = (s) => `radial-gradient(70% 55% at 56% 62%, ${mix(s.base, s.deep, 0.35)}, ${mix(s.deep, '#000', 0.55)} 60%, #050208)`;
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
      opacity: opts.fadeIn === false ? '1' : '0', transition: reduced || opts.fadeIn === false ? 'none' : 'opacity 1s ease', pointerEvents: 'none',
    });
    const prevStyle = { position: container.style.position, isolation: container.style.isolation, touchAction: container.style.touchAction, background: container.style.background };
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.style.isolation = 'isolate';
    if (!container.style.background) container.style.background = stageBg(shade);
    if (interactive) container.style.touchAction = 'pan-y pinch-zoom';
    container.prepend(canvas);
    const g = canvas.getContext('2d', { alpha: false });

    let W = 0, H = 0, dpr = 1, dw = 0, dh = 0;
    let lum = null, genW = 0, genH = 0, genDpr = 0;
    let base = null, prevBase = null, fadeT0 = 0;
    let glints = [], sprites = null, bokeh = null, sheen = null;
    let groove = null, gHi = null, gLo = null, gAO = null, gs = 0.5, strokes = [], grooveDirty = false, current = null;
    let raf = 0, visible = true, running = false, destroyed = false, needsFrame = true;
    const light = { x: 0.56, y: 0.55, tx: 0.56, ty: 0.55 };
    const tilt = { x: 0, y: 0 };
    let hover = null;
    const perf = { n: 0, total: 0, last: 0 };

    const persp = (y) => 0.38 + 0.62 * (y / Math.max(1, H));

    function buildSprites() {
      sprites = glintSprite(shade.glitter);
      bokeh = bokehSprite(mix(shade.light, shade.glitter, 0.5));
      sheen = sheenSprite(mix(shade.light, shade.glitter, 0.3));
    }

    function layout() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
      if (w === W && h === H && base) return;
      W = w; H = h;
      dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      if (W * H * dpr * dpr > MAX_PIX) dpr = Math.max(1, Math.sqrt(MAX_PIX / (W * H)));
      dw = Math.round(W * dpr); dh = Math.round(H * dpr);
      canvas.width = dw; canvas.height = dh;
      // reuse the field if only height shrank a little (mobile URL bar), otherwise regenerate
      if (!lum || dw !== genW || dh > genH || Math.abs(dpr - genDpr) > 0.01 || dh < genH * 0.7) {
        genW = dw; genH = dh; genDpr = dpr;
        lum = buildField(dw, dh, dpr);
        base = colorize(lum, dw, dh, shade);
        prevBase = null;
      }
      // groove buffers
      gs = 0.5;
      groove = mkCanvas(Math.ceil(W * gs), Math.ceil(H * gs));
      gHi = mkCanvas(groove.width, groove.height);
      gLo = mkCanvas(groove.width, groove.height);
      gAO = mkCanvas(groove.width, groove.height);
      grooveDirty = strokes.length > 0;
      seedGlints();
      canvas.style.opacity = '1';
      needsFrame = true;
    }

    function seedGlints() {
      const r = rngFrom(0x9e37 + W * 7 + H);
      const n = clamp(Math.round((W * H) / 1000), 90, 700);
      glints = [];
      const gauss = () => (r() + r() + r() - 1.5) * 0.55;
      for (let i = 0; i < n; i++) {
        const x = r() * W, y = Math.pow(r(), 0.85) * H;
        glints.push({
          x0: x, y0: y, ox: 0, oy: 0, tx: 0, ty: 0,
          mx: x / W + gauss(), my: y / H + gauss() * 0.8,
          s: (0.55 + Math.pow(r(), 3) * 1.7) * persp(y),
          ph: r() * 6.283, sp: 0.0006 + r() * 0.0016, kick: 0,
          lit: Math.exp(-Math.pow((x / W - 0.42) * 1.1, 2) / 0.42 - Math.pow(y / H - 0.58, 2) / 0.2),
        });
      }
    }

    /* ---------- grooves ---------- */
    function drawGrooves(now) {
      const gx = groove.getContext('2d');
      gx.setTransform(1, 0, 0, 1, 0, 0);
      gx.clearRect(0, 0, groove.width, groove.height);
      gx.setTransform(gs, 0, 0, gs, 0, 0);
      gx.lineCap = 'round'; gx.lineJoin = 'round';
      let alive = false;
      strokes = strokes.filter((st) => !st.rel || reduced || now - st.rel < HEAL);
      for (const st of strokes) {
        const a = st.rel && !reduced ? Math.pow(1 - (now - st.rel) / HEAL, 1.6) : 1;
        if (st.rel && !reduced) alive = true;
        if (st.pts.length === 1) st.pts.push({ x: st.pts[0].x + 0.1, y: st.pts[0].y + 0.1 });
        gx.beginPath();
        st.pts.forEach((p, i) => (i ? gx.lineTo(p.x, p.y) : gx.moveTo(p.x, p.y)));
        gx.globalAlpha = a * 0.35; gx.strokeStyle = '#000'; gx.lineWidth = st.w * 1.5; gx.stroke();
        gx.globalAlpha = a; gx.lineWidth = st.w * 0.9; gx.stroke();
      }
      gx.globalAlpha = 1;
      // emboss: light from top-left
      const e = 5 * gs, lx = -0.55 * e, ly = -0.83 * e;
      for (const [cv, sx, sy, col] of [[gHi, lx, ly, mix(shade.base, shade.light, 0.75)], [gLo, -lx, -ly, mix(shade.deep, '#000', 0.55)]]) {
        const c = cv.getContext('2d');
        c.globalCompositeOperation = 'copy';
        c.drawImage(groove, -sx, -sy);
        c.globalCompositeOperation = 'destination-out';
        c.drawImage(groove, sx, sy);
        c.globalCompositeOperation = 'source-in';
        c.fillStyle = col;
        c.fillRect(0, 0, cv.width, cv.height);
        c.globalCompositeOperation = 'source-over';
      }
      const ao = gAO.getContext('2d');
      ao.globalCompositeOperation = 'copy';
      ao.drawImage(groove, 0, 0);
      ao.globalCompositeOperation = 'source-in';
      ao.fillStyle = mix(shade.deep, '#000', 0.25);
      ao.fillRect(0, 0, gAO.width, gAO.height);
      ao.globalCompositeOperation = 'source-over';
      grooveDirty = alive || !!current;
    }

    function scatter(x0, y0, x1, y1, w) {
      const R = w * 0.95;
      const vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1;
      for (const p of glints) {
        const px = p.x0 + p.tx, py = p.y0 + p.ty;
        let t = ((px - x0) * vx + (py - y0) * vy) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cx = x0 + vx * t, cy = y0 + vy * t;
        let dx = px - cx, dy = py - cy;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          if (d < 0.01) { dx = -vy; dy = vx; }
          const k = (R * 1.08 - d) / (Math.hypot(dx, dy) || 1);
          p.tx += dx * k; p.ty += dy * k;
          p.kick = Math.min(1, p.kick + 0.8);
          if (reduced) { p.ox = p.tx; p.oy = p.ty; }
        }
      }
    }

    /* ---------- frame ---------- */
    function update(now, dt) {
      // invisible light drifts slowly; tilt + hover steer it
      const t = now * 0.001;
      let ax = 0.56 + Math.sin(t * 0.13) * 0.3 + Math.sin(t * 0.051 + 1) * 0.1;
      let ay = 0.52 + Math.sin(t * 0.17 + 2) * 0.2;
      if (hover) { ax = ax * 0.4 + hover.x * 0.6; ay = ay * 0.4 + hover.y * 0.6; }
      light.tx = ax + tilt.x; light.ty = ay + tilt.y;
      const k = 1 - Math.pow(0.04, dt / 1000);
      light.x += (light.tx - light.x) * k;
      light.y += (light.ty - light.y) * k;
      const decay = Math.pow(0.5, dt / (HEAL * 0.35));
      const follow = 1 - Math.pow(0.002, dt / 1000);
      for (const p of glints) {
        if (!current) { p.tx *= decay; p.ty *= decay; }
        p.ox += (p.tx - p.ox) * follow; p.oy += (p.ty - p.oy) * follow;
        p.kick *= Math.pow(0.08, dt / 1000);
      }
    }

    function draw(now) {
      if (!base) return;
      const t0 = performance.now();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      // base (with crossfade on shade change)
      if (prevBase) {
        const f = clamp((now - fadeT0) / 900, 0, 1);
        g.drawImage(prevBase, 0, 0, dw, dh, 0, 0, dw, dh);
        g.globalAlpha = f * f * (3 - 2 * f);
        g.drawImage(base, 0, 0, dw, dh, 0, 0, dw, dh);
        g.globalAlpha = 1;
        if (f >= 1) prevBase = null;
      } else {
        g.drawImage(base, 0, 0, dw, dh, 0, 0, dw, dh);
      }
      // grooves
      if (strokes.length) {
        if (grooveDirty) drawGrooves(now);
        g.imageSmoothingEnabled = true;
        g.globalCompositeOperation = 'multiply';
        g.globalAlpha = 0.55;
        g.drawImage(gAO, 0, 0, dw, dh);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        g.drawImage(gLo, 0, 0, dw, dh);
        g.globalCompositeOperation = 'screen';
        g.globalAlpha = 0.9;
        g.drawImage(gHi, 0, 0, dw, dh);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
      }
      // moving sheen
      g.globalCompositeOperation = 'lighter';
      const sr = Math.max(W, H) * 0.75 * dpr;
      g.globalAlpha = 0.16;
      g.drawImage(sheen, light.x * dw - sr / 2, light.y * dh - sr / 2 * 0.7, sr, sr * 0.7);
      // glints
      const aspect = W / H;
      const dofEdge = 0.4;
      const tt = now;
      for (let i = 0; i < glints.length; i++) {
        const p = glints[i];
        const dx = (light.x - p.mx) * aspect, dy = light.y - p.my;
        let b = Math.exp(-(dx * dx + dy * dy) / 0.014);
        const tw = Math.sin(tt * p.sp + p.ph);
        if (tw > 0.985) b += (tw - 0.985) * 40 * p.lit;
        b += p.kick * 0.7;
        if (b < 0.035) continue;
        b = Math.min(1.2, b);
        const x = (p.x0 + p.ox) * dpr, y = (p.y0 + p.oy) * dpr;
        const ny = (p.y0 + p.oy) / H;
        if (ny < dofEdge) {
          const blurK = (dofEdge - ny) / dofEdge;
          if (blurK > 0.18) {
            const r = (3 + 9 * blurK) * p.s * dpr * (0.8 + b * 0.4);
            g.globalAlpha = Math.min(1, b * (0.8 - blurK * 0.35));
            g.drawImage(bokeh, x - r, y - r, r * 2, r * 2);
            continue;
          }
        }
        const r = p.s * (3 + 13 * b) * dpr;
        g.globalAlpha = Math.min(1, b);
        g.drawImage(sprites, x - r, y - r, r * 2, r * 2);
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      const ms = performance.now() - t0;
      perf.n++; perf.total += ms; perf.last = ms;
    }

    let lastT = 0;
    function frame(now) {
      raf = 0;
      if (!running) return;
      const dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      update(now, dt);
      draw(now);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (destroyed || !base || reduced || running || !visible || document.hidden) return;
      running = true; lastT = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function drawStatic() {
      if (raf || !base) return;
      raf = requestAnimationFrame((now) => { raf = 0; update(now, 16); draw(now); });
    }
    const refresh = () => (reduced ? drawStatic() : start());

    /* ---------- input ---------- */
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const skipTarget = (t) => t && t.closest && t.closest('a,button,input,select,textarea,label,summary,[role="button"],[data-no-sand]');
    function onDown(e) {
      if (e.button > 0 || skipTarget(e.target)) return;
      const p = local(e);
      const w = clamp(26 * persp(p.y) * (e.pointerType === 'touch' ? 1.15 : 1), 10, 40);
      current = { id: e.pointerId, pts: [p], w, rel: 0 };
      strokes.push(current);
      if (strokes.length > 40) strokes.shift();
      scatter(p.x, p.y, p.x, p.y, w);
      grooveDirty = true;
      if (typeof L.haptic === 'function') { try { L.haptic(); } catch (err) { /* noop */ } }
      refresh();
    }
    function onMove(e) {
      const p = local(e);
      if (e.pointerType === 'mouse' && !current) hover = { x: p.x / W, y: p.y / H };
      if (!current || e.pointerId !== current.id) return;
      const last = current.pts[current.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 2.5) return;
      current.pts.push(p);
      scatter(last.x, last.y, p.x, p.y, current.w);
      grooveDirty = true;
      if (current.pts.length > 360) { const w = current.w; endStroke(); current = { id: e.pointerId, pts: [p], w, rel: 0 }; strokes.push(current); }
      if (reduced) drawStatic();
    }
    function endStroke() {
      if (!current) return;
      current.rel = performance.now();
      current = null;
      grooveDirty = true;
      if (reduced) drawStatic();
    }
    function onUp(e) { if (current && e.pointerId === current.id) endStroke(); }
    function onLeave(e) { if (e.pointerType === 'mouse') hover = null; onUp(e); }
    function onTilt(e) {
      if (e.gamma == null || e.beta == null) return;
      tilt.x = clamp(e.gamma / 35, -1, 1) * 0.22;
      tilt.y = clamp((e.beta - 40) / 35, -1, 1) * 0.16;
    }

    if (interactive) {
      container.addEventListener('pointerdown', onDown);
      container.addEventListener('pointermove', onMove, { passive: true });
      container.addEventListener('pointerup', onUp);
      container.addEventListener('pointercancel', onUp);
      container.addEventListener('pointerleave', onLeave);
    }
    const tiltOK = interactive && !reduced && typeof window.DeviceOrientationEvent !== 'undefined' &&
      typeof window.DeviceOrientationEvent.requestPermission !== 'function';
    if (tiltOK) window.addEventListener('deviceorientation', onTilt, { passive: true });

    /* ---------- lifecycle ---------- */
    let resizeTimer = 0;
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (!destroyed) { layout(); refresh(); if (reduced) drawStatic(); } }, base ? 140 : 0);
    }) : null;
    const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) refresh(); else stop();
    }, { threshold: 0 }) : null;
    const onVis = () => (document.hidden ? stop() : refresh());
    document.addEventListener('visibilitychange', onVis);

    // Build the field after first paint so the page never blocks on it (container shows a matching gradient meanwhile).
    function init() {
      if (destroyed) return;
      buildSprites();
      layout();
      if (ro) ro.observe(container); else window.addEventListener('resize', layout);
      if (io) io.observe(container);
      if (reduced) { light.x = 0.5; light.y = 0.56; drawStatic(); } else start();
    }
    if (opts.sync) init(); else requestAnimationFrame(() => setTimeout(init, 0));

    return {
      setShade(id) {
        const next = getShade(id);
        if (next.id === shade.id) return;
        shade = next;
        if (!lum) { if (!prevStyle.background) container.style.background = stageBg(shade); return; }
        prevBase = reduced ? null : base;
        fadeT0 = performance.now();
        base = colorize(lum, genW, genH, shade);
        buildSprites();
        grooveDirty = strokes.length > 0;
        if (!prevStyle.background) container.style.background = stageBg(shade);
        refresh();
        if (reduced) drawStatic();
      },
      destroy() {
        destroyed = true;
        stop();
        clearTimeout(resizeTimer);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', layout);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        if (interactive) {
          container.removeEventListener('pointerdown', onDown);
          container.removeEventListener('pointermove', onMove);
          container.removeEventListener('pointerup', onUp);
          container.removeEventListener('pointercancel', onUp);
          container.removeEventListener('pointerleave', onLeave);
        }
        if (tiltOK) window.removeEventListener('deviceorientation', onTilt);
        canvas.remove();
        Object.assign(container.style, prevStyle);
      },
      _bench(n = 120) {
        if (!base) return 0;
        const t0 = performance.now();
        for (let i = 0; i < n; i++) { const now = t0 + i * 16.7; update(now, 16.7); draw(now); }
        g.getImageData(0, 0, 1, 1);
        return (performance.now() - t0) / n;
      },
      stats() { return { avgMs: perf.n ? perf.total / perf.n : 0, lastMs: perf.last, frames: perf.n, glints: glints.length, dpr, size: [dw, dh] }; },
    };
  }

  L.art = { product, sandStage, swatch, logo, shades: SHADES };
})();

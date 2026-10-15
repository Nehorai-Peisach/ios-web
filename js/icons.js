/* LUMA — hand-drawn icon set. 24px grid, 1.8 stroke, rounded caps & joins.
   L.icon(name, {filled, size, label}) → inline SVG markup (currentColor). */
(() => {
  'use strict';
  const L = window.Luma;

  // Outline glyphs (stroked).
  const O = {
    home: '<path d="M4 10.4 11.1 4.5a1.4 1.4 0 0 1 1.8 0L20 10.4V19a1.8 1.8 0 0 1-1.8 1.8H15v-5.3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.3H5.8A1.8 1.8 0 0 1 4 19z"/>',
    shop: '<rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="4" width="7" height="7" rx="2.2"/><rect x="4" y="13" width="7" height="7" rx="2.2"/><rect x="13" y="13" width="7" height="7" rx="2.2"/>',
    bag: '<path d="M5.6 8.2h12.8a.9.9 0 0 1 .9 1l-.9 9.8a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8l-.9-9.8a.9.9 0 0 1 .9-1z"/><path d="M8.8 10.5V7.4a3.2 3.2 0 0 1 6.4 0v3.1"/>',
    search: '<circle cx="10.6" cy="10.6" r="6.3"/><path d="m15.4 15.4 4.6 4.6"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    back: '<path d="M14.8 5.2 8.2 12l6.6 6.8"/>',
    forward: '<path d="M9.2 5.2 15.8 12l-6.6 6.8"/>',
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    minus: '<path d="M5.5 12h13"/>',
    check: '<path d="M5.2 12.6 9.6 17 18.8 7.4"/>',
    chevronDown: '<path d="M6.2 9.4 12 15.2l5.8-5.8"/>',
    chevronUp: '<path d="M6.2 14.6 12 8.8l5.8 5.8"/>',
    sparkle: '<path d="M11 4.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18 3.2c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2zM18.2 16.4c.15.9.6 1.35 1.5 1.5-.9.15-1.35.6-1.5 1.5-.15-.9-.6-1.35-1.5-1.5.9-.15 1.35-.6 1.5-1.5z"/>',
    truck: '<path d="M2.8 7.2A1.2 1.2 0 0 1 4 6h9.6a1 1 0 0 1 1 1v9.8H4a1.2 1.2 0 0 1-1.2-1.2z"/><path d="M14.6 9.3h3.3a1 1 0 0 1 .8.4l2.3 3.1c.1.2.2.4.2.6v2.7a.7.7 0 0 1-.7.7h-1.1"/><circle cx="7.4" cy="17.4" r="1.9"/><circle cx="17" cy="17.4" r="1.9"/><path d="M9.3 16.8h5.8"/>',
    returnBox: '<path d="M4.2 8.6h15.6V18a2.2 2.2 0 0 1-2.2 2.2H6.4A2.2 2.2 0 0 1 4.2 18z"/><path d="M3.4 5.4a1.1 1.1 0 0 1 1.1-1.1h15a1.1 1.1 0 0 1 1.1 1.1v2.1a1.1 1.1 0 0 1-1.1 1.1h-15a1.1 1.1 0 0 1-1.1-1.1z"/><path d="M10.4 11.2 8.6 13l1.8 1.8"/><path d="M8.8 13h4.7a2.1 2.1 0 0 1 0 4.2h-1.2"/>',
    lock: '<rect x="5" y="10.4" width="14" height="10.2" rx="2.6"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/><path d="M12 14.4v2.2"/>',
    sliders: '<path d="M4 7.5h8.5M17.5 7.5H20M4 16.5h2.5M11.5 16.5H20"/><circle cx="15" cy="7.5" r="2.4"/><circle cx="9" cy="16.5" r="2.4"/>',
    star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    heart: '<path d="M12 19.8s-7.6-4.6-7.6-10.3A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.6 2.6c0 5.7-7.6 10.3-7.6 10.3z"/>',
    share: '<path d="M8.4 9.8H7.2A2 2 0 0 0 5.2 11.8v7a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.2"/><path d="M12 3.4v11.2M8.6 6.6 12 3.2l3.4 3.4"/>',
    gift: '<rect x="3.6" y="7.8" width="16.8" height="4" rx="1.2"/><path d="M5.2 11.8v7.1a1.8 1.8 0 0 0 1.8 1.8h10a1.8 1.8 0 0 0 1.8-1.8v-7.1M12 7.8v12.9"/><path d="M12 7.8C10.6 4.6 7.4 4 7 5.8c-.4 1.7 2.4 2 5 2zM12 7.8c1.4-3.2 4.6-3.8 5-2 .4 1.7-2.4 2-5 2z"/>',
    shield: '<path d="M12 3.4 18.8 6v5.4c0 4.4-2.9 7.7-6.8 9.2-3.9-1.5-6.8-4.8-6.8-9.2V6z"/><path d="m9.2 12.1 2 2 3.8-3.9"/>',
    drop: '<path d="M12 3.6s6 6.3 6 10.8a6 6 0 0 1-12 0c0-4.5 6-10.8 6-10.8z"/><path d="M9.4 15.2a2.8 2.8 0 0 0 2.4 2.5"/>',
    leaf: '<path d="M19.6 4.4C10.8 4.2 5 8.6 5 14.8c0 1.9.5 3.5 1.4 4.8 7 .3 13.4-4.4 13.2-15.2z"/><path d="M4 20.6c3-4.8 6.6-8 11-10.4"/>',
    hand: '<path d="M8.4 12.6V6.4a1.5 1.5 0 0 1 3 0v5.2M11.4 11.4V4.9a1.5 1.5 0 0 1 3 0v6.6M14.4 11.6V6.6a1.5 1.5 0 0 1 3 0v7.8c0 3.8-2.6 6.6-6.2 6.6-2.4 0-4-1.1-5.3-3.1l-2.4-3.8a1.4 1.4 0 0 1 2.2-1.7l1.7 2.1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v1.8M12 19.4v1.8M2.8 12h1.8M19.4 12h1.8M5.5 5.5l1.3 1.3M17.2 17.2l1.3 1.3M5.5 18.5l1.3-1.3M17.2 6.8l1.3-1.3"/>',
    moon: '<path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2z"/>',
    info: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.6"/><circle cx="12" cy="7.9" r=".6" fill="currentColor"/>',
    trash: '<path d="M4.4 6.9h15.2M9.6 6.9V5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v1.7"/><path d="M6.2 6.9 7 18.9a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9l.8-12"/><path d="M10.2 10.8v6M13.8 10.8v6"/>',
    mapPin: '<path d="M12 20.8s-6.4-5.6-6.4-11a6.4 6.4 0 0 1 12.8 0c0 5.4-6.4 11-6.4 11z"/><circle cx="12" cy="9.9" r="2.3"/>',
    creditCard: '<rect x="3" y="5.4" width="18" height="13.2" rx="2.6"/><path d="M3 9.8h18M6.6 14.8h3.2"/>',
    apple: '<path stroke="none" fill="currentColor" d="M16.37 12.73c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 5.97c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.6-2.66 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.05-.52 2.68-1.28z"/>',
    // Extras used by the shell and views.
    appearance: '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor" stroke="none"/>',
    clear: '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity=".45"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" stroke="var(--icon-knock, #fff)" stroke-width="1.9"/>',
    ellipsis: '<circle cx="6.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="17.5" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    tag: '<path d="M3.8 12.6V5.4a1.6 1.6 0 0 1 1.6-1.6h7.2a1.6 1.6 0 0 1 1.1.5l6.6 6.6a1.6 1.6 0 0 1 0 2.3l-7.2 7.2a1.6 1.6 0 0 1-2.3 0l-6.6-6.6a1.6 1.6 0 0 1-.4-1.2z"/><circle cx="8.4" cy="8.4" r="1.4"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>',
    phone: '<path d="M8.2 3.9 6.1 4.4a1.9 1.9 0 0 0-1.4 2.1c1 7 6 12 13 13a1.9 1.9 0 0 0 2.1-1.4l.5-2.1a1.4 1.4 0 0 0-.8-1.6l-2.8-1.2a1.4 1.4 0 0 0-1.6.4l-1 1.2a10.8 10.8 0 0 1-4.6-4.6l1.2-1a1.4 1.4 0 0 0 .4-1.6L9.8 4.7a1.4 1.4 0 0 0-1.6-.8z"/>',
    mail: '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="2.6"/><path d="m4 7.2 8 6 8-6"/>',
    user: '<circle cx="12" cy="8.4" r="3.8"/><path d="M4.8 20.2c.8-3.6 3.6-5.8 7.2-5.8s6.4 2.2 7.2 5.8"/>',
    box: '<path d="M12 3.4 19.6 7.4v9.2L12 20.6l-7.6-4V7.4z"/><path d="M4.6 7.5 12 11.5l7.4-4M12 11.5v9"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8M12 3.4c2.4 2.4 3.4 5.4 3.4 8.6s-1 6.2-3.4 8.6c-2.4-2.4-3.4-5.4-3.4-8.6s1-6.2 3.4-8.6z"/>',
    diamond: '<path d="M7.2 4.6h9.6l3.6 4.8L12 20 3.6 9.4z"/><path d="M3.6 9.4h16.8M9.6 4.6 8.4 9.4 12 20l3.6-10.6-1.2-4.8"/>',
    bolt: '<path d="M13.2 3.4 5.6 13.2h5.6l-1 7.4 7.6-9.8h-5.6z"/>',
    bell: '<path d="M6.4 16.6V11a5.6 5.6 0 0 1 11.2 0v5.6l1.4 1.6H5z"/><path d="M10 20.4a2.2 2.2 0 0 0 4 0"/>',
    arrowUp: '<path d="M12 19V5.4M6.4 11 12 5.4 17.6 11"/>',
  };

  // Filled glyphs (tab bar, ratings). Same silhouettes, solid.
  const F = {
    home: '<path stroke="none" fill="currentColor" d="M3.3 10.2 10.8 4a1.9 1.9 0 0 1 2.4 0l7.5 6.2c.4.3.6.8.6 1.3V19a2.4 2.4 0 0 1-2.4 2.4h-3.4v-5.8a1.3 1.3 0 0 0-1.3-1.3h-4.4a1.3 1.3 0 0 0-1.3 1.3v5.8H5.1A2.4 2.4 0 0 1 2.7 19v-7.5c0-.5.2-1 .6-1.3z"/>',
    shop: '<g stroke="none" fill="currentColor"><rect x="3.4" y="3.4" width="7.9" height="7.9" rx="2.5"/><rect x="12.7" y="3.4" width="7.9" height="7.9" rx="2.5"/><rect x="3.4" y="12.7" width="7.9" height="7.9" rx="2.5"/><rect x="12.7" y="12.7" width="7.9" height="7.9" rx="2.5"/></g>',
    bag: '<path stroke="none" fill="currentColor" d="M5.4 7.6h13.2a1.6 1.6 0 0 1 1.6 1.8l-.9 9.7a2.6 2.6 0 0 1-2.6 2.4H7.3a2.6 2.6 0 0 1-2.6-2.4l-.9-9.7a1.6 1.6 0 0 1 1.6-1.8z"/><path d="M8.8 9.2V7.3a3.2 3.2 0 0 1 6.4 0v1.9" stroke-width="2"/>',
    search: '<circle cx="10.6" cy="10.6" r="6.1" stroke-width="2.5"/><path d="m15.3 15.3 4.7 4.7" stroke-width="2.6"/>',
    star: '<path fill="currentColor" stroke-width="1.2" d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    heart: '<path fill="currentColor" d="M12 19.8s-7.6-4.6-7.6-10.3A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.6 2.6c0 5.7-7.6 10.3-7.6 10.3z"/>',
    sparkle: '<g fill="currentColor" stroke-width="1"><path d="M11 4.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18 3.2c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2zM18.2 16.4c.15.9.6 1.35 1.5 1.5-.9.15-1.35.6-1.5 1.5-.15-.9-.6-1.35-1.5-1.5.9-.15 1.35-.6 1.5-1.5z"/></g>',
    info: '<circle cx="12" cy="12" r="9.2" fill="currentColor" stroke="none"/><path d="M12 11v5.6" stroke="var(--icon-knock, #fff)" stroke-width="2"/><circle cx="12" cy="7.9" r="1.15" fill="var(--icon-knock, #fff)" stroke="none"/>',
    check: '<circle cx="12" cy="12" r="9.2" fill="currentColor" stroke="none"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8" stroke="var(--icon-knock, #fff)" stroke-width="2"/>',
  };

  // Directional glyphs flip in RTL (CSS: [dir=rtl] .icon--dir).
  const DIRECTIONAL = new Set(['back', 'forward', 'share-x']);

  function icon(name, opts = {}) {
    const { filled = false, size = 24, label = '', className = '' } = opts;
    const body = (filled && F[name]) || O[name];
    if (!body) {
      console.warn(`[icon] unknown icon "${name}"`);
      return '';
    }
    const cls = ['icon', `icon-${name}`, filled && F[name] ? 'icon--filled' : '', DIRECTIONAL.has(name) ? 'icon--dir' : '', className]
      .filter(Boolean).join(' ');
    const a11y = label ? `role="img" aria-label="${L.esc ? L.esc(label) : label}"` : 'aria-hidden="true"';
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${a11y}>${body}</svg>`;
  }

  icon.names = Object.keys(O);
  icon.has = (name) => name in O;
  L.icon = icon;
})();

/* =====================================================================
   LUMA: document meta per route (title, description, Open Graph, X)
   + Product structured data generated from the catalog.
   ===================================================================== */
(() => {
  const L = window.Luma;

  const SITE = 'לוּמָה';
  const ORIGIN = 'https://nehorai-peisach.github.io/ios-web/';
  const DEFAULT = {
    title: 'לוּמָה · חול יהלומים סגול',
    social: 'יהלומים שאפשר לגעת בהם · לוּמָה',
    description: 'חול קינטי סגול עם נצנוץ יהלומי. רך בידיים, שקט בראש. ארבעה גוונים, אביזרים ומארזי מתנה, ומשלוח חינם מעל 249 ₪.',
  };

  const withSite = (t) => `${t} · ${SITE}`;
  // Plain text (no bidi marks from Intl): meta text is shown outside the page by previews and search engines.
  const price = (n) => `${n} ₪`;

  const PAGES = {
    home: () => ({ title: DEFAULT.title, social: DEFAULT.social, description: DEFAULT.description }),

    shop: (params, query) => {
      const cat = L.catalog?.categories.find((c) => c.id === query.cat && c.id !== 'all');
      const shade = L.catalog?.shade?.(query.shade);
      const title = cat ? `${cat.name} · חנות` : 'חנות';
      const lead = shade ? `חול יהלומים בגוון ${shade.name}` : cat ? `${cat.name} מבית לוּמָה` : 'כל המוצרים של לוּמָה';
      return {
        title: withSite(title),
        description: `${lead}: חול קינטי מנצנץ, כלים, מגשים ומארזי מתנה. משלוח חינם מעל ${price(L.SHIPPING?.freeOver ?? 249)}, 14 ימי החזרה.`,
      };
    },

    product: (params, query) => {
      const p = L.catalog?.get(params.id);
      if (!p) return { title: withSite('המוצר לא נמצא'), description: DEFAULT.description };
      const shade = p.shades && L.catalog.shade(query.shade || p.defaultShade);
      const from = L.catalog.priceFrom(p);
      const multi = p.sizes.length > 1;
      const name = shade && p.shades.length > 1 ? `${p.name}, ${shade.name}` : p.name;
      return {
        title: withSite(name),
        description: `${shade && shade.id !== p.defaultShade ? `${p.name} בגוון ${shade.name}.` : p.short} ${multi ? `החל מ־${price(from)}` : price(from)}, כולל מע״מ. משלוח חינם מעל ${price(L.SHIPPING?.freeOver ?? 249)}.`,
      };
    },

    bag: () => ({ title: withSite('סל הקניות'), description: 'הסל שלכם בלוּמָה. משלוח חינם בקנייה מעל 249 ₪.' }),
    checkout: () => ({ title: withSite('תשלום'), description: 'תשלום מאובטח בלוּמָה: Apple Pay, Google Pay, Bit או כרטיס אשראי.' }),
    done: () => ({ title: withSite('אישור הזמנה'), description: 'תודה שקניתם בלוּמָה.' }),
    search: (params, query) => ({
      title: withSite(query.q ? `חיפוש: ${query.q}` : 'חיפוש'),
      description: 'חיפוש בחנות לוּמָה: חול יהלומים, גוונים, כלים ומארזי מתנה.',
    }),
  };

  function setMeta(attr, key, value) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.append(el);
    }
    el.setAttribute('content', value);
  }

  function apply(name, params = {}, query = {}) {
    let m;
    try { m = (PAGES[name] || PAGES.home)(params, query); } catch { m = PAGES.home(); }
    const social = m.social || m.title;
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('property', 'og:title', social);
    setMeta('property', 'og:description', m.description);
    setMeta('name', 'twitter:title', social);
    setMeta('name', 'twitter:description', m.description);
  }

  /* Product list as schema.org data, built from the catalog (single source of truth). */
  function injectProducts() {
    if (!L.catalog || document.getElementById('ld-products')) return;
    const image = `${ORIGIN}assets/og-image.jpg`;
    const items = L.catalog.products.map((p, i) => {
      const prices = p.sizes.map((s) => s.price);
      const offers = prices.length > 1
        ? { '@type': 'AggregateOffer', priceCurrency: 'ILS', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, availability: 'https://schema.org/InStock' }
        : { '@type': 'Offer', priceCurrency: 'ILS', price: prices[0], availability: 'https://schema.org/InStock' };
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          sku: p.id,
          brand: { '@type': 'Brand', name: 'LUMA' },
          image,
          url: `${ORIGIN}#/product/${p.id}`,
          offers,
        },
      };
    });
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'ld-products';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'מוצרי לוּמָה', itemListElement: items });
    document.head.append(s);
  }

  L.meta = { apply, injectProducts };
})();

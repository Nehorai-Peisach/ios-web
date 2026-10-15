/* LUMA: catalog: shades, categories, products, search. Prices include VAT. */
(() => {
  'use strict';
  const L = window.Luma;

  const shades = [
    { id: 'amethyst', name: 'אמטיסט',   base: '#8E4DE8', deep: '#4B1E92', light: '#C9A2FF', glitter: '#F4E9FF', en: 'amethyst' },
    { id: 'lavender', name: 'לבנדר',    base: '#B79CFF', deep: '#7A5CCB', light: '#E6DCFF', glitter: '#FFFFFF', en: 'lavender' },
    { id: 'violet',   name: 'סגול עמוק', base: '#5A1FB0', deep: '#2A0A63', light: '#8E5BEA', glitter: '#E3CCFF', en: 'deep violet' },
    { id: 'midnight', name: 'חצות',     base: '#2B1652', deep: '#120729', light: '#5A3C8F', glitter: '#E8ECFF', en: 'midnight' },
  ];

  const categories = [
    { id: 'all', name: 'הכול' },
    { id: 'sand', name: 'חול' },
    { id: 'accessories', name: 'אביזרים' },
    { id: 'gifts', name: 'מתנות' },
  ];

  const ALL_SHADES = ['amethyst', 'lavender', 'violet', 'midnight'];
  const SAND_SPECS = [
    ['חומר', 'חול קוורץ וסיליקון בדרגת צעצוע'],
    ['גיל', '3+ בהשגחה'],
    ['נצנוץ', 'חלקיקי ברק עדינים'],
  ];
  const CARE = ['ניקוי', 'מטלית לחה. אין לשטוף במים.'];

  const products = [
    {
      id: 'classic',
      name: 'חול יהלומים סגול קלאסי',
      short: 'חול קינטי מנצנץ בגוון אמטיסט. רך, נקי ומרגיע.',
      description: 'החול שממנו הכול התחיל. גרגרים רכים כמו משי שנאספים אל עצמם ומשאירים את הידיים נקיות, עם נצנוץ יהלומי עדין שתופס את האור בכל תנועה. זמין בארבעה גוונים ובשלושה גדלים, משולחן העבודה ועד מגש משפחתי.',
      category: 'sand', badge: 'רב מכר', kind: 'pouch',
      shades: ALL_SHADES, defaultShade: 'amethyst',
      sizes: [
        { id: '450', label: '450 ג׳', grams: 450, price: 89 },
        { id: '900', label: '900 ג׳', grams: 900, price: 149 },
        { id: '2000', label: '2 ק״ג', grams: 2000, price: 279 },
      ],
      highlights: [
        'לא נדבק לידיים ולא משאיר סימנים על השולחן',
        'נצנוץ יהלומי שתופס את האור מכל זווית',
        'נשאר רך וגמיש חודשים ארוכים, בלי להוסיף מים',
      ],
      specs: [...SAND_SPECS, ['משקל', '450 ג׳ / 900 ג׳ / 2 ק״ג'], ['אריזה', 'שקית נייר מתקפלת עם סגר חוזר'], CARE],
      stock: 64, rating: 4.9, reviews: 128,
    },
    {
      id: 'quartet',
      name: 'אוסף ארבעת הגוונים',
      short: 'ארבע שקיות 225 ג׳ מכל הגוונים, בקופסה אחת.',
      description: 'אמטיסט, לבנדר, סגול עמוק וחצות, זה לצד זה בקופסה מעוצבת אחת. ערבבו לשכבות, צרו מעברי צבע או שמרו כל גוון לעצמו. הדרך היפה ביותר להכיר את כל המשפחה.',
      category: 'sand', badge: 'חדש', kind: 'set',
      shades: null, defaultShade: null,
      sizes: [{ id: '4x225', label: '4 × 225 ג׳', grams: 900, price: 219 }],
      highlights: [
        'ארבעה גוונים, 225 ג׳ מכל אחד',
        'קופסה קשיחה עם מגירה, מוכנה למתנה',
        'מושלם לשכבות ולמעברי צבע',
      ],
      specs: [...SAND_SPECS, ['תכולה', '4 שקיות × 225 ג׳'], ['משקל כולל', '900 ג׳'], ['מידות הקופסה', '24 × 18 × 6 ס״מ'], CARE],
      stock: 30, rating: 4.8, reviews: 46,
    },
    {
      id: 'midnight',
      name: 'מהדורה מוגבלת "חצות"',
      short: 'גוון חצות עם נצנוץ כסוף. 450 ג׳ בלבד.',
      description: 'סגול כהה, כמעט שחור, כמו שמיים רגע לפני שהכוכבים יוצאים, עם נצנוץ כסוף וקריר שמתגלה רק כשהאור פוגע בו. יוצר במנה אחת וממוספרת, וכשהיא תיגמר היא לא תחזור.',
      category: 'sand', badge: 'מהדורה מוגבלת', kind: 'pouch',
      shades: ['midnight'], defaultShade: 'midnight',
      sizes: [{ id: '450', label: '450 ג׳', grams: 450, price: 109 }],
      highlights: [
        'מנת ייצור אחת, ממוספרת',
        'נצנוץ כסוף שקיים רק בגוון חצות',
        'שקית קטיפה שחורה עם חותם מוטבע',
      ],
      specs: [...SAND_SPECS, ['משקל', '450 ג׳'], ['אריזה', 'שקית קטיפה ממוספרת'], CARE],
      stock: 18, rating: 5.0, reviews: 31, limited: true,
    },
    {
      id: 'refill',
      name: 'שקית מילוי 900 ג׳',
      short: 'מילוי חוזר בגוון לבחירה, באריזה חסכונית.',
      description: 'כשהמגש מבקש עוד. 900 ג׳ מאותו חול רך ומנצנץ, בשקית מילוי עם פחות אריזה ויותר חול. מתאים לכל הגוונים ומתמזג בקלות עם מה שכבר יש לכם.',
      category: 'sand', badge: null, kind: 'pouch',
      shades: ALL_SHADES, defaultShade: 'amethyst',
      sizes: [{ id: '900', label: '900 ג׳', grams: 900, price: 129 }],
      highlights: [
        'פחות אריזה, יותר חול',
        'מתמזג בקלות עם חול קיים',
        'סגר חוזר ששומר על הרכות',
      ],
      specs: [...SAND_SPECS, ['משקל', '900 ג׳'], ['אריזה', 'שקית מילוי עם סגר חוזר'], CARE],
      stock: 50, rating: 4.8, reviews: 62,
    },
    {
      id: 'tools',
      name: 'סט כלים ותבניות',
      short: '8 תבניות וכלים מעוצבים בגוון סגול מט.',
      description: 'מגרפה עדינה, סכין חיתוך, גלגלת דוגמאות וחמש תבניות: יהלום, ירח, כוכב, לב ומשושה. בגימור סגול מט, נעימים לאחיזה וקלים לניקוי.',
      category: 'accessories', badge: null, kind: 'tools',
      shades: null, defaultShade: null,
      sizes: [{ id: '8', label: '8 חלקים', grams: null, price: 59 }],
      highlights: [
        '8 חלקים בגימור סגול מט',
        'פלסטיק ממוחזר, ללא BPA',
        'נשטפים בקלות במים ובסבון',
      ],
      specs: [['תכולה', 'מגרפה, סכין, גלגלת ו־5 תבניות'], ['חומר', 'פלסטיק ממוחזר ללא BPA'], ['גיל', '3+ בהשגחה'], ['ניקוי', 'מים חמימים וסבון']],
      stock: 80, rating: 4.7, reviews: 54,
    },
    {
      id: 'tray',
      name: 'מגש עץ אלון',
      short: 'מגש אלון בגימור שמן, עם קצוות מוגבהים.',
      description: 'מגש מעץ אלון מלא, מלוטש ביד ומשומן בשמן טבעי. הקצוות המוגבהים שומרים על החול בפנים, ורגליות הלבד שומרות על השולחן. יפה מספיק כדי להישאר בחוץ גם כשלא משחקים.',
      category: 'accessories', badge: null, kind: 'tray',
      shades: null, defaultShade: null,
      sizes: [{ id: '40x30', label: '40 × 30 ס״מ', grams: null, price: 189 }],
      highlights: [
        'עץ אלון מלא בגימור שמן טבעי',
        'קצוות מוגבהים של 3 ס״מ',
        'רגליות לבד שמגינות על השולחן',
      ],
      specs: [['חומר', 'עץ אלון מלא'], ['גימור', 'שמן טבעי על בסיס צמחי'], ['מידות', '40 × 30 × 3 ס״מ'], ['ניקוי', 'מטלית יבשה או לחה מעט']],
      stock: 12, rating: 4.9, reviews: 23,
    },
    {
      id: 'jar',
      name: 'צנצנת זכוכית לעיצוב',
      short: 'צנצנת זכוכית עם מכסה פקק, מלאה בחול יהלומים.',
      description: 'פריט עיצוב שמזמין לגעת. זכוכית עבה ושקופה, מכסה פקק טבעי ו־250 ג׳ חול יהלומים בגוון לבחירה. על המדף, ליד המחשב או על שידת הלילה, הנצנוץ עושה את שלו.',
      category: 'accessories', badge: 'חדש', kind: 'jar',
      shades: ALL_SHADES, defaultShade: 'lavender',
      sizes: [{ id: '250', label: '250 ג׳', grams: 250, price: 79 }],
      highlights: [
        'זכוכית עבה עם מכסה פקק טבעי',
        '250 ג׳ חול בגוון לבחירה',
        'מגיעה עטופה בנייר משי, מוכנה למתנה',
      ],
      specs: [...SAND_SPECS, ['תכולה', '250 ג׳ חול'], ['מידות הצנצנת', 'גובה 12 ס״מ, קוטר 9 ס״מ'], CARE],
      stock: 36, rating: 4.8, reviews: 39,
    },
    {
      id: 'mini',
      name: 'ערכת מיני למסע',
      short: 'שלוש צנצנות 80 ג׳ במארז כיס. לשולחן העבודה ולטיסה.',
      description: 'שלוש צנצנות קטנות באמטיסט, לבנדר וסגול עמוק, במארז בד רך שנכנס לכל תיק. רגע של שקט בין פגישות, בהמתנה לטיסה או בנסיעה ארוכה.',
      category: 'gifts', badge: null, kind: 'mini',
      shades: null, defaultShade: null,
      sizes: [{ id: '3x80', label: '3 × 80 ג׳', grams: 240, price: 69 }],
      highlights: [
        'שלוש צנצנות × 80 ג׳',
        'מארז בד עם רוכסן',
        'קטן מספיק לתיק יד',
      ],
      specs: [...SAND_SPECS, ['תכולה', '3 צנצנות × 80 ג׳'], ['גוונים', 'אמטיסט, לבנדר, סגול עמוק'], CARE],
      stock: 44, rating: 4.7, reviews: 27,
    },
    {
      id: 'giftbox',
      name: 'קופסת מתנה · חוויית היהלום',
      short: '900 ג׳ חול, סט כלים וכרטיס ברכה באריזה ממותגת.',
      description: 'כל מה שצריך כדי להתאהב: 900 ג׳ חול יהלומים באמטיסט, סט כלים ותבניות מלא וכרטיס ברכה בכתב יד, בקופסה קשיחה עם סרט סאטן. אתם בוחרים את המילים, אנחנו כותבים.',
      category: 'gifts', badge: 'רב מכר', kind: 'box',
      shades: null, defaultShade: null,
      sizes: [{ id: 'box', label: 'מארז מתנה', grams: 900, price: 249 }],
      highlights: [
        '900 ג׳ חול וסט 8 כלים',
        'כרטיס ברכה בכתב יד, בנוסח שלכם',
        'קופסה קשיחה עם סרט סאטן',
      ],
      specs: [...SAND_SPECS, ['תכולה', '900 ג׳ חול, 8 כלים, כרטיס ברכה'], ['אריזה', 'קופסה קשיחה עם סרט סאטן'], CARE],
      stock: 20, rating: 4.9, reviews: 74,
    },
  ];

  /* ---------- Hebrew-friendly search ---------- */
  const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[֑-ׇ]/g, '')            // niqqud & cantillation
      .replace(/[׳״'"`´\-\u2013\u2014_.,:;!?()]/g, ' ')
      .replace(/[ךםןףץ]/g, (c) => FINALS[c])
      .replace(/\s+/g, ' ')
      .trim();
  }

  const SYNONYMS = {
    sand: 'חול קינטי sand kinetic',
    accessories: 'אביזרים אביזר accessories',
    gifts: 'מתנה מתנות gift',
  };

  const index = new Map();
  function haystack(p) {
    if (index.has(p.id)) return index.get(p.id);
    const shadeWords = (p.shades || []).map((id) => {
      const s = shades.find((x) => x.id === id);
      return s ? `${s.name} ${s.en}` : '';
    });
    const cat = categories.find((c) => c.id === p.category);
    const hs = {
      name: normalize(p.name),
      all: normalize([p.name, p.short, p.description, p.badge, cat?.name, SYNONYMS[p.category], p.id, ...shadeWords, ...(p.highlights || [])].join(' ')),
    };
    index.set(p.id, hs);
    return hs;
  }

  function search(q) {
    const terms = normalize(q).split(' ').filter(Boolean);
    if (!terms.length) return [];
    return products
      .map((p) => {
        const hs = haystack(p);
        if (!terms.every((t) => hs.all.includes(t))) return null;
        const score = terms.reduce((n, t) => n + (hs.name.includes(t) ? 3 : 1) + (hs.name.startsWith(t) ? 2 : 0), 0);
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }

  const get = (id) => products.find((p) => p.id === id);
  function price(product, sizeId) {
    const p = typeof product === 'string' ? get(product) : product;
    if (!p) return 0;
    const size = p.sizes.find((s) => s.id === sizeId) || p.sizes[0];
    return size.price;
  }
  const priceFrom = (product) => {
    const p = typeof product === 'string' ? get(product) : product;
    return p ? Math.min(...p.sizes.map((s) => s.price)) : 0;
  };
  const shade = (id) => shades.find((s) => s.id === id);
  const size = (product, sizeId) => {
    const p = typeof product === 'string' ? get(product) : product;
    return p ? p.sizes.find((s) => s.id === sizeId) || p.sizes[0] : undefined;
  };
  const byCategory = (cat) => (!cat || cat === 'all' ? products.slice() : products.filter((p) => p.category === cat));

  L.catalog = { shades, categories, products, get, search, price, priceFrom, shade, size, byCategory, normalize };
})();

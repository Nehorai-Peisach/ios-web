# LUMA — חול יהלומים · Architecture & Agent Contract

Read this file fully before writing code. Also read `research/ios-liquid-glass-spec.md` (design system) and `research/ux-content-spec.md` (UX rules, catalog, Hebrew copy).

## Product
- Brand: **LUMA** (Hebrew: **לוּמָה**), tagline "חול יהלומים". Sells purple glittering kinetic "diamond sand" + accessories.
- Site = **one app-like SPA** with a landing page (home) and a store (shop, product, bag, checkout). Hebrew, RTL, iOS 26/27 Liquid Glass look — must feel like a native Apple app. Luxurious, clean, calm.
- Demo store: checkout is simulated (no real payment). No backend.

## Tech rules
- **Static, no build step, no frameworks, no npm deps.** Must work by double-clicking `index.html` (file://) AND via a local server. Therefore: **classic `<script defer>` files (NOT ES modules)**, all attaching to the global namespace `window.Luma`. Each file is an IIFE: `(() => { const L = window.Luma; ... })();`
- Only external resource: Google Fonts Heebo (`https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap`). No images from the web — all product visuals are generated (SVG/canvas) by `js/art.js`.
- `<html lang="he" dir="rtl">`. Use CSS logical properties everywhere (`margin-inline-start`, `inset-inline-end`, `padding-inline`…). Never hardcode left/right for layout.
- Modern CSS ok (nesting, color-mix, :has, container queries, linear() easings, View Transitions) with sensible fallbacks.
- localStorage access always wrapped in try/catch (use `L.storage`).
- Accessibility: semantic HTML, buttons are `<button>`, aria-labels on icon buttons, `:focus-visible` rings, 44px targets, respects prefers-reduced-motion / prefers-contrast / prefers-reduced-transparency.
- Code style: clean, readable, small functions, Hebrew strings inline (no i18n system needed). Comments sparse and useful.

## File ownership (only edit files you own)
| File | Owner |
|---|---|
| `index.html` | Foundation |
| `css/tokens.css`, `css/base.css`, `css/glass.css`, `css/components.css`, `css/shell.css` | Foundation |
| `js/core.js`, `js/icons.js`, `js/catalog.js`, `js/cart.js`, `js/components.js`, `js/app.js` | Foundation |
| `js/art.js`, `assets/logo.svg`, `assets/favicon.svg` | Visuals |
| `js/views/home.js`, `css/views/home.css` | Landing |
| `js/views/shop.js`, `js/views/product.js`, `js/views/bag.js`, `js/views/checkout.js`, `css/views/shop.css` | Store |

`index.html` must load, in this exact order:
```
css: tokens.css, base.css, glass.css, components.css, shell.css, views/home.css, views/shop.css
js (defer): core.js, icons.js, catalog.js, cart.js, art.js, components.js,
            views/home.js, views/shop.js, views/product.js, views/bag.js, views/checkout.js, app.js
```
`app.js` boots on `DOMContentLoaded` (after all view files registered).

## Design decisions (binding)
- **Accent (brand violet, chosen over systemPurple magenta because the product is violet and for AA contrast):**
  - `--accent` (text/glyphs/links): light `#7B3FE4`, dark `#B18CFF`
  - `--accent-fill` (prominent button background, white label): light `#7B3FE4`, dark `#7C4DFF`
  - `--accent-soft`: `color-mix(in oklab, var(--accent) 14%, transparent)`
- iOS semantic tokens from the spec: `--bg`, `--bg-2`, `--bg-3`, `--bg-grouped`, `--bg-grouped-2`, `--label`, `--label-2`, `--label-3`, `--label-4`, `--separator`, `--fill`, `--fill-2`, `--fill-3`, plus system `--green`, `--red`, `--orange`.
- Type tokens: `--t-large-title`, `--t-title1`, `--t-title2`, `--t-title3`, `--t-headline`, `--t-body`, `--t-callout`, `--t-subhead`, `--t-footnote`, `--t-caption1`, `--t-caption2` (as `font` shorthand-friendly size/line values) + utility classes `.t-large-title`, `.t-title1`… `.t-caption2`, `.t-secondary` (color label-2).
- Spacing: `--s-1:4px --s-2:8px --s-3:12px --s-4:16px --s-5:20px --s-6:24px --s-8:32px --s-10:40px --s-12:48px --s-16:64px --s-20:80px`. Page gutter `--gutter: max(16px, env(safe-area-inset-left), env(safe-area-inset-right))` (20px ≥ 430px wide, 32px ≥ 1068px). Content max width `--content-max: 1180px`.
- Radii: `--r-sm:10px --r-md:16px --r-card:26px --r-tile:32px --r-sheet:38px --r-pill:999px`.
- Springs: `--spring-smooth`, `--spring-snappy`, `--spring-bouncy` (+ durations `--d-smooth:670ms --d-snappy:640ms --d-bouncy:730ms`), `--ease-out: cubic-bezier(.32,.72,0,1)`.
- Theme: follows system; user override via `html[data-theme="light"|"dark"]`. Glass opacity user setting → `--glass-alpha` (stored, applied on `<html>` inline style).
- **Glass only on the navigation/controls layer** (top bar buttons, tab bar, search, sheets, segmented control, toasts, floating accessory bar, media controls). Product cards, lists, content sections are SOLID.
- Prices: `L.fmt.price(n)` = `Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:0})` → "89 ₪". Use it everywhere; never hand-format.
- Shipping constants: `L.SHIPPING = { freeOver: 249, home: 29, pickup: 19 }`.
- Desktop (≥ 1068px): tab bar floats at **top center** (iPadOS 26 style) instead of bottom; layout widens to multi-column. Mobile-first.

## Shared API (implemented by Foundation, consumed by all)

### core.js
```js
L.h(tag, attrs?, ...children) -> Element
  // attrs: class, style (string|object), dataset via data-*, aria-*, on<Event> handlers (onClick…),
  // html: '<raw>' sets innerHTML. children: Node | string | number | arrays | null/false (skipped).
L.$(sel, root?)  L.$$(sel, root?) -> Element | Element[]
L.bus.on(evt, fn) -> off(); L.bus.emit(evt, data)
  // events: 'cart:change' (cart snapshot), 'route:change' ({name, params, query}), 'settings:change'
L.storage.get(key, fallback) / L.storage.set(key, value)   // JSON, try/catch safe
L.fmt.price(n) -> "89 ₪";  L.fmt.grams(g) -> "450 ג׳" / "2 ק״ג"
L.fmt.deliveryDate(businessDays) -> e.g. "יום ג׳, 21 באוקטובר" (skips Fri/Sat)
L.reducedMotion() -> boolean
L.haptic()   // navigator.vibrate?.(8) guarded — tiny tactile tick on supported devices
L.SHIPPING
```

### icons.js
`L.icon(name, {filled=false, size=24}?) -> string (inline SVG markup, currentColor, stroke 1.8, rounded caps)`.
Names (minimum): `home, shop, bag, search, close, back, forward, plus, minus, check, chevronDown, sparkle, truck, returnBox, lock, sliders, star, heart, share, gift, shield, drop, leaf, hand, sun, moon, info, trash, mapPin, creditCard, apple`.
`back`/`forward` are logical: `back` points to the inline-start-reversed direction automatically in RTL (points right in RTL). Tab-bar icons support `filled:true`.

### catalog.js
```js
L.catalog.shades     // [{id:'amethyst', name:'אמטיסט', base:'#8E4DE8', deep:'#4B1E92', light:'#C9A2FF', glitter:'#F4E9FF'},
                     //  {id:'lavender', name:'לבנדר', base:'#B79CFF', deep:'#7A5CCB', light:'#E6DCFF', glitter:'#FFFFFF'},
                     //  {id:'violet', name:'סגול עמוק', base:'#5A1FB0', deep:'#2A0A63', light:'#8E5BEA', glitter:'#E3CCFF'},
                     //  {id:'midnight', name:'חצות', base:'#2B1652', deep:'#120729', light:'#5A3C8F', glitter:'#E8ECFF'}]
L.catalog.categories // [{id:'all',name:'הכול'},{id:'sand',name:'חול'},{id:'accessories',name:'אביזרים'},{id:'gifts',name:'מתנות'}]
L.catalog.products   // see shape below — the 9 products from research/ux-content-spec.md §4 (ids: classic, quartet, midnight, refill, tools, tray, jar, mini, giftbox)
L.catalog.get(id) -> product | undefined
L.catalog.search(q) -> product[]   // matches name/short/description/shade names, Hebrew-friendly (normalize, ignore niqqud)
L.catalog.price(product, sizeId?) -> number
L.catalog.priceFrom(product) -> number
L.catalog.shade(id) -> shade
```
Product shape:
```js
{ id:'classic', name:'חול יהלומים סגול – קלאסי', short:'…one line…', description:'…2–3 sentences…',
  category:'sand', badge:'רב מכר'|null, kind:'pouch'|'set'|'jar'|'tools'|'tray'|'mini'|'box',
  shades:['amethyst','lavender','violet','midnight'] | null, defaultShade:'amethyst'|null,
  sizes:[{id:'450', label:'450 ג׳', grams:450, price:89}, …],   // always ≥1 size
  highlights:['…','…','…'], specs:[['חומר','…'],['גיל','3+ בהשגחה'],…],
  stock: number, rating: 4.9, reviews: 128, limited?: true }
```
`kind` mapping: classic→pouch, quartet→set, midnight→pouch, refill→pouch, tools→tools, tray→tray, jar→jar, mini→mini, giftbox→box.

### cart.js
```js
L.cart.items() -> [{key, id, shade, size, qty, product, unitPrice, lineTotal}]
L.cart.add(id, {shade, size, qty=1}) -> line   // merges same key (id|shade|size); emits 'cart:change'
L.cart.setQty(key, qty)  // qty 0 removes
L.cart.remove(key);  L.cart.clear()
L.cart.count() -> total units;  L.cart.subtotal()
L.cart.shipping(method='home'|'pickup') -> number (0 when subtotal ≥ freeOver)
L.cart.total(method) ;  L.cart.freeShippingRemaining() -> number ≥ 0
// persisted to localStorage 'luma.cart'
```

### art.js (Visuals)
```js
L.art.product(productOrId, {shade?, variant:'card'|'hero'|'thumb'}) -> Element
   // div.art (fills its container, aspect-ratio 1/1 by default), SVG with seeded deterministic glitter, transparent bg + soft contact shadow.
   // 'hero' adds subtle animated twinkle (CSS, disabled under reduced motion). Re-renders per shade.
L.art.sandStage(container, {shade='amethyst', interactive=true}) -> {setShade(id), destroy()}
   // Full-bleed canvas: luxurious macro glitter-sand field, sparkles that catch "light", reacts to pointer
   // (finger draws a groove / particles part) and optionally device tilt. DPR-aware, pauses offscreen
   // (IntersectionObserver) and when tab hidden, static frame under reduced motion. ≤ ~4ms/frame on mobile.
L.art.swatch(shadeId) -> string   // CSS background value (gradient + sparkle) for round shade swatches
L.art.logo({size}) -> string      // SVG wordmark/emblem markup (faceted diamond-grain emblem + "LUMA")
```

### components.js (Foundation)
```js
L.ui.button(label, {variant:'prominent'|'glass'|'filled'|'tinted'|'plain'|'applepay', size:'lg'|'md'|'sm', icon?, full?, onClick?, href?, ariaLabel?}) -> Element
L.ui.iconButton(icon, {ariaLabel, onClick, variant:'glass'|'plain'}) -> Element  // 44px glass circle
L.ui.stepper({value, min=1, max=10, onChange}) -> Element   // − value + ; numeric control NOT mirrored
L.ui.segmented({items:[{id,label}], value, onChange, glass=true}) -> Element & {setValue}  // sliding pill (snappy spring)
L.ui.chips({items:[{id,label,sub?,disabled?}], value, onChange}) -> Element     // size selection
L.ui.swatches({shades:[ids], value, onChange}) -> Element  // round swatches + selected name text
L.ui.accordion([{title, content: Node|string, open?}]) -> Element  // inset grouped style
L.ui.groupedList([{header?, footer?, rows:[{icon?, title, subtitle?, value?, accessory?: Node, chevron?, onClick?, href?}]}]) -> Element
L.ui.sheet({title?, content: Node, detent:'medium'|'large', cancel?:label, done?:{label,onClick}, onClose?}) -> {el, close(), setDetent()}
   // glass sheet, grabber, dim backdrop, swipe-down dismiss, focus trap, Esc closes, View-Transition/spring entrance
L.ui.toast(text, {icon?, action?:{label,onClick}, duration=2600})  // floating glass capsule at top
L.ui.productCard(product, {shade?, compact?}) -> Element
   // SOLID card: art (L.art.product variant 'card'), badge, name, "החל מ־89 ₪", swatch dots (tap swaps art shade),
   // quick-add "+" glass circle at bottom-start corner → adds default variant & toasts (or opens variant sheet when product has shades/sizes >1).
   // Whole card links to #/product/:id ; sets view-transition-name `art-<id>` on its art for morph into product page.
L.ui.largeTitle(text, subtitle?) -> Element   // h1.large-title[data-large-title]; shell watches it for inline-title collapse
L.ui.badge(text) -> Element
L.ui.empty({icon, title, text, action?}) -> Element
```

### app.js — shell + router (Foundation)
```js
L.views.define(name, {
  route: '/product/:id',      // hash route pattern
  title: 'חנות',              // inline nav title (string or fn(params))
  tab: 'home'|'shop'|'bag',   // which tab is selected
  back: false|true,           // shows glass back button in top bar (leading/right side in RTL)
  hideTabBar: false,          // e.g. checkout
  render(ctx)                 // build DOM into ctx.el
});
// ctx = { el, params, query, setTitle(text), setAccessory(Node|null), setTopActions(Node[]), onCleanup(fn), go(path) }
L.router.go('#/shop?cat=sand');  L.router.back();  L.router.current()
```
Routes: `#/` home · `#/shop` (`?cat=`) · `#/product/:id` (`?shade=`) · `#/bag` · `#/checkout` · `#/done/:orderId` (checkout success, defined by Store) · `#/search` (`?q=`, owned by Foundation, uses L.ui.productCard).
Shell responsibilities:
- Top bar: no background, scroll-edge effect (progressive blur/fade), glass back button, centered inline title fading in when the view's `[data-large-title]` scrolls under, trailing glass actions (default: settings button "תצוגה").
- **Floating glass tab bar** (tabs right→left: בית, חנות, סל with count badge) + separate circular glass **search** button at the left. Selected-pill slides with spring. **Minimizes on scroll down**, expands on scroll up. Search button morphs into a search field.
- **Tab bar accessory** (`ctx.setAccessory`): a floating glass capsule above the tab bar (iOS 26 bottomAccessory). Used by product page ("הוספה לסל · 89 ₪") and bag ("מעבר לתשלום"). When tab bar minimizes, accessory slides inline beside it.
- Settings sheet: theme (אוטומטי/בהיר/כהה) segmented + "שקיפות זכוכית" slider (שקוף ↔ מעומעם) mapped to `--glass-alpha` .18–.85 (iOS 27 style), persisted.
- Route transitions via `document.startViewTransition` when available (respect reduced motion); scroll restoration per route; focus management (focus h1 on navigation).
- Views get padding so content never hides under bars: `.view { padding-block-end: calc(var(--tabbar-space) + var(--s-6)); }`.

## View expectations
- **Home (Landing)** — apple.com product-page storytelling with the copy from the UX spec: dark luxurious hero with `L.art.sandStage` full-bleed, huge headline, CTAs (prominent "לחנות", plain "איך זה מרגיש ›"), features grid, sticky-scroll sensory chapter (ללחוץ / לחתוך / לשפוך) driven by scroll progress, shades carousel/teaser (tap shade → live recolor of a hero art), collection teaser with product cards, specs & safety, testimonials (marked sample), FAQ (accordion), final CTA, Apple-style fine-print footer. Scroll-reveal animations (transform/opacity only).
- **Store** — shop: large title "חנות", glass segmented categories, responsive 2/3/4-col product grid. Product: art gallery (hero art + shade-driven variants, swipe dots), title, rating, price, swatches, size chips with per-100g hint, stepper, add-to-bag via accessory bar + inline button, trust rows, delivery estimate, accordions, "השלימו את הסט" cross-sell. Bag: large title "סל", lines with stepper/remove, free-shipping progress, summary, Apple Pay + "מעבר לתשלום", empty state. Checkout: single page, inset grouped forms, express pay row, delivery method, payment, installments, sticky pay button with amount, inline validation; success page `#/done/:id` with order summary + celebration sparkle.

## Foundation addendum (as built — authoritative where it differs from above)
- `L.views.define/get/list` lives in **core.js** (so view files can register before app.js). View defs may include `parent: '#/shop'` (back fallback when no history).
- `L.ui.largeTitle(text, subtitle)` → with subtitle returns `header.large-title-group` (h1[data-large-title] + p.large-title-sub); otherwise the h1.
- Product cards set `view-transition-name: art-<id>` on their art only when tapped. **The product page hero art must set `view-transition-name: art-<id>` itself** (see stub).
- `grams` is `null` for tools/tray — guard before `L.fmt.grams`.
- Additions: `L.router.setQuery(obj)` (replace query w/o history or re-render — use for `?cat=` / `?shade=`); `L.ui.art(productOrId,{shade,variant})` (L.art wrapper w/ fallback); `L.ui.variantSheet(product,{shade,size})`; `L.ui.toastAdded(product,line)`; `L.ui.swatchBg(id)`; `L.ui.icon(name,opts)` → Element; `L.ui.announce(text)` (aria-live).
- `button`: + `iconEnd, type, disabled`, variant `'prominent-glass'`; element has `.setLabel(t)`, `.setDisabled(b)`. `iconButton`: variants `'glass'|'plain'|'fill'|'clear'|'prominent'`, `size, filled, badge, href`. `toast`: + `subtitle`, returns `{close}`. `stepper`: + `size:'sm'`, `label`; `.setValue/.getValue`. `segmented/chips/swatches`: `.setValue/.getValue`; segmented + `ariaLabel`, `size:'lg'`. `groupedList` rows: + `destructive`; chevron defaults true with href. `sheet` → `{el, panel, body, close, setDetent}`; `done.onClick` returning false keeps it open.
- `L.catalog.size(product,sizeId)`, `.byCategory(cat)`, `.normalize(str)`; shades have `en`. `L.cart.MAX_QTY=10`; `cart:change` payload `{items,count,subtotal}`.
- core: `L.fmt.number`, `L.storage.remove`, `L.clamp`, `L.debounce`, `L.uid`, `L.esc`, `L.mq`, `L.isDesktop()`. Shell: `L.shell.openSettings()`, `L.shell.setMin(bool)`, `L.shell.openSearch()`.
- Extra icons: `chevronUp, appearance, clear, ellipsis, tag, clock, phone, mail, user, box, globe, diamond, bolt, bell, arrowUp`.
- CSS for views: `.view` already pads top by `--topbar-space` and bottom by `--tabbar-space + 24px` (full-bleed hero: `.view[data-view=home]{padding-block-start:0}`). Views add their own `.container` for gutter/max-width. `--topbar-h` 56px (72px ≥1068), `--tabbar-h` 62px, `--accessory-h` 52px, `--dock-bottom`; `--tabbar-space` auto-updates with accessory/hidden tab bar. `.pgrid` = 2/3/4-col product grid. `.on-grouped` on a view → grouped bg + white cards + tinted page edges. Set `--edge-color` on :root to tint scroll-edge fade (e.g. dark for home hero). Themed tokens: `--card-bg`, `--art-bg`, `--seg-solid-pill`.
- Known: glass shows unblurred ~0.5s during Chrome view-transition snapshots; sheet swipe-dismiss only from grabber/header.

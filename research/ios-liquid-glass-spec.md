# iOS 26/27 Liquid Glass — Web Design Spec (researched 2026-10-15)

Sources: WWDC25 "Meet Liquid Glass" (219), "Get to know the new design system" (356), "Build a UIKit app with the new design" (284); HIG pages Materials / Color / Typography / Tab bars / Toolbars / Sheets / Buttons; 9to5Mac, TechCrunch (iOS 27), kube.io (CSS refraction). Values marked ≈ are measurements, not Apple-published.

## 0. Current state
- iOS 26 (Jun 2025) introduced Liquid Glass. 26.1 added Clear/Tinted. **iOS 27 (Sep 2026)** keeps Liquid Glass, adds a transparency↔tint **slider** (default midpoint) and **diffuses complex content behind panels for readability**.
- → Build glass slightly more diffused/opaque than 26.0 and **ship an in-app glass-opacity setting** (Safari cannot detect Reduce Transparency).

## 1. Material rules
- Glass = a **functional layer for controls & navigation that floats above content**. **Never use glass in the content layer** (cards, list rows, page backgrounds are solid). **No glass on glass** — items on glass use fills/vibrancy.
- Lensing: specular highlight traces the silhouette; larger elements = thicker (deeper shadow).
- Has no color of its own. **Tint only the primary action** (tint the glass background, not the glyph).
- Variants: **Regular** (default) / **Clear** (only over media, bold bright glyphs, with 35% black dimming behind if content is bright). Never mix in one group.
- Touch: glass "lifts" (scale ≈1.06–1.12) with a radial glow from the touch point; returns with bouncy spring.
- Light source stays top-left even in RTL (physical light).

```css
:root{
  --glass-alpha:.30;               /* user setting .2–.85 */
  --glass-fill: 255 255 255;
  --glass-rim: rgb(255 255 255 / .55);
  --glass-shadow: 0 8px 28px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .10);
}
/* dark */ --glass-fill: 28 28 30; --glass-alpha:.42; --glass-rim: rgb(255 255 255 / .22); --glass-shadow: 0 8px 28px rgb(0 0 0 / .45);
.glass{
  position:relative; isolation:isolate;
  background: rgb(var(--glass-fill) / var(--glass-alpha));
  -webkit-backdrop-filter: blur(14px) saturate(180%) brightness(1.04);
          backdrop-filter: blur(14px) saturate(180%) brightness(1.04);
  box-shadow: inset 0 1px 0 var(--glass-rim), inset 0 -1px 0 rgb(255 255 255/.08),
              inset 0 0 12px rgb(255 255 255/.10), var(--glass-shadow);
}
.glass::after{ /* light-catching rim */
  content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
  background:linear-gradient(135deg, rgb(255 255 255/.75), rgb(255 255 255/.08) 35%, rgb(255 255 255/.04) 65%, rgb(255 255 255/.45));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
}
.glass--clear{ --glass-alpha:.06; backdrop-filter:blur(3px) saturate(150%); }
.glass--prominent{ background:color-mix(in oklab, var(--accent) 88%, transparent); color:#fff; }
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){ .glass{ background: rgb(var(--glass-fill) / .92); } }
```
- Regular blur: 12–20px (2–3px looks broken), always with saturate(160–180%).
- `backdrop-filter:url(#svg)` refraction works **only in Chromium**; Safari/iOS paints nothing (and `@supports` lies). Optional desktop-Chrome enhancement only, feature-detect via `navigator.userAgentData?.brands` containing "Chromium". Don't use `-apple-visual-effect`.
- Don't animate backdrop-filter per scroll frame; animate transform/opacity only.

## 2. Navigation patterns
**Tab bar** — floating capsule (not full width), ≈62px tall, ≈16–20px from sides, `bottom: max(env(safe-area-inset-bottom) - 8px, 12px)`. 3–5 tabs, filled icons ≈24–28px, label 10px/600. Selected tab: lighter inner pill (radius = capsule radius − 4px padding) + accent glyph; pill **slides between tabs with a spring**. **Search = separate circular glass button ≈62px** at the trailing end (in RTL: **left**; first tab on the right); tapping expands it into a search field while tabs collapse. **Minimize on scroll down** to a compact state; expand on scroll up/tap. Tab bar = navigation only, never actions. Monochrome labels.

**Toolbars / nav bar** — no bar background; 44px glass circles in corners. Related icons share one capsule; text buttons get their own capsule; primary action (Done ✓) separate with prominent tint. Back = chevron in glass circle (RTL: points right).
**Scroll edge effect** — **no hairline dividers**; soft progressive blur + fade under bars:
```css
.edge-top{position:fixed;inset:0 0 auto;height:calc(env(safe-area-inset-top) + 64px);pointer-events:none;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  mask-image:linear-gradient(#000 40%,transparent);-webkit-mask-image:linear-gradient(#000 40%,transparent);
  background:linear-gradient(var(--bg) 0%,transparent)}
```
**Large titles** — 34px bold (700–800 for Hebrew), leading-aligned (right in RTL), scroll with content; when it passes under the bar, fade in a 17px semibold centered inline title (IntersectionObserver). Optional 15px secondary subtitle.

**Sheets** — detents medium ≈50% / large ≈full. Grabber 36×5, radius 2.5, 5px from top, `rgb(127 127 127/.4)`. Medium: floating glass sheet inset ≈8px from sides/bottom, corner radius concentric (≈47px). Large: edge-to-edge, more opaque, top radius ≈38px. Dim layer 20–35% black. Cancel on leading edge, Done (prominent) trailing. Swipe-down to dismiss.

**Concentric radii** — child radius = parent radius − padding; capsule (h/2) for standalone buttons.
**Buttons** — capsule, min 44px tall, 17px semibold, 20px horizontal padding. `.glass` = label color on regular glass; `.glassProminent` = accent-filled glass, white label. One prominent action per view.

## 3. Typography
```css
html{font-family:-apple-system,BlinkMacSystemFont,"Heebo",system-ui,"Segoe UI",Arial,sans-serif;
     -webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
:lang(he){letter-spacing:0}
```
Heebo (Google Fonts `family=Heebo:wght@400;500;600;700;800&display=swap`) must come **before system-ui** (Windows Segoe UI would win otherwise). Apple devices use SF Hebrew. Don't self-host SF. Use rem.

| Style | px size/line | weight |
|---|---|---|
| Large Title | 34/41 | 700 (Hebrew 700–800) |
| Title 1 | 28/34 | 700 |
| Title 2 | 22/28 | 700 |
| Title 3 | 20/25 | 600 |
| Headline | 17/22 | 600 |
| Body | 17/22 | 400 |
| Callout | 16/21 | 400 |
| Subheadline | 15/20 | 400 |
| Footnote | 13/18 | 400 |
| Caption 1 | 12/16 | 400 |
| Caption 2 | 11/13 | 400 |
iOS 26: bolder, leading-aligned titles. No Light/Thin weights. Min 11px.

## 4. Colors
System purple iOS 26: light #CB30E0 / dark #DB34F2 (accessible: #B02FC2 / #EA8DFF). White on #CB30E0 = 4.17:1 (fails AA). **Brand decision: see ARCHITECTURE.md.**
Grays light/dark: Gray #8E8E93; Gray2 #AEAEB2/#636366; Gray3 #C7C7CC/#48484A; Gray4 #D1D1D6/#3A3A3C; Gray5 #E5E5EA/#2C2C2E; Gray6 #F2F2F7/#1C1C1E.
| Token | Light | Dark |
|---|---|---|
| systemBackground | #FFFFFF | #000000 |
| secondarySystemBackground | #F2F2F7 | #1C1C1E |
| tertiarySystemBackground | #FFFFFF | #2C2C2E |
| systemGroupedBackground | #F2F2F7 | #000000 |
| secondarySystemGroupedBackground | #FFFFFF | #1C1C1E |
| label | #000 | #FFF |
| secondaryLabel | rgb(60 60 67/.6) | rgb(235 235 245/.6) |
| tertiaryLabel | rgb(60 60 67/.3) | rgb(235 235 245/.3) |
| separator | rgb(60 60 67/.29) | rgb(84 84 88/.6) |
| systemFill | rgb(120 120 128/.2) | rgb(120 120 128/.36) |
| secondarySystemFill | rgb(120 120 128/.16) | rgb(120 120 128/.32) |
| tertiarySystemFill | rgb(118 118 128/.12) | rgb(118 118 128/.24) |
Use `color-scheme: light dark` + meta. Set html/body background explicitly (Safari 26 tints chrome from page edges; theme-color ignored).

## 5. Layout
8pt grid (4pt half-steps). Side margins 16px (20px on wide phones+), `padding-inline:max(16px, env(safe-area-inset-left))`, `viewport-fit=cover`. Touch targets ≥44px.
**Inset grouped list**: grouped bg, sections in secondaryGroupedBg, radius ≈24px (iOS 26), 16px inset, rows ≥44px (52–60 with subtitle), 16px padding, 0.5px separators inset to text (16px, or 60px with icon), section header 13px secondary label (no uppercase in Hebrew).
Radii: small controls 8–12; buttons capsule; cards 20–28; hero tiles 28–34; sheets 38–47.
Squircle: `@supports (corner-shape:squircle){ .card{border-radius:calc(var(--r)*1.6);corner-shape:squircle} }` (Chrome 139+).

## 6. Motion
```css
--spring-smooth: linear(0,.049,.157,.285,.411,.526,.624,.706,.772,.825,.867,.899,.924,.943,.957,.968,.976,.983,.987,.99,.993,.995,.996,.997,1); /* 670ms */
--spring-snappy: linear(0,.027,.095,.186,.287,.389,.487,.577,.658,.728,.787,.837,.878,.911,.937,.957,.972,.984,.992,.998,1.002,1.004,1.006,1.006,1.006,1.006,1.006,1.005,1.004,1.004,1.003,1.002,1); /* 640ms */
--spring-bouncy: linear(0,.023,.084,.169,.267,.372,.475,.574,.665,.745,.815,.874,.923,.961,.991,1.013,1.029,1.038,1.044,1.046,1.045,1.043,1.039,1.035,1.03,1.025,1.021,1.016,1.013,1.009,1.006,1.004,1.002,1.001,1,.999,.998,.998,.998,.998,1); /* 730ms */
--ease-fallback: cubic-bezier(.32,.72,0,1);
```
Snappy: tab pill, button feedback. Smooth: sheets, title collapse. Bouncy: sparingly (glass morph into menu). Content rows/cards press → scale .97. `-webkit-tap-highlight-color:transparent; touch-action:manipulation`. View Transitions API for morphs (Safari 18+, Chrome 111+).
Accessibility:
```css
@media (prefers-reduced-motion: reduce){ *{animation-duration:.01ms!important;transition-duration:.15s!important} .glass:active{transform:none} }
@media (prefers-reduced-transparency: reduce){ .glass{--glass-alpha:.94;backdrop-filter:none} }
@media (prefers-contrast: more){ .glass{--glass-alpha:.97;box-shadow:0 0 0 1.5px CanvasText} }
```

## 7. apple.com marketing style (landing)
Hero headline 80px/1.05/600 (≤1068: 64, ≤734: 48); section headers 56/48/28; eyebrow 24/21 600; body 17. Hebrew: weight 700–800, letter-spacing 0. Backgrounds alternate #FFF / #F5F5F7 / #000 / #1D1D1F; text #1D1D1F, secondary #6E6E73/#86868B. Content width 87.5% up to 980px; breakpoints 734/1068/1440. Sections 100–160px apart. Pill CTAs (radius 980px) + "Learn more ›" text link. Tiles radius 28px. Easing cubic-bezier(0,0,.5,1).
Sticky storytelling: tall wrapper (300vh) + `position:sticky;top:0;height:100dvh` stage, driven by `animation-timeline: view()/scroll()` (Chrome 115+, Safari 26+) with IntersectionObserver/scroll-progress fallback.
Glass only on nav, floating CTAs, media controls (clear variant + dim). Storytelling content stays solid.

## 8. Mistakes to avoid
1. Glass everywhere / glass on glass / glass cards.
2. Low-contrast labels on glass over busy content → in-app opacity setting; legible resting state.
3. Hairline dividers / solid bars under controls → scroll edge effect.
4. Small blur or no saturation.
5. Mirroring everything in RTL — mirror layout, tab order, search side, chevrons; NOT light source, media icons, clocks.
6. Fake iOS chrome (status bar, notch, home indicator). Use safe-area env() and 100dvh.
7. Relying on theme-color.
8. Self-hosting SF / SF Symbols. Use own inline SVG icons with similar weight (≈1.75–2 stroke; filled for tab bar).
9. Ease-in-out where a spring belongs; animating backdrop-filter on scroll.
10. Text <11px, Light weights, colored tab labels, multiple tinted buttons per screen.
11. Selectable text on controls (`user-select:none`), 300ms tap delay, overscroll fights (`overscroll-behavior: contain` in sheets).
12. Missing `:focus-visible` rings (2px accent, 2px offset).

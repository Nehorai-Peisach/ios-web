# UX + Content Spec — חול יהלומים סגול

Source: research agent (Baymard public articles, Apple Pay guidance, Israeli norms). Items marked [convention] are not verified — confirm before real launch.

## 1. E-commerce UX rules
- Baymard: 70% cart abandonment; 39% due to unexpected costs, 18% long checkout, 14% can't see total, 19% forced account. → Show shipping/total early, guest checkout, ~8 fields max.
- **Listing**: 2 cols mobile / 3–4 desktop. Square or 4:5 cards: big image, name, "החל מ-₪X", max one badge. 6–9 products → segmented control (הכול / חול / אביזרים / מתנות) in a glass pill, not filters. Shade swatch dots on cards (tap swaps image). Quick-add "+" at bottom-leading corner (bottom-left in RTL) → opens variant sheet if variants.
- **Product page**: swipeable gallery (mobile, dots), sticky gallery on desktop (right side in RTL). Title, price incl. VAT, swatches with shade name in text (never color only), size chips with per-100g hint, stepper `− 1 +` (44px targets, min 1 max 10), primary "הוספה לסל". Sticky add bar on mobile when main button scrolls away (safe-area padded). Trust rows: משלוח חינם מעל ₪249 · 14 ימי החזרה · תשלום מאובטח (Apple Pay · Bit · אשראי). Delivery estimate "מגיע עד [date]". Accordions: תיאור, מפרט, בטיחות ותקנים, משלוחים והחזרות. Cross-sell "השלימו את הסט" (3 items).
- **Bag**: bottom sheet on mobile, side drawer on desktop. Don't navigate away on add. Lines: thumb, name, variant, stepper, remove, line price. Free-shipping progress "עוד ₪47 למשלוח חינם". Subtotal + shipping + total visible. Order: Apple Pay (black, full width) → "מעבר לתשלום" → collapsed "יש לי קוד קופון".
- **Checkout** (single page, guest-first): express row (Apple Pay, Google Pay, Bit). Fields: אימייל, טלפון, שם מלא, עיר, רחוב ומספר, דירה/קומה (optional), הערות לשליח (optional). Delivery radios: משלוח עד הבית (₪29, free over ₪249) / נקודת איסוף (₪19). Installments "עד 3 תשלומים ללא ריבית" [convention]. autocomplete attrs, inputmode=tel/numeric, inline validation, specific errors. Final button shows amount: "תשלום 238 ₪".
- **Thumb zone**: primary actions in bottom 40%. Minimal header. 44px min targets. Inputs ≥16px font (prevents iOS zoom).

## 2. Luxury patterns
Restrained palette (graphite/off-white + purple as single accent, product supplies color). Big imagery, whitespace, one idea per screen. Slow, smooth reveal motion; no autoplay carousels. Short story chapters. 3 quotes + one rating line (marked sample). Tasteful scarcity only ("מהדורה מוגבלת"; "נשארו X" only if true). No countdowns. Gift wrap as value-add instead of discounts.

## 3. Hebrew / Israel
- `<html lang="he" dir="rtl">`, CSS logical properties. Mirror arrows/chevrons/drawer direction; do NOT mirror play, stepper, checkmark, search, logo.
- Wrap Latin/numbers/phones in `<bdi>` where needed. No positive letter-spacing on Hebrew.
- Price: `new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:0}).format(89)` → "‏89 ‏₪" (contains RLM U+200F + NBSP — don't string-compare). Pick one format and use it everywhere. Prices include VAT (18%) — label "כולל מע״מ".
- Shipping [convention]: free over ₪249, ₪29 home courier 2–5 business days, pickup point ₪19. "הזמנות עד 14:00 יוצאות באותו יום עסקים".
- Payments: Apple Pay, Bit, Visa/Mastercard/Isracard/Amex, installments.

## 4. Catalog (sample data, prices incl. VAT)
Shades: אמטיסט (Amethyst), לבנדר (Lavender), סגול עמוק (Deep Violet), חצות (Midnight).

| id | Name | Description | Variants | Price | Badge | Category |
|---|---|---|---|---|---|---|
| classic | חול יהלומים סגול – קלאסי | חול קינטי מנצנץ בגוון אמטיסט. רך, נקי ומרגיע. | sizes 450 ג׳ / 900 ג׳ / 2 ק״ג; 4 shades | 89 / 149 / 279 | רב מכר | חול |
| quartet | אוסף ארבעת הגוונים | ארבע שקיות 225 ג׳ מכל הגוונים, בקופסה אחת. | 4×225 ג׳ | 219 | חדש | חול |
| midnight | מהדורה מוגבלת "חצות" | גוון חצות עם נצנוץ כסוף. 450 ג׳ בלבד. | 450 ג׳ | 109 | מהדורה מוגבלת | חול |
| refill | שקית מילוי 900 ג׳ | מילוי חוזר בגוון לבחירה, באריזה חסכונית. | 900 ג׳; 4 shades | 129 | — | חול |
| tools | סט כלים ותבניות | 8 תבניות וכלים מעוצבים בגוון סגול מט. | 8 חלקים | 59 | — | אביזרים |
| tray | מגש עץ אלון | מגש אלון בגימור שמן, עם קצוות מוגבהים. | 40×30 ס״מ | 189 | — | אביזרים |
| jar | צנצנת זכוכית לעיצוב | צנצנת זכוכית עם מכסה פקק, מלאה בחול יהלומים. | 250 ג׳; 4 shades | 79 | חדש | אביזרים |
| mini | ערכת מיני למסע | שלוש צנצנות 80 ג׳ במארז כיס. לשולחן העבודה ולטיסה. | 3×80 ג׳ | 69 | — | מתנות |
| giftbox | קופסת מתנה – חוויית היהלום | 900 ג׳ חול, סט כלים וכרטיס ברכה באריזה ממותגת. | 1 | 249 | רב מכר | מתנות |

## 5. Landing page copy
Order: Hero → Features (4) → Sensory → Collection teaser → Specs & safety → Testimonials → FAQ → Final CTA.

**Hero** — H1: **יהלומים שאפשר לגעת בהם.** (alt: סגול. מנצנץ. שלכם.)
Sub: חול קינטי בגוון אמטיסט עם נצנוץ יהלומי. רך בידיים, שקט בראש.
CTAs: "לחנות" (primary), "איך זה מרגיש" (secondary).
Microline: משלוח חינם מעל ₪249 · 14 ימי החזרה · תקן בטיחות

**Features**
1. **לא נדבק לידיים** — החול נאסף לעצמו ולא משאיר סימן על העור או על השולחן.
2. **נצנוץ יהלומי** — חלקיקי ברק עדינים שתופסים את האור מכל זווית.
3. **בטוח לילדים** — לא רעיל, נבדק ומתאים מגיל 3.
4. **לא מתייבש** — נשאר רך וגמיש גם אחרי חודשים, בלי להוסיף מים.

**Sensory** — Title: **הרגשה שאי אפשר להסביר. אפשר רק לגעת.**
Body: לוחצים, והחול נמס בין האצבעות. חותכים, והחתך נקי ושקט. משחררים, והוא נשפך לאט כמו משי. כל תנועה מקבלת נצנוץ, וכל נשימה נעשית איטית יותר.
Captions: ללחוץ / לחתוך / לשפוך.

**Collection** — Title: **ארבעה גוונים. עולם אחד.** Line: אמטיסט, לבנדר, סגול עמוק וחצות. בחרו אחד, או אספו את כולם. CTA: "לכל המוצרים".

**Specs & safety** — Title: **מפורט. בטוח. בדוק.**
Specs (sample): חומר: חול קוורץ וסיליקון בדרגת צעצוע · גיל: 3+ בהשגחה · נצנוץ: חלקיקי ברק עדינים · משקל: 450 ג׳ / 900 ג׳ / 2 ק״ג · ניקוי: מטלית לחה.
Safety: לא רעיל. ללא אלרגנים ידועים. מומלץ להשגיח על ילדים צעירים. לא למאכל.
⚠️ Only claim EN 71 / CE / ת״י 562 after holding a test report for the exact product (SI 562 is mandatory for toys in Israel).

**Testimonials** (label as sample)
- "הילדה שלי לא מורידה ממנו את הידיים. ואני, אם להודות, גם לא." — נועה, תל אביב
- "הפכתי את הצנצנת לפריט עיצוב בסלון. כולם שואלים מאיפה." — דניאל, חיפה
- "הדבר הכי טוב לסוף יום ארוך. שקט, מנצנץ, מרגיע." — מיכל, ירושלים
Rating line: 4.9 ★

**FAQ**
1. האם החול בטוח לילדים? — החול לא רעיל ומתאים מגיל 3, בהשגחה. לא מיועד לאכילה.
2. האם הוא מתייבש? — לא. הוא שומר על הרכות שלו. מומלץ לסגור את האריזה אחרי השימוש.
3. איך מנקים אותו? — אוספים פירורים עם גוש חול — הוא מושך אותם אליו. אין לשטוף במים.
4. כמה זמן לוקח משלוח? — 2–5 ימי עסקים עד הבית, או לנקודת איסוף. משלוח חינם בקנייה מעל ₪249.
5. אפשר להחזיר? — כן, תוך 14 יום מקבלת המוצר, באריזה סגורה.
6. איזה גוון לבחור? — אמטיסט הוא הקלאסי. לבנדר רך ובהיר, סגול עמוק עשיר, וחצות הכי דרמטי. ואפשר גם את אוסף ארבעת הגוונים.

**Final CTA** — **הרגע שלכם מתחיל בכף היד.** Sub: משלוח חינם מעל ₪249 · 14 ימי החזרה · אריזת מתנה. CTA: "לחנות".

**Microcopy**: הוספה לסל · נוסף לסל · הסל ריק. בואו נמלא אותו בנצנוץ. · מעבר לתשלום · אזל זמנית. עדכנו אותי · נקודת איסוף · אריזת מתנה + כרטיס ברכה

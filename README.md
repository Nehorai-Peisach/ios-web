# LUMA · חול יהלומים

אתר נחיתה + חנות לחול יהלומים סגול, בעיצוב iOS 26/27 Liquid Glass. ‏HTML/CSS/JS נקי, בלי build ובלי תלויות.

## הרצה
- פשוט לפתוח את `index.html` בדפדפן, או:
- `python3 -m http.server 8000` ואז http://localhost:8000

## מבנה
- `index.html` — מעטפת האפליקציה
- `css/` — tokens, base, glass (חומר Liquid Glass), components, shell (סרגלים, tab bar), `views/`
- `js/core.js` · `icons.js` · `catalog.js` (9 מוצרים) · `cart.js` · `art.js` (איורי מוצר + קנבס חול אינטראקטיבי) · `components.js` · `app.js` (router + shell)
- `js/views/` — home (דף נחיתה), shop, product, bag, checkout (+ done)
- `research/` — מחקר עיצוב iOS ומחקר UX/תוכן
- `ARCHITECTURE.md` — החוזה והחלטות העיצוב

## הערות
- חנות הדגמה: התשלום מדומה. קוד קופון לדוגמה: `LUMA10`.
- ביקורות ומפרטי בטיחות הם לדוגמה. לפני עלייה לאוויר צריך להחליף אותם בנתונים אמיתיים ובאישורי תקן (ת״י 562 / EN 71).

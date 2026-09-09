# Social Status Storefront Audit & Next-Week Plan

Date: September 4, 2026
Store: socialstatuspgh.com (social-status.myshopify.com)
Published theme: `SocialStatus-v2/release` (ID 146061328426) — Krown "Split" 4.3.4, heavily customized
Repo: `main` @ `1539c43` (verified: repo matches published theme on the issues below)
Estimates are for: Shafi (solo, familiar with codebase). Hours include local test + push to dev theme, not client QA.

> How the audit was done: static grep review of the repo, live-page measurement in Chrome (Performance API, DOM inspection) against the published theme, and a raw-HTML fetch of the homepage. Lighthouse/PageSpeed could not run from the sandbox (API quota + proxy) — task P-09 below captures a proper baseline.

---

## Executive summary

The store works. Nothing is broken for shoppers. But it is heavy, and a handful of small code-level fixes will make a visible difference:

- **Homepage HTML is 624 KB.** 270 KB of that is pure whitespace from one section (`latest-features.liquid`), caused by nested Liquid loops with no whitespace control. This is the single cheapest, biggest win.
- **324 requests / 4.7 MB / 158 scripts** on the homepage. jQuery + Fancybox load on every page but are used in 2 files / 1 section. Typekit CSS is linked 3 times. `component-modal.js` is loaded twice.
- **Collection TTFB is ~1.26 s** (vs ~0.3 s on home). `collection_rows` = 16 → 64 products per page, each with 2 images + quick-buy variant data, plus 66 facet inputs rendered in Liquid.
- **Third-party stack is duplicated:** Hotjar *and* Clarity, Gorgias *and* Re:amaze loaders, 4× `gtag/js` loads via GTM, plus legacy CSS (font-awesome, sweetalert, smartwishlist) from apps that appear to no longer be in use. Most of this is outside theme code — needs client sign-off.
- **Accessibility:** June report said "safe fixes implemented", but several Critical/High items are still in the code (go-top `onclick`, 3 unnamed dialogs, 9 inline `onclick`, 19 `outline: none`). Cart drawer doesn't take focus when opened.
- **SEO/UX:** 9 `<h1>` on the homepage, 5 on every page (footer headings are h1). Checkout button in the cart drawer sits below the fold on a 929 px-tall viewport. "Not eligible for international shipping" banner shows to US visitors too.
- **Tech debt:** 4 backup/prototype sections, 2 orphan snippets, ~10 unused sections, 8 deprecated `img_url` calls, a test page template, 6 `console.log`s.

Proposed week: ~32.5 h of dev work across 30 tasks, front-loaded with performance.

---

## Findings by area

### A. Performance

| # | Finding | Evidence | Severity |
|---|---------|----------|----------|
| A1 | `latest-features.liquid` emits ~270 KB whitespace on the homepage (97% of the section's 282 KB). 4-level nested loops (`tabs_list` × `blog.articles` × `tags` × `blocks` × `tags`) with 1 `{%-` vs 172 `{%` tags. Also O(n⁴) Liquid work on every request. | `sections/latest-features.liquid:25-138`; raw HTML fetch | **High** |
| A2 | jQuery 3.7.1 loaded from code.jquery.com on every page; used only in `component-facets.js` and `rotating-slider.js`. | `layout/theme.liquid:122-127` | High |
| A3 | Fancybox JS+CSS from jsDelivr on every page; used only in `besocial-locations.liquid` (`data-fancybox`). | `snippets/conditional-imports.liquid:1-2`, rendered at `theme.liquid:130` | High |
| A4 | Typekit stylesheet `els0ojo.css` linked 3× (identical). Render-blocking external CSS. | `snippets/head-variables.liquid:14-16` | Med |
| A5 | `component-modal.js` included twice. | `layout/theme.liquid:352` and `:399` | Low |
| A6 | Hero (split-screen slider) first image has no `fetchpriority="high"`, `sizes="961px"` hard-coded. PDP first gallery image same (`loading=auto`, no fetchpriority). LCP candidates not prioritized. | live DOM, `sections/split-screen-slider.liquid` | Med |
| A7 | 31 homepage images without `width`/`height` attrs; 49 `<img>` tags in sections/snippets lack `width=`. CLS risk (measured 0 on desktop, but mobile untested). | grep | Med |
| A8 | Collection page: TTFB 1.26 s, 441 requests, 4,441 DOM nodes. `collection_rows: 16` × 4 = 64 products/page; 66 facet inputs rendered server-side. | `templates/collection.json`, `sections/main-collection.liquid:17-19` | High |
| A9 | Flickity CSS/JS global (56 KB JS). Used by 11 sections — global load is defensible; leave for now. | grep | Info |
| A10 | Third parties on homepage: GTM (4× gtag), Klaviyo (18 req), Gorgias chat (12 req) **and** `reamaze-loader.js`, Hotjar **and** Clarity, 9gtb, Ryzo, Accessibly, `font-awesome.min.css` (bootstrapcdn), `sweetalert.min.css`, `smartwishlist.min.css`, `globo.formbuilder`. Most come via GTM / app embeds, not theme. | live resource list | High (client decision) |
| A11 | 56 inline `<script>` blocks, 27 inline `<style>` blocks in sections; 71 KB inline JS on home. | raw HTML | Low |

### B. Accessibility (follow-ups to June 25 report)

| # | Finding | Evidence | June # | Status |
|---|---------|----------|--------|--------|
| B1 | Go-to-top is `<span onclick="window.scrollTo(...smooth)">` — not keyboard reachable, ignores reduced-motion. | `layout/theme.liquid:405-409` | #2, #11 | **Still open** |
| B2 | `role="dialog"` without `aria-label`/`aria-labelledby`. | `layout/theme.liquid:252`, `:285`, `sections/helper-pickup-availability.liquid:64` | #1 | Still open (3 of 4) |
| B3 | Inline `onclick=` in 6 files (9 occurrences). | `cart-recommendations`, `customers-addresses`, `main-gift-card`, `customers-login`, `latest-features-backup`, `theme.liquid` | #2, #6 | Still open |
| B4 | Cart drawer opens without moving focus into it (`focusInDrawer: false`); focus stays on Add-to-cart button. | live test | #1 note | Open |
| B5 | `outline: none/0` — 19 occurrences across 10 CSS files, no `:focus-visible` replacement in most. | `assets/*.css` | #4 | Partially open |
| B6 | 4 `type="email"` inputs without `autocomplete`; 3 `autofocus`. | grep | #9, #10 | Open |
| B7 | Event date field is `type="text"` with placeholder `11/02/2022`. | `sections/blog-events.liquid:352` | #16 | Open |
| B8 | `transition: all` ×63. | `assets/*.css` | #12 | Open, low |
| B9 | Only 3 files reference `prefers-reduced-motion`; 5 hard-coded `behavior: 'smooth'`. | grep | #11 | Open |
| B10 | Accessibly overlay app is installed. Overlays don't fix code-level WCAG failures and add JS. Keep or drop is a client decision — don't count on it. | `config/settings_data.json` | — | Note |
| ✓ | Iframe titles, Flickity `accessibility:false` — fixed. | grep = 0 | #5, #7 | Done |

### C. SEO / Conversion / UX

| # | Finding | Evidence | Severity |
|---|---------|----------|----------|
| C1 | Multiple `<h1>` per page: 9 on home, 5 on collection/PDP. Footer "Categories / Quick Links / Follow Us" and "Built for the community…" are h1s; section titles use `<h1 class="main-title h1">`. | live DOM, `sections/latest-features.liquid:8`, footer | Med |
| C2 | Cart drawer: Checkout button at y = 1107 px in a 929 px viewport — shopper must scroll to check out. Footer is `position: relative`. | live test | **High** |
| C3 | "This product is not eligible for international shipping" shown to every visitor (incl. US) for listed vendors. Should be gated on `localization.country.iso_code != 'US'`. | `snippets/ineligibile-product-message.liquid` | Med |
| C4 | PDP has no size guide for footwear (14 sizes shown, no chart link). | live PDP | Med |
| C5 | 9 `href="#"` links + 2 links with no accessible name on collection page. | live DOM | Low |
| C6 | 1 px horizontal overflow (`scrollWidth 1921` at 1920 vw) — likely announcement marquee. | live DOM | Low |
| C7 | Homepage `<title>` OK, meta description 309 chars (truncates ~160). Collection meta OK. | live DOM | Low |
| C8 | `product-recommendations` renders 0 cards at load on PDP (fills later via Section Rendering API — verify it actually populates; cart-drawer recs do). | live DOM | Check |

### D. Code quality / tech debt

| # | Finding | Evidence |
|---|---------|----------|
| D1 | Backup / prototype files in production theme: `latest-features-backup`, `main-collection-backup`, `main-collection-v2`, `prototype-section` (sections); `page.test-brendan.json` (template). | `ls sections templates` |
| D2 | Orphan snippets: `button`, `product-tooltip`. | grep |
| D3 | Sections not referenced by any template/JSON: `article-spotlight`, `before-after`, `blog-header-article`, `blog-posts`, `collection-slider`, `countdown-banner`, `featured-product`, `hero-slideshow`, `promotional-banner`, `testimonials`, `video-popup`, `app`. (`helper-*` sections ARE used via JS Section Rendering — keep.) Verify in Theme Editor before deleting. | grep |
| D4 | Deprecated `img_url` ×8 in 5 files (`besocial-locations` ×3, `latest-features-backup` ×2, `product-masonry`, `floating-testimonials`, `flagship-programs`). | grep |
| D5 | `console.log` ×6 left in non-minified JS. | grep |
| D6 | `!important` ×51 in `custom-theme.css`, ×72 in `theme.css`. Symptom of override-on-override. | grep |
| D7 | No local `shopify theme check` in the dev loop (CLI not on this machine's PATH; `package.json` has no `check` script). | — |
| D8 | Store's Shopify MCP connector in this workspace points at **Galtsand**, not Social Status — analytics/GraphQL tooling can't be used for this store until switched. | MCP query |

---

## Next-week project plan

Tasks are ordered by value — if the week gets cut short, the highest-impact items are already shipped. Ship to the dev theme (`Development (2cf5d0-Shafis-Mac-mini)`), get client QA, then publish.

### Performance (≈ 13 h)

| ID | Task | Files | Est. |
|----|------|-------|------|
| P-01 | **Fix `latest-features` whitespace + loop cost.** Add `{%- -%}` to all tags; pre-filter articles with `where` / `limit` instead of nested tag loops; cap articles per tab. Verify rendered output is byte-identical apart from whitespace (diff the section HTML before/after). | `sections/latest-features.liquid` | 2.5 h |
| P-02 | Dedupe head: single Typekit `<link>` + `preconnect`; remove second `component-modal.js` include. | `snippets/head-variables.liquid`, `layout/theme.liquid:399` | 0.5 h |
| P-03 | Scope Fancybox to `besocial-locations` only — move the two tags from `conditional-imports` into the section (or `{% if template contains 'besocial' %}`). Delete `conditional-imports` if empty. | `snippets/conditional-imports.liquid`, `sections/besocial-locations.liquid` | 1 h |
| P-04 | Scope jQuery: load only when `template.name == 'collection'` or a page uses `rotating-slider`. Guard both JS files with a `window.jQuery` check so nothing throws. *(Stretch later: rewrite both files vanilla, ~5 h.)* | `layout/theme.liquid:122`, `assets/component-facets.js`, `assets/rotating-slider.js` | 1 h |
| P-05 | LCP priority: first slide in `split-screen-slider` and first PDP gallery image get `loading="eager" fetchpriority="high"` and a real `sizes` attr; all other slides `loading="lazy"`. | `sections/split-screen-slider.liquid`, `sections/main-product.liquid` / gallery snippet | 1.5 h |
| P-06 | Add `width`/`height` (or `image_tag` with `widths`) to the 49 `<img>` tags missing them; prioritize home + collection + PDP. | sections/snippets (grep list) | 2 h |
| P-07 | Collection page weight: drop `collection_rows` from 16 → 8 (32 products) in `collection.json`; check quick-buy variant JSON isn't rendered for every card; consider lazy-rendering facets drawer via Section Rendering. Measure TTFB before/after. | `templates/collection.json`, `sections/main-collection.liquid`, `snippets/facets.liquid` | 2.5 h |
| P-08 | Third-party inventory doc for client: list every script/CSS on home with owner (GTM tag / app / theme), flag duplicates (Hotjar+Clarity, Gorgias+Re:amaze, 4× gtag, dead CSS from font-awesome/sweetalert/smartwishlist). Client removes; you verify. | `docs/third-party-inventory.md` | 1.5 h |
| P-09 | Baseline + after metrics: PageSpeed Insights (mobile) for home / collection / PDP before starting and after the performance tasks. Record in this doc. | `docs/` | 0.25 h × 2 |

### Accessibility follow-ups (≈ 7 h)

| ID | Task | Files | Est. |
|----|------|-------|------|
| A-01 | Go-top → `<button type="button">` + JS listener honoring `prefers-reduced-motion`. | `layout/theme.liquid:405-432` | 0.5 h |
| A-02 | `aria-labelledby` on the 3 unnamed dialogs (point at existing visible titles). | `layout/theme.liquid:252, :285`, `sections/helper-pickup-availability.liquid:64` | 0.5 h |
| A-03 | Replace remaining inline `onclick` with buttons + delegated JS. | `cart-recommendations`, `customers-addresses`, `main-gift-card`, `customers-login` | 1.5 h |
| A-04 | Cart/search/menu drawers: move focus to drawer title on open, trap Tab, return focus to opener on close, Esc closes. Check `sidebar-drawer` custom element. | `assets/component-sidebar.js` (or wherever `sidebar-drawer` lives) | 1.5 h |
| A-05 | Replace `outline: none` with `:focus-visible` outline (19 spots; skip `flickity.min.css`, override instead). | `assets/*.css` | 1.5 h |
| A-06 | `autocomplete="email"` on 4 inputs; remove 3 `autofocus`; `type="date"` on event form. | grep list, `sections/blog-events.liquid:352` | 1 h |
| A-07 | Wrap the 5 hard-coded `behavior: 'smooth'` in a reduced-motion check. | `assets/*.js` | 0.5 h |

### SEO / conversion (≈ 6 h)

| ID | Task | Files | Est. |
|----|------|-------|------|
| S-01 | One `<h1>` per page: footer headings → `<h2 class="h1">` / `<p>`; section titles → `<h2>` (keep `.h1` class for styling). Home hero keeps the h1. | `sections/footer.liquid`, `latest-features`, `featured-collection`, `text-columns-with-icons`, others from grep | 1.5 h |
| S-02 | Cart drawer sticky footer: subtotal + Checkout always visible (`position: sticky; bottom: 0` on drawer footer, drawer body scrolls). | `assets/component-sidebar.css`, `snippets/cart-*.liquid` | 1 h |
| S-03 | Gate international-shipping notice on `localization.country.iso_code != 'US'`. | `snippets/ineligibile-product-message.liquid` | 0.5 h |
| S-04 | Size guide on footwear PDP: metafield-driven modal (reuse `component-modal`), shown when `product.metafields.custom.size_guide` present. | `sections/main-product.liquid`, new snippet | 2 h |
| S-05 | Fix `href="#"` links (9) and 2 unnamed links; fix 1 px horizontal overflow from marquee. | `sections/header.liquid`, `sections/announcement-bar.liquid` | 0.75 h |
| S-06 | Confirm `product-recommendations` populates on PDP; trim home meta description to ≤160 chars (in Admin). | `sections/product-recommendations.liquid` | 0.25 h |

### Tech debt + tooling (≈ 6.5 h)

| ID | Task | Files | Est. |
|----|------|-------|------|
| T-01 | Delete backup/prototype/test files: 4 sections, `page.test-brendan.json`, 2 orphan snippets. Confirm none referenced in `settings_data.json` or any template first. | see D1, D2 | 0.75 h |
| T-02 | Review the 12 unreferenced sections in Theme Editor (are any used as "add section" options the client relies on?). Delete the dead ones. | see D3 | 1.5 h |
| T-03 | Replace 8 deprecated `img_url` with `image_url` / `image_tag`. | see D4 | 1 h |
| T-04 | Remove 6 `console.log`s. | `assets/*.js` | 0.25 h |
| T-05 | Install Shopify CLI on the Mac mini; add `"check": "shopify theme check"` to `package.json`; fix anything at `error` level. | `package.json` | 1 h |
| T-06 | Add `docs/README.md`: published theme name/ID, dev theme flow, `npm run dev/pull/push`, third-party owners, and this audit's after-metrics. Switch the Shopify MCP connector to Social Status. | `docs/` | 0.75 h |
| T-07 | Buffer for client QA feedback + publish. | — | 1.25 h |

**Total: ≈ 32.5 h** (Perf 13 · A11y 7 · SEO/UX 6 · Debt 6.5). If the week runs short, drop S-04, T-02, and A-05 first (≈ 5 h) — everything else is small and safe.

### Not this week (backlog)

- Rewrite `component-facets.js` and `rotating-slider.js` without jQuery (~5 h) → then remove jQuery entirely.
- Reduce `!important` count in `custom-theme.css` by moving overrides into the owning section CSS (~6–8 h, incremental).
- `transition: all` → explicit properties (63 spots, ~2 h, cosmetic).
- Mobile-specific pass with real device / Lighthouse mobile (couldn't resize the Chrome window during this audit).
- Inline `<style>` blocks (27 sections) → section CSS files.

---

## Quick glossary (for the client-facing version)

- **TTFB** — time to first byte; how long Shopify takes to render the Liquid before the browser gets anything. High TTFB = heavy Liquid.
- **LCP** — largest contentful paint; when the biggest above-fold element (usually the hero image) is visible. `fetchpriority="high"` tells the browser to fetch it first.
- **Whitespace control** — `{%-` / `-%}` strips the newlines/indentation Liquid would otherwise output. In nested loops this adds up to hundreds of KB.
- **Section Rendering API** — fetching one section's HTML via `?section_id=` and swapping it into the page. Used here for cart, predictive search, recommendations.
- **Focus trap** — while a drawer/modal is open, Tab cycles only inside it; Esc closes and focus returns to the button that opened it.

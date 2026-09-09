# Week 1 Work Order — 10 h slate

Branch first:

```bash
cd "$HOME/mnt/social-status"
git checkout -b perf/week1-2026-09
```

Work locally with `npm run dev`, push to dev theme once at the end.

---

## Corrections to the audit (found while reading code)

Two items from the audit were wrong. Removed from the slate:

1. **Dialog accessible names — already done.** All three `role="dialog"` elements (`site-cart`, `site-search`, `PickupAvailabilityDrawer`) already have `aria-labelledby` pointing at real IDs. My grep only checked the same line as `role="dialog"`, and the attribute sits on the next line. No work needed. *(frees 0.5 h)*
2. **`component-facets.js` does not use jQuery.** The `$(...)` matches were inside a minified `rangeSlider` bundle, not jQuery. Only `rotating-slider.js` uses jQuery — and that section is only on `templates/index.json`. This makes task 4 easier, not harder.

Also worth knowing: `snippets/lazy-image.liquid` already emits `width`, `height`, `srcset`, and skips `loading="lazy"` when `preload: true` is passed. So the theme's image handling is better than the raw-`<img>` grep suggested. The real gap is `fetchpriority`.

---

## Task order

| # | Task | Est. |
|---|------|------|
| 1 | Rewrite `latest-features.liquid` | 2.5 h |
| 2 | Dedupe head (Typekit ×3, modal ×2) | 0.5 h |
| 3 | Scope jQuery + Fancybox to pages that need them | 1.5 h |
| 4 | `fetchpriority="high"` on LCP images | 0.5 h |
| 5 | Cart drawer — keep Checkout visible | 1.0 h |
| 6 | Gate international-shipping notice to non-US | 0.5 h |
| 7 | Go-to-top → real button + reduced-motion | 0.5 h |
| 8 | Remove `console.log` ×6 | 0.25 h |
| 9 | PageSpeed baseline + after | 0.5 h |
| 10 | QA, fix fallout, push to dev theme | 2.25 h |
| | **Total** | **10 h** |

---

## Task 9 first — capture the baseline

Before touching anything, run PageSpeed Insights (mobile) on all three and save the scores:

- https://pagespeed.web.dev/analysis?url=https://www.socialstatuspgh.com/
- https://pagespeed.web.dev/analysis?url=https://www.socialstatuspgh.com/collections/sneakers
- https://pagespeed.web.dev/analysis?url=https://www.socialstatuspgh.com/products/nike-mind-002-flyknit-1

Record: Performance score, LCP, TBT, CLS, and "Total byte weight". Without a before-number none of this is provable to the client.

Also record the current homepage HTML size for the whitespace fix specifically:

```bash
curl -s https://www.socialstatuspgh.com/ | wc -c
```

Expect ~639,000 bytes.

---

## Task 1 — Rewrite `sections/latest-features.liquid` (2.5 h)

### What's wrong

Three separate problems in one file:

**a) No whitespace control.** The file has 172 `{% ... %}` tags and only one `{%- ... -%}`. Every Liquid tag sitting on its own line emits the newline and indentation around it. That is harmless in a flat template, but this file has four nested loops:

```
for city (3)
  for article (~250)
    for tag (~6)        ← date lookup
    for block (3)
      for tag (~6)      ← city match
```

Roughly 3 × 250 × (6 + 3 × 6) ≈ 18,000 innermost iterations, each emitting ~15 lines of indentation that render nothing. Measured on the live homepage: this one section is **282 KB, of which 272 KB (97%) is whitespace**.

> **Whitespace control**: `{%-` strips whitespace before the tag, `-%}` strips it after. `{% liquid %}` wraps several logic statements in one tag that emits nothing at all — cleaner than dashing every line.

**b) The article loop runs three times per city.** Once for the image column, once to count articles for the "View More" button, once to render. The counting pass is removable: count as you render and emit "View More" after the loop closes.

**c) The block loop is inside the article loop.** For every article, the template re-derives which tags belong to the current city. That's the same answer every time. Hoist it out: build a delimited string once per city, then test with `contains`.

```liquid
{%- comment -%} once per city {%- endcomment -%}
assign city_tag_list = '|pittsburgh||pgh|'

{%- comment -%} per article — pipes prevent 'ny' matching 'nyc' {%- endcomment -%}
assign padded_tag = tag | downcase | remove: '#' | prepend: '|' | append: '|'
if city_tag_list contains padded_tag
```

Combined: ~18,000 innermost iterations → ~4,500, and 272 KB of whitespace → near zero.

### How to apply

I've attached the rewritten file. Replace the existing one:

```bash
cd "$HOME/mnt/social-status"
cp sections/latest-features.liquid /tmp/latest-features.liquid.bak
# copy the attached file over sections/latest-features.liquid
```

### What changed, line by line

- `assign` block at the top wrapped in `{% liquid %}`, plus `today` and `max_articles` hoisted out of the loops (they were being recomputed inside the innermost tag loop).
- Both article loops: filter logic moved into a single `{% liquid %}` block.
- `city_tag_list` built once per city, before the article loop.
- Tag matching now uses the pipe-padded `contains` test instead of a nested block loop.
- The counting pass is gone. `city_total_articles` increments during the render pass; "View More" still renders after the loop and still uses `> max_articles`.
- Image column now `{% break %}`s once it hits `max_articles` instead of scanning all remaining articles.
- Added `loading="lazy"` to both `<img>` tags (they had `width`/`height` but no lazy attribute — these images are all below the fold).
- `{%- ... -%}` added to tags on their own lines only.

### One rule to remember

**Do not add dashes to inline conditionals inside HTML attributes.** These must stay as-is:

```liquid
class="tab-list-item-container {% if city == first_city %}active{% endif %} {% if city_article_count == 1 %}expanded{% endif %}"
```

`{%- if -%}` there would eat the literal space between `active` and `expanded` and merge the class names. A tag that sits inline on one line emits no newline anyway, so there is nothing to strip.

### Test

1. `npm run dev`, open the homepage.
2. The Latest Features section must look identical — same tabs, same article count per tab, same images, same order, same `/01 /02` numbering.
3. Click every city tab. Images must swap correctly (this depends on `data-tab-image-index` staying sequential across cities — it does, `image_index` is still incremented globally).
4. Check a city with more articles than `max_articles` — the "View More" button must still appear.
5. Check a city with zero matching articles — "No events found" must still appear.
6. Measure the win:

```bash
curl -s "http://127.0.0.1:9292/" | wc -c
```

Expect roughly 639,000 → 370,000 bytes.

### If output differs

The most likely cause is a city tag with a `#` or different casing that the pipe-padded match handles differently from the old nested loop. Compare the rendered section against the backup by diffing whitespace-stripped output:

```bash
curl -s https://www.socialstatuspgh.com/ | tr -d ' \n\t' > /tmp/before.txt
curl -s http://127.0.0.1:9292/ | tr -d ' \n\t' > /tmp/after.txt
diff <(fold -w120 /tmp/before.txt) <(fold -w120 /tmp/after.txt) | head -40
```

Ignore differences in cache-busting `?v=` query strings.

---

## Task 2 — Dedupe head (0.5 h)

### 2a. Typekit loaded three times

`snippets/head-variables.liquid` lines 14–16 are three identical tags:

```liquid
<link rel="stylesheet" href="https://use.typekit.net/els0ojo.css">
<link rel="stylesheet" href="https://use.typekit.net/els0ojo.css">
<link rel="stylesheet" href="https://use.typekit.net/els0ojo.css">
```

Replace all three with one, plus a preconnect so the TLS handshake starts earlier:

```liquid
{% comment %} Yantramanav font {% endcomment %}
<link rel="preconnect" href="https://use.typekit.net" crossorigin>
<link rel="preconnect" href="https://p.typekit.net" crossorigin>
<link rel="stylesheet" href="https://use.typekit.net/els0ojo.css">
```

> Browsers dedupe identical stylesheet *downloads*, so this isn't three round trips — but it is three extra render-blocking entries the parser has to resolve before painting.

### 2b. `component-modal.js` loaded twice

`layout/theme.liquid` line 352 and line 399 both load it. Delete **line 399** (keep 352, it comes first). The line to remove:

```liquid
<script src="{{ 'component-modal.js' | asset_url }}" defer></script>
```

Keep the `component-modal.css` line directly under it.

Verify only one remains:

```bash
grep -n "component-modal.js" layout/theme.liquid
```

### Test

Open any product page, trigger a modal (size guide, quick view, lightbox). Check the Network tab shows `component-modal.js` once and `els0ojo.css` once.

---

## Task 3 — Scope jQuery and Fancybox (1.5 h)

### Current state

Both load on **every page**:

- `layout/theme.liquid:122-127` — jQuery 3.7.1 from `code.jquery.com`
- `snippets/conditional-imports.liquid:1-2` — Fancybox CSS + JS from jsDelivr (rendered at `theme.liquid:130`)

### Who actually needs them

| Library | Used by | Templates |
|---|---|---|
| jQuery | `rotating-slider.js` | `index` |
| Fancybox (needs jQuery) | `besocial-locations.liquid` (`data-fancybox`) | `page.besocial`, `page.book-event`, `page.attend-event` |

Nothing else. `component-facets.js` is vanilla JS despite the `$(` matches.

### The change

**Step 1** — delete the jQuery block from `layout/theme.liquid` (lines 122–127):

```liquid
<script
  src="https://code.jquery.com/jquery-3.7.1.min.js"
  integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
  crossorigin="anonymous"
  defer
></script>
```

Leave `{% render 'conditional-imports' %}` on line 130 where it is.

**Step 2** — replace the whole of `snippets/conditional-imports.liquid` with:

```liquid
{%- liquid
  assign fancybox_templates = 'page.besocial,page.book-event,page.attend-event' | split: ','
  assign needs_fancybox = false
  assign needs_jquery = false

  if fancybox_templates contains template
    assign needs_fancybox = true
    assign needs_jquery = true
  endif

  if template.name == 'index'
    assign needs_jquery = true
  endif
-%}

{%- if needs_jquery -%}
  <script
    src="https://code.jquery.com/jquery-3.7.1.min.js"
    integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
    crossorigin="anonymous"
    defer
  ></script>
{%- endif -%}

{%- if needs_fancybox -%}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>
{%- endif -%}
```

**Why the load order still works:** both jQuery and Fancybox use `defer`, and deferred scripts run in document order. jQuery is written first in this snippet, so it executes before Fancybox. `rotating-slider.js` is loaded from inside the section body, further down the document, so it also runs after jQuery.

**Why a template list and not a per-section load:** Liquid `assign` does not leak between sections, so a section can't tell the layout "I need jQuery". A template allowlist is the pragmatic version. Note this as a known constraint.

### Guard against future breakage

Add a defensive check at the top of `assets/rotating-slider.js` so a mis-scoped page fails quietly instead of throwing:

```js
if (typeof window.jQuery === 'undefined') {
  console.warn('[rotating-slider] jQuery not loaded on this template — add it to conditional-imports.liquid');
} else {
  // ... existing file contents, or leave the file alone and just add the warning above line 439
}
```

Minimum viable version — wrap only the two `$(function () {` initialisers at lines 439 and 450.

Also leave a comment in `conditional-imports.liquid` naming which sections depend on the list, so the next person who adds a `besocial-locations` section to a new page knows to update it.

### Test

1. Homepage → rotating slider still animates, no console errors.
2. `/pages/besocial` → click a gallery image, Fancybox lightbox opens.
3. `/pages/book-event` and `/pages/attend-event` → same.
4. Any **product** page → Network tab shows **no** `jquery` and **no** `fancybox` requests. Page still fully functional.
5. Any **collection** page → same, and filters still work (this is the one to check carefully given the audit's wrong call on facets).

Expected saving on product/collection pages: ~30 KB transferred, 3 fewer requests, and jQuery's parse/execute off the main thread.

---

## Task 4 — `fetchpriority="high"` on the LCP image (0.5 h)

`snippets/lazy-image.liquid` already takes a `preload` flag and drops `loading="lazy"` when it's set. The split-screen slider passes `preload: true` for the first slide of the first section. But nothing tells the browser this image is more important than the 60 other images on the page.

> **`fetchpriority="high"`** moves an image to the front of the browser's fetch queue. Only ever put it on the single largest above-the-fold image — using it on several cancels out the benefit.

In `snippets/lazy-image.liquid`, change line 19 from:

```liquid
{% unless preload %} loading="lazy" {% endunless %} class="lazy {{ class }}"
```

to:

```liquid
{% if preload %} fetchpriority="high" {% else %} loading="lazy" {% endif %} class="lazy {{ class }}"
```

Then check the product gallery passes `preload` for its first image:

```bash
grep -rn "lazy-image" sections/main-product.liquid snippets/product-media.liquid snippets/media.liquid
```

If the first gallery image renders without `preload: true`, add it — same pattern the slider uses (`if forloop.first`).

### Test

Load the homepage, open DevTools → Network → filter Img → enable the "Priority" column. Exactly one image should show `High`, and it should be the hero. In Lighthouse, "Largest Contentful Paint image was lazily loaded" should be gone.

---

## Task 5 — Cart drawer: keep Checkout visible (1.0 h)

### The problem

Measured live: the Checkout button sits at y = 1107 px in a 929 px-tall viewport. With one item in the cart, the shopper has to scroll the drawer to find it — because `#AjaxCartSubtotal` (which holds the total and both buttons) sits at the bottom of a long scrolling column that also contains the line items and six "You may also like" recommendations.

Structure:

```
sidebar-drawer#site-cart
  .site-nav-container          ← height:100%; overflow-y:auto  (the scroll container)
    .site-nav-container-last
      cart-form                ← line items
      cart-recommendations     ← six product cards, this is what pushes it down
      #AjaxCartSubtotal        ← total + View cart + Checkout
```

### The fix

Pin `#AjaxCartSubtotal` to the bottom of the scroll container. Add to the end of `assets/component-sidebar.css`:

```css
/* Keep cart total + checkout in view while the drawer body scrolls */
#site-cart #AjaxCartSubtotal {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: var(--main-background);
  /* covers the drawer's own horizontal padding so items don't show through */
  box-shadow: 0 -1px 0 var(--main-borders);
}
```

`position: sticky` needs the element to be a descendant of the scrolling box (`.site-nav-container`) and not inside an ancestor with `overflow: hidden`. `.site-nav.style--sidebar` does have `overflow: hidden`, but that's the drawer shell, outside the scroll container — so this should work. **Verify it actually sticks** rather than assuming.

If it doesn't stick, the fallback is flexbox on the container:

```css
#site-cart .site-nav-container-last {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
#site-cart #AjaxCartSubtotal {
  margin-top: auto;
  position: sticky;
  bottom: 0;
}
```

### Test

1. Add one item → Checkout visible without scrolling.
2. Add six items → drawer body scrolls, Checkout stays pinned.
3. Empty cart → the `[data-cart-empty]` state still renders correctly and doesn't leave a floating empty bar (there's already a rule at `component-sidebar.css:428` for this).
4. Mobile width (375 px) → same behaviour, subtotal not covering the last line item.
5. The `/cart` page (not the drawer) must be **unaffected** — the selector is scoped to `#site-cart`, so confirm the full cart page looks unchanged.

---

## Task 6 — Gate the international-shipping notice (0.5 h)

`snippets/ineligibile-product-message.liquid` currently shows a red bordered warning to **every** visitor, including US shoppers who are the majority of traffic:

```liquid
{% if vendor_array contains product.vendor %}
  <span style="...">This product is not eligible for international shipping.</span>
{% endif %}
```

Add the country check:

```liquid
{%- if vendor_array contains product.vendor and localization.country.iso_code != 'US' -%}
  <span style="display: block; width: 100%; text-align: center; color: #CF0C28; font-size: 14px; line-height: 1.25; margin: 15px 0 15px 0; padding: 10px 5px; border: 1px dashed #CF0C28;">
    This product is not eligible for international shipping.
  </span>
{%- endif -%}
```

> `localization.country.iso_code` reflects the country the visitor has selected in the market/currency picker, not their IP. A US visitor who switched the picker to Canada will see the notice — which is the correct behaviour.

### Test

1. US selected in the currency picker → notice hidden on a product from a listed vendor.
2. Switch the picker to Canada → notice appears.
3. Confirm with the client that the vendor list in this snippet is still current before shipping — it's a hardcoded array.

---

## Task 7 — Go-to-top: real button + reduced-motion (0.5 h)

`layout/theme.liquid` around line 405. Currently a `<span>` with an inline `onclick` — not focusable, not activatable by keyboard, and it animates regardless of the visitor's motion setting.

Replace the `<span id="go-top">` element with a `<button>`:

```liquid
<button
  type="button"
  id="go-top"
  class="main-go-top"
>
  <span class="visually-hidden">{{ 'general.accessibility_labels.go_to_top' | t }}</span>
  <span class="main-go-top__icon" aria-hidden="true">
    {%- render 'theme-symbols', icon: 'arrow_icon_down_slim' -%}
  </span>
  <span class="main-go-top__text" aria-hidden="true">{{ 'general.accessibility_labels.top' | t }}</span>
</button>
```

Then replace the inline `<script>` block directly below it:

```liquid
<script>
  (function () {
    var goTop = document.getElementById('go-top');
    if (!goTop) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    goTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });

    window.addEventListener('scroll', function () {
      goTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
  })();
</script>
```

### CSS check

`<button>` carries UA defaults a `<span>` doesn't. Check `.main-go-top` in `assets/theme.css` and add if the button looks wrong:

```css
.main-go-top {
  appearance: none;
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
```

### Test

1. Scroll down 500 px → button appears, looks identical to before.
2. Press <kbd>Tab</kbd> until it's focused → visible focus ring, <kbd>Enter</kbd> and <kbd>Space</kbd> both scroll to top.
3. macOS: System Settings → Accessibility → Display → Reduce motion **on** → the jump is instant, not animated.

---

## Task 8 — Remove `console.log` (0.25 h)

Six left in shipped JS:

```
assets/component-cart.js:103
assets/component-collection-tabs.js:42
assets/component-localization-form.js:92
assets/component-map.js:172
assets/component-pickup-availability.js:23
assets/component-product-form.js:566
```

Five of them are `console.log(e)` inside `catch` blocks. Don't just delete those — swallowing an error silently is worse than logging it. Change them to `console.error(e)` so real failures still surface in error tracking, and delete the two that are pure debug output:

- `component-collection-tabs.js:42` — `console.log(this.querySelector('button'), panel.id)` → delete
- `component-map.js:172` — geocode failure message → change to `console.warn(...)`

Verify:

```bash
grep -rn "console\.log" assets/*.js | grep -v min.js
```

Should return nothing.

---

## Task 10 — QA and push (2.25 h)

### Regression pass

Walk these in the dev theme before pushing:

- Home: hero slider, rotating slider, Latest Features tabs, Instafeed
- Collection: filters, sort, pagination, quick buy
- Product: gallery, variant picker, add to cart, virtual try-on widget, pickup availability
- Cart drawer: add, change qty, remove, recommendations, checkout button
- `/cart` page: unchanged
- beSOCIAL pages: Fancybox gallery
- Search drawer, mobile menu
- Mobile width 375 px for all of the above

### Console must be clean

Open DevTools console on home, collection, product, and a beSOCIAL page. Any new error means something got mis-scoped — most likely jQuery.

### Push

```bash
cd "$HOME/mnt/social-status"
git add -A
git commit  # message below
npm run push  # pushes to the dev theme
```

Commit message:

```
perf: cut homepage HTML 42%, scope jQuery/Fancybox, fix cart CTA

- latest-features: add whitespace control, hoist city tag lookup out of
  the article loop, merge the counting pass into the render pass.
  Homepage HTML 624KB -> ~360KB.
- head: single Typekit stylesheet (was 3x), single component-modal.js (was 2x)
- jQuery now loads only on index + beSOCIAL pages; Fancybox only on
  beSOCIAL pages. Both were global.
- lazy-image: fetchpriority=high when preload is set
- cart drawer: sticky subtotal so Checkout stays in view
- international shipping notice gated to non-US visitors
- go-to-top is a real button, respects prefers-reduced-motion
- console.log -> console.error/warn in catch blocks

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JEB7Kfxz4pi32YAwk3EJjD
```

### Re-measure

Re-run the three PageSpeed URLs against the dev theme preview and record the deltas next to the baseline numbers from Task 9. That table is what goes to the PM.

---

## Rolled into next week

- Collection page weight (`collection_rows` 16 → 8, lazy facets) — 2.5 h
- Third-party inventory doc for the client — 1.5 h
- Remaining accessibility: focus trap in drawers, `outline: none` ×19, form autocomplete — 4.5 h
- Single H1 per page — 1.5 h

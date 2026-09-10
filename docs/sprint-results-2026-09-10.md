# Social Status — Sprint Results

**Developer:** Shafi
**Date:** September 10, 2026
**Budget:** 10 hours · **Used:** 10 hours · **Tasks completed:** 10 of 10
**Branch:** `perf/week1-2026-09` — 5 commits, on the dev theme, awaiting client QA

---

## Headline

**The homepage now sends 40% less HTML: 627 KB → 377 KB (−250 KB).**

One section was generating 270 KB of empty whitespace on every single page load. The rendered output after the fix is byte-for-byte identical to before — same tabs, same articles, same images, same order. Verified by diffing the live page against the fixed one.

Every page also drops three third-party file downloads (jQuery and the Fancybox gallery library, **165 KB uncompressed**) that were loading site-wide but are only used on the homepage and the beSOCIAL pages.

---

## What shipped

| # | Task | Est. | Actual | Outcome |
|---|------|------|--------|---------|
| 1 | Rewrite oversized homepage section | 2.5 h | 2.5 h | −250 KB, output verified identical |
| 2 | Remove duplicate font + script tags | 0.5 h | 0.25 h | Font stylesheet 3× → 1×, modal script 2× → 1× |
| 3 | Load jQuery / Fancybox only where used | 1.5 h | 1.5 h | 3 fewer downloads on ~all pages |
| 4 | Fix image loading priority | 0.5 h | 1.5 h | Above-fold collection images no longer lazy-loaded |
| 5 | Keep Checkout visible in cart drawer | 1.0 h | 1.0 h | Button moved from off-screen into view |
| 6 | Hide intl shipping notice from US shoppers | 0.5 h | 0.5 h | Confirmed hidden for US, shown for non-US |
| 7 | Make "back to top" keyboard accessible | 0.5 h | 0.5 h | Real button, respects reduced-motion |
| 8 | Remove debug logging | 0.25 h | 0.25 h | All removed |
| 9 | Before/after measurements | 0.5 h | 0.5 h | This document |
| 10 | Testing + QA across 10 page types | 2.25 h | 2.0 h | No regressions found |

Two estimates moved. Task 4 ran 1 h over — the original approach would have made performance *worse*, and re-doing it correctly required measuring how the theme actually loads images. Task 2 came in under. Net: on budget.

---

## Measured results

### Page weight

| Page | Before | After | Change |
|---|---|---|---|
| **Homepage** | 627 KB | 377 KB | **−250 KB (−40%)** |

Other page types show a small *increase* in this comparison, but that is **not** from this sprint's work. It traces entirely to the footer (+6.4 KB) and page head (+2.3 KB) differing between the dev theme and the live theme — unrelated pending changes sitting in the working copy. Every other section on those pages matches byte-for-byte. The real change on those pages is the removed downloads below.

### Downloads removed from every page except the homepage and beSOCIAL pages

| File | Size (uncompressed) |
|---|---|
| jQuery 3.7.1 | 85 KB |
| Fancybox JS | 67 KB |
| Fancybox CSS | 12 KB |
| **Total** | **165 KB, 3 fewer requests** |

Over the wire these are compressed to roughly a third of that, but the browser also stops spending time parsing and executing them — which is what improves responsiveness on phones.

### Conversion and accessibility

| Fix | Before | After |
|---|---|---|
| Checkout button in cart drawer | 178 px below the visible area | Always visible, stays pinned while scrolling |
| Above-fold collection images | All 64 lazy-loaded, incl. the 4 visible ones | First row loads immediately |
| "Not eligible for international shipping" | Shown to every visitor incl. US | Non-US visitors only |
| "Back to top" control | Not reachable by keyboard | Real button, keyboard + focus ring, honors reduced-motion |

---

## Quality checks

Ten page types tested against the live site: homepage, two collections, product, cart page, blog, search, 404, beSOCIAL, standard page.

- **No template errors on any page.**
- **No browser console errors** on homepage, collection, or product.
- Collection filters, sorting and price slider fully working (applied a filter end-to-end: "473 of 559 products").
- Product gallery, size picker, add to cart, cart drawer all working.
- beSOCIAL photo gallery lightbox working.
- `/cart` page unchanged.
- Search and mobile menu drawers unchanged.

### Two items not verified by automation

1. **Mobile layout** — the browser automation could not resize the viewport, so the cart drawer and back-to-top button were only confirmed at desktop width. Needs a manual check at phone size before publishing.
2. **Back-to-top appear-on-scroll** — automated scrolling was unavailable in the test environment. The logic is unchanged from the original; needs a 10-second manual check.

---

## Honest notes

**One change has no effect on the current homepage.** Part of the image-priority work targets the first slide of the homepage hero. That slide is currently a **video**, not an image, so the change does nothing there today. It is correct and will apply if that slide ever becomes an image. It is not counted as a homepage win.

**The homepage hero being a video is itself the next performance question** — it is the largest thing loading above the fold, and this sprint did not address it.

**Three tracking/chat tools still load duplicate copies of jQuery** (versions 1.9.1 and 2.2.0, from 2013 and 2016) via installed apps, outside the theme. Removing the theme's own copy was the part under our control. The remaining ones need a client decision on which apps are still needed — see the third-party inventory task, still outstanding.

---

## Recommended next

| Priority | Item | Est. |
|---|---|---|
| 1 | Manual mobile QA, then publish to live | 0.5 h |
| 2 | Third-party app audit — duplicate analytics, chat and jQuery copies | 1.5 h |
| 3 | Collection page weight — 64 products per page is heavy (server time ~1.3 s) | 2.5 h |
| 4 | Remaining accessibility items from the June report — focus handling in drawers, missing focus outlines, form labels | 4.5 h |
| 5 | Homepage hero video optimization | 1.5 h |
| 6 | One H1 per page (currently 9 on the homepage) | 1.5 h |

**Also needs resolving:** two files in the working copy (`header-group.json`, `templates/index.json`) hold theme-editor changes from before this sprint. They are the source of the footer/head size difference noted above and should be reviewed and either committed or reverted before publishing.

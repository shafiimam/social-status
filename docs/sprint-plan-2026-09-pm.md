# Social Status — Storefront Improvement Sprint

**Prepared by:** Shafi
**Date:** September 4, 2026
**Scope:** socialstatuspgh.com, published theme (Krown Split, customized)
**Total estimate:** 32.5 hours (≈ one developer week)

Hours cover development, local testing, and deployment to the dev theme. Client QA and publish sign-off are additional.

---

## Project 1 — Site Speed & Page Weight (13 h)

| # | Task | Hours |
|---|------|-------|
| 1 | Fix homepage "Latest Features" section — currently outputs ~270 KB of empty whitespace (≈ 45% of the page HTML) | 2.5 |
| 2 | Remove duplicate font stylesheet (loaded 3×) and duplicate modal script | 0.5 |
| 3 | Load Fancybox gallery library only on the beSOCIAL locations page instead of every page | 1.0 |
| 4 | Load jQuery only on pages that use it (collection filters, rotating slider) instead of every page | 1.0 |
| 5 | Prioritize hero and product images so the largest image loads first (LCP) | 1.5 |
| 6 | Add explicit image dimensions to ~50 images to prevent layout shift | 2.0 |
| 7 | Reduce collection page weight — 64 products per page → 32, lighter filter rendering (currently 1.3 s server time) | 2.5 |
| 8 | Third-party script inventory for client review — duplicated tools found (Hotjar + Clarity, Gorgias + Re:amaze, 4× Google tag loads, unused app CSS) | 1.5 |
| 9 | Record before/after PageSpeed scores for home, collection, product pages | 0.5 |

## Project 2 — Accessibility Follow-ups (7 h)

Remaining items from the June 2026 ADA report.

| # | Task | Hours |
|---|------|-------|
| 10 | Make "back to top" a real keyboard-accessible button, respect reduced-motion setting | 0.5 |
| 11 | Add accessible names to 3 unnamed dialogs (search, cart, pickup availability) | 0.5 |
| 12 | Replace inline click handlers with proper buttons (cart recommendations, account pages, gift card) | 1.5 |
| 13 | Cart / search / menu drawers: move keyboard focus inside on open, trap focus, return focus on close | 1.5 |
| 14 | Restore visible keyboard focus outlines (19 places where they were removed) | 1.5 |
| 15 | Form fixes: autocomplete on email fields, remove autofocus, proper date picker on event form | 1.0 |
| 16 | Respect reduced-motion preference for smooth-scroll animations | 0.5 |

## Project 3 — SEO & Conversion (6 h)

| # | Task | Hours |
|---|------|-------|
| 17 | One H1 per page — homepage currently has 9, every other page has 5 (footer headings are H1s) | 1.5 |
| 18 | Cart drawer: keep Checkout button always visible (currently below the fold on laptop screens) | 1.0 |
| 19 | Show "not eligible for international shipping" notice only to non-US visitors | 0.5 |
| 20 | Add size guide popup on footwear product pages (driven by product metafield) | 2.0 |
| 21 | Fix placeholder `#` links, unlabeled links, and 1 px horizontal scroll from announcement bar | 0.75 |
| 22 | Verify product recommendations load on product page; trim homepage meta description to 160 chars | 0.25 |

## Project 4 — Code Cleanup & Tooling (6.5 h)

| # | Task | Hours |
|---|------|-------|
| 23 | Remove backup / prototype / test files from the live theme (4 sections, 1 test page template, 2 unused snippets) | 0.75 |
| 24 | Review 12 unused sections with client, delete confirmed dead ones | 1.5 |
| 25 | Replace 8 deprecated Shopify image filters with current API | 1.0 |
| 26 | Remove leftover debug logging from JavaScript | 0.25 |
| 27 | Set up automated theme linting (`shopify theme check`) in the dev workflow | 1.0 |
| 28 | Write developer README (theme IDs, deploy flow, third-party owners, metrics) | 0.75 |
| 29 | Buffer for client QA feedback and publish | 1.25 |

---

## Summary

| Project | Hours |
|---------|-------|
| Site Speed & Page Weight | 13.0 |
| Accessibility Follow-ups | 7.0 |
| SEO & Conversion | 6.0 |
| Code Cleanup & Tooling | 6.5 |
| **Total** | **32.5** |

**If time runs short**, drop tasks 20, 24, and 14 first (≈ 5 h). Everything else is small and low-risk.

**Needs client input:** task 8 (which tracking/chat tools to keep), task 24 (which sections are still needed).

**Backlog (not this sprint):** remove jQuery entirely (~5 h), reduce CSS `!important` overrides (~6–8 h), mobile-specific performance pass with real device testing.

# Social Status — Sprint Summary (Week 2)

**Developer:** Shafi
**Week ending:** September 18, 2026
**Hours:** 10

All work is on the development theme. Nothing has been published to the live store yet.

---

## Site speed

| Item | Result |
|---|---|
| Replaced 63 repeated cart icons with a single shared copy | −38 KB per collection page |
| Trimmed oversized image options on product cards | −24 KB per collection page |
| (Carried over from last week) header and menu cleanup | −43 KB on every page |

**Collection pages are now 722 KB → 656 KB of page code, a 9% reduction.** Product images
themselves are unchanged — this is all code weight, which is what slows phones down most.

---

## Accessibility

- **Cart, search and menu drawers now trap keyboard focus correctly.** Previously, opening the
  cart with a keyboard left the cursor stranded on the page behind it, and closing it lost the
  user's place entirely. This was listed in the June ADA report as a partial issue; it turned out
  to be a complete one.
- Restored the visible focus outline on buttons, the lightbox close button and two form controls
  where it had been switched off with no replacement.
- Fixed the event booking form, where two fields were submitting under the wrong names and so
  weren't reaching the notification email. The form isn't currently live on any page, so no
  bookings were lost — it's fixed ahead of being switched on.

---

## SEO

**Every page now has exactly one main heading.** Previously the homepage had eight, collection
pages five, and every other page at least five.

The main cause was a single setting: the footer column titles (*Categories*, *Quick Links*,
*Follow Us*) were set to the top heading level, which put four of them on **every page of the
site**. Fixed once, applied everywhere. Nine section headings were also stepped down a level —
no visual change, the text is the same size as before.

---

## Client decision document

Produced an inventory of every third-party tool running on the storefront: **20 vendors, 44
requests on a single page.** Written as a set of keep/remove decisions rather than a technical
report.

The technical owner has since reviewed it. Ten tools are confirmed keepers, one (OrderLogic) is
being uninstalled, and **three open questions remain** — all in one category: a second tool doing
a job another tool already does.

- **Email marketing** — Klaviyo is the one in use. Omnisend and Mailchimp also load.
- **Support chat** — Gorgias is the one in use. Re:amaze also loads, and appears to do nothing.
- **Session recording** — Hotjar and Clarity both record every session. One would do.

None of these are urgent, and none should be switched off without checking what's connected to
them first — a marketing tool can hold live contact lists even when it looks idle.

## Notes for planning

- Two stylesheets were locked by a running process all week and could not be checked. Small
  follow-up, needs doing.
- One duplicate heading remains on product pages. I left it deliberately rather than guess —
  it needs a check on a real phone, which I can do next session.
- **Nothing is live.** All ten hours are on the development theme, awaiting review and publish.

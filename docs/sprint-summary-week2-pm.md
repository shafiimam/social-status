# Social Status — Sprint Summary (Week 2)

**Developer:** Shafi
**Week ending:** September 19, 2026
**Hours:** 10

All work sits on a development theme. **Nothing has been published to the live store yet** — the
live site is unchanged and was re-checked this morning to confirm that.

---

## Site speed

Collection pages carry the most weight on the site, so that's where the work went.

| Change | Saving |
|---|---|
| Replaced 63 repeated cart icons with one shared copy | −38 KB per collection page |
| Removed image size options the browser can never use | −24 KB per collection page |
| Header and menu cleanup (carried over from last week) | −43 KB on every page |

**Collection pages go from 722 KB to 656 KB of page code — a 9% reduction.** Product images are
untouched; this is all code weight, which is the part that slows phones down most.

One note on the second item: the original plan was to trim the largest image sizes. On measuring,
those were never being generated in the first place, so that would have saved nothing. The real
waste was three near-identical small sizes competing with each other. Same outcome, different fix.

---

## Accessibility

- **Cart, search and menu drawers now hold keyboard focus properly.** Previously, opening the cart
  with a keyboard left the cursor stranded on the page behind it, and closing it lost the user's
  place entirely. The June ADA report listed this as a partial issue; on inspection it was a
  complete one.
- **Restored the visible focus outline in five places** where it had been switched off with no
  replacement — including the search box inside the drawer, which matters more now that opening
  search puts the cursor straight into that field.
- **Fixed the event booking form**, where two fields were submitting under the wrong names and so
  never reached the notification email. The form isn't live on any page yet, so no bookings were
  lost — it's fixed ahead of being switched on.

---

## SEO

**Every page now has exactly one main heading.** Previously the homepage had eight, collection
pages five, and every other page at least five.

Most of it traced to a single setting: the footer column titles — *Categories*, *Quick Links*,
*Follow Us* — were set to the top heading level, which placed four of them on **every page of the
site**. Fixed once, applied everywhere. Nine section headings were also stepped down a level, with
no visual change; the text is the same size as before.

---

## Third-party tools — reviewed and resolved

Produced an inventory of every third-party tool on the storefront: **20 vendors, 44 requests on a
single page.** Written as keep/remove decisions rather than a technical report.

Both reviews are now in. **Eleven tools are confirmed keepers. Four are cleared for removal:**

| Tool | Job | Weight today |
|---|---|---|
| Hotjar | Session recording (Clarity does the same job, and stays) | 254 KB |
| Omnisend | Email marketing (Klaviyo does this) | 135 KB |
| Mailchimp | Email marketing (Klaviyo does this) | 1 file |
| OrderLogic | Purchase limits | 3 files |

**That's roughly 390 KB and 8 requests off every page of the site — and it needs no development
work.** None of the four has any code in the theme; all four are removed by uninstalling an app or
deleting a tag.

Worth putting next to the sprint numbers: the ten hours of theme work saved 66 KB on collection
pages. Removing four tools nobody uses saves close to six times that, for free. If there's a choice
about where the next block of hours goes, this is the honest comparison.

Two practical notes. **Hotjar is not a Shopify app** — it runs through Google Tag Manager, so
looking for it in the app list won't find it; that removal sits with whoever holds GTM access. And
before either email tool is uninstalled, someone should export contact lists and confirm nothing is
still scheduled inside them — that isn't recoverable afterwards.

One question is still open: **Re:amaze**, an older support chat tool. It loads on every page and
appears to do nothing, with Gorgias handling support. Likely a leftover, but worth a quick
confirmation before it's switched off.

## Notes for planning

- **Nothing is live.** All ten hours are on a development theme. Publishing is a separate step and
  needs a short verification pass on a real phone first.
- One duplicate heading remains on product pages. I left it deliberately rather than guess — it
  needs checking at phone screen width, which is the first item next session.
- Two stylesheets that couldn't be checked mid-week have now been reviewed; one contained the
  search-box issue listed above, now fixed.

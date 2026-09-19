# Social Status — Third-Party Script & App Inventory

**Prepared by:** Shafi
**Date:** September 18, 2026 (rev. 2 — reflects technical owner's review)
**Measured on:** socialstatuspgh.com, published theme, `/collections/all`, desktop Chrome, cold cache

---

## Status

A single collection page loads **266 network requests**, **44 of them to 20 different third-party
companies**. Most of these are approved and staying. This revision records the decisions already
made and narrows the open items to **three**, all in the same category.

Sizes below are **uncompressed** file sizes. Over the wire they're roughly 3–4× smaller, but the
browser still unpacks and executes the full amount, which is what costs time on a phone. Where a
vendor doesn't permit measurement, the row says so rather than guessing.

---

## Decided — keeping

These are confirmed in use and stay as they are. No action.

| Tool | What it does | Cost |
|---|---|---|
| **Gorgias Live Chat** | Customer support inbox and chat | 19 files, 1,990 KB |
| **Gorgias Convert** | Conversion features on the chat widget | 2 files, 195 KB |
| **Klaviyo** | Email & SMS marketing | 20 files, 371 KB |
| **Accessibly** | Accessibility widget | 6 files, 458 KB |
| **Smart Wishlist** | Customer wishlists | 69 KB + own CSS |
| **Ryzo** | Image search in the search bar | 2 API calls |
| **Instafeed** | Instagram feed on the homepage | 3 files |
| **Globo Form Builder** | Forms on two specific pages — see note below | script only |
| **R Terms & Conditions** | Checkout terms checkbox | small |
| **Shoplift** | A/B testing | 2 font files |

Gorgias is the single largest third-party item on the site at roughly 2 MB of JavaScript. It stays
— support chat is a real business function and that's the price of the product. Recorded here so
the number isn't a surprise later if page-speed scores come up.

---

## Decided — removing

**OrderLogic** (purchase quantity limits) — being uninstalled by the technical owner.

I checked the theme for leftovers before and found **none**: no snippets, no settings, no template
references, no hardcoded markers. Its files load purely through Shopify's script-tag mechanism,
which Shopify clears automatically when an app is uninstalled. **No theme work is required**, and
nothing needs to be published for this removal to take effect.

Worth re-measuring after the uninstall: one of the two duplicate jQuery copies on the site loads
immediately after OrderLogic's own files, so it may belong to it. If so, that copy disappears with
the app. I'll confirm rather than assume.

---

## Still open — three tools doing two jobs

Everything below is one category: tools that duplicate another tool already on the site. These are
the only decisions left.

| Job | In use | Also loading | Question |
|---|---|---|---|
| Email & SMS | **Klaviyo** *(keeping)* | **Omnisend** — settings call returns 404 | Still needed? |
| Email & SMS | **Klaviyo** *(keeping)* | **Mailchimp** | Still needed? |
| Support chat | **Gorgias** *(keeping)* | **Re:amaze** — loads, then does nothing | Still needed? |
| Session recording | — | **Hotjar** *and* **Microsoft Clarity** | Both record every session. Pick one? |

**Re:amaze looks abandoned.** Its loader downloads on every page, but the object it creates
(`_support`) never appears — so it costs a request and delivers nothing. Lowest-risk removal on
the list, but it should still be confirmed with whoever set it up.

**Omnisend is partly broken** — its settings call returns 404 — but a broken marketing tool can
still hold contact lists and automations, so it needs checking before removal, not just switching
off.

**Hotjar and Clarity are not Shopify apps.** Both are fired by Google Tag Manager, so they're
removed in the GTM dashboard, not in Shopify. Whoever has GTM access controls these. There are
also three Google containers running — `GTM-MGDGHNFP`, `G-F7TC8J3JXX` and `GT-PJ4NJMB` — and the
third is unaccounted for.

---

## Note: why the Globo script loads everywhere

The technical owner asked why a form used on specific pages is loading across the whole site.

The **form** appears on exactly two page templates — the Pittsburgh flagship page and the RSVP
page. The **script** loads on all pages, because it's injected through Shopify's script-tag
mechanism, which has no page targeting. That's a limitation of how the app installs itself, not a
misconfiguration.

Keeping the app is right — it's genuinely in use, and the theme also carries custom styling that
restores the form's field labels (Globo's own template hides them, which is an accessibility
problem). Scoping the script to just those two pages is possible but is a separate small task, not
a keep-or-remove decision.

---

## What this document does not cover

- **Checkout scripts.** Shopify's own checkout loads ~150 further files. Those are Shopify's and
  can't be changed.
- **Mobile.** All measurements are desktop. Phone impact is worse, because the same JavaScript
  runs on a slower processor.
- **Cost.** I can see what each tool loads, not what it's billed at. Worth cross-checking this
  list against the invoices — a tool nobody opens is worth removing for the line item alone, not
  the page weight.

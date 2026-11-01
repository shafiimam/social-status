# Social Status — Third-Party Script & App Inventory

**Prepared by:** Shafi
**Date:** September 22, 2026 (rev. 3 — PM confirmations applied)
**Measured on:** socialstatuspgh.com, published theme, `/collections/all`, desktop Chrome, cold cache

---

## Status

Started at 20 third-party vendors and 44 requests on a single collection page. After the technical
owner's review and the PM's confirmation, **four tools are cleared for removal** and **one question
remains open**.

Sizes are uncompressed. Over the wire they're roughly 3–4× smaller, but the browser still unpacks
and executes the full amount, which is what costs time on a phone.

---

## Cleared for removal

| Tool | Job | Confirmed by | Cost today | How it's removed |
|---|---|---|---|---|
| **Hotjar** | Session recording | PM — not used | **254 KB**, 2 files | Google Tag Manager |
| **Omnisend** | Email marketing | PM — not used | **135 KB**, 4 files | Uninstall app |
| **Mailchimp** | Email marketing | PM — not used | 1 file, not measurable | Uninstall app |
| **OrderLogic** | Purchase limits | Technical owner | 3 files | Uninstall app |

**Combined: roughly 390 KB and 8 requests off every page of the site.**

For scale: the theme optimisation work in the last sprint saved 66 KB on collection pages and took
ten hours. Removing four unused tools saves close to six times that, and needs no development work
at all. Worth saying plainly, because it changes where the next hours should go.

**None of these four have any code in the theme.** I checked every theme directory for each one —
no snippets, no settings, no template references, no hardcoded markers. Nothing needs to be
published for these removals to take effect, and no theme work is required.

### Two different removal routes

**Omnisend, Mailchimp, OrderLogic** — uninstall the app in Shopify. Their files load through
Shopify's script-tag mechanism, which Shopify clears automatically on uninstall.

**Hotjar is not a Shopify app.** It's fired by Google Tag Manager, container `GTM-MGDGHNFP`, which
is hardcoded in the theme's `layout/theme.liquid`. Removing Hotjar means deleting its tag inside
the GTM dashboard — looking for it in the Shopify app list will come up empty. Whoever holds GTM
access owns this one.

Before uninstalling either email tool, someone should confirm nothing is still scheduled inside
them — a marketing tool can hold live automations and contact lists even when nobody has logged in
for months. Exporting contact lists first costs nothing and is not recoverable afterwards.

---

## Still open — one question

**Re:amaze** (customer support chat) has not been confirmed either way.

It loads on every page, but the object it creates never appears — so it costs a request and
delivers nothing visible. Gorgias is the support tool actually in use. This is very likely a
leftover from a previous support platform, but it should be confirmed with whoever set it up
rather than assumed.

---

## Keeping

Confirmed in use, no action.

| Tool | What it does | Cost |
|---|---|---|
| **Gorgias Live Chat** | Support inbox and chat | 19 files, 1,990 KB |
| **Gorgias Convert** | Conversion features on the chat widget | 2 files, 195 KB |
| **Klaviyo** | Email & SMS marketing | 20 files, 371 KB |
| **Microsoft Clarity** | Session recording — the one being kept | via GTM |
| **Accessibly** | Accessibility widget | 6 files, 458 KB |
| **Smart Wishlist** | Customer wishlists | 69 KB + own CSS |
| **Ryzo** | Image search in the search bar | 2 API calls |
| **Instafeed** | Instagram feed on the homepage | 3 files |
| **Globo Form Builder** | Forms on two specific pages | script only |
| **R Terms & Conditions** | Checkout terms checkbox | small |
| **Shoplift** | A/B testing | 2 font files |

Gorgias is the largest single third-party item on the site at roughly 2 MB of JavaScript. It stays
— support chat is a real business function. Recorded here so the number isn't a surprise later if
page-speed scores come up.

---

## Note: why the Globo script loads everywhere

The form appears on exactly two page templates — the Pittsburgh flagship page and the RSVP page.
The script loads on all pages, because it's injected through Shopify's script-tag mechanism, which
has no page targeting. That's a limitation of how the app installs itself, not a misconfiguration.
Scoping it to those two pages is possible, but it's a small separate task rather than a
keep-or-remove decision.

---

## What this document does not cover

- **Checkout scripts.** Shopify's own checkout loads ~150 further files. Those are Shopify's and
  can't be changed.
- **Mobile.** All measurements are desktop. Phone impact is worse, because the same JavaScript runs
  on a slower processor.
- **Cost.** I can see what each tool loads, not what it's billed at. The four removals above are
  worth checking against the invoices — an unused tool may also be an unused subscription.

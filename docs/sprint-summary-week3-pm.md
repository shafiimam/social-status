# Social Status — Sprint Summary (Week 3)

**Developer:** Shafi
**Week ending:** September 25, 2026
**Hours:** 10

**Three weeks of work is now live**, and for the first time there are before/after numbers
measured against the real site rather than a development copy.

---

## What the three weeks actually delivered

Page code, measured on the live site before and after:

| Page | before | after | reduction |
|---|---|---|---|
| Collection pages | 723,685 | 647,073 | **−10.6%** |
| Homepage | 340,722 | 316,852 | −7.0% |
| Cart | 191,183 | 178,904 | −6.4% |
| beSOCIAL | 243,392 | 231,124 | −5.0% |
| Product pages | 313,915 | 301,656 | −3.9% |

Separately, removing four unused third-party tools took roughly **390 KB and 8 requests off
every page** — Hotjar, Omnisend, Mailchimp and OrderLogic. Two more things left with them:
an abandoned support-chat tool, and a thirteen-year-old JavaScript library that no longer
receives security patches.

**Every page now has exactly one main heading**, down from eight on the homepage and twelve on
beSOCIAL.

**All three drawers — cart, search and menu — now hold keyboard focus correctly.** Verified on
the live site: with a drawer open there is nothing tabbable behind it, and closing returns the
user to where they were. This was the largest outstanding item from the June ADA report.

---

## New this week

- **Testimonials section rebuilt.** The two homepage rows were stepping between positions on a
  timer; they now drift continuously, with a slow fade at the point where the loop restarts.
  The speed and the fade are both adjustable in the theme editor without a developer. The old
  version relied on a slider library; the replacement needs none, so the homepage loads one
  fewer component.
- **Housekeeping.** Six abandoned files removed from the theme, a misspelled section filename
  corrected across the twelve store pages that used it, outdated image code replaced, and three
  form fields fixed that were stealing focus on page load.
- **Product recommendations checked** and confirmed working. Nothing to fix.

---

## One new issue found — needs scheduling

While checking the last accessibility item, I found that **the filter control on collection
pages cannot be reached by keyboard at all.** It behaves correctly with a mouse, but a keyboard
user has no way to open the filters on a page carrying 64 products.

This was not in the June ADA report and is more consequential than the three items that task
was originally written to cover — those three turned out to be already resolved. The fix is
small; finding it took the time. **Recommend it goes at the top of next week.**

---

## Notes for planning

- **Page weight is measured; PageSpeed scores are not.** If the client wants a score rather
  than a size, that is a separate exercise, now possible against a stable live baseline.
- **Product pages still list two main headings in their code.** Scripts correct this before a
  visitor or search engine sees it, so the impact is nil, but it should be tidied at source.
- The homepage meta description is 309 characters against a 160-character limit, and product
  pages look similar. That is a copy task rather than a development one.
- **Remaining from the original plan:** collection page weight (2.5 h), automated theme checks
  (1.0 h), plus the keyboard filter fix above.

# Performance baseline — 15 Sep 2026 (before week-2 tasks)

Lighthouse 12 CLI, mobile emulation + simulated throttling, headless Chrome on Shafi's MacBook. Live theme SocialStatus-v2/release (id 146061328426). Live does NOT yet include week-1 fixes (dev theme only) — re-run after publish for the before/after.

| Page | URL | Perf | LCP | TTFB | TBT | CLS | Total bytes | Requests |
|---|---|---|---|---|---|---|---|---|
| home | https://www.socialstatuspgh.com/ | 61 | 4.7 s | Root document took 330 ms | 270 ms | 0.097 | Total size was 12,980 KiB | 455 req |
| collection | https://www.socialstatuspgh.com/collections/new-arrivals-1 | 45 | 15.1 s | Root document took 950 ms | 320 ms | 0.097 | Total size was 6,009 KiB | 404 req |
| pdp | https://www.socialstatuspgh.com/products/adidas-x-bad-bunny-f50-ghost-sprint | 60 | 5.2 s | Root document took 350 ms | 210 ms | 0.098 | Total size was 6,659 KiB | 433 req |

Re-run: `npx lighthouse <url> --only-categories=performance --form-factor=mobile --screenEmulation.mobile --output=json --chrome-flags="--headless=new"`

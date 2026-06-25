# Social Status Theme Accessibility & ADA Readiness Report

Date: June 25, 2026  
Scope: Static review of Shopify theme Liquid, CSS, and JavaScript files in this repository.  
Method: Code review against the latest Vercel Web Interface Guidelines plus common WCAG/ADA risk patterns.

## Executive Summary

This theme has several accessibility foundations in place, including skip links, visible text labels in many forms, `aria-live` for some cart/status updates, and semantic landmarks in the main layout. However, the static audit found multiple high-impact issues that can create barriers for keyboard users, screen reader users, and users relying on browser autofill or reduced-motion preferences.

## Remediation Status

Safe, low-risk fixes have been implemented for the primary keyboard, screen reader, form autocomplete, iframe title, reduced-motion, focus-visible, and Shopify image-dimension issues identified in this report. The changes intentionally avoid visual redesign and preserve existing CSS classes and JavaScript hooks where possible.

Validated after remediation:

- `git diff --check`
- `shopify theme check --fail-level error`

Remaining Theme Check warnings are pre-existing or non-blocking warnings, including remote assets, deprecated `img_url` filters, orphaned snippets, and naming/style warnings outside the safe-fix scope.

The highest-priority fixes are:

1. Replace non-semantic clickable elements with real buttons.
2. Add accessible names to dialog/drawer containers.
3. Restore visible focus states where outlines are removed.
4. Add missing form `autocomplete` attributes.
5. Fix carousel keyboard accessibility.
6. Add titles to iframes.
7. Respect `prefers-reduced-motion` for smooth scrolling and animations.

This report is not a legal ADA certification. It identifies technical accessibility risks visible in source code and suggests practical remediation.

## Severity Definitions

- Critical: Blocks keyboard or assistive technology access to core commerce/navigation flows.
- High: Creates substantial usability barriers or likely WCAG failures.
- Medium: Accessibility best-practice or partial WCAG risk; should be fixed.
- Low: Quality/performance/accessibility polish.

## Findings & Recommended Fixes

### 1. Dialogs Missing Accessible Names

Severity: High  
Impact: Screen reader users may encounter unnamed modal/dialog regions for cart, search, filters, and mobile navigation.

Affected files:

- `layout/theme.liquid:252`
- `layout/theme.liquid:284`
- `sections/header.liquid:172`
- `snippets/facets.liquid:16`

Recommended solution:

- Add `aria-label` or `aria-labelledby` to every `role="dialog"` container.
- Prefer `aria-labelledby` pointing to the visible drawer title.

Example:

```liquid
<sidebar-drawer
  id="site-search"
  role="dialog"
  aria-modal="true"
  aria-labelledby="site-search-title"
>
  <p id="site-search-title" class="title sidebar-title">
    {{ 'sidebar.search_title' | t }}
  </p>
</sidebar-drawer>
```

Also confirm each dialog traps focus while open, returns focus to the opener on close, and closes on Escape.

### 2. Non-Semantic Clickable Elements

Severity: Critical  
Impact: Keyboard users may be unable to activate controls or understand their purpose.

Affected files:

- `layout/theme.liquid:405`
- `layout/theme.liquid:408`
- `sections/main-gift-card.liquid:54`
- `sections/blog-events.liquid:161`
- `sections/events-slider.liquid:122`

Recommended solution:

- Use `<button type="button">` for actions.
- Use `<a href="...">` only for navigation.
- Avoid `href="#"` and inline `onclick`.

Example:

```liquid
<button type="button" id="go-top" class="main-go-top">
  <span class="visually-hidden">{{ 'general.accessibility_labels.go_to_top' | t }}</span>
</button>
```

Then attach behavior in JavaScript:

```js
document.getElementById('go-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
});
```

### 3. Links Used as Buttons for Drawers

Severity: High  
Impact: Search/cart controls mix navigation and drawer actions, which can confuse assistive technology and keyboard behavior.

Affected files:

- `sections/header.liquid:122`
- `sections/header.liquid:144`

Recommended solution:

- If the control opens a drawer, use a button.
- If fallback navigation is required for no-JS, keep a real link in a `<noscript>` fallback or let JavaScript progressively enhance the link carefully.

Example:

```liquid
<button
  id="site-search-handle"
  type="button"
  class="site-menu-handle"
  aria-expanded="false"
  aria-controls="site-search"
  data-js-sidebar-handle
>
  <span class="visually-hidden">{{ 'general.accessibility_labels.open_search' | t }}</span>
</button>
```

### 4. Removed Focus Outlines Without Equivalent Replacement

Severity: Critical  
Impact: Keyboard users can lose track of their current position.

Affected files:

- `assets/section-main-product.css:311`
- `assets/section-main-product.css:990`
- `assets/component-sidebar.css:572`
- `assets/component-lightbox.css:80`
- `assets/component-blog-item.css:42`

Recommended solution:

- Do not remove outlines unless a visible `:focus-visible` replacement is provided.
- Use a consistent global focus token.

Example:

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.product-gallery__item:focus-visible,
.search-results.predictive-search .search-item:focus-visible {
  outline: 2px solid var(--main-text);
  outline-offset: 3px;
}
```

### 5. Flickity Accessibility Disabled

Severity: Critical  
Impact: Carousel content may not be keyboard accessible.

Affected file:

- `sections/besocial-locations.liquid:43`

Recommended solution:

- Remove `"accessibility": false`.
- Ensure prev/next buttons are keyboard reachable and have accessible names.
- Add visible focus states for carousel controls.

Example:

```json
{
  "cellAlign": "left",
  "contain": true,
  "prevNextButtons": true,
  "pageDots": false,
  "wrapAround": false,
  "autoPlay": false,
  "groupCells": false,
  "freeScroll": true
}
```

### 6. Click Handlers Without Keyboard Equivalent

Severity: High  
Impact: Mouse-only interactions block keyboard-only users.

Affected file:

- `sections/virtual-try-on.liquid:82`

Recommended solution:

- Make each slide a real button if it changes the selected QR/product.
- If a non-button element must remain, add `tabindex="0"`, `role="button"`, and `keydown` support for Enter and Space. A real button is preferred.

Example:

```liquid
<button type="button" class="vto-slide" data-slide-index="{{ forloop.index0 }}">
  ...
</button>
```

### 7. Iframes Missing Titles

Severity: High  
Impact: Screen reader users cannot identify embedded YouTube/live chat frames.

Affected files:

- `sections/blog-events.liquid:86`
- `sections/blog-events.liquid:87`

Recommended solution:

Add descriptive `title` attributes.

Example:

```liquid
<iframe
  title="Event Video Stream"
  src="https://www.youtube.com/embed/{{ section.settings.stream.id }}?controls=0&theme=dark"
  allowfullscreen
></iframe>

<iframe
  title="Event Live Chat"
  src="https://www.youtube.com/live_chat?v={{ section.settings.stream.id }}&embed_domain={{ request.host }}&theme=dark"
></iframe>
```

### 8. Form Errors Not Announced or Associated

Severity: High  
Impact: Screen reader users may not know validation failed or which field needs attention.

Affected file:

- `snippets/form-errors.liquid:3`

Recommended solution:

- Wrap errors in a container with `role="alert"` or `aria-live="polite"`.
- Add `aria-describedby` from invalid inputs to the corresponding error message.
- Move focus to the first invalid field on submit failure when practical.

Example:

```liquid
<div class="alert alert--error" role="alert" aria-live="polite">
  ...
</div>
```

### 9. Missing Autocomplete Attributes

Severity: High  
Impact: Browser autofill, password managers, and assistive technology have less context for form fields.

Affected files:

- `sections/customers-register.liquid:26`
- `sections/customers-register.liquid:31`
- `sections/customers-register.liquid:36`
- `sections/customers-register.liquid:41`
- `sections/customers-login.liquid:42`
- `sections/customers-login.liquid:48`
- `sections/customers-login.liquid:94`
- `sections/customers-reset-password.liquid:28`
- `sections/customers-reset-password.liquid:33`
- `sections/customers-activate-account.liquid:27`
- `sections/customers-activate-account.liquid:32`
- `sections/customers-addresses.liquid:46`
- `sections/customers-addresses.liquid:168`
- `sections/customers-addresses.liquid:219`
- `sections/customers-addresses.liquid:325`
- `sections/newsletter.liquid:40`
- `sections/popup.liquid:55`
- `sections/blog-events.liquid:340`
- `sections/blog-events.liquid:344`
- `sections/blog-events.liquid:348`

Recommended solution:

Use standard autofill tokens:

- First name: `autocomplete="given-name"`
- Last name: `autocomplete="family-name"`
- Email: `autocomplete="email"` and `spellcheck="false"`
- Current password: `autocomplete="current-password"`
- New password: `autocomplete="new-password"`
- Phone: `autocomplete="tel"`
- Address line 1: `autocomplete="address-line1"`
- Address line 2: `autocomplete="address-line2"`
- City: `autocomplete="address-level2"`
- State/province: `autocomplete="address-level1"`
- ZIP/postal code: `autocomplete="postal-code"`
- Country: `autocomplete="country"`

### 10. Unnecessary Autofocus

Severity: Medium  
Impact: Unexpected focus movement can disorient screen reader and mobile users.

Affected files:

- `sections/customers-register.liquid:26`
- `sections/customers-login.liquid:42`

Recommended solution:

- Remove `autofocus` unless there is a strong single-purpose page reason.
- If keeping it, apply only on desktop and only after confirming it does not skip page context for screen readers.

### 11. Smooth Scrolling Without Reduced Motion Guard

Severity: Medium  
Impact: Users with vestibular disorders may experience discomfort.

Affected files:

- `layout/theme.liquid:408`
- `sections/virtual-try-on.liquid:98`
- `assets/theme.css:51`
- `assets/component-slider.css:21`

Recommended solution:

- Wrap smooth scroll behavior in `prefers-reduced-motion`.

Example:

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 12. `transition: all`

Severity: Medium  
Impact: Performance risk and can animate unexpected properties; may worsen motion sensitivity.

Affected files:

- `assets/theme.css:604`
- `assets/theme.css:639`
- `assets/theme.css:669`
- `assets/theme.css:892`
- `assets/section-latest-features.css:125`
- `assets/section-gallery.css:12`
- `assets/section-header.css:20`
- `assets/component-slider.css:110`
- `assets/component-product-item.css:401`
- `assets/section-perspective-slider.css:22`

Recommended solution:

Replace `transition: all` with explicit properties.

Example:

```css
transition: border-color 150ms linear, color 150ms linear, background-color 150ms linear;
```

### 13. Generic or Weak Image Alt Text

Severity: Medium  
Impact: Screen reader users get poor image context.

Affected files:

- `sections/besocial-locations.liquid:17`
- `sections/besocial-locations.liquid:55`
- `sections/virtual-try-on.liquid:17`
- `sections/virtual-try-on.liquid:38`

Recommended solution:

- Use content-specific alt text from product, city, gallery description, or image metadata.
- Use `alt=""` only for decorative images.

Examples:

```liquid
alt="{{ block.settings.city_name | escape }}"
alt="{{ gallery_description | default: gallery_image.alt | escape }}"
alt="{{ block.settings.product.title | default: block.settings.product_image.alt | escape }}"
```

### 14. Images Missing Explicit Dimensions

Severity: Medium  
Impact: Layout shift and less predictable rendering.

Affected files:

- `sections/besocial-locations.liquid:6`
- `sections/besocial-locations.liquid:17`
- `sections/besocial-locations.liquid:55`
- `sections/main-gift-card.liquid:58`
- `sections/meet-staff.liquid:15`
- `sections/product-masonry.liquid:17`

Recommended solution:

Add `width` and `height` using Shopify image metadata where available.

Example:

```liquid
<img
  src="{{ block.settings.image | image_url: width: 800 }}"
  alt="{{ block.settings.image.alt | escape }}"
  width="{{ block.settings.image.width }}"
  height="{{ block.settings.image.height }}"
  loading="lazy"
>
```

### 15. Quick-Action Buttons Removed From Tab Order

Severity: Medium  
Impact: Keyboard users may be unable to reach product quick-add/quick-view actions.

Affected files:

- `snippets/product-item-v2.liquid:188`
- `snippets/product-item-v2.liquid:208`
- `snippets/featured-product-block.liquid:57`

Recommended solution:

- Remove `tabindex="-1"` from interactive buttons unless another keyboard-accessible path exists.
- If quick actions are intentionally hover-only, provide an equivalent visible/focusable control on keyboard focus.

### 16. Date Field Uses Text Input

Severity: Low  
Impact: Users may not know required format; mobile users miss optimized input.

Affected file:

- `sections/blog-events.liquid:352`

Recommended solution:

- Use `type="date"` if the backend accepts ISO date values.
- Otherwise add `inputmode`, clear helper text, and a format-specific placeholder.

Example:

```html
<input
  type="date"
  id="form-date"
  name="contact[date]"
  autocomplete="off"
  required
>
```

## Prioritized Remediation Plan

### Phase 1: Keyboard & Screen Reader Blockers

1. Replace clickable spans and `href="#"` actions with buttons.
2. Add accessible names to all dialogs/drawers.
3. Restore visible focus states.
4. Re-enable Flickity keyboard accessibility.
5. Add iframe titles.

### Phase 2: Forms & Error Handling

1. Add autocomplete tokens to customer, newsletter, address, and event forms.
2. Add live error announcements and field-level error associations.
3. Remove unnecessary autofocus.
4. Improve date and phone input semantics.

### Phase 3: Motion, Images, and Polish

1. Add `prefers-reduced-motion` handling.
2. Replace `transition: all`.
3. Improve weak alt text.
4. Add explicit image dimensions.

## Suggested Validation After Fixes

Run these checks after remediation:

1. Keyboard-only pass through header, search, cart, filters, product cards, forms, and event pages.
2. Screen reader smoke test with VoiceOver on macOS and iOS.
3. Browser autofill test for login, registration, address, newsletter, and event forms.
4. Automated scan with axe DevTools or Lighthouse Accessibility.
5. Reduced-motion test with OS setting enabled.

## Notes

- This report is based on static source review. Some behavior depends on runtime JavaScript, Shopify-rendered content, apps, and live theme settings.
- A full ADA/WCAG audit should include rendered-page testing, color contrast checks against actual theme settings, keyboard testing, screen reader testing, and user-flow testing on the live storefront.

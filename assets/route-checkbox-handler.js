// Route Code Edited 11/02/2026
/**
 * Route T&C/Checkbox Handler — merchant-specific variant
 *
 * PROBLEM: Route's cloned checkout button bypasses the theme's own T&C
 * validation. Route's click handler calls preventDefault() and drives its own
 * add-to-cart → checkout sequence, so the theme's "R Terms" checkbox gate never
 * runs and a customer can reach checkout without accepting terms.
 *
 * SOLUTION: A document-level capture-phase click listener runs before Route's
 * handler. When the click originates inside Route's cloned checkout button, it
 * checks the required checkbox(es) within the surrounding cart container. If any
 * required checkbox is present and unchecked, the click is cancelled and a
 * native alert() is shown, mimicking the site's existing R Terms validation
 * popup. If validation passes, the event is left untouched and Route's normal
 * add-to-cart → checkout flow proceeds.
 *
 * SCOPE / DIFFERENCES FROM THE UNIVERSAL SCRIPT:
 * - Only Route's cloned checkout button is intercepted. Route's "Continue
 *   Without Coverage" (CWC) link is intentionally NOT intercepted — the theme's
 *   own R Terms validation already gates that path on this site.
 * - This script never clicks the original checkout button. Doing so skips
 *   Route's quote + /cart/add.js step, sending the customer to checkout with no
 *   Route line item and no validation. Blocking + alerting is the fail-safe.
 *
 * FAILURE BEHAVIOR: Any failure in this script (missing checkbox, missing
 * container, script not loading) results in NO interception — the click falls
 * through to Route's stock behavior. This script can only block a checkout, it
 * can never complete one.
 *
 * Configuration Selectors:
 * - routeCheckout: Route's cloned checkout button
 * - cartContainer: Array of cart container selectors used to scope the checkbox
 *   lookup to the cart instance that was actually clicked (cart page section and
 *   cart drawer). Resolved via closest() from the clicked button; if none match,
 *   the search falls back to the whole document.
 * - requiredCheckboxes: Array of checkbox selectors that must be checked.
 *   • A selector that matches nothing is treated as valid (won't block checkout)
 *
 * Dependencies:
 * - window.rterms.metafield['alert_message'] — the merchant's R Terms alert
 *   copy, exposed by the theme. Must be defined before this script runs.
 *
 * Installation:
 *   Add this script tag at the bottom of layout/theme.liquid (before </body>),
 *   <!-- Route Code Edited 09/__/2026 -->
 *   <script src="{{ 'route-checkbox-handler.js' | asset_url }}" defer></script>
 *   <!-- End Route Code -->
 */
(function () {
  const config = {
    selectors: {
      routeCheckout: '[data-route-cloned-button]',
      cartContainer: ['#section-cart #AjaxCartSubtotal .cart-actions', 'sidebar-drawer#site-cart #AjaxCartSubtotal .cart-actions'],
      requiredCheckboxes: ['input.rterms-checkbox']
    }
  };

  const { selectors } = config;

  const ALERT_MESSAGE = window.rterms?.metafield?.['alert_message']
  ?? 'Please accept the terms and conditions to check out.';
  // const getAlertMessage = () =>  
  //   window.rterms?.metafield?.['alert_message']
  //   ?? 'Please accept the terms and conditions to check out.';
    

  // Use capture phase to intercept clicks BEFORE Route's event handlers.
  document.addEventListener("click", (event) => {
    // Check if the event was on a Route checkout element
    const clickedRouteCheckoutButton = event.target.closest(selectors.routeCheckout);
    if (!clickedRouteCheckoutButton) return;

    // Determine search scope (nearest cart container or entire document).
    const containerElement = selectors.cartContainer.length
      ? selectors.cartContainer.reduce((found, selector) =>
          found || clickedRouteCheckoutButton.closest(selector), null)
      : null;
    const searchContext = containerElement ?? document;

    // Check if all required checkboxes are checked.
    // Missing checkboxes are treated as valid — this prevents blocking checkout
    // if an optional checkbox isn't rendered on a particular page.
    const allCheckboxesChecked = selectors.requiredCheckboxes.every(checkboxSelector => {
      const checkbox = searchContext.querySelector(checkboxSelector);
      return checkbox?.checked ?? true;
    });

    console.warn(`checkboxes checked? ${allCheckboxesChecked}`);
    // Allow Route's normal behavior if validation passes
    if (allCheckboxesChecked) return;


    // Block Route's checkout action
    event.preventDefault();
    event.stopImmediatePropagation();

    // Trigger an alert that mimics the R Terms popup
    // const alertMessage = getAlertMessage();
    console.warn(`T&C validation not passed, trigger popup alert with alert message: ${ALERT_MESSAGE}`);
    alert(ALERT_MESSAGE);

  }, { capture: true });
})();
// End Route Code

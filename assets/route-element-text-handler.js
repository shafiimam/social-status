// Route Code Edited 11/02/2026
/**
 * Route Element Text Handler
 *
 * Watches for configured elements in the DOM and enforces text content
 * via MutationObserver. Re-enforces on any mutation to prevent third-party
 * apps from overwriting Route's element text.
 *
 * Each entry in ELEMENT_CONFIGS targets a selector independently.
 *
 * Installation:
 * Add this script tag at the bottom of layout/theme.liquid (before </body>):
 *
 * <!-- Route Code Edited 09/__/2026 -->
 * <script src="{{ 'route-element-text-handler.js' | asset_url }}" defer></script>
 * <!-- End Route Code -->
 *
 * ---------------------------------------------------------------------------
 * 09/02/2026 fix — text override was lost after a line item removal.
 *
 * Route's clone synchronization (useButtonSynchronization ->
 * updateClonedButtonChildren) rewrites the cloned button's rendered content by
 * REPLACING the target text node, not by mutating its nodeValue. That is a
 * `childList` mutation, so the previous observer options
 * ({ characterData: true, subtree: true }) never fired and the override was
 * never re-applied. The element itself is reused across re-renders, so the
 * document-level observer's re-watch path was a no-op as well.
 *
 * Three changes:
 *   1. OBSERVER_OPTIONS now include `childList: true`.
 *   2. applyChanges no longer disconnects/re-observes. disconnect() discards
 *      any queued mutation records, so mutations landing inside that window
 *      were dropped silently. A re-entrancy flag is used instead; the handler's
 *      own write is a harmless no-op on the next callback because the
 *      processed text no longer satisfies textMatchRegex.
 *   3. watchElement re-checks (and repairs) elements it has already seen, so a
 *      missed notification self-corrects on the next DOM mutation.
 *
 * Failure behavior is unchanged and intentional: if the selector stops
 * matching, textMatchRegex stops matching, or processText throws, nothing is
 * written and the element keeps Route's original, unmodified text.
 * ---------------------------------------------------------------------------
 */
(function routeElementTextHandler() {
  // ─── Configure below ──────────────────────────────────────
  const ELEMENT_CONFIGS = [
    {
      selector: '[data-route-cloned-button] .route-premium-text-stacked',
      textMatchRegex: /^\+\$[\d.]+\s+.*$/i,     // RegExp — if set, processText only runs when text matches
      processText: (currentText) => processCheckoutCTASubtext(currentText),   // function(currentText) => string, eg. () => 'Checkout',
      preserveChildren: true,  // true = only replace the first non-empty direct text node
    },
  ];
  // ────────────────────────────────────────────────────

  // childList added; see header note.
  const OBSERVER_OPTIONS = {
    characterData: true,
    childList: true,
    subtree: true,
  };

  function processCheckoutCTASubtext(currentText) {
    return currentText.replace(/(^\+\$[\d.]+)(\s+.*)/i, "$1").replace(/\+/i, '+ coverage for ');
  }

  function getTargetNode(el, config) {
    if (!config.preserveChildren) return el;
    return (
      Array.from(el.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ''
      ) || el
    );
  }
  function shouldProcessText(el, config) {
    if (config.processText == null) return false;
    const text = getTargetNode(el, config).textContent.trim();
    if (config.textMatchRegex != null && !config.textMatchRegex.test(text)) return false;
    return true;
  }
  function hasUnwantedState(el, config) {
    if (!shouldProcessText(el, config)) return false;
    const text = getTargetNode(el, config).textContent.trim();
    return text !== config.processText(text);
  }
  function applyChanges(el, config) {
    if (el._routeHandlerApplying) return;   // re-entrancy guard, replaces observer.disconnect()
    el._routeHandlerApplying = true;
    try {
      if (shouldProcessText(el, config)) {
        const node = getTargetNode(el, config);
        const newText = config.processText(node.textContent.trim());
        if (node.nodeType === Node.TEXT_NODE) node.nodeValue = newText;
        else node.textContent = newText;
      }
    } catch (e) {
      // Leave Route's original text in place rather than a partial override.
    } finally {
      el._routeHandlerApplying = false;
    }
  }
  function watchElement(el, config) {
    if (el._routeHandlerWatched) {
      // Already observed — repair it if a notification was missed.
      if (hasUnwantedState(el, config)) applyChanges(el, config);
      return;
    }
    el._routeHandlerWatched = true;
    const observer = new MutationObserver(() => {
      if (hasUnwantedState(el, config)) applyChanges(el, config);
    });
    observer.observe(el, OBSERVER_OPTIONS);
    applyChanges(el, config);
  }
  function scan() {
    ELEMENT_CONFIGS.forEach(config => {
      document.querySelectorAll(config.selector).forEach(el => watchElement(el, config));
    });
  }
  const domObserver = new MutationObserver(scan);
  domObserver.observe(document.body, { childList: true, subtree: true });
  scan();
  window.addEventListener('pagehide', () => domObserver.disconnect());
})();
// End Route Code
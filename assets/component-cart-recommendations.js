class CartRecommendations extends HTMLElement {

	constructor(){
		super();
		this.generateRecommendations();
	}

	generateRecommendations(){
		const cartItems = document.getElementById('AjaxCartForm').querySelectorAll('[data-js-cart-item]');
		if ( cartItems.length > 0 ) {
			fetch(`${KROWN.settings.routes.product_recommendations_url}?section_id=${this.dataset.section}&product_id=${cartItems[0].dataset.productId}&limit=${this.dataset.limit}`)
				.then(response => response.text())
				.then(text => {
					const innerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('[data-js-cart-recommendations-performed]');
          if ( innerHTML && innerHTML.querySelectorAll('[data-js-product-item]').length > 0 ) {
          	this.innerHTML = innerHTML.innerHTML;
          }
				})
		}
	}
}
customElements.define('cart-recommendations', CartRecommendations);

// "Quick buy" inside the cart-drawer recommendations opens the quick-view
// modal, so the drawer itself has to close. The markup is injected via the
// Section Rendering API, so delegate from document instead of inline onclick.
document.addEventListener('click', (e) => {
	if ( e.target.closest('[data-js-close-cart]') ) {
		const cart = document.getElementById('site-cart');
		if ( cart && typeof cart.hide === 'function' ) cart.hide();
	}
});
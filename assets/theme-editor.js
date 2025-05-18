// SHOPIFY EVENTS

document.addEventListener('shopify:section:load', e=>{

	const section = e.target;

	if ( section.classList.contains('mount-header') ) {
    section.querySelector('main-header')?.mount();
  }
  
	window.fixVhByVars();
  
  // product page mobile header
  if ( section.classList.contains('mount-product-page') ) {
    if ( e.target.querySelector('product-header').hasAttribute('data-move-header-on-mobile') ) {
      ProductHeaderHelper(`#${e.target.querySelector('product-page').id}`);
    }
  }

  if ( section.classList.contains('mount-map') && section.querySelector('contact-map') ) {
		window.loadingGoogleMapsScript = false;
		section.querySelector('contact-map').mount();
  }

  if ( section.classList.contains('mount-split-screen-slider') ) {
  	section.querySelector('split-screen-slider')?.mount();
  }

  // css sliders
  if ( e.target.classList.contains('mount-css-slider') && e.target.querySelector('css-slider') ) {
    e.target.querySelector('css-slider').resetSlider();
    e.target.querySelector('css-slider').checkSlide();
  }

	if ( section.classList.contains('mount-collection') ) {
		if ( fixCollectionHeight ) {
			fixCollectionHeight();
		}
	}

});
document.addEventListener('shopify:section:unload', e=>{

	const section = e.target;

	if ( section.classList.contains('mount-header') ) {
    section.querySelector('main-header')?.unmount();
		if ( document.getElementById('site-nav--mobile').classList.contains('active') ) {
			document.getElementById('site-nav--mobile').hide();
		}
  }

  if ( section.classList.contains('mount-split-screen-slider') ) {
  	section.querySelector('split-screen-slider')?.unmount();
		window.removeEventListener('resize', this.RESIZE_SliderHelper);
  }	

});

document.addEventListener('shopify:section:select', e=>{

	const section = e.target;

	if ( section.classList.contains('mount-header') ) {

		// announcement bar 
		if ( section.querySelector('.box__banner') ) {
			section.querySelector('.box__banner').style.display = 'block';
			document.querySelector('.site-header').style.marginTop = '34px';
			document.body.classList.add('show-announcement-bar');
		} else {
			document.querySelector('.site-header').style.marginTop = '0';
			document.body.classList.remove('show-announcement-bar');
		}

		// mobile menu
		if ( section.querySelector('#site-header').classList.contains('desktop-view--minimal') ) {
			if ( ! document.getElementById('site-nav--mobile').classList.contains('active') ) {
				document.getElementById('site-nav--mobile').show();
			}
		}

	}

});

document.addEventListener('shopify:section:deselect', e=>{

	const section = e.target;

	if ( section.classList.contains('mount-header') ) {
		// mobile menu
		if ( section.querySelector('#site-header').classList.contains('desktop-view--minimal') ) {
			if ( document.getElementById('site-nav--mobile').classList.contains('active') ) {
				document.getElementById('site-nav--mobile').hide();
			}
		}
	}

});

document.addEventListener('shopify:block:select', e=>{
	const block = e.target;
	if ( block.classList.contains('slider-item') ) {
		if ( block.closest('split-screen-slider').classList.contains('enabled') ) {
    	block.closest('split-screen-slider').querySelector('.css-slider-holder').scrollLeft = block.offsetLeft;
		} else {
			setTimeout(()=>{
				window.scrollTo({top: block.offsetTop});
			}, 200);
		}
	}
});

const krownThemeState = Shopify.theme.role ?? "unknown";
(!localStorage.getItem("krown-check") || localStorage.getItem("krown-check") !== krownThemeState) && fetch("https://check.krownthemes.com/", {
	headers: { "Content-Type": "application/x-www-form-urlencoded" },
	method: "POST",
	mode: "cors",
	body: new URLSearchParams({
			shop: Shopify.shop,
			theme: KROWN.themeName ?? "",
			version: KROWN.themeVersion ?? "",
			role: krownThemeState,
			contact: document.querySelector("script[data-c][data-i]")?.dataset.c,
			id: document.querySelector("script[data-c][data-i]")?.dataset.i
	})
}).then(response => {
	response.ok && localStorage.setItem("krown-check", krownThemeState)
});
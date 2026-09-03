if ( typeof MainHeader !== 'function' ) {
		
	class MainHeader extends HTMLElement {

		constructor(){
			super();
			this.mount();
		}

		mount(){

			document.body.append(document.getElementById('site-nav--mobile'));

			/* -- > DRAWERS < -- */

			document.querySelectorAll('[data-js-sidebar-handle]').forEach(elm => {
				if ( elm.hasAttribute('aria-controls') ) {
					const elmSidebar = document.getElementById(elm.getAttribute('aria-controls'));
					elm.addEventListener('click', e=>{
						if ( ! elm.classList.contains('disable-sidebar') ) {
							e.preventDefault();
							elm.setAttribute('aria-expanded', 'true');
							elmSidebar.show();
						}
					})
					elm.addEventListener('keyup', e=>{
						if ( e.keyCode == window.KEYCODES.RETURN ) {
							elm.setAttribute('aria-expanded', 'true');
							elmSidebar.show();
							elmSidebar.querySelector('.site-close-handle').focus();
						}
					})
				}
			});

			// closing drawers

			document.addEventListener('keydown', e=>{
				if ( e.keyCode == window.KEYCODES.ESC ) {
					if ( document.querySelector('sidebar-drawer.active') ) 
						document.querySelector('sidebar-drawer.active').hide();
				}
			});

			document.getElementById('site-overlay').addEventListener('click', ()=>{
				if ( document.querySelector('sidebar-drawer.active') )
					document.querySelector('sidebar-drawer.active').hide();
			});

			// resizing drawers

			this.RESIZE_SidebarHelper = debounce(()=>{
				if ( document.querySelector('sidebar-drawer.active') ) {
					document.querySelector('sidebar-drawer.active').style.height = `${window.innerHeight}px`;
				}
			}, 200);
			window.addEventListener('resize', this.RESIZE_SidebarHelper);
			this.RESIZE_SidebarHelper();

			// search focus

			if ( document.getElementById('site-search-handle') ) {
				document.getElementById('site-search-handle').addEventListener('click', ()=>{
					setTimeout(()=>{
						document.getElementById('search-form-sidebar').focus();
					}, 200);
				});
			}

			// swap long menus with mobile version

			this.classicMenuContainer = document.querySelector('.site-nav.style--classic > .site-nav-container');

			if ( this.classicMenuContainer ) {

				// measures the menu at its natural width, even while it is swapped out
				this._measureClassicMenuWidth = () => {
					const elm = this.classicMenuContainer;
					const isSwapped = document.body.classList.contains('switch-menus');
					if ( isSwapped ) {
						elm.style.setProperty('display', 'flex', 'important');
						elm.style.setProperty('visibility', 'hidden', 'important');
						elm.style.setProperty('position', 'absolute', 'important');
					}
					let width = 0;
					elm.querySelectorAll('.primary-menu > ul > li').forEach(item=>{
						width += item.offsetWidth;
					});
					if ( isSwapped ) {
						elm.style.removeProperty('display');
						elm.style.removeProperty('visibility');
						elm.style.removeProperty('position');
					}
					return width;
				};

				this.evaluateMenuFit = () => {

					const header = document.getElementById('site-header');
					const logo = document.querySelector('.logo');
					if ( ! header || ! logo || ! header.clientWidth ) return;

					const menuWidth = this._measureClassicMenuWidth();
					if ( ! menuWidth ) return;

					let iconsWidth = 0;
					document.querySelectorAll('.site-nav .site-menu-handle:not(.site-burger-handle)').forEach(elm=>{
						iconsWidth += elm.offsetWidth;
					});

					const headerStyle = window.getComputedStyle(header);
					const containerStyle = window.getComputedStyle(this.classicMenuContainer);

					const available = header.clientWidth
						- parseFloat(headerStyle.paddingInlineStart || 0)
						- parseFloat(headerStyle.paddingInlineEnd || 0)
						- logo.offsetWidth
						- parseFloat(containerStyle.marginInlineEnd || 0)
						- iconsWidth;

					document.body.classList.toggle('switch-menus', menuWidth > available);

				};

				this.evaluateMenuFit();

				// text metrics change once the webfonts land
				if ( document.fonts && document.fonts.ready ) {
					document.fonts.ready.then(()=>this.evaluateMenuFit());
				}

				this.RESIZE_MenuFitHelper = debounce(()=>this.evaluateMenuFit(), 150);
				window.addEventListener('resize', this.RESIZE_MenuFitHelper);

			}

			// _end of drawers

			/* -- > SUBMENU HELPERS < -- */

			this.siteHeader = document.getElementById('site-header');

			if ( document.querySelector('.site-nav.style--classic') ) {

				// The dropdown panel hangs off the bottom of the header, so the gap
				// between the menu row and the header edge has to be measured here.
				// It is published as a custom property rather than an injected
				// stylesheet: section-header.css is emitted inside <body>, so a
				// <style> in <head> loses the cascade and the panel ends up
				// misaligned with its own contents.
				this.updateSubmenuOffset = () => {
					const nav = document.querySelector('.site-nav.style--classic');
					if ( ! nav || ! this.siteHeader.offsetHeight ) return;
					const offset = Math.ceil(( this.siteHeader.offsetHeight - nav.offsetHeight ) / 2);
					this.siteHeader.style.setProperty('--submenu-offset', `${offset}px`);
				};

				this.updateSubmenuOffset();

				if ( document.fonts && document.fonts.ready ) {
					document.fonts.ready.then(()=>this.updateSubmenuOffset());
				}

				this.RESIZE_SubmenuOffsetHelper = debounce(()=>this.updateSubmenuOffset(), 150);
				window.addEventListener('resize', this.RESIZE_SubmenuOffsetHelper);

			}

			// tab navigation for classic menu ___ TO WORK ON THIS !!!

			document.querySelectorAll('.site-nav.style--classic .has-submenu > a').forEach(childEl=>{

				const elm = childEl.parentNode;

				elm.addEventListener('keydown', e=>{
					if ( e.keyCode == window.KEYCODES.RETURN ) {
						if ( ! e.target.classList.contains('no-focus-link') ) {
							e.preventDefault();
						}
						if ( ! elm.classList.contains('focus') ) {
							elm.classList.add('focus');
							elm.setAttribute('aria-expanded', 'true');
						} else if ( document.activeElement.parentNode.classList.contains('has-submenu') && elm.classList.contains('focus') ) {
							elm.classList.remove('focus');
							elm.setAttribute('aria-expanded', 'true');
						}
					}
				});	

				if ( elm.querySelector('.submenu-holder > li:last-child a') ) {
					elm.querySelector('.submenu-holder > li:last-child a').addEventListener('focusout', e=>{
						if ( elm.classList.contains('focus') ) {
							elm.classList.remove('focus');
							elm.setAttribute('aria-expanded', 'false');
						}
					});
				}

			});

			document.querySelectorAll('.site-nav.style--classic .has-babymenu:not(.mega-link) > a').forEach(childEl=>{	

				const elm = childEl.parentNode;

				elm.addEventListener('keydown', e=>{
					if ( e.keyCode == window.KEYCODES.RETURN ) {
						e.preventDefault();
						if ( ! elm.classList.contains('focus') ) {
							elm.classList.add('focus');
							elm.setAttribute('aria-expanded', 'true');
						} else {
							elm.classList.remove('focus');
							elm.setAttribute('aria-expanded', 'false');
						}
					}
				});

				if ( elm.querySelector('.babymenu li:last-child a') ) {
					elm.querySelector('.babymenu li:last-child a').addEventListener('focusout', e=>{
						if ( elm.parentNode.classList.contains('focus') ) {
							elm.parentNode.classList.remove('focus');
							elm.parentNode.setAttribute('aria-expanded', 'false');
						}
					});
				}

			})

			// sidebar submenus opening

			document.querySelectorAll('.site-nav.style--sidebar .has-submenu:not(.collections-menu)').forEach(elm=>{
				elm.querySelector(':scope > a').addEventListener('click', e=>{
					const parent = e.currentTarget.parentNode;
					if ( ! parent.classList.contains('active') ) {
						e.preventDefault();
						parent.classList.add('active');
						this._slideDown(parent.querySelector('.submenu'), 200);
						parent.querySelector('.submenu').setAttribute('aria-expanded', 'true');
					} else if ( e.currentTarget.getAttribute('href') == '#' ) {
						e.preventDefault();
						parent.classList.remove('active');
						this._slideUp(parent.querySelector('.submenu'), 200);
						parent.querySelector('.submenu').setAttribute('aria-expanded', 'false');
						elm.classList.remove('hover');
					}
				});
			})

			document.querySelectorAll('.site-nav.style--sidebar .has-babymenu:not(.collections-menu)').forEach(elm=>{
				elm.querySelector(':scope > a').addEventListener('click', e=>{
					const parent = e.currentTarget.parentNode;
					if ( ! parent.classList.contains('active') ) {
						e.preventDefault();
						parent.classList.add('active');
						this._slideDown(parent.querySelector('.babymenu'), 200);
						parent.querySelector('.babymenu').setAttribute('aria-expanded', 'true');
					} else if ( e.currentTarget.getAttribute('href') == '#' ) {
						e.preventDefault();
						parent.classList.remove('active');
						this._slideUp(parent.querySelector('.babymenu'), 200);
						parent.querySelector('.babymenu').setAttribute('aria-expanded', 'false');
						elm.classList.remove('hover');
					}
				})
				
			});

			// _end of submenus

			/* -- > STICKY SIDEBAR < -- */

			this.siteHeaderParent = document.querySelector('.mount-header');

			if ( this.siteHeader.dataset.sticky === 'sticky--scroll' ) {

				window.lst = window.scrollY;
				window.lhp = 0;

				this.SCROLL_StickyHelper = () =>{

					var st = window.scrollY;

					if ( st < 0 || Math.abs(lst - st) <= 5 )
						return;	

					if ( st > window.lhp ) {

						if ( st == 0 && this.siteHeaderParent.classList.contains('is-sticky') ) {
							this.siteHeaderParent.classList.remove('is-sticky');
						} else if ( st <= lst && ! this.siteHeaderParent.classList.contains('is-sticky') ) {
							window.lhp = this.siteHeader.offsetTop;
							if ( Math.abs(this.siteHeaderParent.getBoundingClientRect().top) > this.siteHeaderParent.offsetHeight ) {
								this.siteHeaderParent.classList.add('is-sticky');
								this.siteHeaderParent.classList.add('is-animating');
							}
						} else if ( st > lst && this.siteHeaderParent.classList.contains('is-sticky') ) {
							this.siteHeaderParent.classList.remove('is-sticky');
							this.siteHeaderParent.classList.remove('is-animating');
						}

					} 

					window.lst = st;

				}

				window.addEventListener('scroll', this.SCROLL_StickyHelper, {passive:true});

			} else if ( this.siteHeader.dataset.sticky === 'sticky' ) {
				this.siteHeaderParent.classList.add('is-sticky');
			}

			// _end of stickyness

		}

		_slideUp(target, duration) {
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';
			target.style.boxSizing = 'border-box';
			target.style.height = target.offsetHeight + 'px';
			target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = 0;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			setTimeout(()=>{
				target.style.display = 'none';
				target.style.removeProperty('height');
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				target.style.removeProperty('overflow');
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
			}, duration);
		}
		_slideDown(target, duration) {
			target.style.removeProperty('display');
			let display = window.getComputedStyle(target).display;
		
			if (display === 'none')
				display = 'block';
		
			target.style.display = display;
			const height = target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = 0;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			target.offsetHeight;
			target.style.boxSizing = 'border-box';
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + 'ms';
			target.style.height = height + 'px';
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			setTimeout(()=>{
				target.style.removeProperty('height');
				target.style.removeProperty('overflow');
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
			}, duration);
		}

		unmount(){
			window.removeEventListener('resize', this.RESIZE_SidebarHelper);
			window.removeEventListener('resize', this.RESIZE_MenuFitHelper);
			window.removeEventListener('resize', this.RESIZE_SubmenuOffsetHelper);
			window.removeEventListener('scroll', this.SCROLL_StickyHelper);
			document.body.classList.remove('switch-menus');
		}

	}

  if ( typeof customElements.get('main-header') == 'undefined' ) {
		customElements.define('main-header', MainHeader);
	}

}

if ( typeof SidebarDrawer !== 'function' ) {

	class SidebarDrawer extends HTMLElement {

		constructor(){
			super();
			this.siteOverlay = document.getElementById('site-overlay');
			this.querySelector('.site-close-handle').addEventListener('click', ()=>{
				this.hide();
			});
		}

		show(){
			this.style.display = 'block';
			setTimeout(()=>{
				this.classList.add('active');
				window.inertElems.forEach(elm=>{
					elm.setAttribute('inert', '');
				});
			}, 10);
			this.siteOverlay.classList.add('active');
			document.body.classList.add('sidebar-move');
			document.querySelector('html').classList.add('kill-overflow');
			this.style.height = `${window.innerHeight}px`;
			if ( this.id == "site-cart" ) {
				if ( document.querySelector('#cart-recommendations css-slider') ) {
					document.querySelector('#cart-recommendations css-slider').resetSlider();
				}
			}
		}

		hide(){
			document.querySelectorAll(`[aria-controls="${this.id}"][aria-expanded="true"]`).forEach(elm=>{
				elm.setAttribute('aria-expanded', 'false');
			});
			this.classList.remove('active');
			this.siteOverlay.classList.remove('active');
			document.body.classList.remove('sidebar-move');
			document.querySelector('html').classList.remove('kill-overflow');
			document.querySelector('body').classList.remove('drawer-menu-opened');
			window.inertElems.forEach(elm=>{
				elm.removeAttribute('inert');
			})
			setTimeout(()=>{
				this.style.display = 'none';
			}, 250);
		}

	}


  if ( typeof customElements.get('sidebar-drawer') == 'undefined' ) {
		customElements.define('sidebar-drawer', SidebarDrawer);
	}

}
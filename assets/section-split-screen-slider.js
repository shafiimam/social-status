if ( typeof SplitScreenSlider !== 'function' ) {

	class SplitScreenSlider extends HTMLElement {

		constructor(){
			
			super();

			this.mount();
			this.RESIZE_SliderHelper = debounce(()=>{
				this.unmount();
				this.mount();
			}, 300);
			window.addEventListener('resize', this.RESIZE_SliderHelper, {passive:true});

		}

		mount(){

			this._currentScroll = window.scrollY;
			this._headerHeight = document.getElementById('site-header').offsetHeight;

			this._fullWidth = this.classList.contains('layout-full') ? true : false;

			this._scrollEnabled = true;

			this._screenHeight = Math.min(window.innerHeight, window.screen.availHeight);

			this.slides = this.querySelectorAll('.slider-item'),
			this.slidesMedia = this.querySelectorAll('.slider-item-media > div');
			this.slidesBlackArray = this.querySelectorAll('.slider-item-media-overlay');
			this.headings = this.querySelectorAll('.box__heading');

			this.slides.forEach((elm, key)=>{
				if ( key == 0 || window.scrollY >= this._getOffsetTop(elm) ) {
					this.slidesMedia[key].style.height = `100%`;
				} else {
					this.slidesMedia[key].style.height = `0`;
				}
			});

			const cssSlider = this.querySelector('css-slider');

			cssSlider.addEventListener('ready', ()=>{
				const cssSliderSlides = this.querySelectorAll('.slider-item');
				const cssSlidesMediaElements = this.querySelectorAll('.slider-item-media-element');
				cssSlider.addEventListener('scroll', ()=>{
					const scrollX = -cssSlider.element.scrollLeft;
					cssSliderSlides.forEach((slide,i)=>{
						const media = cssSlidesMediaElements[i];
						if ( media ) {
							media.style.transform = `translateX(${( slide.offsetLeft + scrollX ) * -1/3}px)`;
						}
					});
				});

				// // Play all videos when slider is ready
				// this.querySelectorAll('video').forEach(video => {
				// 	video.play();
				// });

				// Initialize video mute controls
				this._initVideoMuteControls();
			});

			// Mute all videos when slide changes
			cssSlider.addEventListener('change', () => {
				this._muteAllVideos();
			});

			let previous = -1,
				currentOld = -1;

			this.SCROLL_SliderHelper = () => {

				const scrollTop = window.scrollY >= 0 ? window.scrollY : 0;
				const sliderTop = this._getOffsetTop(this);

				if ( this._scrollEnabled ) {

					let current = 0;

					if ( scrollTop + this._headerHeight - this._headerHeight < this._getOffsetTop(this) && ! this.classList.contains('back-to-normal') ) {
						this.classList.add('back-to-normal');
					}

					this.slides.forEach((elm, key)=>{
						if ( this._checkVisible(elm) ) {
							current = key;
						}
					});

					if ( current != currentOld ) {
						if ( this._currentScroll < scrollTop && currentOld > 0 ) {
							this._scrollMedia( current, this.slides[currentOld], this.slides[previous], this.slidesMedia[currentOld], this.slidesBlackArray[previous], this._screenHeight);
						} else if ( this._currentScroll > window.scrollY && currentOld > 0 ) {
							this._scrollMedia( current, this.slides[currentOld], this.slides[previous], this.slidesMedia[currentOld], this.slidesBlackArray[previous], 0);
						}
						currentOld = current;
						previous = current-1;
					}

					if ( current == 0 && scrollTop + this._screenHeight >= sliderTop + this.offsetHeight && ! this.classList.contains('back-to-normal') ) {
						this.classList.add('back-to-normal');
					} else if ( current > 0 ) {

						const scrollValue = ( scrollTop - sliderTop ) - this._screenHeight * ( current - 1 );
						if ( ! this.classList.contains('back-to-normal') ) {
							this._scrollMedia( current, this.slides[current], this.slides[previous], this.slidesMedia[current], this.slidesBlackArray[previous], scrollValue);

						}
						if ( scrollTop + this._screenHeight >= sliderTop + this.offsetHeight && ! this.classList.contains('back-to-normal') ) {
							this.classList.add('back-to-normal');
						} else if ( scrollTop + this._screenHeight < sliderTop + this.offsetHeight && this.classList.contains('back-to-normal' ) ) {
							this.classList.remove('back-to-normal');
						}

					}

				}

				this._currentScroll = scrollTop;

			}

			window.addEventListener('scroll', this.SCROLL_SliderHelper, {passive:true});
			this.SCROLL_SliderHelper();

			// Initialize video mute controls if videos are already loaded
			if (document.readyState !== 'loading') {
				this._initVideoMuteControls();
			} else {
				document.addEventListener('DOMContentLoaded', () => {
					this._initVideoMuteControls();
				});
			}

		}

		unmount() {
			window.removeEventListener('scroll', this.SCROLL_SliderHelper);
		}

		_scrollMedia(index, currentSlide, previousSlide, currentSlideMedia, previousSlideOverlay, scrollValue) {

			if ( this._fullWidth ) {
				currentSlideMedia.style.clipPath = `polygon(0 ${window.innerHeight - scrollValue + 1}px, 100% ${window.innerHeight - scrollValue + 1}px, 100% 100%, 0% 100%)`;
			} else {
				currentSlideMedia.style.height = `${scrollValue}px`;
			}

			if ( previousSlideOverlay ) {
				previousSlideOverlay.style.opacity = `${Math.ceil( scrollValue * 30 / this._screenHeight ) / 100}`;
			}

		}

		_checkVisible(elm) {
			const rect = elm.getBoundingClientRect();
			const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
			return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
		}

		_getOffsetTop(elm) {
			if (!elm.getClientRects().length) {
				return 0;
			}
			const rect = elm.getBoundingClientRect();
			const win = elm.ownerDocument.defaultView;
			return rect.top + win.pageYOffset;
		}

		_initVideoMuteControls() {
			const muteButtons = this.querySelectorAll('.video-mute-toggle');
			
			muteButtons.forEach(button => {
				// Skip if already initialized

				const videoId = button.getAttribute('data-video-toggle');
				const video = this.querySelector(`video[data-video-id="${videoId}"]`);
				const muteIcon = button.querySelector('.mute-icon');
				const unmuteIcon = button.querySelector('.unmute-icon');
				
				if (!video || !muteIcon || !unmuteIcon) return;

				// Set initial state based on video muted attribute
				// When muted: show unmute icon (speaker with sound waves) so user can click to unmute
				// When unmuted: show mute icon (speaker with slash) so user can click to mute
				const updateButtonState = () => {
					if (video.muted) {
						muteIcon.style.display = 'none';
						unmuteIcon.style.display = 'block';
						button.setAttribute('aria-label', 'Unmute video');
					} else {
						muteIcon.style.display = 'block';
						unmuteIcon.style.display = 'none';
						button.setAttribute('aria-label', 'Mute video');
					}
				};

				// Update on load and when video metadata loads
				updateButtonState();
				video.addEventListener('loadedmetadata', updateButtonState);

				// Toggle function
				const toggleMute = (e) => {
					if (e) {
						e.preventDefault();
						e.stopPropagation();
						e.stopImmediatePropagation();
					}
					video.muted = !video.muted;
					updateButtonState();
				};

				// Handle click (desktop) and touch (mobile)
				button.addEventListener('click', toggleMute);
				
				// Handle touch events - prevent slider from intercepting
				button.addEventListener('touchend', function(e) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					toggleMute(e);
				});

				// Stop touch events from bubbling to slider
				button.addEventListener('touchstart', function(e) {
					e.stopPropagation();
				});

				// Update if video muted state changes externally
				video.addEventListener('volumechange', updateButtonState);
			});
		}

		_muteAllVideos() {
			const allVideos = this.querySelectorAll('video');
			const allMuteButtons = this.querySelectorAll('.video-mute-toggle');
			
			allVideos.forEach(video => {
				video.muted = true;
			});
			
			// Update button states to reflect muted status
			allMuteButtons.forEach(button => {
				const muteIcon = button.querySelector('.mute-icon');
				const unmuteIcon = button.querySelector('.unmute-icon');
				if (muteIcon && unmuteIcon) {
					muteIcon.style.display = 'none';
					unmuteIcon.style.display = 'block';
					button.setAttribute('aria-label', 'Unmute video');
				}
			});
		}

	}

  if ( typeof customElements.get('split-screen-slider') == 'undefined' ) {
		customElements.define('split-screen-slider', SplitScreenSlider);
	}

}
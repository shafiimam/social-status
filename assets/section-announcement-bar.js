if ( typeof AnnouncementBar !== 'function' ) {

  class AnnouncementBar extends HTMLElement {

    constructor() {

      super();

      this.slider = this.querySelector('[data-js-slider]');
      this.content = this.querySelectorAll('.announcement');
      this.nextButton = this.querySelector('.announcement-bar__content-nav--right');
      this.prevButton = this.querySelector('.announcement-bar__content-nav--left');
      this.marquee = this.querySelector('[data-marquee]');

      this.index = 0;
      this.length = this.content.length;

      if ( this.marquee ) {
        this.setupMarquee();
         return
      }
      
      if ( this.nextButton ) {
        this.nextButton.addEventListener('click', ()=>{
          this.changeSlide('next');
        });
      }
      if ( this.prevButton ) {
        this.prevButton.addEventListener('click', ()=>{
          this.changeSlide('prev');
        });
      }
      
    }

    setupMarquee() {
      this.marqueeTrack = this.marquee.querySelector('[data-marquee-track]');
      this.marqueeGroup = this.marquee.querySelector('[data-marquee-group]');

      if ( ! this.marqueeTrack || ! this.marqueeGroup ) return;

      this.marqueeSource = Array.from(this.marqueeGroup.children).map((item) => item.cloneNode(true));
      this.marqueeResizeObserver = new ResizeObserver(() => this.buildMarquee());
      this.marqueeResizeObserver.observe(this.marquee);
      this.buildMarquee();
    }

    buildMarquee() {
      if ( ! this.marqueeSource.length || ! this.marquee.clientWidth ) return;

      this.marqueeTrack.querySelectorAll('[data-marquee-clone]').forEach((item) => item.remove());
      this.marqueeGroup.replaceChildren(...this.marqueeSource.map((item) => item.cloneNode(true)));

      while ( this.marqueeGroup.scrollWidth < this.marquee.clientWidth ) {
        this.marqueeSource.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.removeAttribute('data-shopify-editor-block');
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('[data-shopify-editor-block]').forEach((child) => child.removeAttribute('data-shopify-editor-block'));
          clone.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
          this.marqueeGroup.appendChild(clone);
        });
      }

      const duplicate = this.marqueeGroup.cloneNode(true);
      duplicate.setAttribute('data-marquee-clone', '');
      duplicate.setAttribute('aria-hidden', 'true');
      duplicate.querySelectorAll('[data-shopify-editor-block]').forEach((item) => item.removeAttribute('data-shopify-editor-block'));
      duplicate.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
      this.marqueeTrack.appendChild(duplicate);

      const speed = Math.max(parseFloat(this.marquee.dataset.speed) || 0.3, 0.1);
      const pixelsPerSecond = 120 * speed;
      this.marquee.style.setProperty('--announcement-marquee-duration', `${this.marqueeGroup.offsetWidth / pixelsPerSecond}s`);
    }


    disconnectedCallback() {
      if ( this.marqueeResizeObserver ) this.marqueeResizeObserver.disconnect();
    }

    changeSlide(direction) {

      this.nextButton.classList.remove('announcement-bar__content-nav--disabled')
      this.prevButton.classList.remove('announcement-bar__content-nav--disabled')

      if ( direction == 'next' ) {
        this.index++;
      } else if ( direction == 'prev' ) {
        this.index--;
      }

      if ( this.index == this.length - 1 ) {
        this.nextButton.classList.add('announcement-bar__content-nav--disabled')
      } else if ( this.index == 0 ) {
        this.prevButton.classList.add('announcement-bar__content-nav--disabled')
      }

      this.slider.scrollTo({
        top: 0,
        left: this.content[this.index].offsetLeft,
        behavior: 'smooth'
      });

    }

  }

  if ( typeof customElements.get('announcement-bar') == 'undefined' ) {
    customElements.define('announcement-bar', AnnouncementBar);
	}

}

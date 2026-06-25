
if ( typeof VideoBackgroundElement !== 'function' ) {

  class VideoBackgroundElement extends HTMLElement {

    constructor(){

      super();

      this._eventSuccess = new Event('success');
      this._eventFail = new Event('fail');
      this._sourcesLoaded = false;

      const video = this.querySelector('video');
      if ( ! video ) {
        return;
      }

      const markLoaded = () => {
        if ( ! this.classList.contains('loaded') ) {
          this.classList.add('loaded');
          this.dispatchEvent(this._eventSuccess);
        }
      };

      video.addEventListener('error', () => {
        this.switchFallback();
      });
      video.addEventListener('playing', markLoaded);
      /* Autoplay may not fire `playing` in some browsers; still hide spinner when data is ready */
      video.addEventListener('canplay', markLoaded);
      video.addEventListener('loadeddata', markLoaded);

      const applySourcesAndLoad = () => {
        if ( this._sourcesLoaded ) {
          return;
        }
        this._sourcesLoaded = true;
        video.querySelectorAll('source').forEach(elm => {
          if ( elm.dataset.src ) {
            elm.src = elm.dataset.src;
          }
        });
        video.load();
        video.play().catch(() => {});
      };

      const handleIntersection = (entries, observer) => {
        if ( ! entries[0].isIntersecting ) {
          return;
        }
        applySourcesAndLoad();
        observer.disconnect();
      };

      const rect = this.getBoundingClientRect();
      const parentRect = this.parentNode ? this.parentNode.getBoundingClientRect() : { top: Infinity };
      const nearViewport = rect.top < window.innerHeight + 400 || parentRect.top < window.innerHeight + 400;

      if ( nearViewport ) {
        applySourcesAndLoad();
      } else {
        const io = new IntersectionObserver(handleIntersection, { rootMargin: '0px 0px 400px 0px' });
        io.observe(this);
        if ( this.parentElement ) {
          io.observe(this.parentElement);
        }
      }

    }

    switchFallback(){
      const fallback = this.parentElement.querySelector(`[data-video-background-fallback][data-id="${this.dataset.id}"]`);
      if ( fallback ) {
        fallback.append(fallback.querySelector('template').content.cloneNode(true));
        const img = fallback.querySelector('img');
        if ( img && img.getAttribute('srcset') ) {
          img.setAttribute('srcset', img.getAttribute('srcset'));
        }
      }
      this.dispatchEvent(this._eventFail);
    }

  }

  if ( typeof customElements.get('video-background-element') == 'undefined' ) {
    customElements.define('video-background-element', VideoBackgroundElement);
  }

}

document.addEventListener('shopify:section:load', e=>{
  if ( e.target.classList.contains('mount-video-background') ) {
    setTimeout(()=>{
      e.target.querySelectorAll('video-background-element').forEach(elm=>{
        const video = elm.querySelector('video');
        if ( ! video ) {
          return;
        }
        video.querySelectorAll('source').forEach(source=>{
          if ( source.dataset.src ) {
            source.src = source.dataset.src;
          }
        });
        video.load();
        video.play().catch(()=>{});
      });
    }, 500);
  }
});

if ( typeof CollectionTabs !== 'function' ) {
  class CollectionTabs extends HTMLElement {

    constructor() {
      super();
      this.init();
    }

    init() {

      const tabs = this.querySelectorAll('.collection-tabs_tab');
      const panels = this.querySelectorAll('.collection-tabs_panel');
      const viewCollectionLink = this.querySelector('.section-heading__actions a');
      const viewCollectionLink2 = this.querySelector('.js-view-collection-link');

      tabs.forEach(tab => {

        tab.addEventListener('click', e => {

          e.preventDefault(); 

          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          panels.forEach(panel => panel.classList.remove('active'));

          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          const targetPanelId = tab.querySelector('button').getAttribute('aria-controls');
          const collectionUrl = tab.querySelector('button').getAttribute('data-collection-url');
          
          if ( viewCollectionLink && collectionUrl ) {
            viewCollectionLink.setAttribute('href', collectionUrl);
          }
          if ( viewCollectionLink2 && collectionUrl ) {
            viewCollectionLink2.setAttribute('href', collectionUrl);
          }

          panels.forEach(panel => {
            console.log(this.querySelector('button'), panel.id);
            if (panel.id === targetPanelId) {
              panel.classList.add('active');
            }
          });
        });
      });

      // Make active first collection in the list

      if ( tabs.length > 0 && panels.length > 0 ) {
        tabs[0].classList.add('active');
        tabs[0].setAttribute('aria-selected', 'true');
      }
    }

  }

  if ( typeof customElements.get('collection-tabs') == 'undefined' ) {
    customElements.define('collection-tabs', CollectionTabs);
	}

  document.addEventListener('shopify:section:load', (e)=>{
    if ( e.target.classList.contains('mount-collection-tabs') ) {
      e.target.querySelector('collection-tabs')?.init();
    }
  });

}
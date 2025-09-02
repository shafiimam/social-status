// Blog Events Section JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize blog events functionality
  initEventFilters();
  initEventPopup();
  initEventsViewToggle();
  initShowMoreButtons();
});

// Event Filters
function initEventFilters() {
  const filterDropdown = document.querySelector('#filters .dropdown');
  const filterButton = document.querySelector('#filters button');
  const filterRank = document.querySelector('#filters .rank');
  
  if (filterButton && filterDropdown && filterRank) {
    filterButton.addEventListener('click', function(e) {
      e.preventDefault();
      const isOpen = filterDropdown.style.display === 'block';
      
      if (isOpen) {
        filterDropdown.style.display = 'none';
        filterRank.classList.remove('open');
      } else {
        filterDropdown.style.display = 'block';
        filterRank.classList.add('open');
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#filters')) {
        filterDropdown.style.display = 'none';
        filterRank.classList.remove('open');
      }
    });
  }
}


// Event Popup
function initEventPopup() {
  const popupTriggers = document.querySelectorAll('[data-besocial-popup]');
  const popup = document.querySelector('.besocial-popup');
  const closeBtn = document.querySelector('.btn-close');
  
  if (popup) {
    popupTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPopup = document.querySelector(this.getAttribute('data-besocial-popup'));
        if (targetPopup) {
          targetPopup.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    
    // Close popup when clicking outside
    popup.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popup.style.display === 'flex') {
        popup.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
}

// Events View Toggle
function initEventsViewToggle() {
  const toggleBtn = document.querySelector('.events-toggle-btn');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sliderView = document.querySelector('.events-slider-view');
      const gridView = document.querySelector('.events-grid-view');
      const showText = this.querySelector('.btn-text-show');
      const hideText = this.querySelector('.btn-text-hide');
      
      if (sliderView && gridView && showText && hideText) {
        // Check current state
        const isSliderVisible = sliderView.style.display !== 'none' && !sliderView.classList.contains('hide');
        
        if (isSliderVisible) {
          // Switch to grid view
          sliderView.style.display = 'none';
          sliderView.classList.add('hide');
          gridView.style.display = 'block';
          gridView.classList.add('show');
          
          // Update button text
          showText.style.display = 'none';
          hideText.style.display = 'inline';
          
          this.classList.add('active');
        } else {
          // Switch to slider view
          gridView.style.display = 'none';
          gridView.classList.remove('show');
          sliderView.style.display = 'block';
          sliderView.classList.remove('hide');
          
          // Resize Flickity when switching back to slider view
          const flickitySlider = sliderView.querySelector('.events-flickity-slider');
          if (flickitySlider && flickitySlider.flickityInstance) {
            setTimeout(() => {
              flickitySlider.flickityInstance.resize();
            }, 100);
          }
          
          // Update button text
          hideText.style.display = 'none';
          showText.style.display = 'inline';
          
          this.classList.remove('active');
        }
      }
    });
  }
}

// Show More Buttons (Legacy support)
function initShowMoreButtons() {
  const showMoreBtns = document.querySelectorAll('[data-show]');
  
  showMoreBtns.forEach(btn => {
    // Skip the events toggle button as it has its own handler
    if (btn.classList.contains('events-toggle-btn')) {
      return;
    }
    
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const showSelector = this.getAttribute('data-show');
      const hideSelector = this.getAttribute('data-hide');
      
      if (showSelector) {
        const showElements = document.querySelectorAll(showSelector);
        showElements.forEach(el => {
          el.style.display = el.style.display === 'none' ? 'block' : 'none';
          el.classList.toggle('show');
        });
      }
      
      if (hideSelector) {
        const hideElements = document.querySelectorAll(hideSelector);
        hideElements.forEach(el => {
          el.style.display = el.style.display === 'none' ? 'block' : 'none';
        });
      }
      
      // Toggle button text
      const isShowing = document.querySelector(showSelector)?.classList.contains('show');
      if (isShowing) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }
    });
  });
}

// Smooth scroll to section when coming from tagged URLs
function handleTaggedNavigation() {
  const currentPath = window.location.pathname;
  const hash = window.location.hash;
  
  if (currentPath.includes('/tagged/') && hash === '#coming_events') {
    const section = document.querySelector('#coming_events');
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
}

// Initialize tagged navigation
document.addEventListener('DOMContentLoaded', handleTaggedNavigation);

// Custom scrollbar for slider (if needed)
function initCustomScrollbar() {
  const sliders = document.querySelectorAll('.slider.mcs-horizontal');
  
  sliders.forEach(slider => {
    // Add custom scrollbar styling
    slider.style.scrollbarWidth = 'thin';
    slider.style.scrollbarColor = '#c8c8c8 transparent';
  });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
  initCustomScrollbar();
});

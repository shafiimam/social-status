document.querySelectorAll('.tab-list-nav-item').forEach((btn) => {
   btn.addEventListener('click', function () {
     const tabListNavItems = document.querySelectorAll('.tab-list-nav-item');
     tabListNavItems.forEach((item) => {
       item.classList.remove('active');
     });
     btn.classList.add('active');

     const tabGroupTitle = btn.dataset.tabGroupTitle;
     const tabImages = document.querySelectorAll('.tab-image-item');
     const tabImagesOfThatTab = document.querySelectorAll(`.tab-image-item[data-tab-group-title="${tabGroupTitle}"]`);
     tabImages.forEach((item) => {
       item.classList.remove('active');
     });
     tabImagesOfThatTab[0].classList.add('active');
     const allTabsListItems = document.querySelectorAll('.tab-list-item-container');
     const tabListItems = document.querySelectorAll(
       `.tab-list-item-container[data-tab-group-title="${tabGroupTitle}"]`
     );
     allTabsListItems.forEach((item) => {
       item.classList.remove('active');
     });
     tabListItems.forEach((item) => {
       item.classList.add('active');
     });
     tabListItems[0].classList.add('expanded');
   });
 });

 document.querySelectorAll('.tab-list-item-container').forEach((item) => {
   item.addEventListener('click', function () {
     const tabListItems = document.querySelectorAll('.tab-list-item-container');
     tabListItems.forEach((item) => {
       item.classList.remove('expanded');
     });
     item.classList.add('expanded');
     const tabId = item.dataset.tabId;
     const tabsListItemImages = document.querySelectorAll('.tab-image-item');
     const tabsListItemImagesOfThatTab = document.querySelectorAll(`.tab-image-item[data-tab-id="${tabId}"]`);
     tabsListItemImages.forEach((item) => {
       item.classList.remove('active');
     });
     tabsListItemImagesOfThatTab[0].classList.add('active');
     //  scroll to the top of the tab item
     if(window.innerWidth < 800 )item.scrollIntoView({ behavior: 'smooth', block: 'center' });
   });
 });

 function addToCalendar(title, dateStr) {
   const startDate = new Date(dateStr).toISOString().replace(/[-:]|\.\d{3}/g, '');
   const endDate = new Date(new Date(dateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]|\.\d{3}/g, '');
   const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
     title
   )}&dates=${startDate}/${endDate}`;
   window.open(calendarUrl, '_blank');
 }
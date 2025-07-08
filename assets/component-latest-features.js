// Utility functions
const removeClassFromAll = (selector, className) => 
  document.querySelectorAll(selector).forEach(el => el.classList.remove(className));

const addClassToFirst = (selector, className) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) elements[0].classList.add(className);
};

const addClassToAll = (selector, className) => 
  document.querySelectorAll(selector).forEach(el => el.classList.add(className));

const getTabGroupTitle = (element) => element.dataset.tabGroupTitle;
const getTabId = (element) => element.dataset.tabId;

const updateTabNavigation = (clickedBtn) => {
  removeClassFromAll('.tab-list-nav-item', 'active');
  clickedBtn.classList.add('active');
};

const updateTabImages = (tabGroupTitle) => {
  removeClassFromAll('.tab-image-item', 'active');
  addClassToFirst(`.tab-image-item[data-tab-group-title="${tabGroupTitle}"]`, 'active');
};

const updateTabListItems = (tabGroupTitle) => {
  removeClassFromAll('.tab-list-item-container', 'active');
  addClassToAll(`.tab-list-item-container[data-tab-group-title="${tabGroupTitle}"]`, 'active');
  addClassToFirst(`.tab-list-item-container[data-tab-group-title="${tabGroupTitle}"]`, 'expanded');
};

const handleTabNavClick = (btn) => {
  const tabGroupTitle = getTabGroupTitle(btn);
  updateTabNavigation(btn);
  updateTabImages(tabGroupTitle);
  updateTabListItems(tabGroupTitle);
};

const updateExpandedState = (clickedItem) => {
  removeClassFromAll('.tab-list-item-container', 'expanded');
  clickedItem.classList.add('expanded');
};

const updateImageForTabItem = (tabId) => {
  removeClassFromAll('.tab-image-item', 'active');
  addClassToFirst(`.tab-image-item[data-tab-id="${tabId}"]`, 'active');
};

const scrollToItemIfMobile = (item) => {
  if (window.innerWidth < 800) {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const handleTabItemClick = (item) => {
  const tabId = getTabId(item);
  updateExpandedState(item);
  updateImageForTabItem(tabId);
  scrollToItemIfMobile(item);
};

// Event listeners
document.querySelectorAll('.tab-list-nav-item').forEach(btn => 
  btn.addEventListener('click', () => handleTabNavClick(btn))
);

document.querySelectorAll('.tab-list-item-container').forEach(item => 
  item.addEventListener('click', () => handleTabItemClick(item))
);

// Calendar function
const formatDateForCalendar = (dateStr) => 
  new Date(dateStr).toISOString().replace(/[-:]|\.\d{3}/g, '');

const createCalendarUrl = (title, dateStr) => {
  const startDate = formatDateForCalendar(dateStr);
  const endDate = formatDateForCalendar(new Date(new Date(dateStr).getTime() + 60 * 60 * 1000));
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}`;
};

const addToCalendar = (title, dateStr) => {
  const calendarUrl = createCalendarUrl(title, dateStr);
  window.open(calendarUrl, '_blank');
};
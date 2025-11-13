class Wishlist {
   constructor() {
     this.wishlistContainer = document.querySelector(
       ".wishlist-product-container"
     );
     this.customerId = this.wishlistContainer.dataset.customerId;
     this.wishlistItems = [];
     this.isLoading = true;
     this.init();
   }
 
   showLoadingSpinner() {
     this.wishlistContainer.innerHTML = `
       <div class="loading-spinner">
         <div class="spinner"></div>
         <p>Loading your wishlist...</p>
       </div>
     `;
   }
 
   async loadWishlistSection() {
     this.showLoadingSpinner();
     const wishlistItems = this.wishlistItems;
     console.log("wishlistItems", wishlistItems);
     if (wishlistItems.length > 0) {
       this.isLoading = false;
       this.renderWishlistData();
       setTimeout(() => {
         this.initFlickity();
       }, 500);
     } else {
       await this.fetchAndRenderWishlistData();
       setTimeout(() => {
         this.initFlickity();
       }, 500);
     }
   }
 
   async fetchAndRenderWishlistData() {
     try {
       const response = await fetch(
         `/a/wishlist?type=api&customerid=${this.customerId}&version=1`
       );
       const data = await response.json();
       console.log("data", data);
       this.wishlistItems = data.items || [];
       this.isLoading = false;
       this.renderWishlistData();
     } catch (error) {
       console.error("Error fetching wishlist:", error);
       this.wishlistContainer.innerHTML = `
         <div class="error-message">
           <p>Failed to load wishlist. Please try again later.</p>
         </div>
       `;
     }
   }
 
   renderWishlistData() {
     if (this.isLoading) return;
     this.wishlistContainer.innerHTML = "";
 
     if (this.wishlistItems.length === 0) {
       this.wishlistContainer.innerHTML = `
         <div class="empty-wishlist">
           <p>Your wishlist is empty</p>
         </div>
       `;
       return;
     }
 
     const wishlistRoot = document.createElement("div");
     wishlistRoot.classList.add("wishlist-root");
     this.wishlistContainer.appendChild(wishlistRoot);
 
     this.wishlistItems.forEach((item) => {
       const productCard = document.createElement("product-card");
       productCard.classList.add("product-card");
       productCard.innerHTML = this.generateProductCardMarkup(item);
       wishlistRoot.appendChild(productCard);
       this.addEventListeners(productCard);
     });
     console.log("renderWishlistData");
   }
 
   initFlickity() {
     const productCardCount =
       this.wishlistContainer.querySelectorAll(".product-card").length;
     if (productCardCount > 4) {
       const flkty = new Flickity(".wishlist-root", {
         wrapAround: true,
         selectedAttraction: 0.01,
         pageDots: false,
       });
     }
   }
 
   removeCacheData() {
     localStorage.removeItem("wishlist");
   }
 
   refreshWishlist() {
     console.log("refreshWishlist");
     this.wishlistItems = [];
     this.removeCacheData();
     this.init();
   }
 
   addEventListeners(productCard) {
     productCard
       .querySelector(".smartwishlist")
       .addEventListener("click", () => {
         this.refreshWishlist();
       });
   }
   generateProductCardMarkup(item) {
     return `
       
         <div class="product-card__figure">
           <a href="/products/${item.handle}" class="product-card__media" draggable="false" data-instant="">
             <img
               src="${item.image}"
               draggable="false"
               class="product-card__image product-card__image--primary aspect-square"
               alt="${item.title}"
             >
           </a>
           
         </div>
         <div class="product-card__info empty:hidden">
           <span class="smartwishlist" data-product="${item.id}" data-variant="${item.variant_id}"></span>
           <div class="v-stack justify-items-center gap-2">
             <div class="v-stack justify-items-center gap-1">
               <a
                 href="/products/${item.handle}"
                 class="product-title line-clamp"
                 style="--line-clamp-count: 2"
                 data-instant=""
               >${item.title}</a>
               <price-list class="price-list">
                 <sale-price class="text-subdued">
                   <span class="sr-only">Sale price</span>
                   $${item.variant_price}
                 </sale-price>
               </price-list>
             </div>
           </div>
         </div>
 
     `;
   }
 
   async init() {
     await this.loadWishlistSection();
     if (window.ReloadSmartWishlist && typeof window.ReloadSmartWishlist === "function") {
       window.ReloadSmartWishlist();
     }
   }
 }
 
 const wishlist = new Wishlist();
 
let cart = [];
let activeCategory = "All";
let localQuantities = {};

function init() {
  renderCategories();
  renderProducts();
  updateCart();
}

function renderCategories() {
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  document.getElementById("categories").innerHTML = cats
    .map(
      (cat) => `
    <button class="cat-pill ${cat === activeCategory ? "active" : ""}" onclick="selectCategory('${cat}')">
      ${cat}
    </button>
  `,
    )
    .join("");
}

function selectCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderProducts();
}

function renderProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const grid = document.getElementById("productGrid");

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm);
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:#aaa;font-size:16px;">
      😔 No products found
    </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p, i) => {
      const qty = localQuantities[p.id] || 1;
      const inCart = cart.find((c) => c.id === p.id);
      return `
      <div class="product-card" style="animation-delay:${i * 0.05}s">
        <div class="product-thumb">
          <img
            src="${p.img}"
            alt="${p.name}"
            class="loading"
            onload="this.classList.remove('loading');this.classList.add('loaded');this.nextElementSibling.classList.add('hidden')"
            onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')"
          />
          <div class="thumb-placeholder">${p.fallback}</div>
          <span class="product-cat-badge">${p.category}</span>
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-description">${p.description}</div>
          <div class="product-footer">
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="changeLocalQty(${p.id}, -1)">−</button>
              <span class="qty-display" id="localQty-${p.id}">${qty}</span>
              <button class="qty-btn" onclick="changeLocalQty(${p.id}, 1)">+</button>
            </div>
          </div>
          <button class="add-to-cart-btn ${inCart ? "added" : ""}" onclick="addToCart(${p.id})" id="atcBtn-${p.id}">
            <i class="fas fa-cart-plus"></i>
            <span>${inCart ? "Update Cart" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

function filterProducts() {
  renderProducts();
}

function changeLocalQty(productId, delta) {
  localQuantities[productId] = Math.max(
    1,
    (localQuantities[productId] || 1) + delta,
  );
  const el = document.getElementById(`localQty-${productId}`);
  if (el) el.textContent = localQuantities[productId];
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const qty = localQuantities[productId] || 1;
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity = qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }

  updateCart();
  showToast(`${product.name} added to cart 🛒`);

  const btn = document.getElementById(`atcBtn-${productId}`);
  if (btn) {
    btn.classList.add("added");
    btn.querySelector("span").textContent = "Update Cart";
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
  renderProducts();
}

function changeCartQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  updateCart();
}

function updateCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");
  const cartFooter = document.getElementById("cartFooter");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-basket-shopping"></i>
        <p>Your cart is empty</p>
      </div>`;
    cartFooter.style.display = "none";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <img
          class="cart-item-img"
          src="${item.img}"
          alt="${item.name}"
          onerror="this.style.display='none'"
        />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" onclick="changeCartQty(${item.id}, -1)">−</button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="changeCartQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `,
      )
      .join("");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    totalPrice.textContent = `$${total.toFixed(2)}`;
    cartFooter.style.display = "flex";
  }
}

function toggleCart() {
  document.getElementById("cartModal").classList.toggle("active");
}
function handleOverlayClick(e) {
  if (e.target.id === "cartModal") toggleCart();
}

function checkout() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(
    `✅ Order placed!\nTotal: $${total.toFixed(2)}\n\nThank you for shopping at FreshNest!`,
  );
  cart = [];
  localQuantities = {};
  updateCart();
  toggleCart();
  renderProducts();
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

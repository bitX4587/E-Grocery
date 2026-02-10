let cart = [];

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = products
    .map(
      (product) => `
                <div class="product-card" data-product-name="${product.name.toLowerCase()}">
                    <div class="product-icon">${product.icon}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-description">${product.description}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `,
    )
    .join("");
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

function updateCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
    cartTotal.style.display = "none";
    checkoutBtn.style.display = "none";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
                    <div class="cart-item">
                        <div class="cart-item-icon">${item.icon}</div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name} x${item.quantity}</div>
                            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
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
    cartTotal.style.display = "flex";
    checkoutBtn.style.display = "block";
  }
}

function toggleCart() {
  const modal = document.getElementById("cartModal");
  modal.classList.toggle("active");
}

function checkout() {
  alert(
    "Thank you for your order! Total: " +
      document.getElementById("totalPrice").textContent,
  );
  cart = [];
  updateCart();
  toggleCart();
}

function filterProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const productName = card.getAttribute("data-product-name");
    if (productName.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function showNotification(message) {
  // Simple notification (you can enhance this)
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
            `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

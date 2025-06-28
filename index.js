// DummyJSON API endpoint
const DUMMY_API = "https://dummyjson.com/products?limit=24";

// Elements
const productList = document.getElementById("product-list");
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartCountSpan = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeCartBtn = document.getElementById("close-cart");
const messageBox = document.getElementById("message");
const shoppedSection = document.getElementById("shopped-section");
const shoppedList = document.getElementById("shopped-list");
const navLinks = document.querySelectorAll('.nav-link');
const aboutSection = document.getElementById("about-section");
const productsSection = document.getElementById("products-section");

// State
let cart = JSON.parse(localStorage.getItem("soleTiesCart") || "[]");
let shopped = JSON.parse(localStorage.getItem("soleTiesShopped") || "[]");

// Show feedback message
function showMessage(msg, timeout = 2000) {
    messageBox.textContent = msg;
    messageBox.classList.remove("hidden");
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => messageBox.classList.add("hidden"), timeout);
}

// Navigation: show/hide main sections
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        // Hide all main sections
        document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
        // Show the right section
        const target = document.getElementById(link.getAttribute('href').replace('#', ''));
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (target === shoppedSection) renderShopped();
        }
        e.preventDefault();
    });
});

// Load products from DummyJSON
function loadProducts() {
    fetch(DUMMY_API)
        .then(res => res.json())
        .then(data => {
            productList.innerHTML = "";
            data.products.forEach(product => renderProductCard({
                id: product.id,
                name: product.title,
                price: product.price,
                size: product.size || "N/A",
                condition: product.brand || "Brand new",
                image: product.thumbnail
            }));
        });
}

// Render a product card
function renderProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p><strong>Price:</strong> KES ${product.price}</p>
    <p><strong>Size:</strong> ${product.size}</p>
    <p><strong>Condition:</strong> ${product.condition}</p>
    <div class="card-actions">
      <button class="buy-btn">Buy</button>
      <button class="cart-btn">Add to Cart</button>
    </div>
  `;
    card.querySelector(".buy-btn").onclick = () => {
        buyProductFromProducts(product);
    };
    card.querySelector(".cart-btn").onclick = () => {
        addToCart(product);
    };
    productList.appendChild(card);
}

// Cart functions
function updateCartCount() {
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}
function saveCart() {
    localStorage.setItem("soleTiesCart", JSON.stringify(cart));
    updateCartCount();
}
function openCart() {
    renderCartItems();
    cartSidebar.classList.remove("hidden");
    closeCartBtn.focus();
}
function closeCart() {
    cartSidebar.classList.add("hidden");
    cartBtn.focus();
}
function renderCartItems() {
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
        cartTotal.textContent = '';
        return;
    }
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        const li = document.createElement("li");
        li.innerHTML = `
      <span>${item.name} (x${item.qty})<br/>Ksh ${item.price}</span>
      <span>
        <button class="cart-buy-btn" aria-label="Buy ${item.name}">Buy</button>
        <button aria-label="Remove ${item.name} from cart">&times;</button>
      </span>
    `;
        li.querySelector(".cart-buy-btn").onclick = () => {
            buyProductFromCart(item);
        };
        li.querySelectorAll("button")[1].onclick = () => {
            removeFromCart(item.id);
        };
        cartItemsList.appendChild(li);
    });
    cartTotal.textContent = `Total: Ksh ${total}`;
}
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, image: product.image, size: product.size, condition: product.condition });
    }
    saveCart();
    showMessage(`Added "${product.name}" to cart!`);
}
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartItems();
}

// Buy product from cart (move to shopped, remove from cart)
function buyProductFromCart(item) {
    addToShopped(item);
    removeFromCart(item.id);
    showMessage(`You bought "${item.name}"!`);
}

// Buy directly from products (simulate buy: add to shopped)
function buyProductFromProducts(product) {
    addToShopped(product);
    showMessage(`You bought "${product.name}"!`);
}

// Shopped (bought) items functions
function addToShopped(product) {
    if (!shopped.find(item => item.id === product.id)) {
        shopped.push({ ...product });
        localStorage.setItem("soleTiesShopped", JSON.stringify(shopped));
    }
    renderShopped();
}
function renderShopped() {
    shoppedList.innerHTML = '';
    if (!shopped.length) {
        shoppedList.innerHTML = `<div style="padding:2rem;text-align:center;">No shopped items yet.</div>`;
        return;
    }
    shopped.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card bought";
        card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p><strong>Price:</strong> KES ${product.price}</p>
      <p><strong>Size:</strong> ${product.size || ""}</p>
      <p><strong>Condition:</strong> ${product.condition || ""}</p>
    `;
        shoppedList.appendChild(card);
    });
}

// Cart events
cartBtn.onclick = openCart;
closeCartBtn.onclick = closeCart;
cartSidebar.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCart();
});

// On page load, show products, hide others
window.onload = () => {
    [productsSection, shoppedSection, aboutSection].forEach((sec, i) => {
        sec.classList.toggle('hidden', sec !== productsSection);
    });
    loadProducts();
    updateCartCount();
    renderShopped();
};
// Load menu
fetch('/counter/menu/1') // Replace 1 with the actual restaurant ID
  .then(response => response.json())
  .then(data => {
    const menuList = document.getElementById('menu');
    data.menu.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<h3>${item.name}</h3><p>Price: $${item.price}</p><button onclick="addToCart(${item.id})">Add to Cart</button>`;
      menuList.appendChild(li);
    });
  });

// Add item to cart
function addToCart(itemId) {
  const cartList = document.getElementById('cart');
  const li = document.createElement('li');
  li.textContent = `Item ID: ${itemId}`;
  cartList.appendChild(li);
}

// Place order
function placeOrder() {
  const cartItems = Array.from(document.getElementById('cart').children).map(li => li.textContent.split(': ')[1]);
  fetch('/counter/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurantId: 1, items: cartItems }), // Replace 1 with the actual restaurant ID
  })
    .then(response => response.json())
    .then(data => alert(data.message));
}
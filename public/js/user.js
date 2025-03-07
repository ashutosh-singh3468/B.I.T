// Load restaurants
fetch('/user/restaurants')
  .then(response => response.json())
  .then(data => {
    const restaurantsList = document.getElementById('restaurants');
    data.restaurants.forEach(restaurant => {
      const li = document.createElement('li');
      li.innerHTML = `<h3>${restaurant.name}</h3><button onclick="loadMenu(${restaurant.id})">View Menu</button>`;
      restaurantsList.appendChild(li);
    });
  });

// Load menu for a restaurant
function loadMenu(restaurantId) {
  fetch(`/user/menu/${restaurantId}`)
    .then(response => response.json())
    .then(data => {
      const menuItems = document.getElementById('menuItems');
      menuItems.innerHTML = '';
      data.menu.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<h3>${item.name}</h3><p>Price: $${item.price}</p><button onclick="addToCart(${item.id})">Add to Cart</button>`;
        menuItems.appendChild(li);
      });
      document.getElementById('restaurants').style.display = 'none';
      document.getElementById('menu').style.display = 'block';
    });
}

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
  fetch('/user/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 1, restaurantId: 1, items: cartItems }), // Replace with actual user and restaurant IDs
  })
    .then(response => response.json())
    .then(data => alert(data.message));
}

// Go back to restaurants list
function goBack() {
  document.getElementById('restaurants').style.display = 'block';
  document.getElementById('menu').style.display = 'none';
}
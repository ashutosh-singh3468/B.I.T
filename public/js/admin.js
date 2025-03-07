// Add restaurant
document.getElementById('addRestaurantForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('restaurantName').value;
  fetch('/admin/restaurant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
    .then(response => response.json())
    .then(data => alert(data.message));
});

// Add menu item
document.getElementById('addMenuItemForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('menuName').value;
  const price = document.getElementById('menuPrice').value;
  const category = document.getElementById('menuCategory').value;
  fetch('/admin/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, restaurantId: 1 }), // Replace 1 with the actual restaurant ID
  })
    .then(response => response.json())
    .then(data => alert(data.message));
});

// Generate access key
document.getElementById('generateKeyBtn').addEventListener('click', () => {
  fetch('/admin/generate-key')
    .then(response => response.json())
    .then(data => alert(`Generated Key: ${data.key}`));
});
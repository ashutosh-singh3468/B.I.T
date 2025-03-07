// Load orders
fetch('/kitchen/orders')
  .then(response => response.json())
  .then(data => {
    const ordersList = document.getElementById('orders');
    data.orders.forEach(order => {
      const li = document.createElement('li');
      li.innerHTML = `<h3>Order ID: ${order.id}</h3><p>Status: ${order.status}</p><button onclick="updateOrderStatus(${order.id}, 'completed')">Mark as Completed</button>`;
      ordersList.appendChild(li);
    });
  });

// Update order status
function updateOrderStatus(orderId, status) {
  fetch(`/kitchen/order/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      window.location.reload(); // Refresh the page to show updated status
    });
}
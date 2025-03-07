// Toggle access key field based on role
document.getElementById('role').addEventListener('change', function () {
    const accessKeyField = document.getElementById('accessKeyField');
    if (this.value === 'kitchen' || this.value === 'counter') {
      accessKeyField.style.display = 'block';
    } else {
      accessKeyField.style.display = 'none';
    }
  });
  
  // View menu for a restaurant (User Dashboard)
  function viewMenu(restaurantId) {
    fetch(`/menu?restaurantId=${restaurantId}`)
      .then(response => response.json())
      .then(menu => {
        const menuItems = document.getElementById('menuItems');
        menuItems.innerHTML = '';
        menu.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<h3>${item.name}</h3><p>Price: $${item.price}</p>`;
          menuItems.appendChild(li);
        });
        document.getElementById('restaurants').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
      });
  }
  
  // Go back to restaurants list (User Dashboard)
  function goBack() {
    document.getElementById('restaurants').style.display = 'block';
    document.getElementById('menu').style.display = 'none';
  }
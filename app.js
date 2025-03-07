const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Encryption functions
const algorithm = 'aes-256-ctr';
const secretKey = 'my_secret_key';

function encrypt(text) {
  const cipher = crypto.createCipher(algorithm, secretKey);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text) {
  const decipher = crypto.createDecipher(algorithm, secretKey);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

// Load data from JSON files
function loadData(file) {
  try {
    const data = fs.readFileSync(`./data/${file}.json`, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading or parsing ${file}.json:`, err);
    return [];
  }
}

// Save data to JSON files
function saveData(file, data) {
  try {
    fs.writeFileSync(`./data/${file}.json`, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${file}.json`);
  } catch (err) {
    console.error(`Error saving data to ${file}.json:`, err);
  }
}

// Middleware to validate access key for kitchen and counter roles
function validateAccessKey(req, res, next) {
  const { role, accessKey } = req.body;
  if ((role === 'kitchen' || role === 'counter') && !accessKey) {
    return res.status(400).json({ message: 'Access key is required for kitchen and counter roles.' });
  }
  next();
}

// Middleware to authenticate users
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const users = loadData('users');
  const user = users.find(user => user.token === token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }

  req.user = user; // Attach user to the request object
  next();
}

// Routes

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Signup Page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Signup Logic
app.post('/signup', validateAccessKey, (req, res) => {
  const { name, email, password, role, accessKey } = req.body;
  const users = loadData('users');

  // Check if user already exists
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists!' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Save user
  const token = crypto.randomBytes(16).toString('hex'); // Generate a token
  users.push({ id: Date.now(), name, email, password: hashedPassword, role, accessKey, token });
  saveData('users', users);

  res.status(201).json({ message: 'User registered successfully!', token });
});

// Login Logic
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadData('users');

  const user = users.find(user => user.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials!' });
  }

  // Generate a new token (optional: you can reuse the existing token)
  const token = crypto.randomBytes(16).toString('hex');
  user.token = token; // Update the user's token
  saveData('users', users);

  res.json({ message: 'Login successful!', token, role: user.role });
});

// User Dashboard: Load Restaurants
app.get('/user/restaurants', authenticate, (req, res) => {
  const restaurants = loadData('restaurants');
  res.json({ restaurants });
});

// User Dashboard: Load Menu for a Restaurant
app.get('/user/menu/:restaurantId', authenticate, (req, res) => {
  const { restaurantId } = req.params;
  const menu = loadData('menu').filter(item => item.restaurantId === parseInt(restaurantId));
  res.json({ menu });
});

// User Dashboard: Place Order
app.post('/user/order', authenticate, (req, res) => {
  const { userId, restaurantId, items } = req.body;
  const orders = loadData('orders');

  const newOrder = {
    id: Date.now(),
    userId,
    restaurantId,
    items,
    status: 'pending',
  };

  orders.push(newOrder);
  saveData('orders', orders);

  res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
});

// User Dashboard: Update Order Status
app.put('/user/order/:orderId', authenticate, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const orders = loadData('orders');

  const order = orders.find(order => order.id === parseInt(orderId));
  if (!order) {
    return res.status(404).json({ message: 'Order not found!' });
  }

  order.status = status;
  saveData('orders', orders);

  res.json({ message: 'Order status updated successfully!', order });
});

// Counter Dashboard: Load Menu
app.get('/counter/menu/:restaurantId', authenticate, (req, res) => {
  const { restaurantId } = req.params;
  const menu = loadData('menu').filter(item => item.restaurantId === parseInt(restaurantId));
  res.json({ menu });
});

// Counter Dashboard: Place Order
app.post('/counter/order', authenticate, (req, res) => {
  const { restaurantId, items } = req.body;
  const orders = loadData('orders');

  const newOrder = {
    id: Date.now(),
    restaurantId,
    items,
    status: 'pending',
  };

  orders.push(newOrder);
  saveData('orders', orders);

  res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
});

// Kitchen Dashboard: Get Orders
app.get('/kitchen/orders', authenticate, (req, res) => {
  const orders = loadData('orders');
  res.json({ orders });
});

// Kitchen Dashboard: Update Order Status
app.put('/kitchen/order/:orderId', authenticate, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const orders = loadData('orders');

  const order = orders.find(order => order.id === parseInt(orderId));
  if (!order) {
    return res.status(404).json({ message: 'Order not found!' });
  }

  order.status = status;
  saveData('orders', orders);

  res.json({ message: 'Order status updated successfully!', order });
});

// Admin Dashboard: Create Restaurant
app.post('/admin/restaurant', authenticate, (req, res) => {
  const { name } = req.body;
  if (!name) {
      return res.status(400).json({ message: 'Restaurant name is required!' });
  }

  const restaurants = loadData('restaurants');
  const newRestaurant = {
      id: Date.now(), // Generate a unique ID
      name,
  };

  restaurants.push(newRestaurant);
  saveData('restaurants', restaurants);

  res.status(201).json({ message: 'Restaurant created successfully!', restaurant: newRestaurant });
});

  // Admin Dashboard: Delete Restaurant
app.delete('/admin/restaurant/:restaurantId', authenticate, (req, res) => {
  const { restaurantId } = req.params;
  let restaurants = loadData('restaurants');
  const restaurantIndex = restaurants.findIndex(r => r.id === parseInt(restaurantId));

  if (restaurantIndex === -1) {
    return res.status(404).json({ message: 'Restaurant not found!' });
  }

  restaurants.splice(restaurantIndex, 1); // Remove the restaurant
  saveData('restaurants', restaurants);

  res.json({ message: 'Restaurant deleted successfully!' });
});


// Admin Dashboard: Update Restaurant Details
app.put('/admin/restaurant/:restaurantId', authenticate, (req, res) => {
  const { restaurantId } = req.params;
  const { name } = req.body;
  const restaurants = loadData('restaurants');

  const restaurant = restaurants.find(restaurant => restaurant.id === parseInt(restaurantId));
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found!' });
  }

  restaurant.name = name;
  saveData('restaurants', restaurants);

  res.json({ message: 'Restaurant details updated successfully!', restaurant });
});

// Admin Dashboard: Add Dish to Menu
app.post('/admin/menu', authenticate, (req, res) => {
  const { name, price, category, restaurantId } = req.body;
  const menu = loadData('menu');

  menu.push({ id: Date.now(), name, price, category, restaurantId });
  saveData('menu', menu);

  res.status(201).json({ message: 'Dish added to menu successfully!', menu });
});

// Admin Dashboard: Generate Access Key
app.post('/admin/generate-key', authenticate, (req, res) => {
  const key = crypto.randomBytes(16).toString('hex');
  res.status(201).json({ key });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
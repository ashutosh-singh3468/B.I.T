document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const accessKey = document.getElementById('accessKey').value;
  
    // Validate access key for kitchen and counter roles
    if ((role === 'kitchen' || role === 'counter') && !accessKey) {
      alert('Access key is required for kitchen and counter roles.');
      return;
    }
  
    // Send data to the backend
    fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, accessKey }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'User registered successfully!') {
          // Redirect to the respective dashboard
          switch (role) {
            case 'user':
              window.location.href = '/user-dashboard';
              break;
            case 'kitchen':
              window.location.href = '/kitchen-dashboard';
              break;
            case 'counter':
              window.location.href = '/counter-dashboard';
              break;
            case 'admin':
              window.location.href = '/admin-dashboard';
              break;
            default:
              alert('Invalid role');
          }
        } else {
          alert(data.message); // Show error message
        }
      })
      .catch(error => console.error('Error:', error));
  });
  
  // Show/hide access key field based on role
  document.getElementById('role').addEventListener('change', function () {
    const accessKeyField = document.getElementById('accessKeyField');
    if (this.value === 'kitchen' || this.value === 'counter') {
      accessKeyField.style.display = 'block';
    } else {
      accessKeyField.style.display = 'none';
    }
  });
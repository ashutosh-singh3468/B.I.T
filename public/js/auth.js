document.addEventListener("DOMContentLoaded", function () {
    const roleSelect = document.getElementById("role");
    const accessKeyField = document.getElementById("access-key-field");

    if (roleSelect) {
        roleSelect.addEventListener("change", function () {
            accessKeyField.style.display = (roleSelect.value === "kitchen" || roleSelect.value === "counter") ? "block" : "none";
        });

        document.getElementById("signup-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const userData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                role: roleSelect.value,
                accessKey: document.getElementById("access-key").value
            };

            let users = JSON.parse(localStorage.getItem("users")) || [];
            users.push(userData);
            localStorage.setItem("users", JSON.stringify(users));

            alert("Signup Successful!");
            window.location.href = "login.html";
        });
    }

    if (document.getElementById("login-form")) {
        document.getElementById("login-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(u => u.email === email);

            if (user) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid Email!");
            }
        });
    }
});

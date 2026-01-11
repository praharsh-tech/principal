import { users } from "./Data/Database.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!role || !username || !password) {
      alert("Please fill all fields");
      return;
    }

    // Find matching user
    const user = users.find(
      (u) =>
        u.role === role &&
        u.username === username &&
        u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    // Save logged-in user info (NO PASSWORD)
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        dept: user.dept,
        email: user.email,
        phone: user.phone,
        pfp: user.pfp
      })
    );

    // Redirect based on role
    switch (user.role) {
      case "principal":
        window.location.href = "./principal/principal.html";
        break;

      case "hod":
        window.location.href = "./HOD/HOD.html";
        break;

      case "faculty":
        window.location.href = "./faculty/faculty.html";
        break;

      case "accounts":
        window.location.href = "./Dashboards/account.html";
        break;

      case "scholarship":
        window.location.href = "./Dashboards/scholarshipdept.html";
        break;

      default:
        alert("Role not recognized");
    }
  });
});

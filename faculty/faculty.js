/************************************************
 🔐 PAGE PROTECTION
************************************************/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.role !== "faculty") {
  window.location.href = "../index.html";
}

/************************************************
 👤 LOAD FACULTY PROFILE
************************************************/
document.getElementById(
  "facultyHeader"
).textContent = `${loggedInUser.name} (${loggedInUser.dept})`;

document.getElementById("facultyName").textContent = loggedInUser.name;
document.getElementById("facultyDept").textContent = loggedInUser.dept;
document.getElementById("facultyEmail").textContent = loggedInUser.email;
document.getElementById("facultyPhone").textContent = loggedInUser.phone;
document.getElementById("facultyImage").src =
  loggedInUser.pfp || "https://via.placeholder.com/120";

/************************************************
 📦 TASK HELPERS
************************************************/
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/************************************************
 📋 LOAD FACULTY TASKS
************************************************/
function loadFacultyTasks() {
  const allTasks = getTasks();

  const myTasks = allTasks.filter((task) =>
    task.assignedTo.includes(loggedInUser.username)
  );

  renderTasks(myTasks);
}

/************************************************
 🎨 RENDER TASKS + STATUS UPDATE
************************************************/
function renderTasks(tasks) {
  const taskBox = document.getElementById("facultyTasks");
  taskBox.innerHTML = "";

  if (tasks.length === 0) {
    taskBox.innerHTML =
      "<p class='text-gray-500'>No tasks assigned</p>";
    return;
  }

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "bg-white p-5 rounded-xl shadow";

    div.innerHTML = `
      <h3 class="text-lg font-semibold text-blue-700">${task.title}</h3>
      <p class="text-sm text-gray-600 mt-1">${task.description}</p>

      <p class="text-sm mt-2"><strong>Deadline:</strong> ${task.deadline}</p>

      <label class="block text-sm font-medium mt-3">Update Status</label>
      <select
        class="statusSelect border rounded-md px-3 py-1 mt-1 w-full"
        data-id="${task.id}">
        <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="Processing" ${task.status === "Processing" ? "selected" : ""}>Processing</option>
        <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
      </select>
    `;

    taskBox.appendChild(div);
  });

  attachStatusListeners();
}

/************************************************
 🔄 UPDATE STATUS IN LOCALSTORAGE
************************************************/
function attachStatusListeners() {
  const selects = document.querySelectorAll(".statusSelect");

  selects.forEach((select) => {
    select.addEventListener("change", (e) => {
      const taskId = Number(e.target.dataset.id);
      const newStatus = e.target.value;

      const tasks = getTasks();
      const task = tasks.find((t) => t.id === taskId);

      if (task) {
        task.status = newStatus;
        task.updatedAt = new Date().toLocaleString();
        saveTasks(tasks);
      }
    });
  });
}

/************************************************
 🚪 LOGOUT
************************************************/
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "../index.html";
});

/************************************************
 🚀 INIT
************************************************/
loadFacultyTasks();

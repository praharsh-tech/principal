import { users } from "../Data/Database.js";

/************************************************
 🔐 PAGE PROTECTION
************************************************/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.role !== "hod") {
  window.location.href = "../index.html";
}

/************************************************
 👤 LOAD HOD PROFILE
************************************************/
document.getElementById("hodHeaderInfo").textContent =
  `${loggedInUser.name} (${loggedInUser.dept})`;

document.getElementById("hodFullName").textContent = loggedInUser.name;
document.getElementById("hodDept").textContent = loggedInUser.dept;
document.getElementById("hodEmail").textContent = loggedInUser.email;
document.getElementById("hodPhone").textContent = loggedInUser.phone;
document.getElementById("hodImage").src =
  loggedInUser.pfp || "https://via.placeholder.com/150";

/************************************************
 🧑‍🏫 LOAD ALL FACULTY (ALL DEPARTMENTS)
************************************************/
const facultySelect = document.getElementById("assignToSelect");

users
  .filter((u) => u.role === "faculty")
  .forEach((faculty) => {
    const option = document.createElement("option");
    option.value = faculty.username;
    option.textContent = `${faculty.name} (${faculty.dept})`;
    facultySelect.appendChild(option);
  });

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
 📋 LOAD TASKS ASSIGNED TO THIS HOD
************************************************/
function loadHodTasks() {
  const tasks = getTasks();

  // Tasks assigned by Principal to this HOD
  const hodTasks = tasks.filter((task) =>
    task.assignedTo.includes(loggedInUser.username)
  );

  renderTasks(hodTasks);
}

/************************************************
 🎨 RENDER TASKS + STATUS UPDATE (HOD)
************************************************/
function renderTasks(tasks) {
  const taskBox = document.getElementById("hodTasks");
  taskBox.innerHTML = "";

  if (tasks.length === 0) {
    taskBox.innerHTML =
      "<p class='text-gray-500'>No tasks assigned by Principal</p>";
    return;
  }

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "bg-white p-5 rounded-xl shadow";

    div.innerHTML = `
      <h3 class="font-semibold text-lg text-blue-700">${task.title}</h3>
      <p class="text-gray-600 text-sm mt-1">${task.description}</p>

      <p class="text-sm mt-2">
        <strong>Deadline:</strong> ${task.deadline}
      </p>

      <label class="block text-sm font-medium mt-3">
        Update Status
      </label>

      <select
        class="hodStatusSelect border rounded-md px-3 py-1 mt-1 w-full"
        data-id="${task.id}">
        <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>
          Pending
        </option>
        <option value="Processing" ${task.status === "Processing" ? "selected" : ""}>
          Processing
        </option>
        <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>
          Completed
        </option>
      </select>
    `;

    taskBox.appendChild(div);
  });

  attachStatusUpdate();
}

/************************************************
 🔄 HOD STATUS UPDATE LOGIC
************************************************/
function attachStatusUpdate() {
  const selects = document.querySelectorAll(".hodStatusSelect");

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
 ➕ ASSIGN TASK TO FACULTY
************************************************/
document.getElementById("assignTaskForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const facultyUsername = facultySelect.value;
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const deadline = document.getElementById("taskDeadline").value;

  if (!facultyUsername || !title || !desc || !deadline) {
    alert("Please fill all fields");
    return;
  }

  const tasks = getTasks();

  const newTask = {
    id: Date.now(),
    title,
    description: desc,
    deadline,
    assignedBy: loggedInUser.username,
    assignedTo: [facultyUsername],
    status: "Pending",
    createdAt: new Date().toLocaleString()
  };

  tasks.push(newTask);
  saveTasks(tasks);

  clearForm();
  toggleAssignSection(false);
});

/************************************************
 🧹 CLEAR FORM
************************************************/
function clearForm() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDeadline").value = "";
  facultySelect.value = "";
}

/************************************************
 👁 TOGGLE ASSIGN SECTION
************************************************/
const assignSection = document.getElementById("assignTaskSection");

document.getElementById("openAssignTask").addEventListener("click", () => {
  toggleAssignSection(true);
});

document.getElementById("cancelAssign").addEventListener("click", () => {
  toggleAssignSection(false);
});

function toggleAssignSection(show) {
  assignSection.classList.toggle("hidden", !show);
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
loadHodTasks();

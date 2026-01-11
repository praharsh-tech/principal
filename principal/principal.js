import { users } from "../Data/Database.js";

/************************************************
 🔐 PAGE PROTECTION + LOAD PRINCIPAL INFO
************************************************/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.role !== "principal") {
  window.location.href = "../index.html";
}

// Show principal name
document.getElementById("principalName").textContent =
  loggedInUser.name;

/************************************************
 👥 LOAD USERS INTO ASSIGN-TO DROPDOWN
************************************************/
const assignToSelect = document.getElementById("assignTo");

const assignableUsers = users.filter(
  (u) => u.role !== "principal"
);

assignableUsers.forEach((user) => {
  const option = document.createElement("option");
  option.value = user.username;
  option.textContent = `${user.name} (${user.role} - ${user.dept})`;
  assignToSelect.appendChild(option);
});

/************************************************
 🗂 TASK STORAGE HELPERS
************************************************/
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/************************************************
 ➕ ADD NEW TASK
************************************************/
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const nature = document.getElementById("taskNature").value;
  const deadline = document.getElementById("taskDeadline").value;
  const support = document.getElementById("supportPeople").value.trim();

  const assignedTo = Array.from(assignToSelect.selectedOptions).map(
    (opt) => opt.value
  );

  if (!title || !desc || !nature || !deadline || assignedTo.length === 0) {
    alert("Please fill all required fields");
    return;
  }

  const tasks = getTasks();

  const newTask = {
    id: Date.now(),
    title,
    description: desc,
    nature,
    deadline,
    support,
    assignedBy: loggedInUser.username,
    assignedTo,
    status: "Pending",
    createdAt: new Date().toLocaleString()
  };

  tasks.push(newTask);
  saveTasks(tasks);

  clearForm();
  renderTasks(tasks);
});

/************************************************
 🧹 CLEAR FORM AFTER ADD
************************************************/
function clearForm() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskNature").value = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("supportPeople").value = "";
  assignToSelect.selectedIndex = -1;
}

/************************************************
 📋 RENDER TASK LIST
************************************************/
function renderTasks(taskArray) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  if (taskArray.length === 0) {
    taskList.innerHTML =
      "<p class='text-gray-500'>No tasks found</p>";
    return;
  }

  taskArray.forEach((task) => {
    const div = document.createElement("div");
    div.className = "bg-white p-5 rounded-xl shadow";

    div.innerHTML = `
      <h3 class="text-lg font-semibold text-blue-700">${task.title}</h3>
      <p class="text-sm text-gray-600 mt-1">${task.description}</p>

      <div class="mt-2 text-sm">
        <p><strong>Nature:</strong> ${task.nature}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Assigned To:</strong> ${task.assignedTo.join(", ")}</p>
        <p><strong>Support:</strong> ${task.support || "-"}</p>
      </div>
    `;

    taskList.appendChild(div);
  });
}

/************************************************
 🔍 FILTER TASKS
************************************************/
document
  .getElementById("applyFilterBtn")
  .addEventListener("click", () => {
    const keyword =
      document.getElementById("searchTask").value.toLowerCase();
    const status =
      document.getElementById("filterStatus").value;

    let tasks = getTasks();

    if (keyword) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(keyword) ||
          t.description.toLowerCase().includes(keyword)
      );
    }

    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }

    renderTasks(tasks);
  });


   /************************************************
 📊 HOD PERFORMANCE ANALYTICS
************************************************/
function loadHodPerformance() {

    
  const hodContainer = document.getElementById("hodPerformance");
  if (!hodContainer) return;

  const tasks = getTasks();

  // get all HODs
  const hods = users.filter((u) => u.role === "hod");

  hodContainer.innerHTML = "";

  hods.forEach((hod) => {
    // tasks assigned to this HOD
    const hodTasks = tasks.filter((t) =>
      t.assignedTo.includes(hod.username)
    );

    const total = hodTasks.length;
    const completed = hodTasks.filter(
      (t) => t.status === "Completed"
    ).length;

    // determine performance
    let performance = "Excellent";
    let color = "green";

    if (total === 0) {
      performance = "No Tasks";
      color = "gray";
    } else if (completed < total / 2) {
      performance = "Needs Improvement";
      color = "red";
    } else if (completed < total) {
      performance = "Average";
      color = "yellow";
    }

 const card = document.createElement("div");
card.className =
  "bg-white p-5 rounded-xl shadow relative flex gap-4";

card.innerHTML = `
  <!-- HOD PHOTO -->
  <img
    src="${hod.pfp || 'https://via.placeholder.com/60'}"
    alt="HOD Photo"
   class="w-20 h-20 rounded-md object-cover absolute top-4 right-4 border"


  />

  <!-- HOD INFO -->
  <div>
    <h3 class="text-lg font-semibold text-blue-700">
      ${hod.name}
    </h3>

    <p class="text-sm text-gray-600">
      Department: ${hod.dept}
    </p>

    <div class="mt-3 text-sm">
      <p><strong>Total Tasks:</strong> ${total}</p>
      <p><strong>Completed:</strong> ${completed}</p>
    </div>

    <span
      class="inline-block mt-3 px-3 py-1 rounded-full text-sm
      ${
        color === "green"
          ? "bg-green-100 text-green-700"
          : color === "yellow"
          ? "bg-yellow-100 text-yellow-700"
          : color === "red"
          ? "bg-red-100 text-red-700"
          : "bg-gray-200 text-gray-700"
      }">
      ${performance}
    </span>
  </div>
`;


    hodContainer.appendChild(card);
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
 🚀 INITIAL LOAD
************************************************/
renderTasks(getTasks());
loadHodPerformance();
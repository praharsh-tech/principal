/************************************************
 🚀 WAIT FOR DOM TO LOAD
************************************************/
document.addEventListener("DOMContentLoaded", () => {

  /************************************************
   🔐 ROLE PROTECTION
  ************************************************/
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || !["accounts", "scholarship"].includes(user.role)) {
    window.location.href = "../index.html";
    return;
  }

  /************************************************
   👤 LOAD HEADER INFO
  ************************************************/
  const userInfo = document.getElementById("userInfo");
  const taskList = document.getElementById("taskList");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userInfo || !taskList || !logoutBtn) {
    console.error("Dashboard elements missing");
    return;
  }

  userInfo.textContent = `${user.name} (${user.role.toUpperCase()})`;

  /************************************************
   📦 TASK HELPERS
  ************************************************/
  function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }

  /************************************************
   📋 LOAD TASKS FOR THIS USER
  ************************************************/
  function loadTasks() {
    const allTasks = getTasks();

    const myTasks = allTasks.filter(task =>
      Array.isArray(task.assignedTo) &&
      task.assignedTo.includes(user.username)
    );

    renderTasks(myTasks);
  }

  /************************************************
   🎨 RENDER TASKS (READ ONLY)
  ************************************************/
  function renderTasks(tasks) {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      taskList.innerHTML =
        "<p class='text-gray-500'>No tasks assigned</p>";
      return;
    }

    tasks.forEach(task => {
      const div = document.createElement("div");
      div.className = "bg-white p-5 rounded-xl shadow";

      div.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800">
          ${task.title}
        </h3>

        <p class="text-sm text-gray-600 mt-1">
          ${task.description}
        </p>

        <p class="text-sm mt-2">
          <strong>Deadline:</strong> ${task.deadline}
        </p>

        <span class="inline-block mt-2 px-3 py-1 rounded-full text-sm
          ${
            task.status === "Completed"
              ? "bg-green-100 text-green-700"
              : task.status === "Processing"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }">
          ${task.status}
        </span>
      `;

      taskList.appendChild(div);
    });
  }

  /************************************************
   🚪 LOGOUT
  ************************************************/
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../index.html";
  });

  /************************************************
   ✅ INIT
  ************************************************/
  loadTasks();

});

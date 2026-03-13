import { users } from "../Data/Database.js";

/************************************************
 🔐 PAGE PROTECTION
************************************************/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.role !== "principal") {
  window.location.href = "../index.html";
}

document.getElementById("principalName").textContent = loggedInUser.name;

/************************************************
 👥 LOAD USERS
************************************************/
const assignToSelect = document.getElementById("assignTo");

const hodGroup = document.createElement("optgroup");
hodGroup.label = "HODs";

const facultyGroup = document.createElement("optgroup");
facultyGroup.label = "Faculty";

const otherGroup = document.createElement("optgroup");
otherGroup.label = "Others";

users.forEach((user) => {

  if (user.role === "principal") return;

  const option = document.createElement("option");

  option.value = user.username;
  option.textContent = `${user.name} (${user.dept})`;

  if (user.role === "hod") {
    hodGroup.appendChild(option);
  }

  else if (user.role === "faculty") {
    facultyGroup.appendChild(option);
  }

  else {
    otherGroup.appendChild(option);
  }

});

assignToSelect.appendChild(hodGroup);
assignToSelect.appendChild(facultyGroup);
assignToSelect.appendChild(otherGroup);

/************************************************
 🔍 USER SEARCH
************************************************/
document.getElementById("userSearch").addEventListener("input",(e)=>{

const keyword = e.target.value.toLowerCase();

const options = assignToSelect.querySelectorAll("option");

options.forEach(opt=>{

const text = opt.textContent.toLowerCase();

opt.style.display = text.includes(keyword) ? "block" : "none";

});

});

/************************************************
 🗂 TASK STORAGE
************************************************/
function getTasks(){
return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks){
localStorage.setItem("tasks",JSON.stringify(tasks));
}

/************************************************
 ➕ ADD TASK
************************************************/
document.getElementById("addTaskBtn").addEventListener("click",()=>{

const title = document.getElementById("taskTitle").value.trim();
const desc = document.getElementById("taskDesc").value.trim();
const nature = document.getElementById("taskNature").value;
const deadline = document.getElementById("taskDeadline").value;
const support = document.getElementById("supportPeople").value.trim();
const fileInput = document.getElementById("taskFile");
const file = fileInput.files[0];

const assignedTo = Array.from(assignToSelect.selectedOptions).map(o=>o.value);

if(!title || !desc || !nature || !deadline || assignedTo.length===0){
alert("Please fill all required fields");
return;
}

const tasks = getTasks();

const saveTask = (fileData=null)=>{

const newTask = {

id:Date.now(),
title,
description:desc,
nature,
deadline,
support,
file:fileData,
assignedBy:loggedInUser.username,
assignedTo,
status:"Pending",
createdAt:new Date().toLocaleString()

};

tasks.push(newTask);
saveTasks(tasks);

/* EMAILJS */

assignedTo.forEach(username=>{

const user = users.find(u=>u.username===username);

if(!user || !user.email) return;

window.emailjs.send("service_s56fino","template_t43at3r",{

to_name:user.name,
to_email:user.email,
task_title:title,
task_nature:nature,
task_deadline:deadline,
from_name:loggedInUser.name

});

});

clearForm();
renderTasks(tasks);
loadHodPerformance();
loadFacultyPerformance();

};

if(file){

const reader = new FileReader();

reader.onload = ()=> saveTask(reader.result);

reader.readAsDataURL(file);

}else{

saveTask();

}

});

/************************************************
 🧹 CLEAR FORM
************************************************/
function clearForm(){

document.getElementById("taskTitle").value="";
document.getElementById("taskDesc").value="";
document.getElementById("taskNature").value="";
document.getElementById("taskDeadline").value="";
document.getElementById("supportPeople").value="";
document.getElementById("taskFile").value="";
assignToSelect.selectedIndex=-1;

}

/************************************************
 📋 RENDER TASKS
************************************************/
function renderTasks(taskArray){

const taskList=document.getElementById("taskList");

taskList.innerHTML="";

if(taskArray.length===0){

taskList.innerHTML="<p class='text-gray-500'>No tasks found</p>";
return;

}

taskArray.forEach(task=>{

const div=document.createElement("div");

div.className="bg-white p-5 rounded-xl shadow";

div.innerHTML=`

<h3 class="text-lg font-semibold text-blue-700">${task.title}</h3>

<p class="text-sm text-gray-600 mt-1">${task.description}</p>

<div class="mt-2 text-sm">

<p><strong>Nature:</strong> ${task.nature}</p>

<p><strong>Deadline:</strong> ${task.deadline}</p>

<p><strong>Status:</strong> ${task.status}</p>

<p><strong>Assigned To:</strong> ${task.assignedTo.join(", ")}</p>

<p><strong>Support:</strong> ${task.support || "-"}</p>

${task.file ? `<a href="${task.file}" download class="text-blue-600 underline text-sm">Download Attachment</a>` : ""}

</div>

`;

taskList.appendChild(div);

});

}

/************************************************
 📊 HOD PERFORMANCE
************************************************/
function loadHodPerformance(){

const container=document.getElementById("hodPerformance");

if(!container) return;

const tasks=getTasks();

const hods=users.filter(u=>u.role==="hod");

container.innerHTML="";

hods.forEach(hod=>{

const hodTasks=tasks.filter(t=>t.assignedTo.includes(hod.username));

const total=hodTasks.length;

const completed=hodTasks.filter(t=>t.status==="Completed").length;

const percentage= total===0 ? 0 : Math.round((completed/total)*100);

const card=document.createElement("div");

card.className="bg-white p-5 rounded-xl shadow flex justify-between items-center";

card.innerHTML=`

<div>

<h3 class="text-lg font-semibold text-blue-700">${hod.name}</h3>

<p class="text-sm text-gray-600">Dept: ${hod.dept}</p>

<p class="text-sm mt-2">Tasks: ${completed} / ${total}</p>

</div>

<div class="relative w-16 h-16">

<svg class="w-16 h-16 transform -rotate-90">

<circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none"/>

<circle cx="32" cy="32" r="28" stroke="#2563eb" stroke-width="6" fill="none"
stroke-dasharray="175"
stroke-dashoffset="${175-(percentage/100)*175}"/>

</svg>

<span class="absolute inset-0 flex items-center justify-center text-sm font-semibold">

${percentage}%

</span>

</div>

`;

container.appendChild(card);

});

}

/************************************************
 📊 FACULTY PERFORMANCE
************************************************/
function loadFacultyPerformance(){

const container=document.getElementById("facultyPerformance");

if(!container) return;

const tasks=getTasks();

const faculties=users.filter(u=>u.role==="faculty");

container.innerHTML="";

faculties.forEach(fac=>{

const facTasks=tasks.filter(t=>t.assignedTo.includes(fac.username));

const total=facTasks.length;

const completed=facTasks.filter(t=>t.status==="Completed").length;

const percentage= total===0 ? 0 : Math.round((completed/total)*100);

const card=document.createElement("div");

card.className="bg-white p-5 rounded-xl shadow flex justify-between items-center";

card.innerHTML=`

<div>

<h3 class="text-lg font-semibold text-blue-700">${fac.name}</h3>

<p class="text-sm text-gray-600">${fac.dept}</p>

<p class="text-sm mt-2">Tasks: ${completed} / ${total}</p>

</div>

<div class="relative w-16 h-16">

<svg class="w-16 h-16 transform -rotate-90">

<circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none"/>

<circle cx="32" cy="32" r="28" stroke="#10b981" stroke-width="6" fill="none"
stroke-dasharray="175"
stroke-dashoffset="${175-(percentage/100)*175}"/>

</svg>

<span class="absolute inset-0 flex items-center justify-center text-sm font-semibold">

${percentage}%

</span>

</div>

`;

container.appendChild(card);

});

}

/************************************************
 LOGOUT
************************************************/
document.getElementById("logoutBtn").addEventListener("click",()=>{

localStorage.removeItem("loggedInUser");
window.location.href="../index.html";

});

/************************************************
 INITIAL LOAD
************************************************/
renderTasks(getTasks());
loadHodPerformance();
loadFacultyPerformance();




// import { users } from "../Data/Database.js";


// /************************************************
//  🔐 PAGE PROTECTION + LOAD PRINCIPAL INFO
// ************************************************/
// const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// if (!loggedInUser || loggedInUser.role !== "principal") {
//   window.location.href = "../index.html";
// }

// // Show principal name
// document.getElementById("principalName").textContent =
//   loggedInUser.name;

// /************************************************
//  👥 LOAD USERS INTO ASSIGN-TO DROPDOWN
// ************************************************/
// const assignToSelect = document.getElementById("assignTo");

// const hodGroup = document.createElement("optgroup");
// hodGroup.label = "HODs";

// const facultyGroup = document.createElement("optgroup");
// facultyGroup.label = "Faculty";

// const otherGroup = document.createElement("optgroup");
// otherGroup.label = "Others";

// users.forEach((user) => {
//   if (user.role === "principal") return;

//   const option = document.createElement("option");
//   option.value = user.username;
//   option.textContent = `${user.name} (${user.dept})`;

//   if (user.role === "hod") {
//     hodGroup.appendChild(option);
//   } 
//   else if (user.role === "faculty") {
//     facultyGroup.appendChild(option);
//   } 
//   else {
//     otherGroup.appendChild(option);
//   }
// });

// assignToSelect.appendChild(hodGroup);
// assignToSelect.appendChild(facultyGroup);
// assignToSelect.appendChild(otherGroup);

// const userSearch = document.getElementById("userSearch");

// userSearch.addEventListener("input", () => {
//   const keyword = userSearch.value.toLowerCase();

//   const options = assignToSelect.querySelectorAll("option");

//   options.forEach((opt) => {
//     const text = opt.textContent.toLowerCase();

//     if (text.includes(keyword)) {
//       opt.style.display = "block";
//     } else {
//       opt.style.display = "none";
//     }
//   });
// });


// /************************************************
//  🗂 TASK STORAGE HELPERS
// ************************************************/
// function getTasks() {
//   return JSON.parse(localStorage.getItem("tasks")) || [];
// }

// function saveTasks(tasks) {
//   localStorage.setItem("tasks", JSON.stringify(tasks));
// }

// /************************************************
//  ➕ ADD NEW TASK + EMAILJS (SAFE WAY)
// ************************************************/
// document.getElementById("addTaskBtn").addEventListener("click", () => {
//   const title = document.getElementById("taskTitle").value.trim();
//   const desc = document.getElementById("taskDesc").value.trim();
//   const nature = document.getElementById("taskNature").value;
//   const deadline = document.getElementById("taskDeadline").value;
//   const support = document.getElementById("supportPeople").value.trim();

//   const assignedTo = Array.from(assignToSelect.selectedOptions).map(
//     (opt) => opt.value
//   );

//   if (!title || !desc || !nature || !deadline || assignedTo.length === 0) {
//     alert("Please fill all required fields");
//     return;
//   }

//   const tasks = getTasks();

//   const newTask = {
//     id: Date.now(),
//     title,
//     description: desc,
//     nature,
//     deadline,
//     support,
//     assignedBy: loggedInUser.username,
//     assignedTo,
//     status: "Pending",
//     createdAt: new Date().toLocaleString()
//   };

//   tasks.push(newTask);
//   saveTasks(tasks);

//   /************************************************
//    📧 EMAILJS COMPONENT CALL (GLOBAL SAFE)
//   ************************************************/
 

//   assignedTo.forEach((username) => {
//     const user = users.find((u) => u.username === username);
//     if (!user || !user.email) return;
    
// console.log("Assigned username:", username);
// console.log("Resolved user:", user);
// console.log("Email value:", user?.email);

//     // IMPORTANT: window.emailjs (module-safe)
//     window.emailjs
//       .send("service_s56fino", "template_t43at3r", {
//         to_name: user.name,
//         to_email: user.email,
//         task_title: title,
//         task_nature: nature,
//         task_deadline: deadline,
//         from_name: loggedInUser.name
//       })
//       .then(() => {
//         console.log("Email sent to:", user.email);
//       })
//       .catch((err) => {
//         console.error("Email failed:", err);
//       });
//   });

//   clearForm();
//   renderTasks(tasks);
// });

// /************************************************
//  🧹 CLEAR FORM AFTER ADD
// ************************************************/
// function clearForm() {
//   document.getElementById("taskTitle").value = "";
//   document.getElementById("taskDesc").value = "";
//   document.getElementById("taskNature").value = "";
//   document.getElementById("taskDeadline").value = "";
//   document.getElementById("supportPeople").value = "";
//   assignToSelect.selectedIndex = -1;
// }

// /************************************************
//  📋 RENDER TASK LIST
// ************************************************/
// function renderTasks(taskArray) {
//   const taskList = document.getElementById("taskList");
//   taskList.innerHTML = "";

//   if (taskArray.length === 0) {
//     taskList.innerHTML =
//       "<p class='text-gray-500'>No tasks found</p>";
//     return;
//   }

//   taskArray.forEach((task) => {
//     const div = document.createElement("div");
//     div.className = "bg-white p-5 rounded-xl shadow";

//     div.innerHTML = `
//       <h3 class="text-lg font-semibold text-blue-700">${task.title}</h3>
//       <p class="text-sm text-gray-600 mt-1">${task.description}</p>

//       <div class="mt-2 text-sm">
//         <p><strong>Nature:</strong> ${task.nature}</p>
//         <p><strong>Deadline:</strong> ${task.deadline}</p>
//         <p><strong>Status:</strong> ${task.status}</p>
//         <p><strong>Assigned To:</strong> ${task.assignedTo.join(", ")}</p>
//         <p><strong>Support:</strong> ${task.support || "-"}</p>
//       </div>
//     `;

//     taskList.appendChild(div);
//   });
// }

// /************************************************
//  🔍 FILTER TASKS
// ************************************************/
// document
//   .getElementById("applyFilterBtn")
//   .addEventListener("click", () => {
//     const keyword =
//       document.getElementById("searchTask").value.toLowerCase();
//     const status =
//       document.getElementById("filterStatus").value;

//     let tasks = getTasks();

//     if (keyword) {
//       tasks = tasks.filter(
//         (t) =>
//           t.title.toLowerCase().includes(keyword) ||
//           t.description.toLowerCase().includes(keyword)
//       );
//     }

//     if (status) {
//       tasks = tasks.filter((t) => t.status === status);
//     }

//     renderTasks(tasks);
//   });

  


// /************************************************
//  📊 HOD PERFORMANCE ANALYTICS
// ************************************************/
// function loadHodPerformance() {
//   const hodContainer = document.getElementById("hodPerformance");
//   if (!hodContainer) return;

//   const tasks = getTasks();
//   const hods = users.filter((u) => u.role === "hod");

//   hodContainer.innerHTML = "";

//   hods.forEach((hod) => {
//     const hodTasks = tasks.filter((t) =>
//       t.assignedTo.includes(hod.username)
//     );

//     const total = hodTasks.length;
//     const completed = hodTasks.filter(
//       (t) => t.status === "Completed"
//     ).length;

//     let performance = "Excellent";
//     let color = "green";

//     if (total === 0) {
//       performance = "No Tasks";
//       color = "gray";
//     } else if (completed < total / 2) {
//       performance = "Needs Improvement";
//       color = "red";
//     } else if (completed < total) {
//       performance = "Average";
//       color = "yellow";
//     }

//   const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

// const card = document.createElement("div");
// card.className = "bg-white p-5 rounded-xl shadow flex items-center justify-between";

// card.innerHTML = `
//   <div>
//     <h3 class="text-lg font-semibold text-blue-700">${hod.name}</h3>
//     <p class="text-sm text-gray-600">Dept: ${hod.dept}</p>

//     <p class="text-sm mt-2">
//       Tasks: ${completed} / ${total}
//     </p>
//   </div>

//   <div class="relative w-16 h-16">
//     <svg class="w-16 h-16 transform -rotate-90">
//       <circle cx="32" cy="32" r="28"
//         stroke="#e5e7eb"
//         stroke-width="6"
//         fill="none"
//       />

//       <circle cx="32" cy="32" r="28"
//         stroke="#2563eb"
//         stroke-width="6"
//         fill="none"
//         stroke-dasharray="175"
//         stroke-dashoffset="${175 - (percentage / 100) * 175}"
//       />
//     </svg>

//     <span class="absolute inset-0 flex items-center justify-center text-sm font-semibold">
//       ${percentage}%
//     </span>
//   </div>
// `;


//     hodContainer.appendChild(card);
//   });
// }

// function loadFacultyPerformance() {
//   const container = document.getElementById("facultyPerformance");
//   if (!container) return;

//   const tasks = getTasks();
//   const faculties = users.filter((u) => u.role === "faculty");

//   container.innerHTML = "";

//   faculties.forEach((fac) => {
//     const facTasks = tasks.filter((t) =>
//       t.assignedTo.includes(fac.username)
//     );

//     const total = facTasks.length;
//     const completed = facTasks.filter(
//       (t) => t.status === "Completed"
//     ).length;

//    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
// const circumference = 251;
// const offset = circumference - (percentage / 100) * circumference;

// const card = document.createElement("div");
// card.className = "bg-white p-5 rounded-xl shadow flex items-center justify-between";

// card.innerHTML = `
//   <div>
//     <h3 class="text-lg font-semibold text-blue-700">${hod.name}</h3>
//     <p class="text-sm text-gray-600">Dept: ${hod.dept}</p>
//     <p class="text-sm mt-2">Tasks: ${completed} / ${total}</p>
//   </div>

//   <div class="relative w-20 h-20">

//     <svg class="w-20 h-20 transform -rotate-90">

//       <circle
//         cx="40"
//         cy="40"
//         r="32"
//         stroke="#e5e7eb"
//         stroke-width="8"
//         fill="none"
//       />

//       <circle
//         cx="40"
//         cy="40"
//         r="32"
//         stroke="#2563eb"
//         stroke-width="8"
//         fill="none"
//         stroke-dasharray="201"
//         stroke-dashoffset="${201 - (percentage/100)*201}"
//         stroke-linecap="round"
//       />

//     </svg>

//     <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold">
//       ${percentage}%
//     </div>

//   </div>
// `;


//     container.appendChild(card);
//   });
// }


// /************************************************
// LOGOUT
// ************************************************/
// document.getElementById("logoutBtn").addEventListener("click", () => {
//   localStorage.removeItem("loggedInUser");
//   window.location.href = "../index.html";
// });

// /************************************************
// INITIAL LOAD
// ************************************************/
// renderTasks(getTasks());
// loadHodPerformance();
// loadFacultyPerformance();


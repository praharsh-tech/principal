import { users } from "../Data/Database.js";

/************************************************
PAGE PROTECTION
************************************************/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.role !== "hod") {
  window.location.href = "../index.html";
}

/************************************************
LOAD HOD PROFILE
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
LOAD FACULTY DROPDOWN
************************************************/
const facultySelect = document.getElementById("assignToSelect");

users
.filter(u => u.role === "faculty")
.forEach(faculty => {

const option = document.createElement("option");

option.value = faculty.username;
option.textContent = `${faculty.name} (${faculty.dept})`;

facultySelect.appendChild(option);

});

/************************************************
TASK STORAGE
************************************************/
function getTasks(){
return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks){
localStorage.setItem("tasks", JSON.stringify(tasks));
}

/************************************************
LOAD HOD TASKS
************************************************/
function loadHodTasks(){

const tasks = getTasks();

const hodTasks = tasks.filter(task =>
task.assignedTo.includes(loggedInUser.username)
);

renderTasks(hodTasks);

}

/************************************************
RENDER TASKS
************************************************/
function renderTasks(tasks){

const taskBox = document.getElementById("hodTasks");

taskBox.innerHTML = "";

if(tasks.length === 0){

taskBox.innerHTML =
"<p class='text-gray-500'>No tasks assigned by Principal</p>";

return;

}

tasks.forEach(task => {

const div = document.createElement("div");

div.className = "bg-white p-5 rounded-xl shadow";

div.innerHTML = `

<h3 class="font-semibold text-lg text-blue-700">${task.title}</h3>

<p class="text-gray-600 text-sm mt-1">${task.description}</p>

<p class="text-sm mt-2">
<strong>Deadline:</strong> ${task.deadline}
</p>

${task.file ? `
<a href="${task.file}" download
class="text-blue-600 underline text-sm mt-2 block">
Download Attachment
</a>
` : ""}

<label class="block text-sm font-medium mt-3">
Update Status
</label>

<select class="hodStatusSelect border rounded-md px-3 py-1 mt-1 w-full"
data-id="${task.id}">

<option value="Pending" ${task.status==="Pending"?"selected":""}>Pending</option>
<option value="Processing" ${task.status==="Processing"?"selected":""}>Processing</option>
<option value="Completed" ${task.status==="Completed"?"selected":""}>Completed</option>

</select>

<label class="block text-sm font-medium mt-3">
Reply to Principal
</label>

<textarea class="hodReply border rounded-md px-3 py-2 w-full mt-1"
data-id="${task.id}"
placeholder="Write response...">${task.hodReply || ""}</textarea>

<label class="block text-sm font-medium mt-3">
Upload Response File
</label>

<input type="file"
class="hodFile border rounded-md px-3 py-1 w-full mt-1"
data-id="${task.id}" />

<button class="saveReplyBtn bg-blue-600 text-white px-3 py-1 rounded mt-3"
data-id="${task.id}">
Save Response
</button>

${task.hodFile ? `
<a href="${task.hodFile}" download
class="text-green-600 underline text-sm block mt-2">
Download Uploaded Response
</a>
` : ""}

`;

taskBox.appendChild(div);

});

attachStatusUpdate();
attachReplySave();

}

/************************************************
STATUS UPDATE
************************************************/
function attachStatusUpdate(){

document.querySelectorAll(".hodStatusSelect").forEach(select=>{

select.addEventListener("change",(e)=>{

const taskId = Number(e.target.dataset.id);
const tasks = getTasks();

const task = tasks.find(t=>t.id === taskId);

if(task){

task.status = e.target.value;
task.updatedAt = new Date().toLocaleString();

saveTasks(tasks);

}

});

});

}

/************************************************
SAVE HOD RESPONSE
************************************************/
function attachReplySave(){

document.querySelectorAll(".saveReplyBtn").forEach(btn=>{

btn.addEventListener("click",(e)=>{

const taskId = Number(e.target.dataset.id);

const tasks = getTasks();
const task = tasks.find(t=>t.id === taskId);

if(!task) return;

const replyInput =
document.querySelector(`.hodReply[data-id="${taskId}"]`);

const fileInput =
document.querySelector(`.hodFile[data-id="${taskId}"]`);

task.hodReply = replyInput.value;

const file = fileInput.files[0];

if(file){

const reader = new FileReader();

reader.onload = function(){

task.hodFile = reader.result;

saveTasks(tasks);

loadHodTasks();

};

reader.readAsDataURL(file);

}else{

saveTasks(tasks);

alert("Response saved");

}

});

});

}

/************************************************
ASSIGN TASK TO FACULTY
************************************************/
document.getElementById("assignTaskForm").addEventListener("submit",(e)=>{

e.preventDefault();

const facultyUsername = facultySelect.value;
const title = document.getElementById("taskTitle").value.trim();
const desc = document.getElementById("taskDesc").value.trim();
const deadline = document.getElementById("taskDeadline").value;

const fileInput = document.getElementById("taskFile");
const file = fileInput.files[0];

if(!facultyUsername || !title || !desc || !deadline){

alert("Please fill all fields");
return;

}

const tasks = getTasks();

const saveTask = (fileData=null)=>{

const newTask = {

id: Date.now(),
title,
description: desc,
deadline,
assignedBy: loggedInUser.username,
assignedTo: [facultyUsername],
status: "Pending",
file: fileData,
createdAt: new Date().toLocaleString()

};

tasks.push(newTask);

saveTasks(tasks);

alert("Task assigned to faculty");

clearForm();
toggleAssignSection(false);

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
CLEAR FORM
************************************************/
function clearForm(){

document.getElementById("taskTitle").value="";
document.getElementById("taskDesc").value="";
document.getElementById("taskDeadline").value="";
document.getElementById("taskFile").value="";
facultySelect.value="";

}

/************************************************
TOGGLE ASSIGN SECTION
************************************************/
const assignSection = document.getElementById("assignTaskSection");

document.getElementById("openAssignTask").addEventListener("click",()=>{
assignSection.classList.remove("hidden");
});

document.getElementById("cancelAssign").addEventListener("click",()=>{
assignSection.classList.add("hidden");
});

/************************************************
LOGOUT
************************************************/
document.getElementById("logoutBtn").addEventListener("click",()=>{
localStorage.removeItem("loggedInUser");
window.location.href="../index.html";
});

/************************************************
INIT
************************************************/
loadHodTasks();

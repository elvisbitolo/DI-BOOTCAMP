const tasks = [];

const form = document.getElementById("todoForm");
const input = document.getElementById("taskInput");
const list = document.querySelector(".listTasks");

// Add Task
function addTask(e) {
  e.preventDefault();

  const text = input.value.trim();

  if (text === "") return;

  const task = {
    task_id: tasks.length,
    text: text,
    done: false
  };

  tasks.push(task);

  renderTask(task);

  input.value = "";
}

form.addEventListener("submit", addTask);


// Render Task to DOM
function renderTask(task) {
  const div = document.createElement("div");
  div.classList.add("task");
  div.setAttribute("data-task-id", task.task_id);

  div.innerHTML = `
    <i class="fa-solid fa-xmark delete-btn"></i>
    <input type="checkbox" class="checkbox">
    <span>${task.text}</span>
  `;

  list.appendChild(div);

  // EVENTS
  div.querySelector(".checkbox").addEventListener("change", doneTask);
  div.querySelector(".delete-btn").addEventListener("click", deleteTask);
}


// Done Task
function doneTask(e) {
  const taskDiv = e.target.parentElement;
  const id = taskDiv.getAttribute("data-task-id");

  const task = tasks.find(t => t.task_id == id);

  task.done = !task.done;

  const text = taskDiv.querySelector("span");

  if (task.done) {
    text.classList.add("done");
  } else {
    text.classList.remove("done");
  }
}


// Delete Task
function deleteTask(e) {
  const taskDiv = e.target.parentElement;
  const id = taskDiv.getAttribute("data-task-id");

  const index = tasks.findIndex(t => t.task_id == id);

  tasks.splice(index, 1);

  taskDiv.remove();
}
// index.js
import "./styles.css";

// List ------------------
function List(...todos) {
  const todoList = [...todos];

  const addTodo = (todo) => todoList.push(todo);
  const removeTodo = (index) => todoList.splice(index, 1);

  return { todos: todoList, addTodo, removeTodo };
}

// Todo ------------------
const Todo = (title, desc, date, prio, tasks) => ({
  title,
  desc,
  date,
  prio,
  tasks: [...tasks],
});

// Task ------------------
const Task = (name, done = false) => ({
  name,
  done,
  toggleDone() {
    this.done = !this.done;
  },
});

// DOM Elements ----------------
const showButton = document.getElementById("add-item");
const dialog = document.getElementById("item-dialog");
const form = dialog.querySelector("form");
const addTaskButton = document.getElementById("add-task");
const listContainer = document.querySelector(".list-container");

const myTodoList = List();

// DOM functions --------------
const createListDiv = () => {
  const div = document.createElement("div");
  div.className = "todolist";
  return div;
};

function deleteTodo(index) {
  myTodoList.removeTodo(index);
  listContainer.innerHTML = "";
  displayList(myTodoList);
}


const displayList = (list) => {
  listContainer.innerHTML = ""; // Clear existing items
  list.todos.forEach((todo, i) => {
    listContainer.appendChild(generateTodoDiv(todo, i));
  });
};

const generateTodoDiv = (todo, index) => {
  const div = document.createElement("div");
  div.className = "todo-container";

  // Card content
  const card = document.createElement("div");
  card.className = "todo-card";

  card.innerHTML = `
    <p>Title: ${todo.title}</p>
    <p>Description: ${todo.desc}</p>
    <p class="todo-priority priority-${todo.prio.toLowerCase()}">Priority: ${todo.prio}</p>
    <p>Due Date: ${todo.date}</p>
  `;

  // Tasks
  const taskContainer = document.createElement("div");
  taskContainer.className = "task-container";
  todo.tasks.forEach(({ name, done }) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.innerHTML = `
      <p>${name}</p>
      <input type="checkbox" ${done ? "checked" : ""}>
    `;
    taskContainer.appendChild(taskDiv);
  });

  card.appendChild(taskContainer);

  // Actions
  const actionContainer = document.createElement("div");
  actionContainer.className = "todo-actions";
  actionContainer.innerHTML = `
    <button class="item-control edit-button" data-index="${index}">Edit</button>
    <button class="item-control delete-button" data-index="${index}">Delete</button>
  `;

  div.append(card, actionContainer);
  return div;
};


const generateTaskFieldDiv = () => {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-form-field";
  taskDiv.innerHTML = `
    <label>Task: <input type="text" name="task" class="task-input-field"></label>
    <label>Completed? <input type="checkbox" name="checkbox" class="completed-input-field"></label>
  `;
  return taskDiv;
};

// Event Listeners --------------------
showButton.addEventListener("click", (e) => {
  e.preventDefault();
  dialog.showModal();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = form.elements["title"].value.trim();
  const desc = form.elements["desc"].value.trim();
  const dueDate = form.elements["date"].value;
  const priority = form.querySelector('input[name="priority"]:checked')?.value || 'medium';

  const tasks = Array.from(document.querySelectorAll(".task-form-field")).map((taskField) => {
    const name = taskField.querySelector(".task-input-field").value.trim();
    const done = taskField.querySelector(".completed-input-field").checked;
    return name ? Task(name, done) : null;
  }).filter(Boolean);

  const newTodo = Todo(title, desc, dueDate, priority, tasks);

  const editingIndex = form.dataset.editingIndex;

  if (editingIndex !== undefined) {
    myTodoList.todos[editingIndex] = newTodo;
    delete form.dataset.editingIndex;
  } else {
    myTodoList.addTodo(newTodo);
  }

  dialog.close();
  displayList(myTodoList);
});


addTaskButton.addEventListener("click", (e) => {
  e.preventDefault();
  form.insertBefore(generateTaskFieldDiv(), addTaskButton);
});

listContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-button")) {
    const index = e.target.dataset.index;
    openEditDialog(index);
  }
  else if(e.target.classList.contains("delete-button")) {
    const index = e.target.dataset.index;
    deleteTodo(index);
  }
});

const openEditDialog = (index) => {
  const todo = myTodoList.todos[index];

  form.elements["title"].value = todo.title;
  form.elements["desc"].value = todo.desc;
  form.elements["date"].value = todo.date;
  form.elements["prio"].value = todo.prio;

  const taskFields = document.querySelectorAll(".task-form-field");
  taskFields.forEach((field) => field.remove());

  todo.tasks.forEach((task) => {
    const taskDiv = generateTaskFieldDiv();
    taskDiv.querySelector(".task-input-field").value = task.name;
    taskDiv.querySelector(".completed-input-field").checked = task.done;
    form.insertBefore(taskDiv, addTaskButton);
  });

  dialog.showModal();

  form.dataset.editingIndex = index;
};


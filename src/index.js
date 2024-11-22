// index.js
import "./styles.css";

// List ------------------
function List(titleStr, ...todos) {
  const title = titleStr;
  const todoList = [...todos];

  const addTodo = (todo) => todoList.push(todo);
  const removeTodo = (index) => todoList.splice(index, 1);
  const getTodos = () => [...todos];

  return { title, todos: todoList, addTodo, removeTodo };
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
const sidebar = document.querySelector(".sidebar")
const listDialog = document.getElementById("list-dialog");

// DOM functions --------------

function deleteTodo(list, index) {
  list.removeTodo(index);
  listContainer.innerHTML = "";
  displayList(list);
}


const displayList = (list) => {
  listContainer.innerHTML = `<h1>${list.title}</h1>`; // Clear existing items
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

const updateSidebar = () => {
  const container = sidebar.querySelector(".list-name-container")
  
  container.innerHTML = ""; 
  lists.forEach((list, index) => {
    const listItem = document.createElement("button"); 
    listItem.className = "list-link";
    listItem.textContent = list.title;
    listItem.dataset.index = index;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'Delete';
    deleteButton.dataset.index = index;


    const listContainer = document.createElement('div');
    listContainer.appendChild(listItem);
    listContainer.appendChild(deleteButton);
    container.appendChild(listContainer);

    deleteButton.addEventListener('click', () => {
      deleteList(index);
    });
  });
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
  const priority = form.elements["prio"].value;

  const tasks = Array.from(document.querySelectorAll(".task-form-field")).map((taskField) => {
    const name = taskField.querySelector(".task-input-field").value.trim();
    const done = taskField.querySelector(".completed-input-field").checked;
    return name ? Task(name, done) : null;
  }).filter(Boolean);

  const newTodo = Todo(title, desc, dueDate, priority, tasks);

  const activeListIndex =  sidebar.querySelector(".list-link[data-active='true']").dataset.index;
  const editingIndex = form.dataset.editingIndex;

  if (activeListIndex !== undefined) {
    const list = lists[activeListIndex];
    if (editingIndex !== undefined) {
      list.todos[editingIndex] = newTodo;
      delete form.dataset.editingIndex;
    } else {
      list.addTodo(newTodo);
    }

    displayList(list);
  }

  dialog.close();
});


addTaskButton.addEventListener("click", (e) => {
  e.preventDefault();
  form.insertBefore(generateTaskFieldDiv(), addTaskButton);
});

listContainer.addEventListener("click", (e) => {
  const listIndex = sidebar.querySelector(".list-link[data-active='true']").dataset.index;
  const activeList = lists[listIndex];

  if (e.target.classList.contains("edit-button")) {
    const index = e.target.dataset.index;
    openEditDialog(activeList, index);
  }
  else if(e.target.classList.contains("delete-button")) {
    const index = e.target.dataset.index;
    deleteTodo(activeList, index);
  }
});

const openEditDialog = (list, index) => {
  const todo = list.todos[index];

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

sidebar.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-list-button")) {
    e.preventDefault();
    listDialog.showModal();
  }

  if(e.target.classList.contains("submit")) {
    e.preventDefault();
    const title = listDialog.querySelector("form").elements["title"].value.trim();
    const list = List(title);
    console.log(list);

    lists.push(list);
    listDialog.close();

    updateSidebar();
  }

  if(e.target.classList.contains("list-link")) {
    const listIndex = e.target.closest(".list-link").dataset.index;
    sidebar.querySelectorAll(".list-link").forEach((link) => link.removeAttribute("data-active"));
    e.target.setAttribute("data-active", "true");
    displayList(lists[listIndex]);
  } 
});

// Main -------------

function deleteList(index) {
  lists.splice(index, 1); 
  updateSidebar(); 
}

const lists = [];
const myTodoList = List("myTodoList");

const task1 = Task("Finish TodoList");
const task2 = Task("Finish Battleship");

const newTodo = Todo(
  "Finish Odin Project", // Title
  "The tasks yet remaining", // Description
  "2025-01-01", // Due date
  "High", // Priority
  [task1, task2] // Tasks
);
myTodoList.addTodo(newTodo);

lists.push(myTodoList)

updateSidebar();
const firstListLink = sidebar.querySelector(".list-link");
while(!firstListLink) firstListLink = sidebar.querySelector(".list-link");
firstListLink.click();

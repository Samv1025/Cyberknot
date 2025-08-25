const addTaskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const search = document.getElementById('search');
const priority = document.getElementById('priority');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasks = document.getElementById('totalTasks');
const activeTasks = document.getElementById('activeTasks');
const completedTasks = document.getElementById('completedTasks');
const themeToggle = document.getElementById('themeToggle');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(t => t.completed).length;
  activeTasks.textContent = tasks.filter(t => !t.completed).length;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  let filtered = tasks;
  if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
  if (search.value) filtered = filtered.filter(t => t.title.toLowerCase().includes(search.value.toLowerCase()));

  taskList.innerHTML = filtered.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <div class="task-info">
        <span class="task-title">${task.title}</span>
        <span class="task-meta">Priority: ${task.priority}</span>
      </div>
      <div class="task-actions">
        <button class="complete-btn" onclick="toggleComplete('${task.id}')">${task.completed ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
      </div>
    </div>
  `).join('');
  updateStats();
}

function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;
  const newTask = { id: Date.now().toString(), title, priority: priority.value, completed: false };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = '';
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Theme Toggle with LocalStorage
function setTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  setTheme(isDark);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') setTheme(true);

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
search.addEventListener('input', renderTasks);
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks();
}));

renderTasks();

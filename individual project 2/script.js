// Student Task Manager - script.js
// Data stored in localStorage under 'stm_tasks'

const form = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');
const noTasks = document.getElementById('noTasks');
const clearBtn = document.getElementById('clearBtn');

let tasks = []; // {id, title, description, deadline (YYYY-MM-DD), status, createdAt}

function saveTasks() {
  localStorage.setItem('stm_tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem('stm_tasks');
  tasks = raw ? JSON.parse(raw) : [];
}

function uid() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function updateTask(id, updates) {
  tasks = tasks.map(t => t.id === id ? {...t, ...updates} : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearAll() {
  if (!confirm('Clear all tasks? This cannot be undone.')) return;
  tasks = [];
  saveTasks();
  renderTasks();
}

function compareDeadlineAsc(a,b){
  return new Date(a.deadline) - new Date(b.deadline);
}
function compareDeadlineDesc(a,b){
  return new Date(b.deadline) - new Date(a.deadline);
}
function compareStatus(a,b){
  const order = {completed:0, inprogress:1, pending:2};
  return (order[a.status]||9) - (order[b.status]||9);
}

function applySort(list){
  const s = sortBy.value;
  if(s === 'deadline_asc') return list.sort(compareDeadlineAsc);
  if(s === 'deadline_desc') return list.sort(compareDeadlineDesc);
  if(s === 'status') return list.sort(compareStatus);
  return list;
}

function applyFilter(list){
  const f = filterStatus.value;
  if(f === 'all') return list;
  return list.filter(t => t.status === f);
}

function renderTasks() {
  // filter and sort
  let list = [...tasks];
  list = applyFilter(list);
  list = applySort(list);

  tasksContainer.innerHTML = '';
  if(list.length === 0) {
    noTasks.style.display = 'block';
  } else {
    noTasks.style.display = 'none';
  }

  list.forEach(t => {
    const li = document.createElement('li');
    li.className = `task-item ${t.status}`;
    li.dataset.id = t.id;

    const main = document.createElement('div');
    main.className = 'task-main';
    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = t.title;
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const dl = document.createElement('span');
    dl.innerHTML = `Deadline: <strong class="label-deadline">${t.deadline}</strong>`;
    const created = document.createElement('span');
    created.className = 'muted';
    created.style.marginLeft = '10px';
    created.textContent = `Added: ${new Date(t.createdAt).toLocaleDateString()}`;
    meta.appendChild(dl);
    meta.appendChild(created);

    const desc = document.createElement('p');
    desc.className = 'task-desc';
    desc.textContent = t.description || '';

    main.appendChild(title);
    main.appendChild(meta);
    if(t.description) main.appendChild(desc);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const statusSel = document.createElement('select');
    statusSel.className = 'status-select';
    statusSel.innerHTML = `
      <option value="pending">Pending</option>
      <option value="inprogress">In Progress</option>
      <option value="completed">Completed</option>
    `;
    statusSel.value = t.status;
    statusSel.addEventListener('change', (e)=>{
      updateTask(t.id, {status: e.target.value});
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-small edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', ()=> populateFormForEdit(t));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-small delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', ()=> {
      if(confirm('Delete this task?')) deleteTask(t.id);
    });

    actions.appendChild(statusSel);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(main);
    li.appendChild(actions);

    tasksContainer.appendChild(li);
  });

  updateProgress();
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pct = total === 0 ? 0 : Math.round((completed/total)*100);
  progressBar.style.width = pct + '%';
  progressText.textContent = `${completed}/${total} tasks completed`;
}

function populateFormForEdit(task) {
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description || '';
  document.getElementById('deadline').value = task.deadline;
  document.getElementById('status').value = task.status;
  // Replace add action with update
  const addBtn = document.getElementById('addBtn');
  addBtn.textContent = 'Update Task';
  addBtn.dataset.editing = task.id;
  document.getElementById('title').focus();
}

function checkOverdueAndNotify() {
  const today = new Date();
  const overdue = tasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < today);
  if(overdue.length > 0){
    // show one alert for now, listing titles
    const titles = overdue.map(o => `${o.title} (due ${o.deadline})`).join('\n');
    // show a gentle alert — could be replaced by Notification API if permitted
    alert(`Overdue tasks detected:\n\n${titles}`);
  }
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const deadline = document.getElementById('deadline').value;
  const status = document.getElementById('status').value;

  if(!title || !deadline) return; // form required handles most cases

  const addBtn = document.getElementById('addBtn');
  const editingId = addBtn.dataset.editing;

  if(editingId){
    updateTask(editingId, {title, description, deadline, status});
    addBtn.textContent = 'Add Task';
    delete addBtn.dataset.editing;
    form.reset();
  } else {
    const newTask = {
      id: uid(),
      title,
      description,
      deadline,
      status,
      createdAt: new Date().toISOString()
    };
    addTask(newTask);
    form.reset();
  }
});

filterStatus.addEventListener('change', renderTasks);
sortBy.addEventListener('change', renderTasks);
clearBtn.addEventListener('click', clearAll);

// initialize
loadTasks();
renderTasks();
// check for overdue tasks once on load
checkOverdueAndNotify();

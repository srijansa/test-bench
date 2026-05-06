const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const error = document.querySelector('#task-error');
const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');
const clearDone = document.querySelector('#clear-done');
const filterButtons = [...document.querySelectorAll('.filter')];
const themeToggle = document.querySelector('#theme-toggle');
const counterValue = document.querySelector('#counter-value');

let tasks = [
  { id: crypto.randomUUID(), title: 'Try codegen', done: false },
  { id: crypto.randomUUID(), title: 'Run a test', done: true },
];
let filter = 'all';
let counter = 0;

function pluralize(value, label) {
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'open') return !task.done;
    if (filter === 'done') return task.done;
    return true;
  });

  list.innerHTML = '';

  if (visibleTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No tasks here yet.';
    list.append(empty);
  }

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = 'task';
    item.dataset.done = String(task.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark ${task.title} done`);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      render();
    });

    const title = document.createElement('span');
    title.textContent = task.title;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      tasks = tasks.filter((candidate) => candidate.id !== task.id);
      render();
    });

    item.append(checkbox, title, remove);
    list.append(item);
  }

  const openTasks = tasks.filter((task) => !task.done).length;
  count.textContent = `${pluralize(openTasks, 'open task')}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    error.textContent = 'Please enter a task first.';
    input.focus();
    return;
  }

  error.textContent = '';
  tasks.unshift({ id: crypto.randomUUID(), title, done: false });
  input.value = '';
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

clearDone.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.done);
  render();
});

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

document.querySelector('#increment').addEventListener('click', () => {
  counter += 1;
  counterValue.value = counter;
  counterValue.textContent = String(counter);
});

document.querySelector('#decrement').addEventListener('click', () => {
  counter -= 1;
  counterValue.value = counter;
  counterValue.textContent = String(counter);
});

document.querySelector('#reset-counter').addEventListener('click', () => {
  counter = 0;
  counterValue.value = counter;
  counterValue.textContent = String(counter);
});

render();

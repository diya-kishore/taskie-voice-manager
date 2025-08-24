const voiceAddBtn = document.getElementById('voice-add');
const voiceDeleteBtn = document.getElementById('voice-delete');
const voiceCompletedBtn = document.getElementById('voice-completed');
const transcriptDiv = document.getElementById('transcript');
const dueTodayList = document.getElementById('dueTodayList');
const completedList = document.getElementById('completedList');
const deletedList = document.getElementById('deletedList');
const tasksBtn = document.querySelector('.tasks-dropdown-btn');
const tasksMenu = document.getElementById('tasks-menu');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  transcriptDiv.innerText = "Sorry, your browser doesn't support speech recognition.";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  let currentCommand = null;

  // Load tasks from localStorage and populate lists
  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || {due: [], completed: [], deleted: []};
    dueTodayList.innerHTML = '';
    completedList.innerHTML = '';
    deletedList.innerHTML = '';

    savedTasks.due.forEach(taskText => {
      addTaskToDOM(dueTodayList, taskText);
    });
    savedTasks.completed.forEach(taskText => {
      addTaskToDOM(completedList, taskText);
    });
    savedTasks.deleted.forEach(taskText => {
      addTaskToDOM(deletedList, taskText);
    });
  }

  // Save current task lists to localStorage
  function saveTasks() {
    const due = Array.from(dueTodayList.querySelectorAll('li')).map(li => li.textContent);
    const completed = Array.from(completedList.querySelectorAll('li')).map(li => li.textContent);
    const deleted = Array.from(deletedList.querySelectorAll('li')).map(li => li.textContent);
    const tasks = {due, completed, deleted};
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Helper to create a <li> with task text and add it to specified list
  function addTaskToDOM(listElement, taskText) {
    const li = document.createElement('li');
    li.textContent = taskText;
    li.setAttribute('role', 'menuitem');
    listElement.appendChild(li);
  }

  function openDropdownMenu() {
    if (!tasksMenu.classList.contains('show')) {
      tasksMenu.classList.add('show');
      tasksMenu.setAttribute('aria-hidden', 'false');
      tasksBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function findTaskExact(list, text) {
    const lowerText = text.toLowerCase();
    return Array.from(list.querySelectorAll('li')).find(li => li.textContent.toLowerCase() === lowerText) || null;
  }

  function addTask(taskText) {
    addTaskToDOM(dueTodayList, taskText);
    saveTasks();
  }

  function deleteTask(taskText) {
    let task = findTaskExact(dueTodayList, taskText) || findTaskExact(completedList, taskText);
    if (task) {
      task.parentElement.removeChild(task);
      addTaskToDOM(deletedList, taskText);
      saveTasks();
    } else {
      transcriptDiv.innerText = `Task '${taskText}' not found to delete.`;
    }
  }

  function completeTask(taskText) {
    let task = findTaskExact(dueTodayList, taskText);
    if (task) {
      task.parentElement.removeChild(task);
      addTaskToDOM(completedList, taskText);
      saveTasks();
    } else {
      transcriptDiv.innerText = `Task '${taskText}' not found to complete.`;
    }
  }

  function startRecognitionForCommand(command) {
    currentCommand = command;
    transcriptDiv.innerText = `Listening for "${command}" command...`;
    recognition.start();
  }

  recognition.onresult = (event) => {
    if (event.results && event.results.length > 0) {
      const spokenText = event.results[event.resultIndex][0].transcript.trim();
      transcriptDiv.innerText = `You said: "${spokenText}"`;
      if (currentCommand === 'add') {
        addTask(spokenText);
      } else if (currentCommand === 'delete') {
        deleteTask(spokenText);
      } else if (currentCommand === 'completed') {
        completeTask(spokenText);
      }
      openDropdownMenu();
      currentCommand = null;
    } else {
      transcriptDiv.innerText = "No speech was recognized.";
    }
  };

  recognition.onerror = (event) => {
    transcriptDiv.innerText = `Error occurred: ${event.error}`;
  };

  voiceAddBtn.onclick = () => startRecognitionForCommand('add');
  voiceDeleteBtn.onclick = () => startRecognitionForCommand('delete');
  voiceCompletedBtn.onclick = () => startRecognitionForCommand('completed');

  // Initial load
  loadTasks();
}

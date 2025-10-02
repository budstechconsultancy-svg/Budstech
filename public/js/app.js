// Application state
const APP = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentView: 'chat',
  currentMode: 'chat',
  isRecording: false,
  recognition: null,
  settings: {}
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  if (APP.token && APP.user) {
    showApp();
    loadUserSettings();
  } else {
    showLogin();
  }
  
  initializeEventListeners();
  initializeSpeechRecognition();
});

// Show/Hide pages
function showLogin() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('app-page').classList.remove('active');
}

function showApp() {
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-page').classList.add('active');
  
  if (APP.user) {
    document.getElementById('user-name').textContent = `Welcome, ${APP.user.name}!`;
    playWelcomeMessage();
  }
  
  switchView('chat');
}

// Event Listeners
function initializeEventListeners() {
  // Auth forms
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
  });

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      if (view) switchView(view);
    });
  });

  // Voice controls
  document.getElementById('mic-btn').addEventListener('click', toggleRecording);
  
  // Quick commands
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const command = e.target.dataset.command;
      processVoiceCommand(command);
    });
  });

  // Settings
  document.getElementById('settings-form').addEventListener('submit', saveSettings);

  // Documents
  document.getElementById('upload-btn').addEventListener('click', uploadDocument);

  // View navigation
  document.getElementById('back-to-chat').addEventListener('click', () => switchView('chat'));
  document.getElementById('back-to-chat-from-code').addEventListener('click', () => switchView('chat'));
  document.getElementById('clear-whiteboard').addEventListener('click', clearWhiteboard);
  document.getElementById('run-code').addEventListener('click', runCode);
}

// Initialize Speech Recognition
function initializeSpeechRecognition() {
  if ('webkitSpeechRecognition' in window) {
    APP.recognition = new webkitSpeechRecognition();
    APP.recognition.continuous = false;
    APP.recognition.interimResults = false;
    APP.recognition.lang = 'en-US';

    APP.recognition.onstart = () => {
      APP.isRecording = true;
      document.getElementById('recording-indicator').style.display = 'flex';
      document.getElementById('mic-btn').innerHTML = '<span class="mic-icon">🎤</span> Listening...';
    };

    APP.recognition.onend = () => {
      APP.isRecording = false;
      document.getElementById('recording-indicator').style.display = 'none';
      document.getElementById('mic-btn').innerHTML = '<span class="mic-icon">🎤</span> Start Speaking';
    };

    APP.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      addTranscriptMessage(transcript, 'user');
      processVoiceCommand(transcript);
    };

    APP.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      APP.isRecording = false;
      document.getElementById('recording-indicator').style.display = 'none';
      document.getElementById('mic-btn').innerHTML = '<span class="mic-icon">🎤</span> Start Speaking';
    };
  } else {
    console.warn('Speech recognition not supported in this browser');
    document.getElementById('mic-btn').disabled = true;
    document.getElementById('mic-btn').innerHTML = 'Speech recognition not supported';
  }
}

// Toggle recording
function toggleRecording() {
  if (!APP.recognition) return;

  if (APP.isRecording) {
    APP.recognition.stop();
  } else {
    APP.recognition.start();
  }
}

// Switch views
function switchView(view) {
  APP.currentView = view;
  
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === view) {
      btn.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });
  
  document.getElementById(`${view}-view`).classList.add('active');

  // Load view-specific data
  if (view === 'documents') {
    loadDocuments();
  } else if (view === 'bookmarks') {
    loadBookmarks();
  } else if (view === 'settings') {
    loadSettings();
  } else if (view === 'whiteboard') {
    APP.currentMode = 'whiteboard';
    initializeWhiteboard();
  } else if (view === 'code') {
    APP.currentMode = 'code';
  } else if (view === 'chat') {
    APP.currentMode = 'chat';
  }
}

// Authentication handlers
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      APP.token = data.token;
      APP.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showApp();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const gradeLevel = document.getElementById('register-grade').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, gradeLevel })
    });

    const data = await response.json();

    if (response.ok) {
      APP.token = data.token;
      APP.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showApp();
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
}

function handleLogout() {
  APP.token = null;
  APP.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showLogin();
}

// Voice processing
async function processVoiceCommand(transcript) {
  if (!transcript) return;

  try {
    const response = await fetch('/api/voice/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP.token}`
      },
      body: JSON.stringify({
        transcript,
        mode: APP.currentMode,
        gradeLevel: APP.user.gradeLevel
      })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.action === 'switch_mode') {
        switchView(data.mode);
        addTranscriptMessage(data.message, 'tutor');
        speak(data.message);
      } else if (data.action === 'bookmark') {
        await saveBookmark(transcript);
        addTranscriptMessage(data.message, 'tutor');
        speak(data.message);
      } else if (data.action === 'respond') {
        addTranscriptMessage(data.text, 'tutor');
        
        if (data.mode === 'whiteboard') {
          displayWhiteboardContent(data.text);
        } else if (data.mode === 'code') {
          displayCodeContent(data.text);
        }
        
        speak(data.text);
      }
    } else {
      addTranscriptMessage('Sorry, I encountered an error processing your request.', 'tutor');
    }
  } catch (error) {
    console.error('Voice processing error:', error);
    addTranscriptMessage('Sorry, I encountered an error processing your request.', 'tutor');
  }
}

// Transcript display
function addTranscriptMessage(text, sender) {
  const display = document.getElementById('transcript-display');
  const message = document.createElement('div');
  message.className = `transcript-message ${sender}`;
  message.textContent = text;
  display.appendChild(message);
  display.scrollTop = display.scrollHeight;
}

// Text-to-Speech
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = APP.settings.speaking_rate === 'slow' ? 0.8 : 
                     APP.settings.speaking_rate === 'fast' ? 1.2 : 1.0;
    utterance.pitch = APP.settings.pitch === 'low' ? 0.8 : 
                      APP.settings.pitch === 'high' ? 1.2 : 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function playWelcomeMessage() {
  speak(`Hello ${APP.user.name}, which topic shall we explore today?`);
}

// Settings management
async function loadUserSettings() {
  try {
    const response = await fetch('/api/settings', {
      headers: { 'Authorization': `Bearer ${APP.token}` }
    });

    if (response.ok) {
      APP.settings = await response.json();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function loadSettings() {
  if (APP.settings.tts_provider) {
    document.getElementById('tts-provider').value = APP.settings.tts_provider;
  }
  if (APP.settings.speaking_rate) {
    document.getElementById('speaking-rate').value = APP.settings.speaking_rate;
  }
  if (APP.settings.pitch) {
    document.getElementById('pitch').value = APP.settings.pitch;
  }
}

async function saveSettings(e) {
  e.preventDefault();
  
  const settings = {
    tts_provider: document.getElementById('tts-provider').value,
    speaking_rate: document.getElementById('speaking-rate').value,
    pitch: document.getElementById('pitch').value
  };

  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP.token}`
      },
      body: JSON.stringify(settings)
    });

    if (response.ok) {
      APP.settings = settings;
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  }
}

// Documents management
async function loadDocuments() {
  try {
    const response = await fetch('/api/documents', {
      headers: { 'Authorization': `Bearer ${APP.token}` }
    });

    if (response.ok) {
      const documents = await response.json();
      displayDocuments(documents);
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
}

function displayDocuments(documents) {
  const list = document.getElementById('documents-list');
  list.innerHTML = '';

  if (documents.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #666;">No documents uploaded yet.</p>';
    return;
  }

  documents.forEach(doc => {
    const item = document.createElement('div');
    item.className = 'document-item';
    item.innerHTML = `
      <div class="document-info">
        <div class="document-name">${doc.filename}</div>
        <div class="document-date">Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}</div>
      </div>
      <div class="document-actions">
        <button onclick="deleteDocument(${doc.id})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

async function uploadDocument() {
  const fileInput = document.getElementById('document-upload');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file to upload');
    return;
  }

  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${APP.token}` },
      body: formData
    });

    if (response.ok) {
      alert('Document uploaded successfully!');
      fileInput.value = '';
      loadDocuments();
    } else {
      alert('Failed to upload document');
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    alert('Failed to upload document');
  }
}

async function deleteDocument(id) {
  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }

  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${APP.token}` }
    });

    if (response.ok) {
      loadDocuments();
    } else {
      alert('Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    alert('Failed to delete document');
  }
}

// Bookmarks management
async function loadBookmarks() {
  try {
    const response = await fetch('/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${APP.token}` }
    });

    if (response.ok) {
      const bookmarks = await response.json();
      displayBookmarks(bookmarks);
    }
  } catch (error) {
    console.error('Error loading bookmarks:', error);
  }
}

function displayBookmarks(bookmarks) {
  const list = document.getElementById('bookmarks-list');
  list.innerHTML = '';

  if (bookmarks.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #666;">No bookmarks saved yet.</p>';
    return;
  }

  bookmarks.forEach(bookmark => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    item.innerHTML = `
      <div class="bookmark-header">
        <div class="bookmark-concept">${bookmark.concept}</div>
        <span class="bookmark-mode">${bookmark.mode}</span>
      </div>
      ${bookmark.content ? `<div class="bookmark-content">${bookmark.content}</div>` : ''}
      <div class="bookmark-date">Saved: ${new Date(bookmark.created_at).toLocaleDateString()}</div>
      <div class="bookmark-actions">
        <button onclick="deleteBookmark(${bookmark.id})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

async function saveBookmark(concept) {
  try {
    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP.token}`
      },
      body: JSON.stringify({
        concept,
        mode: APP.currentMode,
        content: ''
      })
    });

    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
  return false;
}

async function deleteBookmark(id) {
  if (!confirm('Are you sure you want to delete this bookmark?')) {
    return;
  }

  try {
    const response = await fetch(`/api/bookmarks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${APP.token}` }
    });

    if (response.ok) {
      loadBookmarks();
    } else {
      alert('Failed to delete bookmark');
    }
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    alert('Failed to delete bookmark');
  }
}

// Whiteboard functionality
function initializeWhiteboard() {
  const canvas = document.getElementById('whiteboard-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  ctx.strokeStyle = '#ecf0f1';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseout', () => isDrawing = false);
}

function clearWhiteboard() {
  const canvas = document.getElementById('whiteboard-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('whiteboard-transcript').innerHTML = '';
}

function displayWhiteboardContent(content) {
  const transcript = document.getElementById('whiteboard-transcript');
  transcript.innerHTML = content.replace(/\n/g, '<br>');
}

// Code mode functionality
function displayCodeContent(content) {
  // Parse content for code blocks
  const codeMatch = content.match(/```[\s\S]*?```/);
  if (codeMatch) {
    const code = codeMatch[0].replace(/```/g, '');
    document.getElementById('code-display').textContent = code;
  }
  
  // Display explanation
  const explanation = content.replace(/```[\s\S]*?```/g, '');
  document.getElementById('code-whiteboard-section').textContent = explanation;
}

function runCode() {
  const code = document.getElementById('code-display').textContent;
  const output = document.getElementById('code-output');
  
  output.innerHTML = '<p style="color: #666;">Code execution is simulated. In a production environment, this would run in a sandboxed environment.</p>';
  output.innerHTML += `<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px;">${code}</pre>`;
  
  speak('Code has been executed. Check the results below.');
}

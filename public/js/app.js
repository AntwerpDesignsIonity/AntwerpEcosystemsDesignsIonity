// WebSocket connection
let ws;
let reconnectInterval;
let reconnectAttempts = 0;
let currentTab = 'chat-1';
let tabCounter = 1;
let selectedMessageId = null;

// Initialize the application
function init() {
    connectWebSocket();
    setupEventListeners();
    loadHistory();
}

// Connect to WebSocket server with exponential backoff
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    try {
        ws = new WebSocket(`${protocol}//${window.location.host}`);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            updateConnectionStatus(true);
            reconnectAttempts = 0; // Reset counter on successful connection
            clearInterval(reconnectInterval);
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            updateConnectionStatus(false);
            
            // Exponential backoff for reconnection (max 30 seconds)
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            
            clearInterval(reconnectInterval);
            reconnectInterval = setTimeout(() => {
                console.log(`Attempting to reconnect (attempt ${reconnectAttempts})...`);
                connectWebSocket();
            }, delay);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            ws.close(); // Trigger onclose handler for reconnection
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        updateConnectionStatus(false);
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'init':
            // Initial data load
            data.data.messages.forEach(msg => addMessageToUI(msg));
            data.data.notes.forEach(note => addNoteToUI(note));
            break;
        case 'message':
            addMessageToUI(data.data);
            break;
        case 'note':
            addNoteToUI(data.data);
            break;
        case 'sticker':
            addStickerToMessage(data.data);
            break;
        case 'clear':
            clearUI();
            break;
    }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    
    if (connected) {
        statusElement.innerHTML = '<span class="status-dot connected"></span> Connected';
    } else {
        statusElement.innerHTML = '<span class="status-dot disconnected"></span> Disconnected';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Send message
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add note
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
    document.getElementById('noteInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addNote();
        }
    });
    
    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all chat history?')) {
            clearHistory();
        }
    });
    
    // Add new tab
    document.getElementById('addTabBtn').addEventListener('click', addNewTab);
    
    // Toggle stickers panel
    document.getElementById('stickerToggleBtn').addEventListener('click', toggleStickersPanel);
    
    // Sticker selection
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const emoji = e.target.dataset.emoji;
            if (selectedMessageId) {
                addSticker(emoji, selectedMessageId);
            }
            toggleStickersPanel();
        });
    });
    
    // Close stickers panel when clicking outside
    document.addEventListener('click', (e) => {
        const stickersPanel = document.getElementById('stickersPanel');
        const stickerBtn = document.getElementById('stickerToggleBtn');
        if (!stickersPanel.contains(e.target) && !stickerBtn.contains(e.target)) {
            stickersPanel.style.display = 'none';
        }
    });
}

// Send message to server
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    fetch('/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, sender: 'user' })
    })
    .then(response => response.json())
    .then(data => {
        input.value = '';
        input.focus();
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
}

// Add message to UI
function addMessageToUI(message) {
    const chatContent = document.getElementById('chatContent');
    
    // Remove welcome message if it exists
    const welcomeMsg = chatContent.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    messageDiv.dataset.messageId = message.id;
    
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    const avatar = message.sender === 'user' ? '👤' : '🤖';
    const senderName = message.sender === 'user' ? 'You' : 'Copilot';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${senderName}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(message.text)}</div>
            <div class="message-actions">
                <button class="btn-icon" onclick="selectMessageForSticker(${message.id})" title="Add Reaction">😊</button>
            </div>
            <div class="message-stickers" id="stickers-${message.id}"></div>
        </div>
    `;
    
    chatContent.appendChild(messageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Select message for sticker
function selectMessageForSticker(messageId) {
    selectedMessageId = messageId;
    toggleStickersPanel();
}

// Toggle stickers panel
function toggleStickersPanel() {
    const panel = document.getElementById('stickersPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Add sticker to message
function addSticker(emoji, messageId) {
    fetch('/api/sticker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji, messageId })
    })
    .catch(error => {
        console.error('Error adding sticker:', error);
    });
}

// Add sticker to message UI
function addStickerToMessage(sticker) {
    const stickersContainer = document.getElementById(`stickers-${sticker.messageId}`);
    if (stickersContainer) {
        const stickerSpan = document.createElement('span');
        stickerSpan.className = 'message-sticker';
        stickerSpan.textContent = sticker.emoji;
        stickersContainer.appendChild(stickerSpan);
    }
}

// Add note
function addNote() {
    const input = document.getElementById('noteInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    fetch('/api/note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        input.value = '';
    })
    .catch(error => {
        console.error('Error adding note:', error);
    });
}

// Add note to UI
function addNoteToUI(note) {
    const notesList = document.getElementById('notesList');
    
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    noteDiv.dataset.noteId = note.id;
    
    const timestamp = new Date(note.timestamp).toLocaleString();
    
    noteDiv.innerHTML = `
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-time">${timestamp}</div>
    `;
    
    notesList.appendChild(noteDiv);
}

// Add new tab
function addNewTab() {
    tabCounter++;
    const tabsContainer = document.querySelector('.tabs-container');
    const addBtn = document.getElementById('addTabBtn');
    
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.dataset.tab = `chat-${tabCounter}`;
    
    newTab.innerHTML = `
        <span class="tab-icon">💭</span>
        <span class="tab-name">Chat ${tabCounter}</span>
        <button class="tab-close" onclick="closeTab(this)">×</button>
    `;
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // Add new tab before the add button
    tabsContainer.insertBefore(newTab, addBtn);
    newTab.classList.add('active');
    
    // Setup click event
    newTab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
            switchTab(newTab.dataset.tab);
        }
    });
    
    currentTab = `chat-${tabCounter}`;
}

// Switch tab
function switchTab(tabId) {
    currentTab = tabId;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Close tab
function closeTab(btn) {
    const tab = btn.closest('.tab');
    const tabId = tab.dataset.tab;
    
    // Don't close if it's the last tab
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length === 1) {
        alert('Cannot close the last tab');
        return;
    }
    
    // If closing active tab, switch to another
    if (tab.classList.contains('active')) {
        const nextSibling = tab.nextElementSibling;
        const nextTab = (nextSibling && nextSibling.classList.contains('tab'))
            ? nextSibling 
            : tab.previousElementSibling;
        
        if (nextTab) {
            switchTab(nextTab.dataset.tab);
        }
    }
    
    tab.remove();
}

// Clear history
function clearHistory() {
    fetch('/api/history', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        clearUI();
    })
    .catch(error => {
        console.error('Error clearing history:', error);
    });
}

// Clear UI
function clearUI() {
    const chatContent = document.getElementById('chatContent');
    chatContent.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to Copilot Chat!</h2>
            <p>Start a conversation in the CLI or type here.</p>
            <p class="info-hint">💡 Messages sent from CLI will appear here in real-time</p>
        </div>
    `;
    
    document.getElementById('notesList').innerHTML = '';
}

// Load chat history
function loadHistory() {
    fetch('/api/history')
        .then(response => response.json())
        .then(data => {
            data.messages.forEach(msg => addMessageToUI(msg));
            data.notes.forEach(note => addNoteToUI(note));
            // Stickers are already part of messages
        })
        .catch(error => {
            console.error('Error loading history:', error);
        });
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup tab click handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                switchTab(tab.dataset.tab);
            }
        });
    });
});

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

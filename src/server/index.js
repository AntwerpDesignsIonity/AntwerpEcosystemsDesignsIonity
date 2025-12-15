const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Store chat messages in memory (data is lost when server restarts)
// For persistent storage, consider implementing file-based or database storage
let chatHistory = [];
let notes = [];
let stickers = [];

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());

// API endpoints
app.get('/api/history', (req, res) => {
  res.json({ messages: chatHistory, notes, stickers });
});

app.post('/api/message', (req, res) => {
  // Input validation
  if (!req.body.text || typeof req.body.text !== 'string' || req.body.text.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message text' });
  }
  
  const allowedSenders = ['user', 'copilot'];
  const sender = req.body.sender || 'user';
  if (!allowedSenders.includes(sender)) {
    return res.status(400).json({ error: 'Invalid sender' });
  }
  
  const message = {
    id: Date.now() + Math.random(), // Add randomness to prevent collisions
    text: req.body.text.trim(),
    sender: sender,
    timestamp: new Date().toISOString()
  };
  chatHistory.push(message);
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'message', data: message }));
    }
  });
  
  res.json(message);
});

app.post('/api/note', (req, res) => {
  // Input validation
  if (!req.body.content || typeof req.body.content !== 'string' || req.body.content.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid note content' });
  }
  
  const note = {
    id: Date.now() + Math.random(),
    content: req.body.content.trim(),
    timestamp: new Date().toISOString()
  };
  notes.push(note);
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'note', data: note }));
    }
  });
  
  res.json(note);
});

app.post('/api/sticker', (req, res) => {
  const sticker = {
    id: Date.now(),
    emoji: req.body.emoji,
    messageId: req.body.messageId,
    timestamp: new Date().toISOString()
  };
  stickers.push(sticker);
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'sticker', data: sticker }));
    }
  });
  
  res.json(sticker);
});

app.delete('/api/history', (req, res) => {
  chatHistory = [];
  notes = [];
  stickers = [];
  
  // Broadcast clear event
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'clear' }));
    }
  });
  
  res.json({ success: true });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Send current history to newly connected client
  ws.send(JSON.stringify({ 
    type: 'init', 
    data: { messages: chatHistory, notes, stickers }
  }));
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Open your browser to view the GUI interface`);
  console.log(`Use the CLI tool to send messages from terminal`);
});

// Export for CLI use
module.exports = { PORT };

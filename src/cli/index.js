const readline = require('readline');
const http = require('http');

const SERVER_PORT = process.env.PORT || 3000;
const SERVER_HOST = 'localhost';

// Colors for terminal output (works in PowerShell and CMD)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.cyan}You${colors.reset} > `
});

// Display welcome message
console.log(`${colors.bright}${colors.blue}===========================================`);
console.log(`  Copilot CLI Chat Interface`);
console.log(`  Connected to: http://${SERVER_HOST}:${SERVER_PORT}`);
console.log(`============================================${colors.reset}\n`);
console.log(`${colors.dim}Type your messages and press Enter to send.`);
console.log(`Commands: /help, /clear, /note, /exit${colors.reset}\n`);

// Function to send message to server
function sendMessage(text, sender = 'user') {
  const postData = JSON.stringify({ text, sender });
  
  const options = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: '/api/message',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const message = JSON.parse(data);
        displayMessage(message);
      } else {
        console.error(`${colors.yellow}Failed to send message. Status: ${res.statusCode}${colors.reset}`);
      }
      rl.prompt();
    });
  });
  
  req.on('error', (e) => {
    console.error(`${colors.yellow}Error: Could not connect to server. Make sure the server is running.${colors.reset}`);
    console.error(`${colors.dim}Start the server with: npm start${colors.reset}`);
    rl.prompt();
  });
  
  req.write(postData);
  req.end();
}

// Function to add a note
function addNote(content) {
  const postData = JSON.stringify({ content });
  
  const options = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: '/api/note',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`${colors.green}✓ Note added${colors.reset}`);
      }
      rl.prompt();
    });
  });
  
  req.on('error', (e) => {
    console.error(`${colors.yellow}Error: Could not connect to server.${colors.reset}`);
    rl.prompt();
  });
  
  req.write(postData);
  req.end();
}

// Function to clear history
function clearHistory() {
  const options = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: '/api/history',
    method: 'DELETE'
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(`${colors.green}✓ Chat history cleared${colors.reset}`);
    }
    rl.prompt();
  });
  
  req.on('error', (e) => {
    console.error(`${colors.yellow}Error: Could not connect to server.${colors.reset}`);
    rl.prompt();
  });
  
  req.end();
}

// Function to display a message
function displayMessage(message) {
  const timestamp = new Date(message.timestamp).toLocaleTimeString();
  const senderColor = message.sender === 'user' ? colors.cyan : colors.magenta;
  const senderName = message.sender === 'user' ? 'You' : 'Copilot';
  
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${senderColor}${senderName}${colors.reset}: ${message.text}`);
}

// Display help
function showHelp() {
  console.log(`\n${colors.bright}Available Commands:${colors.reset}`);
  console.log(`  ${colors.cyan}/help${colors.reset}     - Show this help message`);
  console.log(`  ${colors.cyan}/clear${colors.reset}    - Clear chat history`);
  console.log(`  ${colors.cyan}/note${colors.reset}     - Add a note (usage: /note Your note here)`);
  console.log(`  ${colors.cyan}/exit${colors.reset}     - Exit the CLI\n`);
  rl.prompt();
}

// Load chat history on startup
function loadHistory() {
  const options = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: '/api/history',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const history = JSON.parse(data);
        if (history.messages.length > 0) {
          console.log(`${colors.dim}--- Previous Messages ---${colors.reset}`);
          history.messages.forEach(msg => displayMessage(msg));
          console.log(`${colors.dim}--- End of History ---${colors.reset}\n`);
        }
      }
      rl.prompt();
    });
  });
  
  req.on('error', (e) => {
    console.error(`${colors.yellow}⚠ Server not running. Start it with: npm start${colors.reset}`);
    console.log(`${colors.dim}You can still use the CLI, but messages won't be saved.${colors.reset}\n`);
    rl.prompt();
  });
  
  req.end();
}

// Handle user input
rl.on('line', (line) => {
  const input = line.trim();
  
  if (!input) {
    rl.prompt();
    return;
  }
  
  // Handle commands
  if (input.startsWith('/')) {
    const [command, ...args] = input.split(' ');
    
    switch (command.toLowerCase()) {
      case '/help':
        showHelp();
        break;
      case '/clear':
        clearHistory();
        break;
      case '/note':
        if (args.length > 0) {
          addNote(args.join(' '));
        } else {
          console.log(`${colors.yellow}Usage: /note Your note here${colors.reset}`);
          rl.prompt();
        }
        break;
      case '/exit':
        console.log(`${colors.green}Goodbye!${colors.reset}`);
        process.exit(0);
        break;
      default:
        console.log(`${colors.yellow}Unknown command. Type /help for available commands.${colors.reset}`);
        rl.prompt();
    }
  } else {
    // Send as regular message
    sendMessage(input, 'user');
  }
});

rl.on('close', () => {
  console.log(`\n${colors.green}Goodbye!${colors.reset}`);
  process.exit(0);
});

// Load history on startup
loadHistory();

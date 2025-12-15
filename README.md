# Copilot CLI Chat - Hybrid Interface

A hybrid CLI/GUI chat interface for Copilot that runs locally from PowerShell or CMD, featuring a synchronized web-based GUI with chat history, notes, stickers, and tabs.

## 🚀 Features

- **Hybrid Interface**: Use both CLI and GUI simultaneously
- **Real-time Sync**: Messages sent from CLI appear instantly in the GUI via WebSocket
- **Chat History**: Persistent conversation history across sessions
- **Notes System**: Add and manage notes alongside your conversations
- **Stickers/Reactions**: Add emoji reactions to messages
- **Multiple Tabs**: Organize conversations with tab support
- **Modern UI**: Beautiful dark-themed interface inspired by VS Code
- **Cross-platform**: Works on Windows PowerShell, CMD, and other terminals

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## 🔧 Installation

1. Clone this repository:
```bash
git clone https://github.com/AntwerpDesignsIonity/AntwerpEcosystemsDesignsIonity.git
cd AntwerpEcosystemsDesignsIonity
```

2. Install dependencies:
```bash
npm install
```

## 🎮 Usage

### Quick Start (Windows)

#### Using PowerShell:
```powershell
.\start.ps1
```

#### Using CMD:
```cmd
start.bat
```

These scripts will:
1. Install dependencies (if needed)
2. Start the local server
3. Open the GUI in your browser
4. Launch the CLI interface

### Manual Start

#### 1. Start the Server:
```bash
npm start
```
The server will run on `http://localhost:3000`

#### 2. Open the GUI:
Open your browser and navigate to:
```
http://localhost:3000
```

#### 3. Start the CLI (in a separate terminal):
```bash
npm run cli
```

## 💬 CLI Commands

- Type any message and press Enter to send
- `/help` - Show available commands
- `/clear` - Clear chat history
- `/note <text>` - Add a note
- `/exit` - Exit the CLI

## 🌐 GUI Features

### Chat Interface
- Send messages directly from the web interface
- View messages from both GUI and CLI in real-time
- Add emoji reactions to messages
- Automatic timestamps

### Sidebar Features
- **Chat History**: Browse previous conversations
- **Tabs**: Create and manage multiple conversation tabs
- **Notes**: Quick access to your saved notes
- **Clear History**: Remove all messages and notes

### Real-time Synchronization
- All messages sent from CLI appear instantly in GUI
- All GUI messages are visible in CLI
- Notes and stickers sync across both interfaces

## 🏗️ Architecture

```
copilot-cli-gui-chat/
├── src/
│   ├── server/
│   │   └── index.js       # Express + WebSocket server
│   └── cli/
│       └── index.js       # CLI interface
├── public/
│   ├── index.html         # Main GUI page
│   ├── css/
│   │   └── style.css      # GUI styling
│   └── js/
│       └── app.js         # Frontend JavaScript
├── start.ps1              # PowerShell launcher
├── start.bat              # CMD launcher
└── package.json           # Dependencies and scripts
```

## 🔌 Technology Stack

### Backend
- **Express.js**: Web server framework
- **WebSocket (ws)**: Real-time bidirectional communication
- **Node.js**: Runtime environment

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **WebSocket API**: Real-time updates
- **CSS3**: Modern styling with animations

### CLI
- **readline**: Interactive terminal interface
- **HTTP client**: Communicates with server API

## 🎨 Customization

### Changing the Port
Edit the `PORT` in `src/server/index.js` or set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

### Styling the GUI
Modify `public/css/style.css` to customize colors, fonts, and layout.

### Adding Features
The modular architecture makes it easy to add:
- Message persistence to file/database
- User authentication
- File attachments
- Additional emoji/stickers
- Custom commands

## 🔒 Security

- All dependencies are checked for vulnerabilities
- WebSocket communication is isolated to localhost by default
- No external data transmission
- Input sanitization for XSS prevention

## 🐛 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port: `PORT=8080 npm start`

### CLI can't connect
- Ensure the server is running first
- Check console for error messages
- Verify localhost connectivity

### GUI not updating
- Check browser console for errors
- Verify WebSocket connection status (shown in header)
- Refresh the page

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please use the GitHub issue tracker.

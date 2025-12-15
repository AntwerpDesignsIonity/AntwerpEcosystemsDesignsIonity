# Quick Start Guide

## For Windows Users

### Option 1: PowerShell (Recommended)
1. Open PowerShell in the project directory
2. Run: `.\start.ps1`
3. The GUI will open in your browser automatically
4. Use the CLI interface in the PowerShell window

### Option 2: Command Prompt (CMD)
1. Open CMD in the project directory
2. Run: `start.bat`
3. The GUI will open in your browser automatically
4. Use the CLI interface in the CMD window

## For Linux/Mac Users

### Terminal
1. Open terminal in the project directory
2. Install dependencies: `npm install`
3. Start server: `npm start` (in one terminal)
4. Open browser: http://localhost:3000
5. Start CLI: `npm run cli` (in another terminal)

## First Time Setup

If Node.js is not installed:
1. Download from: https://nodejs.org/
2. Install Node.js (includes npm)
3. Restart your terminal
4. Run the launcher scripts

## Usage

### CLI Commands
- Type messages and press Enter to send
- `/help` - Show available commands
- `/clear` - Clear chat history
- `/note <text>` - Add a note
- `/exit` - Exit the CLI

### GUI Features
- **Send Messages**: Type in the input box at the bottom and click Send
- **Add Reactions**: Click the emoji button on any message
- **Create Notes**: Use the Notes section in the sidebar
- **Manage Tabs**: Create new conversation tabs with the "+ New Tab" button
- **Clear History**: Click the trash icon in the sidebar

## Troubleshooting

### "Node is not recognized"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Cannot connect to server"
- Make sure the server is running (`npm start`)
- Check if port 3000 is available
- Try a different port: `PORT=8080 npm start`

### GUI not updating
- Refresh the browser page
- Check the connection status in the GUI header
- Restart the server

## Tips
- Keep both CLI and GUI open to see real-time synchronization
- Messages sent in CLI appear instantly in GUI
- Messages sent in GUI appear instantly in CLI
- All data is stored in memory during the session
- Closing the server will clear all history

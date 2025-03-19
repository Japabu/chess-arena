# Chess Arena Bot Client

This is a bot client for Chess Arena that uses chess.js to calculate random legal moves.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Run the bot client:
   ```
   node bot-client.js --name YourBotName
   ```

## Command-line Options

- `--name <name>`: Specify the bot name (default: MyChessBot)
- `--secret <secret>`: Specify the bot secret (default: testing123)
- `--url <url>`: Specify the server URL (default: http://localhost:3000)
- `--help`: Show help message

## Interactive Commands

When the bot client is running, you can use the following commands:

- `join <matchId>`: Join a match
- `leave <matchId>`: Leave a match
- `move <matchId> <move>`: Make a move in a match
- `exit` or `quit`: Exit the program
- `help`: Show available commands

## Features

- Uses chess.js for legal move generation
- Automatically makes random legal moves when it's the bot's turn
- Supports the testing secret "testing123" for easy authentication
- Command-line parameters for customization

const { io } = require('socket.io-client');
const { Chess } = require('chess.js');
const { program } = require('commander');
const readline = require('readline');

// Setup Commander for CLI parsing
program
  .name('chess-bot')
  .description('Chess Arena Bot Client - plays chess matches automatically')
  .version('1.0.0')
  .option('-u, --username <username>', 'bot username', 'MyChessBot')
  .option('-p, --password <password>', 'bot password', 'password123')
  .option('-s, --server <url>', 'server URL', 'http://localhost:3000')
  .option('-a, --autoplay <matchId>', 'automatically join and play a match')
  .parse(process.argv);

const config = program.opts();

// Convert autoplay to number if provided
if (config.autoplay) {
  config.autoplay = parseInt(config.autoplay, 10);
  if (isNaN(config.autoplay)) {
    console.error('Invalid match ID for autoplay. Must be a number.');
    process.exit(1);
  }
}

console.log(`Starting ${config.username} on ${config.server}`);
if (config.autoplay) console.log(`Will auto-play match ID: ${config.autoplay}`);

// Game state tracking
const autoPlayMatches = new Set();
const botColors = new Map();
const gameInstances = new Map();
let socket = null;
let authToken = null;

// Helper function to promisify socket.emit
function emitAsync(event, ...args) {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not connected'));
      return;
    }

    socket.emit(event, ...args, (response) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(new Error(response?.message || `Failed to execute ${event}`));
      }
    });
  });
}

// Main login and connection function
async function start() {
  try {
    // Login with username/password
    const response = await fetch(`${config.server}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        password: config.password
      })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    authToken = data.access_token;
    console.log('Login successful');
    
    // Connect to socket with token
    socket = io(config.server, { auth: { token: authToken } });
    
    // Set up socket event handlers
    socket.on('connect', async () => {
      console.log('Connected to server');
      if (config.autoplay) await startAutoPlay(config.autoplay);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      autoPlayMatches.clear();
      gameInstances.clear();
    });
    
    socket.on('error', (error) => console.error('Socket error:', error));
    
    // Game events - server only sends 'update' events
    socket.on('update', async data => {
      if (!data?.matchId) return;
      
      // No fallbacks - if we receive an update but don't have the game state, that's an error
      if (!gameInstances.has(data.matchId)) {
        console.error(`Error: Received update for match ${data.matchId} but no game instance exists`);
        return;
      }
      
      // Only process updates with moves
      if (data.move) {
        await updateGameState(data.matchId, data.move, data.status);
      } 
    });
    
    // Setup CLI commands
    setupCliCommands();
    
  } catch (error) {
    console.error('Failed to start:', error.message);
    process.exit(1);
  }
}

// Join a match and setup game state
async function joinMatch(matchId) {
  try {
    const response = await emitAsync('join', matchId);
    
    if (!response.fen) {
      throw new Error(`No FEN received for match ${matchId}`);
    }
    
    // Set bot color if available
    if (!botColors.has(matchId)) {
      if (response.white?.name === config.username) {
        botColors.set(matchId, 'white');
        console.log(`Playing as white vs ${response.black?.name || 'unknown'}`);
      } else if (response.black?.name === config.username) {
        botColors.set(matchId, 'black');
        console.log(`Playing as black vs ${response.white?.name || 'unknown'}`);
      }
    }
    
    // Create chess instance
    const chess = new Chess(response.fen);
    gameInstances.set(matchId, chess);
      
    const state = { 
      matchId, 
      fen: response.fen, 
      status: response.status,
      chess
    };
      
    // Process game state and check if it's our turn
    await processGameState(state);
    
    return state;
  } catch (error) {
    console.error(`Error joining match ${matchId}: ${error.message}`);
    throw error;
  }
}

// Update game state with a move received from server
async function updateGameState(matchId, move, status) {
  const chess = gameInstances.get(matchId);
  if (!chess) {
    throw new Error(`No game instance found for match ${matchId}`);
  }
  
  try {
    // Apply the move to our local chess instance
    chess.move(move);
    
    if (isGameOver(status)) {
      console.log(`Game over in match ${matchId} ${status}`);
      stopAutoPlay(matchId);
      gameInstances.delete(matchId);
      return;
    }
    
    // Check if it's our turn after the opponent's move
    await processGameState({
      matchId,
      status,
      chess
    });
  } catch (error) {
    // No fallbacks - if we can't apply a move, that's a fatal error
    console.error(`Fatal error applying move ${move}: ${error.message}`);
    throw error;
  }
}

// Helper to check if game is over
function isGameOver(status) {
  return status && ['white_won', 'black_won', 'draw', 'aborted'].includes(status);
}

// Leave a match
async function leaveMatch(matchId) {
  if (!gameInstances.has(matchId)) {
    console.error(`Error: Cannot leave match ${matchId} - not joined`);
    return;
  }
  
  try {
    await emitAsync('leave', matchId);
    gameInstances.delete(matchId);
    botColors.delete(matchId);
    stopAutoPlay(matchId);
  } catch (error) {
    console.error(`Error leaving match ${matchId}: ${error.message}`);
  }
}

// Make a move in a match
async function makeMove(matchId, move) {
  try {
    // Send move to server
    await emitAsync('move', { matchId, move });
  } catch (error) {
    console.error(`Error making move ${move}: ${error.message}`);
  }
}

// Calculate a random legal move
function calculateNextMove(gameState) {
    const chess = gameState.chess;
    const moves = chess.moves();
    return moves[Math.floor(Math.random() * moves.length)];
}

// Process game state and make a move if it's our turn
async function processGameState(gameState) {
  const { matchId, chess } = gameState;
  if (!chess) {
    throw new Error(`Cannot process game state: chess instance is missing`);
  }
  
  // Determine whose turn it is
  const isWhiteTurn = chess.turn() === 'w';
  const botColor = botColors.get(matchId);
  
  if (!botColor) {
    console.error(`Error: Cannot determine bot color for match ${matchId}`);
    return;
  }
  
  const isMyTurn = (botColor === 'white' && isWhiteTurn) || (botColor === 'black' && !isWhiteTurn);
  
  // Make a move if it's our turn and auto-play is enabled
  if (isMyTurn && autoPlayMatches.has(matchId)) {
    const delay = 500 + Math.floor(Math.random() * 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
    const nextMove = calculateNextMove(gameState);
    await makeMove(matchId, nextMove);
  }
}

// Start auto-play for a match
async function startAutoPlay(matchId) {
  // If we already have the game, just enable autoplay
  if (gameInstances.has(matchId)) {
    autoPlayMatches.add(matchId);
    
    const chess = gameInstances.get(matchId);
    await processGameState({
      matchId,
      chess
    });
    return;
  }
  
  // Otherwise join the match first
  try {
    const state = await joinMatch(matchId);
    autoPlayMatches.add(matchId);
    console.log(`Auto-play enabled for match ${matchId}`);
    await processGameState(state);
  } catch (error) {
    console.error(`Error: Failed to start auto-play for match ${matchId}`);
  }
}

// Stop auto-play for a match
function stopAutoPlay(matchId) {
  autoPlayMatches.delete(matchId);
}

// Setup interactive CLI commands
function setupCliCommands() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const commands = {
    join: {
      description: 'Join a match',
      handler: async (id) => {
        try {
          await joinMatch(parseInt(id, 10));
        } catch (error) {
          // Error already logged in joinMatch
        }
      }
    },
    leave: {
      description: 'Leave a match',
      handler: async (id) => await leaveMatch(parseInt(id, 10))
    },
    move: {
      description: 'Make a move in a match',
      handler: async (id, move) => await makeMove(parseInt(id, 10), move)
    },
    autoplay: {
      description: 'Join a match and play automatically',
      handler: async (id) => await startAutoPlay(parseInt(id, 10))
    },
    stopauto: {
      description: 'Stop auto-play for a specific match',
      handler: (id) => {
        const matchId = parseInt(id, 10);
        stopAutoPlay(matchId);
        console.log(`Auto-play for match ${matchId} has been stopped`);
      }
    },
    state: {
      description: 'Show the current state of a match',
      handler: (id) => {
        const matchId = parseInt(id, 10);
        const chess = gameInstances.get(matchId);
        if (!chess) {
          console.log(`No active game state for match ${matchId}`);
          return;
        }
        
        console.log(`\nMatch ${matchId} state:`);
        console.log(`Playing as: ${botColors.get(matchId) || 'Unknown'}`);
        console.log(`Auto-play: ${autoPlayMatches.has(matchId) ? 'Enabled' : 'Disabled'}`);
        console.log(chess.ascii());
      }
    },
    exit: {
      description: 'Exit the program',
      handler: () => {
        if (socket) socket.disconnect();
        process.exit(0);
      }
    },
    help: {
      description: 'Show this help message',
      handler: () => {
        console.log('\nAvailable commands:');
        Object.entries(commands).forEach(([name, cmd]) => {
          console.log(`  ${name.padEnd(15)} - ${cmd.description}`);
        });
        console.log('');
      }
    }
  };

  rl.on('line', async (input) => {
    const [command, ...args] = input.trim().split(/\s+/);
    
    if (commands[command]) {
      await commands[command].handler(...args);
    } else {
      console.log('Unknown command. Type "help" for available commands.');
    }
  });

  // Handle CTRL+C
  process.on('SIGINT', commands.exit.handler);
}

// Start the bot
start(); 
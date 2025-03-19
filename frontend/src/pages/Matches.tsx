import { Component, createSignal, Show, onCleanup, onMount, For } from 'solid-js';
import ChessBoard from '../components/ChessBoard';
import './Matches.css';
import { io, Socket } from 'socket.io-client';
import { Chess } from 'chess.js';
import { createStore, produce } from 'solid-js/store';

enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WHITE_WON = 'white_won',
  BLACK_WON = 'black_won',
  DRAW = 'draw',
  ABORTED = 'aborted',
}

interface Match {
  id: number;
  white: { id: number; username: string };
  black: { id: number; username: string };
  createdAt: string;
  status: MatchStatus;
  fen: string;
}

interface JoinResponse {
  success: boolean;
  status: MatchStatus;
  fen: string;
}

interface GameStateUpdate {
  matchId: number;
  status: MatchStatus;
  move?: string;
}

const apiUrl = 'http://localhost:3000';

function emitAsync<T>(socket: Socket, event: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not connected'));
      return;
    }

    socket.emit(event, ...args, (response: T) => {
      resolve(response);
    });
  });
}

const Matches: Component = () => {
  const [matches, setMatches] = createStore<{ [key: number]: Match }>({});
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [searchTerm, setSearchTerm] = createSignal('');
  const [isConnected, setIsConnected] = createSignal(false);
  const [socket, setSocket] = createSignal<Socket | null>(null);

  const chessStates: { [key: number]: Chess } = {};

  onMount(async () => {    
    await fetchInitialData();
    
    const socketInstance = io(apiUrl);
    setSocket(socketInstance);
    
    socketInstance.on('connect', async () => {
      console.log(`WebSocket connected, socket.id: ${socketInstance.id}`);
      setIsConnected(true);
      
      const activeMatchIds = getActiveMatches().map((match: Match) => match.id);
      console.log(`Auto-joining ${activeMatchIds.length} active matches`);
      
      for (const matchId of activeMatchIds) {
          console.log(`Emitting join for match ID: ${matchId}`);
          const response = await emitAsync<JoinResponse>(socketInstance, 'join', matchId);
          if (response.success && response.fen) {
            updateMatchFromJoin(matchId, response);
          }
      }
    });
    
    socketInstance.on('disconnect', (reason: string) => {
      console.log(`WebSocket disconnected, reason: ${reason}`);
      setIsConnected(false);
    });
    
    socketInstance.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      setError(`WebSocket error: ${error.message || 'Unknown error'}`);
    });
    
    // Listen for match updates
    socketInstance.on('update', (data: GameStateUpdate) => {
      console.log('Received match update:', data);
      
      setMatches(produce(matches => {
        const match = matches[data.matchId];
        if(!match) {
          console.error(`Received update for unknown match ID: ${data.matchId}`);
          return matches;
        }

        match.status = data.status;
        if (data.move) {
            chessStates[data.matchId].move(data.move);
            match.fen = chessStates[data.matchId].fen();
        }
      }));
    });
  });

  // Clean up the connection when component unmounts
  onCleanup(() => {
    console.log("Component unmounting - cleaning up WebSocket connection");
    const socketInstance = socket();
    if (socketInstance) {
      socketInstance.disconnect();
    }
  });
  
  // Update match data from join response
  const updateMatchFromJoin = (matchId: number, response: JoinResponse) => {
    setMatches(produce(matches => {
      const match = matches[matchId];
      if (!match) {
        console.error(`Received join response for unknown match ID: ${matchId}`);
        return matches;
      }
      
      match.fen = response.fen;
      match.status = response.status;
      chessStates[matchId] = new Chess(response.fen);
    }));
  };
  
  // Fetch initial data from REST endpoint
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${apiUrl}/match`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      const data = await response.json();

      const matches: { [key: number]: Match } = {};
      for (const match of data) {
        matches[match.id] = {
          id: match.id,
          black: match.black,
          fen: match.fen,
          createdAt: match.createdAt,
          status: match.status,
          white: match.white
        };
      }
      
      setMatches(matches);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching matches');
      console.error('Error fetching matches:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChipClass = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PENDING:
        return 'status-chip pending';
      case MatchStatus.IN_PROGRESS:
        return 'status-chip in-progress';
      case MatchStatus.WHITE_WON:
        return 'status-chip white-won';
      case MatchStatus.BLACK_WON:
        return 'status-chip black-won';
      case MatchStatus.DRAW:
        return 'status-chip draw';
      case MatchStatus.ABORTED:
        return 'status-chip aborted';
      default:
        return 'status-chip';
    }
  };

  const getActiveMatches = () => {
    return Object.values(matches).filter(match => 
      match.status === MatchStatus.PENDING || 
      match.status === MatchStatus.IN_PROGRESS
    );
  };

  const getMatchHistory = () => {
    const completedMatches = Object.values(matches).filter(match => 
      match.status === MatchStatus.WHITE_WON || 
      match.status === MatchStatus.BLACK_WON || 
      match.status === MatchStatus.DRAW ||
      match.status === MatchStatus.ABORTED
    );
    
    if (!searchTerm()) {
      return completedMatches;
    }
    
    // Search by player name, match id, date, or status
    const term = searchTerm().toLowerCase();
    return completedMatches.filter(match => 
      match.id.toString().includes(term) ||
      match.white.username.toLowerCase().includes(term) ||
      match.black.username.toLowerCase().includes(term) ||
      formatDate(match.createdAt).toLowerCase().includes(term) ||
      match.status.toLowerCase().includes(term)
    );
  };
  
  const getStatusDisplayText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.WHITE_WON:
        return 'White Won';
      case MatchStatus.BLACK_WON:
        return 'Black Won';
      default:
        return status.replace('_', ' ');
    }
  };
  
  const renderMatchCard = (match: Match) => (
    <div class="match-card">
      <h2>Match #{match.id}</h2>
      
      <div class={getStatusChipClass(match.status)}>
        {getStatusDisplayText(match.status)}
      </div>
      
      <div>{match.white.username} vs {match.black.username}</div>

      <div>
        <ChessBoard fen={match.fen} />
      </div>
      
      <div class="match-details">
        <span>Started: {formatDate(match.createdAt)}</span>
      </div>
    </div>
  );
  
  return (
    <div class="matches-page">
      <h1>Chess Arena Matches</h1>
      
      <Show when={isConnected()}>
        <div class="connection-status connected">WebSocket Connected</div>
      </Show>
      
      <Show when={!isConnected() && !isLoading()}>
        <div class="connection-status disconnected">WebSocket Disconnected - Using cached data</div>
      </Show>
      
      <Show when={isLoading()}>
        <p>Loading matches...</p>
      </Show>
      
      <Show when={error()}>
        <div class="error-message">{error()}</div>
      </Show>
      
      <h2>Active Matches</h2>
      
      <Show when={!isLoading() && !error() && getActiveMatches().length === 0}>
        <p>No matches are currently active.</p>
      </Show>
      
      <div class="matches-grid">
        <For each={getActiveMatches()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
      
      <h2>Match History</h2>
      
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search by player name, match ID, or date..." 
          value={searchTerm()} 
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="search-input"
        />
      </div>
      
      <Show when={!isLoading() && !error() && getMatchHistory().length === 0}>
        <p>No completed matches found.</p>
      </Show>
      
      <div class="matches-grid">
        <For each={getMatchHistory()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
    </div>
  );
};

export default Matches; 
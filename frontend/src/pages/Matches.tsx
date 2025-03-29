import { Component, createSignal, Show, onCleanup, onMount, For } from 'solid-js';
import ChessBoard from '../components/ChessBoard';
import { io, Socket } from 'socket.io-client';
import { Chess } from 'chess.js';
import { createStore, produce } from 'solid-js/store';
import { MatchService, API_URL } from '../services/api';

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
    
    const socketInstance = io(API_URL);
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
      
      const data = await MatchService.getAllMatches();

      const matches: { [key: number]: Match } = {};
      for (const match of data) {
        // TournamentMatch doesn't have all Match properties, so we need to add defaults
        const matchId = match.matchId || 0;
        matches[matchId] = {
          id: matchId,
          black: {
            id: match.player2?.id || 0,
            username: match.player2?.name || 'Unknown'
          },
          white: {
            id: match.player1?.id || 0,
            username: match.player1?.name || 'Unknown'
          },
          fen: (match as any).fen || '',  // Not in TournamentMatch type, cast as any
          createdAt: (match as any).createdAt || new Date().toISOString(),  // Not in TournamentMatch type, cast as any
          status: (match.status as MatchStatus) || MatchStatus.PENDING
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
    const baseClasses = 'inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase mb-2.5 text-white';
    switch (status) {
      case MatchStatus.PENDING:
        return `${baseClasses} bg-amber-600 dark:bg-amber-700`;
      case MatchStatus.IN_PROGRESS:
        return `${baseClasses} bg-emerald-600 dark:bg-emerald-700`;
      case MatchStatus.WHITE_WON:
        return `${baseClasses} bg-blue-600 dark:bg-blue-700 border-2 border-white`;
      case MatchStatus.BLACK_WON:
        return `${baseClasses} bg-gray-800 dark:bg-gray-900 border-2 border-gray-600`;
      case MatchStatus.DRAW:
        return `${baseClasses} bg-purple-600 dark:bg-purple-700`;
      case MatchStatus.ABORTED:
        return `${baseClasses} bg-red-600 dark:bg-red-700`;
      default:
        return baseClasses;
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
    <div class="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-xl border border-gray-700 dark:border-gray-800 cursor-pointer">
      <div class="bg-gray-700 dark:bg-gray-800 p-4 flex justify-between items-center">
        <h2 class="text-white font-medium">Match #{match.id}</h2>
      </div>
      
      <div class="p-4">
        <div class={getStatusChipClass(match.status)}>
          {getStatusDisplayText(match.status)}
        </div>
        
        <div class="flex justify-between items-center mb-4">
          <div class="flex-1 text-center text-white dark:text-gray-200">
            {match.white.username}
          </div>
          <div class="mx-2 text-lg font-semibold text-gray-400 dark:text-gray-500">
            vs
          </div>
          <div class="flex-1 text-center text-white dark:text-gray-200">
            {match.black.username}
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <ChessBoard fen={match.fen} />
        </div>
        
        <div class="text-sm text-gray-300 dark:text-gray-400 mt-2">
          Started: {formatDate(match.createdAt)}
        </div>
      </div>
    </div>
  );
  
  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-100 dark:text-white mb-6">Chess Arena Matches</h1>
      
      <Show when={isConnected()}>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white mb-4">
          WebSocket Connected
        </div>
      </Show>
      
      <Show when={!isConnected() && !isLoading()}>
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white mb-4">
          WebSocket Disconnected - Using cached data
        </div>
      </Show>
      
      <Show when={isLoading()}>
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <span class="ml-3 text-gray-200 dark:text-gray-200">Loading matches...</span>
        </div>
      </Show>
      
      <Show when={error()}>
        <div class="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
          {error()}
        </div>
      </Show>
      
      <h2 class="text-2xl font-bold text-gray-100 dark:text-white mt-8 mb-4 border-b border-gray-700 pb-2">Active Matches</h2>
      
      <Show when={!isLoading() && !error() && getActiveMatches().length === 0}>
        <p class="text-gray-200 dark:text-gray-200 py-4">No matches are currently active.</p>
      </Show>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <For each={getActiveMatches()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
      
      <h2 class="text-2xl font-bold text-gray-100 dark:text-white mt-8 mb-4 border-b border-gray-700 pb-2">Match History</h2>
      
      <div class="mb-6">
        <input 
          type="text" 
          placeholder="Search by player name, match ID, or date..." 
          value={searchTerm()} 
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="w-full max-w-lg px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <Show when={!isLoading() && !error() && getMatchHistory().length === 0}>
        <p class="text-gray-200 dark:text-gray-200 py-4">No completed matches found.</p>
      </Show>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={getMatchHistory()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
    </div>
  );
};

export default Matches; 
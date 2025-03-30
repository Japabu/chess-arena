import { Component, createSignal, onMount, onCleanup, For } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { socket, MatchService } from '../services/api';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';

// Match statuses
export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WHITE_WON = 'white_won',
  BLACK_WON = 'black_won',
  DRAW = 'draw',
  ABORTED = 'aborted',
}

// Match type
interface Match {
  id: number;
  white: {
    id: number;
    username: string;
  };
  black: {
    id: number;
    username: string;
  };
  fen: string;
  status: MatchStatus;
  createdAt: string;
}

// Game state update from WebSocket
interface GameStateUpdate {
  matchId: number;
  status?: MatchStatus;
  move?: string;
}

// Store to hold chess.js instances for each match
const chessStates: Record<number, Chess> = {};

const Matches: Component = () => {
  const [matches, setMatches] = createStore<Record<number, Match>>({});
  const [isLoading, setIsLoading] = createSignal(true);
  const [isConnected, setIsConnected] = createSignal(false);
  
  const getActiveMatches = () => {
    return Object.values(matches).filter(match => 
      match.status === MatchStatus.PENDING || 
      match.status === MatchStatus.IN_PROGRESS
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getMatchHistory = () => {
    return Object.values(matches).filter(match => 
      match.status === MatchStatus.WHITE_WON || 
      match.status === MatchStatus.BLACK_WON || 
      match.status === MatchStatus.DRAW || 
      match.status === MatchStatus.ABORTED
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  
  onMount(async () => {    
    await fetchInitialData();

    // Connect to WebSocket
    const socketInstance = socket();
    setIsConnected(socketInstance.connected);
    
    // Socket event handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });
    
    socketInstance.on('error', (error: any) => {
      console.error('WebSocket error:', error);
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

        if (data.status) {
          match.status = data.status;
        }
        
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
  
  // Fetch initial data from REST endpoint
  const fetchInitialData = async () => {
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
          username: match.player2?.username || 'Unknown'
        },
        white: {
          id: match.player1?.id || 0,
          username: match.player1?.username || 'Unknown'
        },
        fen: (match as any).fen || '',  // Not in TournamentMatch type, cast as any
        createdAt: (match as any).createdAt || new Date().toISOString(),  // Not in TournamentMatch type, cast as any
        status: (match.status as MatchStatus) || MatchStatus.PENDING
      };
    }
    
    setMatches(matches);
    setIsLoading(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get CSS classes for status chip
  const getStatusChipClass = (status: MatchStatus) => {
    let baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case MatchStatus.PENDING:
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case MatchStatus.IN_PROGRESS:
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case MatchStatus.WHITE_WON:
      case MatchStatus.BLACK_WON:
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case MatchStatus.DRAW:
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`;
      case MatchStatus.ABORTED:
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
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
      
      {isConnected() && (
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white mb-4">
          WebSocket Connected
        </div>
      )}
      
      {!isConnected() && !isLoading() && (
        <div class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white mb-4">
          WebSocket Disconnected - Using cached data
        </div>
      )}
      
      {isLoading() && (
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <span class="ml-3 text-gray-200 dark:text-gray-200">Loading matches...</span>
        </div>
      )}
      
      <h2 class="text-2xl font-bold text-gray-100 dark:text-white mt-8 mb-4 border-b border-gray-700 pb-2">Active Matches</h2>
      
      {!isLoading() && getActiveMatches().length === 0 && (
        <p class="text-gray-200 dark:text-gray-200 py-4">No matches are currently active.</p>
      )}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <For each={getActiveMatches()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
      
      <h2 class="text-2xl font-bold text-gray-100 dark:text-white mt-8 mb-4 border-b border-gray-700 pb-2">Match History</h2>
      
      {!isLoading() && getMatchHistory().length === 0 && (
        <p class="text-gray-200 dark:text-gray-200 py-4">No completed matches found.</p>
      )}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={getMatchHistory()}>
          {match => renderMatchCard(match)}
        </For>
      </div>
    </div>
  );
};

export default Matches; 
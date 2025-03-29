import { Component, createSignal, Show } from 'solid-js';

interface User {
  id: number;
  name: string;
}

interface TournamentMatch {
  matchId?: number;
  matchNumber: number;
  player1?: User;
  player2?: User;
  winner?: number;
  status?: string;
}

interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
}

interface TournamentBracket {
  rounds: TournamentRound[];
}

interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: string;
  format: string;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
  participants: User[];
  matches: any[];
  createdAt: string;
}

// Mock data for tournament with 9 players
const mockPlayers: User[] = [
  { id: 1, name: "GrandMaster Bot" },
  { id: 2, name: "DeepChess AI" },
  { id: 3, name: "QueenGambit" },
  { id: 4, name: "KnightRider" },
  { id: 5, name: "PawnStars" },
  { id: 6, name: "RookSolver" },
  { id: 7, name: "BishopBlitz" },
  { id: 8, name: "KingDefender" },
  { id: 9, name: "CheckMate3000" }
];

// Mock tournament data
const mockTournament: Tournament = {
  id: 1,
  name: "Chess Arena Championship",
  description: "The annual Chess Arena tournament featuring the best AI chess engines competing for the championship title.",
  status: "in_progress",
  format: "single_elimination",
  maxParticipants: 16,
  startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  participants: mockPlayers,
  matches: [],
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
};

// Mock bracket data for 9 players (8 players in the first round with 1 getting a bye)
const mockBracket: TournamentBracket = {
  rounds: [
    {
      round: 1,
      matches: [
        {
          matchNumber: 1,
          player1: mockPlayers[0],
          player2: mockPlayers[1],
          winner: mockPlayers[0].id,
          status: 'white_won'
        },
        {
          matchNumber: 2,
          player1: mockPlayers[2],
          player2: mockPlayers[3],
          winner: mockPlayers[2].id,
          status: 'black_won'
        },
        {
          matchNumber: 3,
          player1: mockPlayers[4],
          player2: mockPlayers[5],
          status: 'in_progress'
        },
        {
          matchNumber: 4,
          player1: mockPlayers[6],
          player2: mockPlayers[7],
          status: 'pending'
        }
      ]
    },
    {
      round: 2,
      matches: [
        {
          matchNumber: 5,
          player1: mockPlayers[0],
          player2: mockPlayers[2],
          status: 'pending'
        },
        {
          matchNumber: 6,
          player1: undefined, // winners from match 3 and 4
          player2: mockPlayers[8], // Player 9 got a bye in first round
          status: 'pending'
        }
      ]
    },
    {
      round: 3,
      matches: [
        {
          matchNumber: 7,
          player1: undefined, // Final match
          player2: undefined,
          status: 'pending'
        }
      ]
    }
  ]
};

const TournamentDetails: Component = () => {
  // We would normally use params.id to fetch the tournament
  // const params = useParams();
  
  // Use mocked data instead of fetching
  const [tournament] = createSignal<Tournament>(mockTournament);
  const [bracket] = createSignal<TournamentBracket>(mockBracket);
  const [isAdmin] = createSignal(true); // Set to true for demo purposes

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const startTournament = async () => {
    alert('Tournament has been started successfully');
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Show when={tournament() && bracket()}>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">{tournament()?.name}</h1>
          <div class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tournament()?.status === 'registration' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : tournament()?.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : tournament()?.status === 'completed' ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
            {tournament()?.status.replace('_', ' ')}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <p class="text-gray-700 dark:text-gray-300 mb-6">{tournament()?.description || 'No description provided'}</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Format:</span>
              <span class="text-gray-900 dark:text-white font-medium">{tournament()?.format.replace('_', ' ')}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
              <span class="text-gray-900 dark:text-white font-medium">{tournament()?.status.replace('_', ' ')}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Participants:</span>
              <span class="text-gray-900 dark:text-white font-medium">{tournament()?.participants.length} / {tournament()?.maxParticipants}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
              <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournament()?.startDate)}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">End Date:</span>
              <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournament()?.endDate)}</span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
              <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournament()?.createdAt)}</span>
            </div>
          </div>
          
          <Show when={isAdmin() && tournament()?.status === 'registration'}>
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                onClick={startTournament}
              >
                Start Tournament
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default TournamentDetails; 
import { Component, createSignal, Show, For } from 'solid-js';
import { A } from '@solidjs/router';

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
  bracketType: 'winners' | 'losers' | 'grand';
}

interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
  bracketType: 'winners' | 'losers' | 'grand';
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

// Mock data for tournament with 8 players
const mockPlayers: User[] = [
  { id: 1, name: "GrandMaster Bot" },
  { id: 2, name: "DeepChess AI" },
  { id: 3, name: "QueenGambit" },
  { id: 4, name: "KnightRider" },
  { id: 5, name: "PawnStars" },
  { id: 6, name: "RookSolver" },
  { id: 7, name: "BishopBlitz" },
  { id: 8, name: "KingDefender" }
];

// Mock tournament data
const mockTournament: Tournament = {
  id: 1,
  name: "Chess Arena Championship",
  description: "The annual Chess Arena tournament featuring the best AI chess engines competing for the championship title.",
  status: "in_progress",
  format: "double_elimination",
  maxParticipants: 8,
  startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  participants: mockPlayers,
  matches: [],
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
};

// Mock bracket data for double elimination tournament
const mockBracket: TournamentBracket = {
  rounds: [
    // Winners bracket round 1
    {
      round: 1,
      bracketType: 'winners',
      matches: [
        {
          matchNumber: 1,
          player1: mockPlayers[0],
          player2: mockPlayers[1],
          winner: mockPlayers[0].id,
          status: 'completed',
          bracketType: 'winners'
        },
        {
          matchNumber: 2,
          player1: mockPlayers[2],
          player2: mockPlayers[3],
          winner: mockPlayers[2].id,
          status: 'completed',
          bracketType: 'winners'
        },
        {
          matchNumber: 3,
          player1: mockPlayers[4],
          player2: mockPlayers[5],
          winner: mockPlayers[4].id,
          status: 'completed',
          bracketType: 'winners'
        },
        {
          matchNumber: 4,
          player1: mockPlayers[6],
          player2: mockPlayers[7],
          winner: mockPlayers[6].id,
          status: 'completed',
          bracketType: 'winners'
        }
      ]
    },
    // Winners bracket round 2
    {
      round: 2,
      bracketType: 'winners',
      matches: [
        {
          matchNumber: 5,
          player1: mockPlayers[0],
          player2: mockPlayers[2],
          winner: mockPlayers[0].id,
          status: 'completed',
          bracketType: 'winners'
        },
        {
          matchNumber: 6,
          player1: mockPlayers[4],
          player2: mockPlayers[6],
          winner: mockPlayers[4].id,
          status: 'completed',
          bracketType: 'winners'
        }
      ]
    },
    // Winners bracket final
    {
      round: 3,
      bracketType: 'winners',
      matches: [
        {
          matchNumber: 7,
          player1: mockPlayers[0],
          player2: mockPlayers[4],
          winner: mockPlayers[0].id,
          status: 'completed',
          bracketType: 'winners'
        }
      ]
    },
    // Losers bracket round 1
    {
      round: 1,
      bracketType: 'losers',
      matches: [
        {
          matchNumber: 8,
          player1: mockPlayers[1],
          player2: mockPlayers[3],
          winner: mockPlayers[3].id,
          status: 'completed',
          bracketType: 'losers'
        },
        {
          matchNumber: 9,
          player1: mockPlayers[5],
          player2: mockPlayers[7],
          winner: mockPlayers[5].id,
          status: 'completed',
          bracketType: 'losers'
        }
      ]
    },
    // Losers bracket round 2
    {
      round: 2,
      bracketType: 'losers',
      matches: [
        {
          matchNumber: 10,
          player1: mockPlayers[3],
          player2: mockPlayers[5],
          winner: mockPlayers[3].id,
          status: 'completed',
          bracketType: 'losers'
        }
      ]
    },
    // Losers bracket round 3
    {
      round: 3,
      bracketType: 'losers',
      matches: [
        {
          matchNumber: 11,
          player1: mockPlayers[3],
          player2: mockPlayers[6],
          winner: mockPlayers[3].id,
          status: 'completed',
          bracketType: 'losers'
        }
      ]
    },
    // Losers bracket final
    {
      round: 4,
      bracketType: 'losers',
      matches: [
        {
          matchNumber: 12,
          player1: mockPlayers[3],
          player2: mockPlayers[4],
          winner: mockPlayers[3].id,
          status: 'completed',
          bracketType: 'losers'
        }
      ]
    },
    // Grand Final
    {
      round: 1,
      bracketType: 'grand',
      matches: [
        {
          matchNumber: 13,
          player1: mockPlayers[0],
          player2: mockPlayers[3],
          winner: mockPlayers[0].id,
          status: 'completed',
          bracketType: 'grand'
        }
      ]
    }
  ]
};

const TournamentDetails: Component = () => {
  // Use mocked data instead of fetching
  const [tournament] = createSignal<Tournament>(mockTournament);
  const [bracket] = createSignal<TournamentBracket>(mockBracket);
  const [isAdmin] = createSignal(true);

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

  // Group rounds by bracket type for easier rendering
  const getBracketRounds = (bracketType: 'winners' | 'losers' | 'grand') => {
    return bracket()?.rounds.filter(round => round.bracketType === bracketType) || [];
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
          
          <div class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Participants</h3>
            <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={tournament()?.participants}>
                  {(participant) => (
                    <A 
                      href={`/profile/${participant.id}`}
                      class="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                    >
                      <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 flex-shrink-0 font-medium">
                        {participant.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span class="text-gray-900 dark:text-white font-medium truncate">
                        {participant.name}
                      </span>
                    </A>
                  )}
                </For>
              </div>
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

      <Show when={tournament() && bracket() && tournament()?.status !== 'registration'}>
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 overflow-hidden">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tournament Bracket</h2>
          
          <div class="overflow-x-auto pb-4" style="min-height: 650px;">
            <div class="tournament-bracket flex flex-col gap-8" style="min-width: 1200px;">
              {/* Winners Bracket */}
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Winners Bracket
                </h3>
                <div class="flex gap-8">
                  <For each={getBracketRounds('winners')}>
                    {(round) => (
                      <div class="flex-shrink-0">
                        <div class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Round {round.round}
                        </div>
                        <div class="flex flex-col gap-8">
                          <For each={round.matches}>
                            {(match) => (
                              <div class="w-64 bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-3">
                                  <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Match #{match.matchNumber}
                                  </div>
                                  <div class={`text-sm font-medium px-2 py-1 rounded ${
                                    match.status === 'pending' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                                    match.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                    match.status === 'completed' || match.status === 'white_won' || match.status === 'black_won' || match.status === 'draw' ?
                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  }`}>
                                    {match.status?.replace('_', ' ') || 'Pending'}
                                  </div>
                                </div>
                                <PlayerMatchCard player={match.player1} isWinner={match.winner === match.player1?.id} />
                                <div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                                <PlayerMatchCard player={match.player2} isWinner={match.winner === match.player2?.id} />
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              
              {/* Losers Bracket */}
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Losers Bracket
                </h3>
                <div class="flex gap-8">
                  <For each={getBracketRounds('losers')}>
                    {(round) => (
                      <div class="flex-shrink-0">
                        <div class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Round {round.round}
                        </div>
                        <div class="flex flex-col gap-8">
                          <For each={round.matches}>
                            {(match) => (
                              <div class="w-64 bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-3">
                                  <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Match #{match.matchNumber}
                                  </div>
                                  <div class={`text-sm font-medium px-2 py-1 rounded ${
                                    match.status === 'pending' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                                    match.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                    match.status === 'completed' || match.status === 'white_won' || match.status === 'black_won' || match.status === 'draw' ?
                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  }`}>
                                    {match.status?.replace('_', ' ') || 'Pending'}
                                  </div>
                                </div>
                                <PlayerMatchCard player={match.player1} isWinner={match.winner === match.player1?.id} />
                                <div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                                <PlayerMatchCard player={match.player2} isWinner={match.winner === match.player2?.id} />
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              
              {/* Grand Finals */}
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Grand Finals
                </h3>
                <div class="flex gap-8">
                  <For each={getBracketRounds('grand')}>
                    {(round) => (
                      <div class="flex-shrink-0">
                        <div class="flex flex-col gap-8">
                          <For each={round.matches}>
                            {(match) => (
                              <div class="w-64 bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700 border-2 border-indigo-500">
                                <div class="flex justify-between items-center mb-3">
                                  <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Grand Final
                                  </div>
                                  <div class={`text-sm font-medium px-2 py-1 rounded ${
                                    match.status === 'pending' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                                    match.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                    match.status === 'completed' || match.status === 'white_won' || match.status === 'black_won' || match.status === 'draw' ?
                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  }`}>
                                    {match.status?.replace('_', ' ') || 'Pending'}
                                  </div>
                                </div>
                                <PlayerMatchCard player={match.player1} isWinner={match.winner === match.player1?.id} />
                                <div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                                <PlayerMatchCard player={match.player2} isWinner={match.winner === match.player2?.id} />
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

// Reusable component for player cards in matches
const PlayerMatchCard = (props: { player?: User; isWinner: boolean }) => {
  return (
    <Show when={props.player} fallback={
      <div class="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
          <span class="text-gray-500 dark:text-gray-400">?</span>
        </div>
        <span class="text-gray-500 dark:text-gray-400 italic">TBD</span>
      </div>
    }>
      <A 
        href={`/profile/${props.player?.id}`}
        class={`flex items-center p-2 ${props.isWinner ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'} rounded-lg`}
      >
        <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
          {props.player?.name.substring(0, 1).toUpperCase()}
        </div>
        <span class={`font-medium ${props.isWinner ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'} truncate`}>
          {props.player?.name}
        </span>
        <Show when={props.isWinner}>
          <span class="ml-auto bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
            Winner
          </span>
        </Show>
      </A>
    </Show>
  );
};

export default TournamentDetails; 
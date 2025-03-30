import { Component, createSignal, createResource, Show, For } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { TournamentService } from '../services/api/TournamentService';
import type { User } from '../services/api/types';

interface TournamentMatch {
  matchId?: number;
  matchNumber: number;
  player1?: User;
  player2?: User;
  winner?: number;
  status?: string;
  bracketType?: 'winners' | 'losers' | 'grand';
}

interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
  bracketType?: 'winners' | 'losers' | 'grand';
}

interface TournamentBracket {
  rounds: TournamentRound[];
}

const TournamentDetails: Component = () => {
  const params = useParams();
  const tournamentId = parseInt(params.id);
  const [isAdmin] = createSignal(true); // TODO: Replace with actual admin check

  // Fetch tournament data
  const [tournamentData, { refetch: refetchTournament }] = createResource(
    () => tournamentId,
    (id: number) => TournamentService.getTournamentById(id)
  );

  // Fetch bracket data
  const [bracketData, { refetch: refetchBracket }] = createResource(
    () => tournamentId,
    async (id: number) => {
      try {
        const response = await fetch(`${TournamentService['baseUrl']}/tournaments/${id}/bracket`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching bracket:', error);
        return { rounds: [] } as TournamentBracket;
      }
    }
  );

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
    try {
      await TournamentService.startTournament(tournamentId);
      // Refresh the data after starting
      refetchBracket();
      refetchTournament();
      alert('Tournament has been started successfully');
    } catch (error) {
      console.error('Error starting tournament:', error);
      alert('Failed to start tournament');
    }
  };

  // Group rounds by bracket type for easier rendering or get all rounds if bracketType isn't used
  const getBracketRounds = (bracketType?: 'winners' | 'losers' | 'grand') => {
    if (!bracketData()?.rounds) return [];
    
    // If bracketType exists in the data, filter by it
    if (bracketType && bracketData().rounds.some((round: TournamentRound) => round.bracketType)) {
      return bracketData().rounds.filter((round: TournamentRound) => round.bracketType === bracketType);
    } 
    // Otherwise return all rounds (for simple brackets that don't have winners/losers separation)
    return bracketData().rounds;
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Show when={!tournamentData.loading} fallback={<div class="text-center py-8">Loading tournament data...</div>}>
        <Show when={tournamentData()}>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">{tournamentData()?.name}</h1>
            <div class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tournamentData()?.status === 'registration' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : tournamentData()?.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : tournamentData()?.status === 'completed' ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
              {tournamentData()?.status?.replace('_', ' ') || 'Unknown Status'}
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <p class="text-gray-700 dark:text-gray-300 mb-6">{tournamentData()?.description || 'No description provided'}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Format:</span>
                <span class="text-gray-900 dark:text-white font-medium">{tournamentData()?.format?.replace('_', ' ') || 'Unknown'}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <span class="text-gray-900 dark:text-white font-medium">{tournamentData()?.status?.replace('_', ' ') || 'Unknown'}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Participants:</span>
                <span class="text-gray-900 dark:text-white font-medium">{tournamentData()?.participants?.length || 0} / {tournamentData()?.maxParticipants || 0}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
                <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournamentData()?.startDate)}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">End Date:</span>
                <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournamentData()?.endDate)}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                <span class="text-gray-900 dark:text-white font-medium">{formatDate(tournamentData()?.createdAt)}</span>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Participants</h3>
              <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <For each={tournamentData()?.participants}>
                    {(participant) => (
                      <A 
                        href={`/profile/${participant.id}`}
                        class="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                      >
                        <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 flex-shrink-0 font-medium">
                          {participant.username ? participant.username.substring(0, 1).toUpperCase() : '?'}
                        </div>
                        <span class="text-gray-900 dark:text-white font-medium truncate">
                          {participant.username}
                        </span>
                      </A>
                    )}
                  </For>
                </div>
              </div>
            </div>
            
            <Show when={isAdmin() && tournamentData()?.status === 'registration'}>
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
      </Show>

      <Show when={tournamentData() && tournamentData()?.status !== 'registration'}>
        <Show when={!bracketData.loading} fallback={<div class="text-center py-8">Loading bracket data...</div>}>
          <Show when={bracketData() && bracketData().rounds && bracketData().rounds.length > 0}>
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 overflow-hidden">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tournament Bracket</h2>
              
              <div class="overflow-x-auto pb-4" style="min-height: 650px;">
                <div class="tournament-bracket flex flex-col gap-8" style="min-width: 1200px;">
                  {/* Check if we have specific bracket types or use a general bracket */}
                  <Show when={bracketData().rounds.some((round: TournamentRound) => round.bracketType)} fallback={
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Tournament Bracket
                      </h3>
                      <div class="flex gap-8">
                        <For each={getBracketRounds()}>
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
                  }>
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
                  </Show>
                </div>
              </div>
            </div>
          </Show>
        </Show>
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
          {props.player?.username ? props.player.username.substring(0, 1).toUpperCase() : '?'}
        </div>
        <span class={`font-medium ${props.isWinner ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'} truncate`}>
          {props.player?.username}
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
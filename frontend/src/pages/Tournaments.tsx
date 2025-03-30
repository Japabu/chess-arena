import { Component, createResource, For, Show } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { TournamentService, type Tournament } from '../services/api';

const Tournaments: Component = () => {
  const navigate = useNavigate();
  
  const fetchTournaments = async () => {
    return await TournamentService.getAllTournaments();
  };

  const [tournaments] = createResource<Tournament[]>(fetchTournaments);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'registration':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-800';
      case 'cancelled':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

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

  return (
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Chess Tournaments</h1>

      <Show when={tournaments.loading}>
        <div class="flex justify-center items-center py-16 transition-opacity duration-300">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span class="ml-4 text-lg text-gray-700 dark:text-gray-300 font-medium">Loading tournaments...</span>
        </div>
      </Show>

      <Show when={tournaments.error}>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 dark:bg-red-900/20 dark:border-red-500/50 rounded-r-md shadow-sm">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 dark:text-red-300">
                Error loading tournaments: {tournaments.error?.message}
              </p>
            </div>
          </div>
        </div>
      </Show>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <For each={tournaments()}>
          {(tournament) => (
            <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500 flex flex-col h-full">
              <div class="p-6 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white truncate mr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tournament.name}</h2>
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(tournament.status)}`}>
                    {tournament.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p class="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3 text-sm">
                  {tournament.description || 'No description provided'}
                </p>
                
                <div class="space-y-3 mb-6 mt-auto">
                  <div class="flex items-center text-sm">
                    <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mr-3 flex-shrink-0">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-medium">Format:</span>
                      <span class="ml-1.5 text-gray-600 dark:text-gray-400">{tournament.format ? tournament.format.replace('_', ' ') : 'Double Elimination'}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-sm">
                    <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mr-3 flex-shrink-0">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-medium">Participants:</span>
                      <span class="ml-1.5 text-gray-600 dark:text-gray-400">
                        {tournament.participants.length}
                        {tournament.maxParticipants > 0 && ` / ${tournament.maxParticipants}`}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-sm">
                    <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mr-3 flex-shrink-0">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-medium">Start:</span>
                      <span class="ml-1.5 text-gray-600 dark:text-gray-400">{formatDate(tournament.startDate)}</span>
                    </div>
                  </div>
                </div>
                
                {tournament.participants.length > 0 && (
                  <div class="mb-5">
                    <div class="text-sm text-gray-700 dark:text-gray-300 font-medium mb-3">
                      Participants:
                    </div>
                    <div class="flex -space-x-2 overflow-hidden">
                      <For each={tournament.participants.slice(0, 5)}>
                        {(participant) => (
                          <A 
                            href={`/profile/${participant.id}`}
                            class="relative inline-flex rounded-full ring-2 ring-white dark:ring-gray-800 transition-transform hover:scale-110 hover:z-10"
                            title={participant.username}
                          >
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                              {participant.username.substring(0, 1).toUpperCase()}
                            </div>
                          </A>
                        )}
                      </For>
                      {tournament.participants.length > 5 && (
                        <div class="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold">
                          +{tournament.participants.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div class="px-6 pb-6">
                <button
                  class="w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
      
      <Show when={tournaments() && tournaments()?.length === 0 && !tournaments.loading}>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 mb-6">
            <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No tournaments available</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">There are currently no tournaments scheduled.</p>
        </div>
      </Show>
    </div>
  );
};

export default Tournaments; 
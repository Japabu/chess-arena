import { Component, createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { TournamentService, type Tournament, type User, type ApiError } from '../services/api';

const Tournaments: Component = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    localStorage.getItem('token') !== null
  );

  const fetchTournaments = async () => {
    return await TournamentService.getAllTournaments();
  };

  const [tournaments, { refetch }] = createResource<Tournament[]>(fetchTournaments);

  const handleRegister = async (tournamentId: number) => {
    if (!isAuthenticated()) {
      alert('You need to be logged in to register for a tournament');
      return;
    }

    try {
      await TournamentService.registerForTournament(tournamentId);
      alert('Successfully registered for the tournament');
      // Refresh tournaments
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';
      alert(`Registration failed: ${errorMessage}`);
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'registration':
        return 'badge badge-green';
      case 'in_progress':
        return 'badge badge-blue';
      case 'completed':
        return 'badge badge-gray';
      case 'cancelled':
        return 'badge badge-red';
      default:
        return 'badge badge-gray';
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
    <div class="content-container">
      <h1 class="heading-primary mb-8">Chess Tournaments</h1>

      <Show when={tournaments.loading}>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span class="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading tournaments...</span>
        </div>
      </Show>

      <Show when={tournaments.error}>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 dark:bg-red-900/20 dark:border-red-500/50">
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={tournaments()}>
          {(tournament) => (
            <div class="card card-hover">
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="heading-secondary truncate mr-2">{tournament.name}</h2>
                  <span class={getStatusBadgeClass(tournament.status)}>
                    {tournament.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p class="text-body mb-6 line-clamp-3">
                  {tournament.description || 'No description provided'}
                </p>
                
                <div class="space-y-2 mb-6">
                  <div class="flex items-center text-sm">
                    <svg class="mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Format:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{tournament.format.replace('_', ' ')}</span>
                  </div>
                  
                  <div class="flex items-center text-sm">
                    <svg class="mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Participants:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">
                      {tournament.participants.length}
                      {tournament.maxParticipants > 0 && ` / ${tournament.maxParticipants}`}
                    </span>
                  </div>
                  
                  <div class="flex items-center text-sm">
                    <svg class="mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Start:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">{formatDate(tournament.startDate)}</span>
                  </div>
                </div>
                
                <div class="flex space-x-3">
                  <button
                    class="flex-1 btn-primary"
                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  >
                    View Details
                  </button>
                  
                  <Show when={tournament.status === 'registration' && isAuthenticated()}>
                    <button
                      class="flex-1 btn-secondary"
                      onClick={() => handleRegister(tournament.id)}
                    >
                      Register
                    </button>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Tournaments; 
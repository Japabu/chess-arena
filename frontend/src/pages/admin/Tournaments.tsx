import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService, TournamentService } from '../../services/api';
import type { Tournament as ApiTournament, User as ApiUser } from '../../services/api/types';

interface User {
  id: number;
  username: string;
}

interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: string;
  format: string; 
  maxParticipants: number;
  participants: User[];
  createdAt: string;
}

const Tournaments: Component = () => {
  const [tournaments, setTournaments] = createSignal<Tournament[]>([]);
  const [selectedTournaments, setSelectedTournaments] = createSignal<number[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const [actionSuccess, setActionSuccess] = createSignal('');
  const [selectAll, setSelectAll] = createSignal(false);
  const navigate = useNavigate();
  
  // Check for authentication and fetch tournaments
  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/admin/login');
    } else {
      fetchTournaments();
    }
  });
  
  const fetchTournaments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const apiTournaments = await TournamentService.getAllTournaments();
      
      // Map API Tournament to our local Tournament interface
      const mappedTournaments = apiTournaments.map((apiTournament: ApiTournament) => ({
        id: apiTournament.id,
        name: apiTournament.name,
        description: apiTournament.description,
        status: apiTournament.status,
        format: apiTournament.format,
        maxParticipants: apiTournament.maxParticipants,
        participants: apiTournament.participants.map((participant: ApiUser) => ({
          id: participant.id,
          username: participant.username || 'Unknown'
        })),
        createdAt: apiTournament.createdAt
      }));
      
      setTournaments(mappedTournaments);
      // Reset selections when fetching new data
      setSelectedTournaments([]);
      setSelectAll(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTournament = async (tournamentId: number) => {
    if (!confirm('Are you sure you want to delete this tournament?')) {
      return;
    }
    
    setError('');
    setDeleteSuccess('');
    
    try {
      await TournamentService.deleteTournament(tournamentId);
      
      // Remove the tournament from the list
      setTournaments(prev => prev.filter(t => t.id !== tournamentId));
      
      setDeleteSuccess('Tournament deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    }
  };
  
  const handleSelectTournament = (tournamentId: number, checked: boolean) => {
    if (checked) {
      setSelectedTournaments(prev => [...prev, tournamentId]);
    } else {
      setSelectedTournaments(prev => prev.filter(id => id !== tournamentId));
      setSelectAll(false);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedTournaments(tournaments().map(tournament => tournament.id));
    } else {
      setSelectedTournaments([]);
    }
  };
  
  const handleBulkDelete = async () => {
    const selectedIds = selectedTournaments();
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} tournaments?`)) {
      return;
    }
    
    setError('');
    setDeleteSuccess('');
    setIsLoading(true);
    
    try {
      await TournamentService.bulkDeleteTournaments(selectedIds);
      
      // Remove the tournaments from the list
      setTournaments(prev => prev.filter(t => !selectedIds.includes(t.id)));
      
      // Reset selections
      setSelectedTournaments([]);
      setSelectAll(false);
      
      setDeleteSuccess(`${selectedIds.length} tournaments deleted successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartTournament = async (tournamentId: number) => {
    setError('');
    setActionSuccess('');
    
    try {
      await TournamentService.startTournament(tournamentId);
      
      // Refresh the tournaments list
      await fetchTournaments();
      setActionSuccess('Tournament started successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const formatTournamentFormat = (format: string) => {
    if (!format) return 'Double Elimination'; // Default to Double Elimination if format is undefined or null
    return format.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getStatusClass = (status: string) => {
    if (status === 'registration') 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    if (status === 'in_progress') 
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
    if (status === 'completed') 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  };
  
  const getStatusText = (status: string) => {
    if (status === 'in_progress') return 'Active';
    if (status === 'completed') return 'Completed';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Tournament Management</h1>
        <div class="flex flex-wrap gap-3">
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            onClick={() => navigate('/admin/tournaments/create')}
          >
            Create Tournament
          </button>
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors" 
            onClick={fetchTournaments}
          >
            Refresh
          </button>
          <Show when={selectedTournaments().length > 0}>
            <button 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" 
              onClick={handleBulkDelete}
              disabled={isLoading()}
            >
              Delete Selected ({selectedTournaments().length})
            </button>
          </Show>
        </div>
      </div>
      
      {error() && <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900/30 dark:text-red-400">{error()}</div>}
      {deleteSuccess() && <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 dark:bg-green-900/30 dark:text-green-400">{deleteSuccess()}</div>}
      {actionSuccess() && <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 dark:bg-green-900/30 dark:text-green-400">{actionSuccess()}</div>}
      
      <Show when={isLoading()}>
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <span class="ml-3 text-gray-700 dark:text-gray-300">Loading tournaments...</span>
        </div>
      </Show>
      
      <Show when={!isLoading() && tournaments().length === 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div class="py-6">
            <p class="text-gray-700 dark:text-gray-300 mb-4">No tournaments found.</p>
            <button 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
              onClick={() => navigate('/admin/tournaments/create')}
            >
              Create Your First Tournament
            </button>
          </div>
        </div>
      </Show>
      
      <Show when={!isLoading() && tournaments().length > 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={selectAll()}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Format</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participants</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <For each={tournaments()}>
                  {(tournament) => (
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <input 
                          type="checkbox" 
                          checked={selectedTournaments().includes(tournament.id)}
                          onChange={(e) => handleSelectTournament(tournament.id, e.target.checked)}
                          class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{tournament.id}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{tournament.name}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatTournamentFormat(tournament.format)}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(tournament.status)}`}>
                          {getStatusText(tournament.status)}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {tournament.participants.length}
                        {tournament.maxParticipants > 0 ? ` / ${tournament.maxParticipants}` : ''}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatDate(tournament.createdAt)}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          class="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
                          onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        >
                          View
                        </button>
                        <Show when={tournament.status === 'registration'}>
                          <button 
                            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" 
                            onClick={() => handleStartTournament(tournament.id)}
                          >
                            Start
                          </button>
                        </Show>
                        <button 
                          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" 
                          onClick={() => handleDeleteTournament(tournament.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Tournaments; 
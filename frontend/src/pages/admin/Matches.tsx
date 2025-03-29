import { Component, createSignal, createEffect, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { MatchService, UserService } from '../../services/api';
import { TournamentMatch, User } from '../../services/api/types';

// Extended match type with properties needed for UI
interface MatchWithDetails extends TournamentMatch {
  id?: number;
  white?: User;
  black?: User;
  fen?: string;
  createdAt?: string;
}

const Matches: Component = () => {
  const [matches, setMatches] = createSignal<MatchWithDetails[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const navigate = useNavigate();
  
  // Check for authentication and fetch matches
  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/admin/login');
    } else {
      fetchMatches();
    }
  });
  
  const fetchMatches = async () => {
    setIsLoading(true);
    const data = await MatchService.getAllMatches();
    // Map TournamentMatch to our MatchWithDetails type
    const mappedMatches = data.map(match => ({
      ...match,
      id: match.matchId,
      white: match.player1,
      black: match.player2
    }));
    setMatches(mappedMatches);
    setIsLoading(false);
  };
  
  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure?')) return;
    await MatchService.deleteMatch(matchId);
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const getStatusText = (status?: string) => {
    if (!status) return 'Unknown';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    return status.replace(/_/g, ' ');
  };
  
  const getStatusClass = (status?: string) => {
    if (!status) return '';
    if (status === 'in_progress') 
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
    if (status === 'completed') 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  };
  
  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Match Management</h1>
        <div class="flex flex-wrap gap-3">
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            onClick={() => navigate('/admin/matches/create')}
          >
            Create Match
          </button>
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors" 
            onClick={fetchMatches}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {isLoading() ? (
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <span class="ml-3 text-gray-700 dark:text-gray-300">Loading matches...</span>
        </div>
      ) : matches().length === 0 ? (
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div class="py-6">
            <p class="text-gray-700 dark:text-gray-300 mb-4">No matches found.</p>
            <button 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
              onClick={() => navigate('/admin/matches/create')}
            >
              Create Your First Match
            </button>
          </div>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={matches()}>
            {(match) => (
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div class="bg-gray-50 dark:bg-gray-750 p-4 flex justify-between items-center">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Match #{match.id || match.matchId}</span>
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(match.status)}`}>
                    {getStatusText(match.status)}
                  </span>
                </div>
                
                <div class="p-4">
                  <div class="flex justify-between items-center mb-4">
                    <div class="flex-1 text-center">
                      <div class="font-medium text-gray-900 dark:text-white">{match.white?.name || match.player1?.name || 'Unknown'}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">White</div>
                    </div>
                    <div class="mx-2 text-lg font-bold text-gray-400 dark:text-gray-500">VS</div>
                    <div class="flex-1 text-center">
                      <div class="font-medium text-gray-900 dark:text-white">{match.black?.name || match.player2?.name || 'Unknown'}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Black</div>
                    </div>
                  </div>
                  
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Created: {formatDate(match.createdAt)}
                  </div>
                  
                  <div class="flex gap-2">
                    <button 
                      class="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => navigate(`/admin/matches/edit/${match.id || match.matchId}`)}
                    >
                      Edit
                    </button>
                    <button 
                      class="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      onClick={() => handleDeleteMatch(match.id || match.matchId!)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default Matches; 
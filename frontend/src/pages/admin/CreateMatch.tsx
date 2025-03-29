import { Component, createSignal, createEffect, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService, MatchService } from '../../services/api';

interface User {
  id: number;
  username: string;
}

const CreateMatch: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isCreating, setIsCreating] = createSignal(false);
  const [error, setError] = createSignal('');
  const [selectedWhiteId, setSelectedWhiteId] = createSignal<number | null>(null);
  const [selectedBlackId, setSelectedBlackId] = createSignal<number | null>(null);
  const [customFen, setCustomFen] = createSignal('');
  const navigate = useNavigate();
  
  // Check for authentication and fetch users
  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/admin/login');
    } else {
      fetchUsers();
    }
  });
  
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const userData = await UserService.getAllUsers();
      
      // Map API users to our local User interface
      setUsers(userData.map(apiUser => ({
        id: apiUser.id,
        username: apiUser.name
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateFen = (fen: string): boolean => {
    if (!fen) return true; // Empty FEN is fine, will use default
    
    // Basic FEN validation
    const fenPattern = /^([pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+\s[wb]\s[KQkq-]+\s[a-h1-8-]+\s\d+\s\d+$/;
    return fenPattern.test(fen);
  };
  
  const handleCreateMatch = async (e: Event) => {
    e.preventDefault();
    
    if (!selectedWhiteId() || !selectedBlackId()) {
      setError('Please select both white and black players');
      return;
    }
    
    if (selectedWhiteId() === selectedBlackId()) {
      setError('White and black players must be different');
      return;
    }
    
    // Validate custom FEN if provided
    if (customFen() && !validateFen(customFen())) {
      setError('Invalid FEN format');
      return;
    }
    
    setError('');
    setIsCreating(true);
    
    try {
      const matchData: any = {
        player1: { id: selectedWhiteId() },
        player2: { id: selectedBlackId() }
      };
      
      if (customFen()) {
        matchData.fen = customFen();
      }
      
      await MatchService.createMatch(matchData);
      
      // Navigate to the matches page
      navigate('/admin/matches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Match</h1>
      
      {error() && (
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900/30 dark:text-red-400">
          {error()}
        </div>
      )}
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <form class="p-6 space-y-6" onSubmit={handleCreateMatch}>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Match Details</h2>
          
          <div class="space-y-2">
            <label for="white-player" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              White Player
            </label>
            <select 
              id="white-player"
              value={selectedWhiteId() || ''}
              onChange={(e) => setSelectedWhiteId(parseInt(e.currentTarget.value))}
              disabled={isLoading() || isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Select White Player</option>
              <For each={users()}>
                {(user) => (
                  <option value={user.id}>{user.username}</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="black-player" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Black Player
            </label>
            <select 
              id="black-player"
              value={selectedBlackId() || ''}
              onChange={(e) => setSelectedBlackId(parseInt(e.currentTarget.value))}
              disabled={isLoading() || isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Black Player</option>
              <For each={users()}>
                {(user) => (
                  <option value={user.id}>{user.username}</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="custom-fen" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Starting Position (FEN) - Optional
            </label>
            <input 
              type="text" 
              id="custom-fen" 
              value={customFen()} 
              onChange={(e) => setCustomFen(e.currentTarget.value)}
              placeholder="Standard starting position will be used if empty"
              disabled={isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button 
              type="button" 
              class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50" 
              onClick={() => navigate('/admin/matches')}
              disabled={isCreating()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              disabled={isLoading() || isCreating() || !selectedWhiteId() || !selectedBlackId()}
            >
              {isCreating() ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch; 
import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService, TournamentService } from '../../services/api';

const CreateTournament: Component = () => {
  const [tournamentName, setTournamentName] = createSignal('');
  const [tournamentDescription, setTournamentDescription] = createSignal('');
  const [tournamentFormat, setTournamentFormat] = createSignal('double_elimination');
  const [maxParticipants, setMaxParticipants] = createSignal(0);
  const [isCreating, setIsCreating] = createSignal(false);
  const [error, setError] = createSignal('');
  const navigate = useNavigate();
  
  // Check for authentication
  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/admin/login');
    }
  });
  
  const handleCreateTournament = async (e: Event) => {
    e.preventDefault();
    
    if (!tournamentName()) {
      setError('Please enter a tournament name');
      return;
    }
    
    setError('');
    setIsCreating(true);
    
    try {
      // Create tournament payload
      const tournamentData = {
        name: tournamentName(),
        description: tournamentDescription(),
        format: tournamentFormat(),
        maxParticipants: maxParticipants(),
        status: 'registration',
      };
      
      console.log('Sending tournament creation request:', tournamentData);
      
      await TournamentService.createTournament(tournamentData);
      
      // Navigate back to tournaments list
      navigate('/admin/tournaments');
    } catch (err) {
      console.error('Tournament creation error:', err);
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
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Tournament</h1>
      
      {error() && (
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900/30 dark:text-red-400">
          {error()}
        </div>
      )}
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <form class="p-6 space-y-6" onSubmit={handleCreateTournament}>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tournament Details</h2>
          
          <div class="space-y-2">
            <label for="tournament-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tournament Name*
            </label>
            <input 
              type="text" 
              id="tournament-name" 
              value={tournamentName()} 
              onInput={(e) => setTournamentName(e.currentTarget.value)}
              placeholder="Enter tournament name"
              required
              disabled={isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
          </div>
          
          <div class="space-y-2">
            <label for="tournament-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea 
              id="tournament-description" 
              value={tournamentDescription()} 
              onInput={(e) => setTournamentDescription(e.currentTarget.value)}
              placeholder="Enter tournament description (optional)"
              rows={4}
              disabled={isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
          </div>
          
          <div class="space-y-2">
            <label for="tournament-format" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tournament Format
            </label>
            <select 
              id="tournament-format" 
              value={tournamentFormat()} 
              onChange={(e) => setTournamentFormat(e.currentTarget.value)}
              disabled={isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="double_elimination">Double Elimination</option>
            </select>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Tournament is organized as a double elimination bracket with winners and losers brackets
            </div>
          </div>
          
          <div class="space-y-2">
            <label for="max-participants" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Participants
            </label>
            <input 
              type="number" 
              id="max-participants" 
              min={0}
              value={maxParticipants()} 
              onInput={(e) => setMaxParticipants(parseInt(e.currentTarget.value) || 0)}
              disabled={isCreating()}
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Set to 0 for unlimited participants
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button 
              type="button" 
              class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50" 
              onClick={() => navigate('/admin/tournaments')}
              disabled={isCreating()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              disabled={isCreating() || !tournamentName()}
            >
              {isCreating() ? 'Creating...' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament; 
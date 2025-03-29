import { Component, createSignal, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { MatchService, UserService } from '../../services/api';
import { User } from '../../services/api/types';
import { Chess } from 'chess.js';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const CreateMatch: Component = () => {
  const navigate = useNavigate();
  const [users, setUsers] = createSignal<User[]>([]);
  const [whiteId, setWhiteId] = createSignal<number | null>(null);
  const [blackId, setBlackId] = createSignal<number | null>(null);
  const [fen, setFen] = createSignal(INITIAL_FEN);
  const [useCustomFen, setUseCustomFen] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Fetch users on mount
  const fetchUsers = async () => {
    setIsLoading(true);
    
    const usersData = await UserService.getAllUsers();
    setUsers(usersData);
    
    setIsLoading(false);
  };
  
  if (users().length === 0) {
    fetchUsers();
  }
  
  const handleCreateMatch = async () => {
    if (!whiteId() || !blackId()) {
      return;
    }
    
    if (whiteId() === blackId()) {
      return;
    }
    
    if (useCustomFen() && !validateFen()) {
      return;
    }
    
    setIsLoading(true);
    
    const whitePlayer = users().find(user => user.id === whiteId());
    const blackPlayer = users().find(user => user.id === blackId());
    
    await MatchService.createMatch({
      matchNumber: 0, // This will be assigned by the backend
      player1: whitePlayer,
      player2: blackPlayer,
      status: 'pending'
    });
    
    navigate('/admin/matches');
    setIsLoading(false);
  };
  
  const validateFen = () => {
    try {
      const chess = new Chess();
      chess.load(fen());
      return true;
    } catch {
      return false;
    }
  };
  
  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Match</h1>
      
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">White Player</label>
            <select 
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={whiteId() || ''}
              onChange={(e) => setWhiteId(Number(e.currentTarget.value))}
              disabled={isLoading()}
            >
              <option value="">Select white player</option>
              <For each={users()}>
                {(user) => (
                  <option value={user.id}>{user.name}</option>
                )}
              </For>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Black Player</label>
            <select 
              class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={blackId() || ''}
              onChange={(e) => setBlackId(Number(e.currentTarget.value))}
              disabled={isLoading()}
            >
              <option value="">Select black player</option>
              <For each={users()}>
                {(user) => (
                  <option value={user.id}>{user.name}</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="useCustomFen" 
              checked={useCustomFen()} 
              onChange={() => setUseCustomFen(!useCustomFen())}
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="useCustomFen" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Use custom starting position (FEN)
            </label>
          </div>
          
          {useCustomFen() && (
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">FEN String</label>
              <input 
                type="text" 
                value={fen()} 
                onInput={(e) => setFen(e.currentTarget.value)}
                disabled={isLoading()}
                class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                e.g. {INITIAL_FEN}
              </p>
            </div>
          )}
          
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              class="px-6 py-2 mr-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => navigate('/admin/matches')}
              disabled={isLoading()}
            >
              Cancel
            </button>
            <button 
              class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={handleCreateMatch}
              disabled={isLoading() || !whiteId() || !blackId() || whiteId() === blackId() || (useCustomFen() && !validateFen())}
            >
              {isLoading() ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMatch; 
import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';
import { UserService, MatchService } from '../../services/api';
import type { User as ApiUser } from '../../services/api/types';

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
    <div class="create-match-page">
      <h1 class="page-title">Create New Match</h1>
      
      {error() && <div class="error-message">{error()}</div>}
      
      <div class="section-card">
        <form class="admin-form" onSubmit={handleCreateMatch}>
          <h2 class="form-title">Match Details</h2>
          
          <div class="form-group">
            <label for="white-player">White Player</label>
            <select 
              id="white-player"
              value={selectedWhiteId() || ''}
              onChange={(e) => setSelectedWhiteId(parseInt(e.currentTarget.value))}
              disabled={isLoading() || isCreating()}
            >
              <option value="">Select White Player</option>
              {users().map((user) => (
                <option value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          
          <div class="form-group">
            <label for="black-player">Black Player</label>
            <select 
              id="black-player"
              value={selectedBlackId() || ''}
              onChange={(e) => setSelectedBlackId(parseInt(e.currentTarget.value))}
              disabled={isLoading() || isCreating()}
            >
              <option value="">Select Black Player</option>
              {users().map((user) => (
                <option value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          
          <div class="form-group">
            <label for="custom-fen">Custom Starting Position (FEN) - Optional</label>
            <input 
              type="text" 
              id="custom-fen" 
              value={customFen()} 
              onChange={(e) => setCustomFen(e.currentTarget.value)}
              placeholder="Standard starting position will be used if empty"
              disabled={isCreating()}
            />
            <div class="form-hint">
              Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
            </div>
          </div>
          
          <div class="form-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              onClick={() => navigate('/admin/matches')}
              disabled={isCreating()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
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
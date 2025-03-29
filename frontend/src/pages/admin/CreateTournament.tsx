import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';
import { UserService, TournamentService } from '../../services/api';

const CreateTournament: Component = () => {
  const [tournamentName, setTournamentName] = createSignal('');
  const [tournamentDescription, setTournamentDescription] = createSignal('');
  const [tournamentFormat, setTournamentFormat] = createSignal('single_elimination');
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
    <div class="create-tournament-page">
      <h1 class="page-title">Create Tournament</h1>
      
      {error() && <div class="error-message">{error()}</div>}
      
      <div class="section-card">
        <form class="admin-form" onSubmit={handleCreateTournament}>
          <h2 class="form-title">Tournament Details</h2>
          
          <div class="form-group">
            <label for="tournament-name">Tournament Name*</label>
            <input 
              type="text" 
              id="tournament-name" 
              value={tournamentName()} 
              onInput={(e) => setTournamentName(e.currentTarget.value)}
              placeholder="Enter tournament name"
              required
              disabled={isCreating()}
            />
          </div>
          
          <div class="form-group">
            <label for="tournament-description">Description</label>
            <textarea 
              id="tournament-description" 
              value={tournamentDescription()} 
              onInput={(e) => setTournamentDescription(e.currentTarget.value)}
              placeholder="Enter tournament description (optional)"
              rows={4}
              disabled={isCreating()}
            />
          </div>
          
          <div class="form-group">
            <label for="tournament-format">Tournament Format</label>
            <select 
              id="tournament-format" 
              value={tournamentFormat()} 
              onChange={(e) => setTournamentFormat(e.currentTarget.value)}
              disabled={isCreating()}
            >
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
              <option value="round_robin">Round Robin</option>
              <option value="swiss">Swiss</option>
            </select>
            <div class="form-hint">
              How the tournament matchups will be organized
            </div>
          </div>
          
          <div class="form-group">
            <label for="max-participants">Maximum Participants</label>
            <input 
              type="number" 
              id="max-participants" 
              min={0}
              value={maxParticipants()} 
              onInput={(e) => setMaxParticipants(parseInt(e.currentTarget.value) || 0)}
              disabled={isCreating()}
            />
            <div class="form-hint">
              Set to 0 for unlimited participants
            </div>
          </div>
          
          <div class="form-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              onClick={() => navigate('/admin/tournaments')}
              disabled={isCreating()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
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
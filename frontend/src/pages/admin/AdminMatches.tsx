import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { MatchService, UserService } from '../../services/api';
import { TournamentMatch, User } from '../../services/api/types';
import '../../styles/Admin.css';

// Extended match type with properties needed for UI
interface MatchWithDetails extends TournamentMatch {
  id?: number;
  white?: User;
  black?: User;
  fen?: string;
  createdAt?: string;
}

const AdminMatches: Component = () => {
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
  
  return (
    <div class="admin-matches-page">
      <div class="page-header">
        <h1 class="page-title">Match Management</h1>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            onClick={() => navigate('/admin/matches/create')}
          >
            Create Match
          </button>
          <button class="btn btn-secondary" onClick={fetchMatches}>
            Refresh
          </button>
        </div>
      </div>
      
      {isLoading() ? (
        <div class="loading-indicator">Loading matches...</div>
      ) : matches().length === 0 ? (
        <div class="section-card">
          <div class="empty-state">
            <p>No matches found.</p>
            <button 
              class="btn btn-primary" 
              onClick={() => navigate('/admin/matches/create')}
            >
              Create Your First Match
            </button>
          </div>
        </div>
      ) : (
        <div class="match-grid">
          <For each={matches()}>
            {(match) => (
              <div class="match-card">
                <div class="match-header">
                  <span class="match-id">Match #{match.id || match.matchId}</span>
                  <span class={`match-status ${match.status === 'in_progress' ? 'match-status-active' : match.status === 'completed' ? 'match-status-completed' : ''}`}>
                    {getStatusText(match.status)}
                  </span>
                </div>
                
                <div class="match-players">
                  <div class="match-player">
                    <div class="match-player-name">{match.white?.name || match.player1?.name || 'Unknown'}</div>
                    <div class="match-player-color">White</div>
                  </div>
                  <div class="match-vs">VS</div>
                  <div class="match-player">
                    <div class="match-player-name">{match.black?.name || match.player2?.name || 'Unknown'}</div>
                    <div class="match-player-color">Black</div>
                  </div>
                </div>
                
                <div class="match-date">
                  Created: {formatDate(match.createdAt)}
                </div>
                
                <div class="match-actions">
                  <button 
                    class="btn btn-secondary"
                    onClick={() => navigate(`/admin/matches/edit/${match.id || match.matchId}`)}
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-danger"
                    onClick={() => handleDeleteMatch(match.id || match.matchId!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default AdminMatches; 
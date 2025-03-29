import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';

interface User {
  id: number;
  username: string;
}

interface Match {
  id: number;
  white: User;
  black: User;
  fen: string;
  createdAt: string;
  status: string;
}

const AdminMatches: Component = () => {
  const [matches, setMatches] = createSignal<Match[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const navigate = useNavigate();
  
  // Check for authentication and fetch matches
  createEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchMatches();
    }
  });
  
  const fetchMatches = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/match`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Failed to fetch matches');
      }
      
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return;
    }
    
    setError('');
    setDeleteSuccess('');
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/match/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete match');
      }
      
      // Remove the match from the list
      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      setDeleteSuccess('Match deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const handleEditMatch = (matchId: number) => {
    navigate(`/admin/matches/edit/${matchId}`);
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
  
  const getStatusClass = (status: string) => {
    if (status === 'in_progress') return 'match-status-active';
    if (status === 'completed') return 'match-status-completed';
    return '';
  };
  
  const getStatusText = (status: string) => {
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
      
      {error() && <div class="error-message">{error()}</div>}
      {deleteSuccess() && <div class="success-message">{deleteSuccess()}</div>}
      
      <Show when={isLoading()}>
        <div class="loading-indicator">Loading matches...</div>
      </Show>
      
      <Show when={!isLoading() && matches().length === 0}>
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
      </Show>
      
      <Show when={!isLoading() && matches().length > 0}>
        <div class="match-grid">
          <For each={matches()}>
            {(match) => (
              <div class="match-card">
                <div class="match-header">
                  <span class="match-id">Match #{match.id}</span>
                  <span class={`match-status ${getStatusClass(match.status)}`}>
                    {getStatusText(match.status)}
                  </span>
                </div>
                
                <div class="match-players">
                  <div class="match-player">
                    <div class="match-player-name">{match.white?.username || 'Unknown'}</div>
                    <div class="match-player-color">White</div>
                  </div>
                  <div class="match-vs">VS</div>
                  <div class="match-player">
                    <div class="match-player-name">{match.black?.username || 'Unknown'}</div>
                    <div class="match-player-color">Black</div>
                  </div>
                </div>
                
                <div class="match-date">
                  Created: {formatDate(match.createdAt)}
                </div>
                
                <div class="match-actions">
                  <button 
                    class="btn btn-secondary"
                    onClick={() => handleEditMatch(match.id)}
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-danger"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default AdminMatches; 
import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';
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

const AdminTournaments: Component = () => {
  const [tournaments, setTournaments] = createSignal<Tournament[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const [actionSuccess, setActionSuccess] = createSignal('');
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
          username: participant.name
        })),
        createdAt: apiTournament.createdAt
      }));
      
      setTournaments(mappedTournaments);
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
    return format.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getStatusClass = (status: string) => {
    if (status === 'registration') return 'tournament-status-registration';
    if (status === 'in_progress') return 'tournament-status-active';
    if (status === 'completed') return 'tournament-status-completed';
    return '';
  };
  
  const getStatusText = (status: string) => {
    if (status === 'in_progress') return 'Active';
    if (status === 'completed') return 'Completed';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div class="admin-tournaments-page">
      <div class="page-header">
        <h1 class="page-title">Tournament Management</h1>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            onClick={() => navigate('/admin/tournaments/create')}
          >
            Create Tournament
          </button>
          <button class="btn btn-secondary" onClick={fetchTournaments}>
            Refresh
          </button>
        </div>
      </div>
      
      {error() && <div class="error-message">{error()}</div>}
      {deleteSuccess() && <div class="success-message">{deleteSuccess()}</div>}
      {actionSuccess() && <div class="success-message">{actionSuccess()}</div>}
      
      <Show when={isLoading()}>
        <div class="loading-indicator">Loading tournaments...</div>
      </Show>
      
      <Show when={!isLoading() && tournaments().length === 0}>
        <div class="section-card">
          <div class="empty-state">
            <p>No tournaments found.</p>
            <button 
              class="btn btn-primary" 
              onClick={() => navigate('/admin/tournaments/create')}
            >
              Create Your First Tournament
            </button>
          </div>
        </div>
      </Show>
      
      <Show when={!isLoading() && tournaments().length > 0}>
        <div class="section-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Format</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={tournaments()}>
                {(tournament) => (
                  <tr>
                    <td>{tournament.id}</td>
                    <td>{tournament.name}</td>
                    <td>{formatTournamentFormat(tournament.format)}</td>
                    <td>
                      <span class={`tournament-status ${getStatusClass(tournament.status)}`}>
                        {getStatusText(tournament.status)}
                      </span>
                    </td>
                    <td>
                      {tournament.participants.length}
                      {tournament.maxParticipants > 0 ? ` / ${tournament.maxParticipants}` : ''}
                    </td>
                    <td>{formatDate(tournament.createdAt)}</td>
                    <td class="action-buttons">
                      <button 
                        class="btn btn-secondary" 
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                      >
                        View
                      </button>
                      <Show when={tournament.status === 'registration'}>
                        <button 
                          class="btn btn-success" 
                          onClick={() => handleStartTournament(tournament.id)}
                        >
                          Start
                        </button>
                      </Show>
                      <button 
                        class="btn btn-danger" 
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
      </Show>
    </div>
  );
};

export default AdminTournaments; 
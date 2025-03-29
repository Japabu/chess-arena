import { Component, createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../styles/Tournaments.css';

interface User {
  id: number;
  name: string;
}

interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: string;
  format: string;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
  participants: User[];
  createdAt: string;
}

const Tournaments: Component = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    localStorage.getItem('token') !== null
  );

  const fetchTournaments = async () => {
    const response = await fetch('http://localhost:3000/tournaments');
    const data = await response.json();
    return data;
  };

  const [tournaments, { refetch }] = createResource<Tournament[]>(fetchTournaments);

  const handleRegister = async (tournamentId: number) => {
    if (!isAuthenticated()) {
      alert('You need to be logged in to register for a tournament');
      return;
    }

    try {
      // Try to use the authenticated endpoint first
      const token = localStorage.getItem('token');
      let endpoint = `http://localhost:3000/tournaments/${tournamentId}/register`;
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      let body = null;

      // Fallback to dev endpoint if in development mode
      const isDev = import.meta.env.DEV;
      if (isDev) {
        endpoint = `http://localhost:3000/tournaments/${tournamentId}/dev/register-by-id`;
        const userId = parseInt(localStorage.getItem('userId') || '1', 10);
        body = JSON.stringify({ userId });
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (response.ok) {
        alert('Successfully registered for the tournament');
        // Refresh tournaments
        refetch();
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
      }
    } catch (error) {
      alert('Error registering for tournament');
      console.error(error);
    }
  };

  const getTournamentStatusClass = (status: string) => {
    switch (status) {
      case 'registration':
        return 'status-registration';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div class="tournaments-container">
      <h1>Chess Tournaments</h1>

      <Show when={tournaments.loading}>
        <div class="loading-spinner">Loading tournaments...</div>
      </Show>

      <Show when={tournaments.error}>
        <div class="error-message">
          Error loading tournaments: {tournaments.error?.message}
        </div>
      </Show>

      <div class="tournaments-grid">
        <For each={tournaments()}>
          {(tournament) => (
            <div class="tournament-card">
              <div class="tournament-header">
                <h2>{tournament.name}</h2>
                <span class={`status-badge ${getTournamentStatusClass(tournament.status)}`}>
                  {tournament.status.replace('_', ' ')}
                </span>
              </div>
              
              <p class="tournament-description">
                {tournament.description || 'No description provided'}
              </p>
              
              <div class="tournament-details">
                <div class="detail">
                  <span class="label">Format:</span>
                  <span class="value">{tournament.format.replace('_', ' ')}</span>
                </div>
                
                <div class="detail">
                  <span class="label">Participants:</span>
                  <span class="value">
                    {tournament.participants.length}
                    {tournament.maxParticipants > 0 && ` / ${tournament.maxParticipants}`}
                  </span>
                </div>
                
                <div class="detail">
                  <span class="label">Start:</span>
                  <span class="value">{formatDate(tournament.startDate)}</span>
                </div>
              </div>
              
              <div class="tournament-actions">
                <button
                  class="view-button"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  View Details
                </button>
                
                <Show when={tournament.status === 'registration' && isAuthenticated()}>
                  <button
                    class="register-button"
                    onClick={() => handleRegister(tournament.id)}
                  >
                    Register
                  </button>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Tournaments; 
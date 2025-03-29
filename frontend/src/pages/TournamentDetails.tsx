import { Component, createSignal, createResource, createEffect, For, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import '../styles/TournamentDetails.css';

interface User {
  id: number;
  name: string;
}

interface TournamentMatch {
  matchId?: number;
  matchNumber: number;
  player1?: User;
  player2?: User;
  winner?: number;
  status?: string;
}

interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
}

interface TournamentBracket {
  rounds: TournamentRound[];
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
  matches: any[];
  createdAt: string;
}

const TournamentDetails: Component = () => {
  const params = useParams();
  const tournamentId = params.id;
  const [socket, setSocket] = createSignal<WebSocket | null>(null);

  // Fetch tournament details
  const fetchTournament = async () => {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}`);
    return response.json();
  };

  const [tournament, { refetch }] = createResource<Tournament>(fetchTournament);

  // Fetch tournament bracket
  const fetchBracket = async () => {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}/bracket`);
    return response.json();
  };

  const [bracket, { refetch: refetchBracket }] = createResource<TournamentBracket>(fetchBracket);

  // Connect to WebSocket for real-time updates
  createEffect(() => {
    if (tournament()) {
      const ws = new WebSocket(`ws://${window.location.host}/ws`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          action: 'join',
          room: `tournament:${tournamentId}`
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'tournament.update') {
          // Refresh tournament data
          refetch();
          refetchBracket();
        }
      };
      
      setSocket(ws);
      
      // Clean up
      return () => {
        ws.close();
      };
    }
  });

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    
    switch (status) {
      case 'pending':
        return 'match-pending';
      case 'in_progress':
        return 'match-in-progress';
      case 'white_won':
      case 'black_won':
        return 'match-completed';
      case 'draw':
        return 'match-draw';
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

  const startTournament = async () => {
    if (!tournament()) return;

    try {
      // Try to use the authenticated endpoint first
      const token = localStorage.getItem('token');
      let endpoint = `http://localhost:3000/tournaments/${tournamentId}/start`;
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fallback to dev endpoint if in development mode
      const isDev = import.meta.env.DEV;
      if (isDev) {
        endpoint = `http://localhost:3000/tournaments/${tournamentId}/dev/start-tournament`;
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers
      });

      if (response.ok) {
        alert('Tournament has been started successfully');
        refetch();
        refetchBracket();
      } else {
        const error = await response.json();
        alert(`Failed to start tournament: ${error.message}`);
      }
    } catch (error) {
      alert('Error starting tournament');
      console.error(error);
    }
  };

  const [isAdmin, setIsAdmin] = createSignal(
    localStorage.getItem('isAdmin') === 'true'
  );

  return (
    <div class="tournament-details-container">
      <Show when={tournament.loading || bracket.loading}>
        <div class="loading-spinner">Loading tournament details...</div>
      </Show>

      <Show when={tournament.error}>
        <div class="error-message">
          Error loading tournament: {tournament.error?.message}
        </div>
      </Show>

      <Show when={tournament() && !tournament.loading}>
        <div class="tournament-header">
          <h1>{tournament()?.name}</h1>
          <div class={`tournament-status ${tournament()?.status}`}>
            {tournament()?.status.replace('_', ' ')}
          </div>
        </div>

        <div class="tournament-info">
          <div class="info-section">
            <h2>Tournament Details</h2>
            <p class="description">{tournament()?.description || 'No description provided'}</p>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Format:</span>
                <span class="value">{tournament()?.format.replace('_', ' ')}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Status:</span>
                <span class="value">{tournament()?.status.replace('_', ' ')}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Start Date:</span>
                <span class="value">{formatDate(tournament()?.startDate)}</span>
              </div>
              
              <div class="info-item">
                <span class="label">End Date:</span>
                <span class="value">{formatDate(tournament()?.endDate)}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Participants ({tournament()?.participants.length})</h2>
            <div class="participants-list">
              <For each={tournament()?.participants}>
                {(participant) => (
                  <div class="participant">{participant.name}</div>
                )}
              </For>
            </div>
          </div>
        </div>

        <Show when={tournament()?.status === 'registration' && isAdmin()}>
          <div class="admin-section">
            <h2>Admin Actions</h2>
            <div class="admin-actions">
              <button 
                class="action-button start-tournament"
                onClick={startTournament}
              >
                Start Tournament
              </button>
            </div>
          </div>
        </Show>

        <Show when={bracket() && tournament()?.status !== 'registration'}>
          <div class="tournament-bracket">
            <h2>Tournament Bracket</h2>
            
            <div class="bracket-visualization">
              <For each={bracket()?.rounds}>
                {(round) => (
                  <div class="round">
                    <div class="round-header">Round {round.round}</div>
                    <div class="matches">
                      <For each={round.matches}>
                        {(match) => (
                          <div class={`match ${getStatusColor(match.status)}`}>
                            <div class="match-number">Match {match.matchNumber}</div>
                            <div class="match-players">
                              <div 
                                class={`player ${match.winner === match.player1?.id ? 'winner' : ''}`}
                              >
                                {match.player1?.name || 'TBD'}
                              </div>
                              <div class="vs">vs</div>
                              <div 
                                class={`player ${match.winner === match.player2?.id ? 'winner' : ''}`}
                              >
                                {match.player2?.name || 'TBD'}
                              </div>
                            </div>
                            <Show when={match.matchId}>
                              <a 
                                href={`/matches/${match.matchId}`} 
                                class="view-match"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                View Match
                              </a>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default TournamentDetails; 
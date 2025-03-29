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

// Mock data for tournament with 9 players
const mockPlayers: User[] = [
  { id: 1, name: "GrandMaster Bot" },
  { id: 2, name: "DeepChess AI" },
  { id: 3, name: "QueenGambit" },
  { id: 4, name: "KnightRider" },
  { id: 5, name: "PawnStars" },
  { id: 6, name: "RookSolver" },
  { id: 7, name: "BishopBlitz" },
  { id: 8, name: "KingDefender" },
  { id: 9, name: "CheckMate3000" }
];

// Mock tournament data
const mockTournament: Tournament = {
  id: 1,
  name: "Chess Arena Championship",
  description: "The annual Chess Arena tournament featuring the best AI chess engines competing for the championship title.",
  status: "in_progress",
  format: "single_elimination",
  maxParticipants: 16,
  startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  participants: mockPlayers,
  matches: [],
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
};

// Mock bracket data for 9 players (8 players in the first round with 1 getting a bye)
const mockBracket: TournamentBracket = {
  rounds: [
    {
      round: 1,
      matches: [
        {
          matchNumber: 1,
          player1: mockPlayers[0],
          player2: mockPlayers[1],
          winner: mockPlayers[0].id,
          status: 'white_won'
        },
        {
          matchNumber: 2,
          player1: mockPlayers[2],
          player2: mockPlayers[3],
          winner: mockPlayers[2].id,
          status: 'black_won'
        },
        {
          matchNumber: 3,
          player1: mockPlayers[4],
          player2: mockPlayers[5],
          status: 'in_progress'
        },
        {
          matchNumber: 4,
          player1: mockPlayers[6],
          player2: mockPlayers[7],
          status: 'pending'
        }
      ]
    },
    {
      round: 2,
      matches: [
        {
          matchNumber: 5,
          player1: mockPlayers[0],
          player2: mockPlayers[2],
          status: 'pending'
        },
        {
          matchNumber: 6,
          player1: undefined, // winners from match 3 and 4
          player2: mockPlayers[8], // Player 9 got a bye in first round
          status: 'pending'
        }
      ]
    },
    {
      round: 3,
      matches: [
        {
          matchNumber: 7,
          player1: undefined, // Final match
          player2: undefined,
          status: 'pending'
        }
      ]
    }
  ]
};

const TournamentDetails: Component = () => {
  const params = useParams();
  const tournamentId = params.id;
  const [socket, setSocket] = createSignal<WebSocket | null>(null);

  // Use mocked data instead of fetching
  const [tournament] = createSignal<Tournament>(mockTournament);
  const [bracket] = createSignal<TournamentBracket>(mockBracket);

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
    alert('Tournament has been started successfully');
  };

  const [isAdmin, setIsAdmin] = createSignal(true); // Set to true for demo purposes

  return (
    <div class="tournament-details-container">
      <Show when={tournament() && bracket()}>
        <div class="tournament-header">
          <h1>{tournament()?.name}</h1>
          <div class={`status-badge ${tournament()?.status.replace('_', '-')}`}>
            {tournament()?.status.replace('_', ' ')}
          </div>
        </div>

        <div class="description-section">
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

        <Show when={tournament()?.status === 'registration' && isAdmin()}>
          <div class="admin-section">
            <h2>Admin Actions</h2>
            <div class="admin-actions">
              <button 
                class="button primary"
                onClick={startTournament}
              >
                Start Tournament
              </button>
            </div>
          </div>
        </Show>

        <div class="tournament-content">
          <div class="participants-sidebar">
            <div class="info-section">
              <h2>Participants ({tournament()?.participants.length})</h2>
              <div class="participants-list-vertical">
                <For each={tournament()?.participants}>
                  {(participant) => (
                    <div class="participant">{participant.name}</div>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="tournament-main-content">
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
            
            <Show when={tournament()?.status === 'registration'}>
              <div class="tournament-status-message">
                <p>Tournament is in registration phase. The bracket will be displayed once the tournament begins.</p>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default TournamentDetails; 
import { User } from './user.model';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  status: string;
  format: string;
  maxParticipants: number;
  maxPlayers: number;
  playerCount?: number;
  startDate?: string;
  endDate?: string;
  participants: User[];
  matches?: TournamentMatch[];
  createdAt: string;
  timeControl?: string;
}

export interface TournamentMatch {
  matchId?: number;
  matchNumber: number;
  player1?: User;
  player2?: User;
  winner?: number;
  status?: string;
}

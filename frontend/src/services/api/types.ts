// Common entity types
export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: string;
  format: string;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
  participants: User[];
  matches?: any[];
  createdAt: string;
}

export interface TournamentMatch {
  matchId?: number;
  matchNumber: number;
  player1?: User;
  player2?: User;
  winner?: number;
  status?: string;
}

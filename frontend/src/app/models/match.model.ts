import { User } from './user.model';

export interface Match {
  id: number;
  player1: User;
  player2: User;
  status: string;
  winner?: User;
  tournamentId?: number;
  currentFen?: string;
  history?: string[];
  createdAt: string;
  updatedAt: string;
}

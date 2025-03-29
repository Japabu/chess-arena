import { Tournament } from 'src/tournament/tournament.model';
import { User } from 'src/user/user.model';

export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WHITE_WON = 'white_won',
  BLACK_WON = 'black_won',
  DRAW = 'draw',
  ABORTED = 'aborted',
}

export interface Match {
  status: MatchStatus;
  id: number;
  white: User;
  black: User;
  moves: string;
  fen: string;
  tournament?: Tournament;
}

export interface MatchUpdateEvent {
  matchId: number;
  status?: MatchStatus;
  move?: string;
}

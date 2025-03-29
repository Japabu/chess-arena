export enum TournamentStatus {
  REGISTRATION = 'registration',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  status: TournamentStatus;
}

import { MatchStatus } from './match.entity';

export class MatchUpdateEvent {
  constructor(
    public readonly matchId: number,
    public readonly status?: MatchStatus,
    public readonly move?: string,
  ) {}
}

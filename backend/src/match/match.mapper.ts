import { Match } from './match.model';
import { MatchEntity } from './match.entity';

export const modelToMatch = (match: MatchEntity): Match => {
  return {
    id: match.id,
    white: {
      id: match.white.id,
      username: match.white.username,
      createdAt: match.white.createdAt,
    },
    black: {
      id: match.black.id,
      username: match.black.username,
      createdAt: match.black.createdAt,
    },
    moves: match.moves,
    fen: match.fen,
    status: match.status,
  };
};

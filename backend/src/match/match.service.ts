import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { MatchEntity } from './match.entity';
import { Chess } from 'chess.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/user.service';
import { Tournament } from 'src/tournament/tournament.service';

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

export const entityToMatch = (match: MatchEntity): Match => {
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

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private matchRepository: Repository<MatchEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  findAll(): Promise<Match[]> {
    return this.matchRepository
      .find({
        relations: ['white', 'black', 'tournament'],
        order: {
          createdAt: 'DESC',
        },
      })
      .then((matches) => matches.map(entityToMatch));
  }
  async findOne(id: number): Promise<Match | null> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['white', 'black', 'tournament'],
    });
    return match ? entityToMatch(match) : null;
  }

  async create(match: {}): Promise<Match> {
    return entityToMatch(
      await this.matchRepository.save(this.matchRepository.create(match)),
    );
  }

  async delete(id: number): Promise<void> {
    await this.matchRepository.delete(id);
  }

  update(id: number, match: Partial<MatchEntity>): Promise<UpdateResult> {
    return this.matchRepository.update(id, match);
  }

  async makeMove(
    match: Match,
    user: User,
    move: string,
  ): Promise<{ success: boolean; message: string }> {
    if (![MatchStatus.PENDING, MatchStatus.IN_PROGRESS].includes(match.status))
      return { success: false, message: 'Match is already completed' };

    const whiteId = match.white.id;
    const blackId = match.black.id;
    const userId = user.id;
    const userColor =
      whiteId === userId ? 'w' : blackId === userId ? 'b' : null;
    if (!userColor)
      return { success: false, message: 'You are not a player in this match' };

    const chess = new Chess(match.fen);
    if (chess.turn() !== userColor)
      return { success: false, message: 'It is not your turn' };

    const moveResult = chess.move(move);
    if (!moveResult) return { success: false, message: 'Invalid move' };

    const updatedMoves = match.moves + ' ' + moveResult.san;

    const updatedFen = chess.fen();
    let status = match.status;

    if (status === MatchStatus.PENDING) {
      status = MatchStatus.IN_PROGRESS;
    }

    if (chess.isDraw()) {
      status = MatchStatus.DRAW;
    } else if (chess.isCheckmate()) {
      status =
        userColor === 'w' ? MatchStatus.WHITE_WON : MatchStatus.BLACK_WON;
    }

    await this.matchRepository.update(match.id, {
      fen: updatedFen,
      moves: updatedMoves,
      status,
    });

    this.emitMatchUpdate({
      matchId: match.id,
      status,
      move: moveResult.san,
    });

    // If match is completed and belongs to a tournament, notify tournament service
    if (
      match.tournament &&
      [MatchStatus.WHITE_WON, MatchStatus.BLACK_WON, MatchStatus.DRAW].includes(
        status,
      )
    ) {
      this.eventEmitter.emit('match.tournament.completed', match.id);
    }

    return { success: true, message: 'Move made successfully' };
  }

  emitMatchUpdate(match: MatchUpdateEvent) {
    this.eventEmitter.emit('match.update', match);
  }
}

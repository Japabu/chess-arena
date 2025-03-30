import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { Chess } from 'chess.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../user/user.service';

export interface MatchUpdateEvent {
  matchId: number;
  status?: MatchStatus;
  move?: string;
}

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private eventEmitter: EventEmitter2,
  ) {}

  findAll(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['white', 'black'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async findOne(id: number): Promise<Match | null> {
    return await this.matchRepository.findOne({
      where: { id },
      relations: ['white', 'black'],
    });
  }

  async create(match: { white: User; black: User }): Promise<Match> {
    return await this.matchRepository.save(
      this.matchRepository.create({
        white: match.white,
        black: match.black,
      }),
    );
  }

  async delete(match: Match): Promise<void> {
    await this.matchRepository.delete(match);
  }

  update(match: Match): Promise<UpdateResult> {
    return this.matchRepository.update(match, match);
  }

  async makeMove(
    match: Match,
    user: User,
    move: string,
  ): Promise<{ error?: string }> {
    if (![MatchStatus.PENDING, MatchStatus.IN_PROGRESS].includes(match.status))
      return { error: 'Match is already completed' };

    const whiteId = match.white.id;
    const blackId = match.black.id;
    const userId = user.id;
    const userColor =
      whiteId === userId ? 'w' : blackId === userId ? 'b' : null;
    if (!userColor) return { error: 'You are not a player in this match' };

    const chess = new Chess(match.fen);
    if (chess.turn() !== userColor) return { error: 'It is not your turn' };

    const moveResult = chess.move(move);
    if (!moveResult) return { error: 'Invalid move' };

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

    return {};
  }

  emitMatchUpdate(match: MatchUpdateEvent) {
    this.eventEmitter.emit('match.update', match);
  }
}

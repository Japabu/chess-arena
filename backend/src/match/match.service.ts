import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { User } from 'src/user/user.entity';
import { Chess } from 'chess.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchUpdateEvent } from './match-update.event';

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

  findOne(id: number): Promise<Match | null> {
    return this.matchRepository.findOne({
      where: { id },
      relations: ['white', 'black'],
    });
  }

  create(match: Partial<Match>): Promise<Match> {
    const newMatch = this.matchRepository.create(match);
    return this.matchRepository.save(newMatch);
  }

  async delete(id: number): Promise<void> {
    await this.matchRepository.delete(id);
  }

  update(id: number, match: Partial<Match>): Promise<UpdateResult> {
    return this.matchRepository.update(id, match);
  }

  async makeMove(
    match: Match,
    user: User,
    move: string,
  ): Promise<{ success: boolean; message: string }> {
    if (![MatchStatus.PENDING, MatchStatus.ABORTED].includes(match.status))
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

    return { success: true, message: 'Move made successfully' };
  }

  emitMatchUpdate(match: MatchUpdateEvent) {
    this.eventEmitter.emit('match.update', match);
  }
}

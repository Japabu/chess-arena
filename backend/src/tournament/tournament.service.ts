import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentEntity } from './tournament.entity';
import { MatchEntity } from '../match/match.entity';
import { UserEntity } from '../user/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchStatus } from 'src/match/match.service';

export interface TournamentBracket {
  rounds: {
    round: number;
    matches: {
      matchId?: number;
      matchNumber: number;
      player1?: UserEntity;
      player2?: UserEntity;
      winner?: number;
      status?: string;
    }[];
  }[];
}

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

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(TournamentEntity)
    private tournamentRepository: Repository<TournamentEntity>,
    @InjectRepository(MatchEntity)
    private matchRepository: Repository<MatchEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  findAll(): Promise<TournamentEntity[]> {
    return this.tournamentRepository.find({
      relations: ['participants'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<TournamentEntity | null> {
    return this.tournamentRepository.findOne({
      where: { id },
      relations: ['participants', 'matches', 'matches.white', 'matches.black'],
    });
  }

  async create(
    tournament: Partial<TournamentEntity>,
  ): Promise<TournamentEntity> {
    const newTournament = this.tournamentRepository.create(tournament);
    return this.tournamentRepository.save(newTournament);
  }

  async update(
    id: number,
    tournamentData: Partial<TournamentEntity>,
  ): Promise<TournamentEntity | null> {
    await this.tournamentRepository.update(id, tournamentData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.tournamentRepository.delete(id);
  }

  async registerParticipant(
    tournamentId: number,
    userId: number,
  ): Promise<TournamentEntity | null> {
    const tournament = await this.findOne(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new Error('Tournament is not open for registration');
    }

    if (
      tournament.maxParticipants > 0 &&
      tournament.participants.length >= tournament.maxParticipants
    ) {
      throw new Error('Tournament is full');
    }

    // Check if user is already registered
    if (tournament.participants.some((p) => p.id === userId)) {
      throw new Error('User is already registered for this tournament');
    }

    // Add user to participants
    await this.tournamentRepository
      .createQueryBuilder()
      .relation(TournamentEntity, 'participants')
      .of(tournamentId)
      .add(userId);

    return this.findOne(tournamentId);
  }

  async startTournament(
    tournamentId: number,
  ): Promise<TournamentEntity | null> {
    const tournament = await this.findOne(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new Error('Tournament is not in registration phase');
    }

    if (tournament.participants.length < 2) {
      throw new Error('Tournament needs at least 2 participants');
    }

    // Create the tournament bracket based on format
    let bracketData: TournamentBracket;

    bracketData = this.createSingleEliminationBracket(tournament);

    // Create initial matches
    await this.createInitialMatches(tournament, bracketData);

    // Update tournament status
    return this.update(tournamentId, {
      status: TournamentStatus.IN_PROGRESS,
      startDate: new Date(),
      bracketData: JSON.stringify(bracketData),
    });
  }

  private createSingleEliminationBracket(
    tournament: TournamentEntity,
  ): TournamentBracket {
    const participants = [...tournament.participants];

    // Shuffle participants using type-safe approach
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Using non-null assertion since we know these indices exist
      [participants[i]!, participants[j]!] = [
        participants[j]!,
        participants[i]!,
      ];
    }

    // Calculate number of rounds needed
    const participantCount = participants.length;
    const rounds = Math.ceil(Math.log2(participantCount));

    // Initialize bracket
    const bracket: TournamentBracket = {
      rounds: Array.from({ length: rounds }, (_, roundIndex) => ({
        round: roundIndex + 1,
        matches: [],
      })),
    };

    // Calculate number of matches in the first round
    const firstRoundMatches = Math.pow(2, rounds - 1);

    // Create first round matches
    let participantIndex = 0;
    for (let i = 0; i < firstRoundMatches; i++) {
      const match = {
        matchNumber: i + 1,
        player1:
          participantIndex < participantCount
            ? participants[participantIndex++]
            : undefined,
        player2:
          participantIndex < participantCount
            ? participants[participantIndex++]
            : undefined,
      };

      bracket.rounds[0]?.matches.push(match);
    }

    // Create subsequent rounds with empty matches
    for (let round = 1; round < rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round - 1);
      for (let match = 0; match < matchesInRound; match++) {
        bracket.rounds[round]?.matches.push({
          matchNumber: match + 1,
        });
      }
    }

    return bracket;
  }

  private async createInitialMatches(
    tournament: TournamentEntity,
    bracket: TournamentBracket,
  ): Promise<void> {
    // Only create matches for first round
    const firstRound = bracket.rounds[0];
    if (!firstRound) return;

    for (const match of firstRound.matches) {
      // Only create matches with both players assigned
      if (match.player1 && match.player2) {
        const createdMatch = await this.matchRepository.save({
          white: match.player1,
          black: match.player2,
          tournament: tournament,
          tournamentRound: 1,
          tournamentMatchNumber: match.matchNumber,
          status: MatchStatus.PENDING,
        });

        match.matchId = createdMatch.id;
      }
    }

    // Update the bracket data
    tournament.bracketData = JSON.stringify(bracket);
    await this.tournamentRepository.save(tournament);
  }

  async processMatchResult(matchId: number): Promise<void> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['tournament', 'white', 'black'],
    });

    if (
      !match?.tournament ||
      match.tournamentRound === undefined ||
      match.tournamentMatchNumber === undefined
    )
      return;

    const tournament = await this.findOne(match.tournament.id);
    if (!tournament?.bracketData) return;

    const bracket: TournamentBracket = JSON.parse(tournament.bracketData);

    // Find the match in the bracket
    const round = bracket.rounds.find((r) => r.round === match.tournamentRound);
    if (!round) return;

    const bracketMatch = round.matches.find(
      (m) => m.matchNumber === match.tournamentMatchNumber,
    );
    if (!bracketMatch) return;

    // Update match status in bracket
    bracketMatch.status = match.status;

    // If match is finished, advance winner to next round
    if (
      match.status === MatchStatus.WHITE_WON ||
      match.status === MatchStatus.BLACK_WON
    ) {
      const winner =
        match.status === MatchStatus.WHITE_WON ? match.white : match.black;
      bracketMatch.winner = winner.id;

      // If not the final round, create or update next match
      if (match.tournamentRound < bracket.rounds.length) {
        const nextRound = match.tournamentRound + 1;
        const nextMatchNumber = Math.ceil(match.tournamentMatchNumber / 2);

        const nextRoundData = bracket.rounds.find((r) => r.round === nextRound);
        if (!nextRoundData) return;

        const nextMatch = nextRoundData.matches.find(
          (m) => m.matchNumber === nextMatchNumber,
        );
        if (!nextMatch) return;

        // Determine if winner goes to player1 or player2 slot
        if (match.tournamentMatchNumber % 2 === 1) {
          nextMatch.player1 = winner;
        } else {
          nextMatch.player2 = winner;
        }

        // If both players are assigned, create the match
        if (nextMatch.player1 && nextMatch.player2) {
          // Check if match already exists
          let nextMatchEntity = await this.matchRepository.findOne({
            where: {
              tournament: { id: tournament.id },
              tournamentRound: nextRound,
              tournamentMatchNumber: nextMatchNumber,
            },
          });

          if (!nextMatchEntity) {
            nextMatchEntity = await this.matchRepository.save({
              white: nextMatch.player1,
              black: nextMatch.player2,
              tournament: { id: tournament.id },
              tournamentRound: nextRound,
              tournamentMatchNumber: nextMatchNumber,
              status: MatchStatus.PENDING,
            });

            nextMatch.matchId = nextMatchEntity.id;
          }
        }
      } else {
        // Final match is complete, tournament is finished
        await this.update(tournament.id, {
          status: TournamentStatus.COMPLETED,
          endDate: new Date(),
        });
      }
    }

    // Update bracket data
    await this.update(tournament.id, {
      bracketData: JSON.stringify(bracket),
    });

    // Emit tournament update event
    this.eventEmitter.emit('tournament.update', {
      tournamentId: tournament.id,
      matchId: match.id,
    });
  }

  async getTournamentBracket(
    tournamentId: number,
  ): Promise<TournamentBracket | null> {
    const tournament = await this.findOne(tournamentId);
    if (!tournament || !tournament.bracketData) return null;

    return JSON.parse(tournament.bracketData);
  }

  @OnEvent('match.tournament.completed')
  async handleMatchCompleted(matchId: number) {
    await this.processMatchResult(matchId);
  }
}

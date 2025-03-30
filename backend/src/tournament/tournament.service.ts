import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentEntity } from './tournament.entity';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(TournamentEntity)
    private tournamentRepository: Repository<TournamentEntity>,
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
}

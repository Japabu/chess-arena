import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { TournamentEntity } from '../tournament/tournament.entity';
import { MatchStatus } from './match.model';

const INITIAL_FEN_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

@Entity()
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity)
  white!: UserEntity;

  @ManyToOne(() => UserEntity)
  black!: UserEntity;

  @Column('text', { default: '' })
  moves: string = '';

  @Column('text', {
    default: INITIAL_FEN_POSITION,
  })
  fen = INITIAL_FEN_POSITION;

  @Column({
    type: 'varchar',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus = MatchStatus.PENDING;

  @ManyToOne(() => TournamentEntity, (tournament) => tournament.matches, {
    nullable: true,
  })
  tournament?: TournamentEntity;

  @Column('integer', { nullable: true })
  tournamentRound?: number;

  @Column('integer', { nullable: true })
  tournamentMatchNumber?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

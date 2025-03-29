import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Tournament } from '../tournament/tournament.entity';

const INITIAL_FEN_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WHITE_WON = 'white_won',
  BLACK_WON = 'black_won',
  DRAW = 'draw',
  ABORTED = 'aborted',
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  white!: User;

  @ManyToOne(() => User)
  black!: User;

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

  @ManyToOne(() => Tournament, (tournament) => tournament.matches, {
    nullable: true,
  })
  tournament?: Tournament;

  @Column('integer', { nullable: true })
  tournamentRound?: number;

  @Column('integer', { nullable: true })
  tournamentMatchNumber?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

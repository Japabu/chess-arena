import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Match } from '../match/match.entity';

export enum TournamentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity()
export class TournamentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  name!: string;

  @Column({
    type: 'varchar',
    enum: TournamentStatus,
    default: TournamentStatus.OPEN,
  })
  status: TournamentStatus = TournamentStatus.OPEN;

  @Column('timestamp', { nullable: true })
  startDate?: Date;

  @Column('timestamp', { nullable: true })
  endDate?: Date;

  @Column('integer', { array: true })
  userIds!: number[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
export class TournamentMatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => TournamentEntity)
  tournament!: TournamentEntity;

  @OneToOne(() => Match)
  match!: Match;

  @Column('integer')
  round!: number;
}

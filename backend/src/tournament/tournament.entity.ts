import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Match } from '../match/match.entity';

export enum TournamentStatus {
  REGISTRATION = 'registration',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    enum: TournamentStatus,
    default: TournamentStatus.REGISTRATION,
  })
  status: TournamentStatus = TournamentStatus.REGISTRATION;

  @Column({
    type: 'varchar',
    enum: TournamentFormat,
    default: TournamentFormat.SINGLE_ELIMINATION,
  })
  format: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION;

  @Column('integer', { default: 0 })
  maxParticipants: number = 0;

  @Column('boolean', { default: false })
  isPublic: boolean = false;

  @Column('datetime', { nullable: true })
  registrationDeadline?: Date;

  @Column('datetime', { nullable: true })
  startDate?: Date;

  @Column('datetime', { nullable: true })
  endDate?: Date;

  @ManyToMany(() => User)
  @JoinTable()
  participants!: User[];

  @OneToMany(() => Match, (match) => match.tournament)
  matches!: Match[];

  @Column('text', { nullable: true })
  bracketData?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

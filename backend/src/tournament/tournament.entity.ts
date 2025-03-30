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
import { UserEntity } from '../user/user.entity';
import { MatchEntity } from '../match/match.entity';
import { TournamentStatus } from './tournament.service';
@Entity()
export class TournamentEntity {
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

  @Column('integer', { default: 0 })
  maxParticipants: number = 0;

  @Column('boolean', { default: false })
  isPublic: boolean = false;

  @Column('timestamp', { nullable: true })
  registrationDeadline?: Date;

  @Column('timestamp', { nullable: true })
  startDate?: Date;

  @Column('timestamp', { nullable: true })
  endDate?: Date;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  participants!: UserEntity[];

  @OneToMany(() => MatchEntity, (match) => match.tournament)
  matches!: MatchEntity[];

  @Column('text', { nullable: true })
  bracketData?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentEntity } from './tournament.entity';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { Match } from '../match/match.entity';
import { MatchModule } from '../match/match.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TournamentEntity, Match]),
    MatchModule,
    UserModule,
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {}

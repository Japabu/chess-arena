import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchService } from './match.service';
import {
  MatchesController,
  AdminMatchesController,
} from './matches.controller';
import { UserModule } from '../users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), UserModule],
  controllers: [MatchesController, AdminMatchesController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

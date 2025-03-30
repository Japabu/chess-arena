import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { UserModule } from '../user/user.module';
@Module({
  imports: [TypeOrmModule.forFeature([Match]), UserModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}

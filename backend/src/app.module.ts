import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { WebSocketModule } from './websocket/websocket.module';
import { MatchModule } from './match/match.module';
import { UserModule } from './user/user.module';
import { TournamentModule } from './tournament/tournament.module';
import { Match } from './match/match.entity';
import { User } from './user/user.entity';
import { Tournament } from './tournament/tournament.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'sqlite'>('DB_TYPE', 'sqlite'),
        database: configService.get<string>('DB_NAME', 'chess_arena.sqlite'),
        entities: [Match, User, Tournament],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    ScheduleModule.forRoot(),
    WebSocketModule,
    MatchModule,
    UserModule,
    TournamentModule,
  ],
})
export class AppModule {}

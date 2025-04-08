import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebSocketModule } from './websocket/websocket.module';
import { MatchModule } from './matches/match.module';
import { UserModule } from './users/user.module';
import { TournamentModule } from './tournament/tournament.module';
import { Match as Match } from './matches/match.entity';
import { User } from './users/user.entity';
import { TournamentEntity as TournamentEntity } from './tournament/tournament.entity';

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
        type: 'postgres',
        url: configService.getOrThrow<string>('POSTGRES_URL'),
        entities: [Match, User, TournamentEntity],
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api{*splat}'],
      serveStaticOptions: {
        fallthrough: true,
      },
    }),
    ScheduleModule.forRoot(),
    WebSocketModule,
    MatchModule,
    UserModule,
    TournamentModule,
  ],
})
export class AppModule {}

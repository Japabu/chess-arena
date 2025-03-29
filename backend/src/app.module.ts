import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { WebSocketModule } from './websocket/websocket.module';
import { MatchModule } from './match/match.module';
import { UserModule } from './user/user.module';
import { TournamentModule } from './tournament/tournament.module';
import { MatchEntity as MatchEntity } from './match/match.entity';
import { UserEntity } from './user/user.entity';
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
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [MatchEntity, UserEntity, TournamentEntity],
        synchronize: configService.getOrThrow('NODE_ENV') !== 'production',
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

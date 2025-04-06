import { Module } from '@nestjs/common';
import { GameWebSocketGateway } from './websocket.gateway';
import { UserModule } from '../users/user.module';
import { MatchModule } from '../matches/match.module';

@Module({
  imports: [MatchModule, UserModule],
  providers: [GameWebSocketGateway],
  exports: [GameWebSocketGateway],
})
export class WebSocketModule {}

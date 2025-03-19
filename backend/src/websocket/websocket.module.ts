import { Module } from '@nestjs/common';
import { GameWebSocketGateway } from './websocket.gateway';
import { UserModule } from '../user/user.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [MatchModule, UserModule],
  providers: [GameWebSocketGateway],
  exports: [GameWebSocketGateway],
})
export class WebSocketModule {}

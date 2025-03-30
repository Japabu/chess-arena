import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway as NestWebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchUpdateEvent } from '../match/match.model';
import { MatchService } from '../match/match.service';
import { JwtPayload, UserService } from '../user/user.service';

interface MoveRequest {
  matchId: number;
  move: string;
}

interface MoveResponse {
  success: boolean;
  message: string;
}

interface JoinMatchResponse {
  success: boolean;
  message: string;
  fen?: string;
  status?: string;
  white?: { id: number; name: string };
  black?: { id: number; name: string };
}

interface ClientData {
  jwtPayload?: JwtPayload;
}

@NestWebSocketGateway({
  cors: {
    origin: true,
  },
  path: '/socket.io',
})
@Injectable()
export class GameWebSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('GameWebSocketGateway');

  // Utility method to get consistent room name for a match
  private getMatchRoomName(matchId: number): string {
    return `match:${matchId}`;
  }

  private getClientData(client: Socket): ClientData {
    return (client.data ?? {}) as ClientData;
  }

  private setClientData(client: Socket, data: ClientData) {
    client.data = data;
  }

  constructor(
    private configService: ConfigService,
    private matchService: MatchService,
    private userService: UserService,
  ) {
    this.logger.log(
      `WebSocket enabled with CORS for: ${this.configService.getOrThrow<string>('FRONTEND_URL')}`,
    );
    this.logger.log('WebSocket path set to: /socket.io');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const token = client.handshake.auth?.['token'];
    if (token) {
      this.setClientData(client, {
        jwtPayload: await this.userService.verifyToken(token),
      });
    }
  }

  @SubscribeMessage('join')
  async handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: number,
  ): Promise<JoinMatchResponse> {
    try {
      this.logger.log(`${client.id} joining match ${matchId}`);

      // Join the match room
      client.join(this.getMatchRoomName(matchId));

      const match = await this.matchService.findOne(matchId);

      if (!match) {
        return {
          success: false,
          message: `Match ${matchId} not found`,
        };
      }

      return {
        success: true,
        message: `Now spectating match ${matchId}`,
        fen: match.fen,
        status: match.status,
        white: match.white
          ? { id: match.white.id, name: match.white.username }
          : undefined,
        black: match.black
          ? { id: match.black.id, name: match.black.username }
          : undefined,
      };
    } catch (error: any) {
      this.logger.error(
        `Error when spectator tried to join match ${matchId}:`,
        error,
      );
      return {
        success: false,
        message: `Error joining match: ${error.message ?? 'Unknown error'}`,
      };
    }
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: number,
  ) {
    this.logger.log(`Client ${client.id} leaving match ${matchId}`);
    client.leave(this.getMatchRoomName(matchId));
  }

  @SubscribeMessage('move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MoveRequest,
  ): Promise<MoveResponse> {
    const { jwtPayload } = this.getClientData(client);
    if (!jwtPayload) return { success: false, message: 'Unauthorized' };

    const user = await this.userService.findOne(jwtPayload.id);
    if (!user) throw new Error('User not found');

    const match = await this.matchService.findOne(data.matchId);
    if (!match) return { success: false, message: 'Match not found' };

    const makeMoveResult = await this.matchService.makeMove(
      match,
      user,
      data.move,
    );

    return {
      success: makeMoveResult.success,
      message: makeMoveResult.message ?? 'Unknown error',
    };
  }

  @OnEvent('match.update')
  handleMatchUpdate(event: MatchUpdateEvent) {
    this.server.to(this.getMatchRoomName(event.matchId)).emit('update', {
      matchId: event.matchId,
      status: event.status,
      move: event.move,
    });
  }

  @OnEvent('tournament.update')
  handleTournamentUpdate(event: { tournamentId: number; matchId: number }) {
    this.server
      .to(this.getTournamentRoomName(event.tournamentId))
      .emit('tournament.update', {
        tournamentId: event.tournamentId,
        matchId: event.matchId,
      });
  }

  private getTournamentRoomName(tournamentId: number): string {
    return `tournament:${tournamentId}`;
  }
}

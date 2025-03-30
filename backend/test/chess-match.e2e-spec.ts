import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { io } from 'socket.io-client';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Match } from '../src/match/match.entity';
import { Repository } from 'typeorm';
import { User } from '../src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Chess Match with Players (e2e)', () => {
  let app: INestApplication;
  let matchesRepository: Repository<Match>;
  let user1Id: number;
  let user2Id: number;
  let user1Password: string;
  let user2Password: string;
  let user1Token: string;
  let user2Token: string;
  let adminToken: string;
  let matchId: number;
  let user1Socket: any;
  let user2Socket: any;
  let wsBaseUrl: string;

  beforeAll(async () => {
    // Set up NestJS application with a separate test database
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get repositories and config service
    matchesRepository = moduleFixture.get<Repository<Match>>(
      getRepositoryToken(Match),
    );

    // Start listening on a dynamic port
    await app.listen(0);
    const httpServer = app.getHttpServer();
    const serverAddress = httpServer.address();
    const port = serverAddress.port;

    wsBaseUrl = `ws://localhost:${port}`;
  });

  afterAll(async () => {
    // Cleanup sockets and close app
    if (user1Socket) user1Socket.disconnect();
    if (user2Socket) user2Socket.disconnect();
    await app.close();
  });

  describe('Chess match play', () => {
    it('should register users, create match, connect users, make moves and verify FEN', async () => {
      // 1. Register two users
      const registerUser1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'TestUser1',
          password: 'password1',
        })
        .expect(201);

      user1Id = registerUser1Response.body.id;
      user1Password = 'password1';
      expect(user1Id).toBeDefined();

      const registerUser2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'TestUser2',
          password: 'password2',
        })
        .expect(201);

      user2Id = registerUser2Response.body.id;
      user2Password = 'password2';
      expect(user2Id).toBeDefined();

      // Login both users to get tokens
      const loginUser1Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestUser1',
          password: user1Password,
        })
        .expect(200);

      user1Token = loginUser1Response.body.access_token;
      expect(user1Token).toBeDefined();
      console.log('User1 token:', user1Token);

      const loginUser2Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestUser2',
          password: user2Password,
        })
        .expect(200);

      user2Token = loginUser2Response.body.access_token;
      expect(user2Token).toBeDefined();
      console.log('User2 token:', user2Token);

      // Login as admin
      const loginAdminResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'chessmaster',
        })
        .expect(200);

      adminToken = loginAdminResponse.body.access_token;
      expect(adminToken).toBeDefined();

      // 2. Create a match between the users as admin
      const createMatchResponse = await request(app.getHttpServer())
        .post('/match')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          white: { id: user1Id },
          black: { id: user2Id },
        })
        .expect(201);

      matchId = createMatchResponse.body.id;
      expect(matchId).toBeDefined();

      // Verify the match has white and black user relations
      const match = await matchesRepository.findOne({
        where: { id: matchId },
        relations: ['white', 'black'],
      });

      expect(match).toBeDefined();
      if (!match) {
        throw new Error('Match not found in database');
      }
      expect(match.white).toBeDefined();
      expect(match.black).toBeDefined();

      // 3. Connect users and play a match
      return new Promise<void>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        // Helper functions for socket operations
        const createSocketConnection = (socketName: string, token: string) => {
          console.log(
            `Creating socket connection for ${socketName} with token:`,
            token.substring(0, 20) + '...',
          );

          const socket = io(wsBaseUrl, {
            auth: {
              token: token,
            },
          });

          // Add event listeners for debugging
          socket.on('connect', () => {
            console.log(`${socketName} socket connected with ID:`, socket.id);
          });

          socket.on('connect_error', (err) => {
            console.error(`${socketName} socket connect error:`, err);
          });

          socket.on('error', (err) => {
            console.error(`${socketName} socket error:`, err);
          });

          socket.connect();
          return socket;
        };

        const joinMatch = (
          socket: any,
          matchId: number,
          socketName: string,
        ) => {
          return new Promise<void>((resolveJoin, rejectJoin) => {
            console.log(`${socketName} attempting to join match ${matchId}`);
            socket.emit('join', matchId, (data: any) => {
              console.log(`${socketName} join response:`, data);
              if (data && data.success) {
                resolveJoin();
              } else {
                rejectJoin(
                  new Error(
                    `Failed to join match: ${data ? data.message : 'Unknown error'}`,
                  ),
                );
              }
            });
          });
        };

        const makeMove = (
          socket: any,
          matchId: number,
          move: string,
          socketName: string,
        ) => {
          return new Promise<void>((resolveMove, rejectMove) => {
            console.log(
              `${socketName} attempting move ${move} in match ${matchId}`,
            );
            socket.emit('move', { matchId, move }, (moveResult: any) => {
              console.log(`${socketName} move response:`, moveResult);
              if (moveResult && moveResult.success) {
                resolveMove();
              } else {
                rejectMove(
                  new Error(
                    `Failed to make move: ${moveResult ? moveResult.message : 'Unknown error'}`,
                  ),
                );
              }
            });
          });
        };

        // Create and set up user1 socket (white)
        user1Socket = createSocketConnection('user1', user1Token);

        // Set timeout for the entire test
        timeoutId = setTimeout(() => {
          reject(new Error('Test timed out'));
        }, 25000);

        // Wait for both sockets to connect before proceeding
        setTimeout(async () => {
          try {
            // Create and set up user2 socket (black)
            user2Socket = createSocketConnection('user2', user2Token);

            // Wait for sockets to be fully connected
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Join match with user1
            await joinMatch(user1Socket, matchId, 'user1');

            // Join match with user2
            await joinMatch(user2Socket, matchId, 'user2');

            // Make moves
            await makeMove(user1Socket, matchId, 'e4', 'user1');
            await makeMove(user2Socket, matchId, 'e5', 'user2');
            await makeMove(user1Socket, matchId, 'Nf3', 'user1');
            await makeMove(user2Socket, matchId, 'Nc6', 'user2');

            // Wait a bit for database updates
            await new Promise((resolveWait) => setTimeout(resolveWait, 500));

            // Check the final FEN from the database
            const updatedMatch = await matchesRepository.findOne({
              where: { id: matchId },
              relations: ['white', 'black'],
            });

            expect(updatedMatch).toBeDefined();
            if (!updatedMatch) {
              throw new Error('Match not found in database');
            }

            // Expected FEN after e4 e5 Nf3 Nc6
            const expectedFen =
              'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
            expect(updatedMatch.fen).toEqual(expectedFen);

            // Clean up resources
            user1Socket.disconnect();
            user2Socket.disconnect();
            clearTimeout(timeoutId);
            resolve();
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        }, 1000);
      });
    }, 30000); // Increased timeout to ensure test has enough time to complete
  });
});

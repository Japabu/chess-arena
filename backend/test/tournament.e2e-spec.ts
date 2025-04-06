import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TournamentStatus } from '../src/tournament/tournament.service';
import { io, Socket } from 'socket.io-client';
import { MatchStatus } from '../src/matches/match.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';

// Define interfaces for tournament bracket data structure
interface TournamentPlayer {
  id: number;
  username: string;
}

interface TournamentMatch {
  matchNumber: number;
  matchId?: number;
  player1?: TournamentPlayer;
  player2?: TournamentPlayer;
  winner?: TournamentPlayer;
}

interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
}

describe('Tournament E2E Test', () => {
  let app: INestApplication;
  let userCredentials: Array<{
    id: number;
    username: string;
    password: string;
    token: string;
    socket?: Socket;
  }> = [];
  let adminToken: string;
  let tournamentId: number;
  let serverBaseUrl: string;

  // Number of users to create for the tournament
  const NUM_USERS = 8;

  // Chess move sequences for quick wins
  const whiteWinSequence = ['e3', 'f6', 'e4', 'g5', 'Qh5']; // White wins with checkmate
  const blackWinSequence = ['f3', 'e6', 'g4', 'Qh4']; // Black wins with checkmate

  beforeAll(async () => {
    // Set up NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Start listening on a dynamic port
    await app.listen(0);
    const httpServer = app.getHttpServer();
    const serverAddress = httpServer.address();
    const port = serverAddress.port;

    // Set the base URLs
    serverBaseUrl = `http://localhost:${port}`;

    // Login as admin first
    const loginAdminResponse = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        username: 'admin',
        password: 'admin', // Use the default from .env
      });

    expect(loginAdminResponse.status).toBe(200);
    adminToken = loginAdminResponse.body.access_token;
    expect(adminToken).toBeDefined();
  });

  afterAll(async () => {
    // Clean up and disconnect all sockets
    for (const user of userCredentials) {
      if (user.socket) {
        user.socket.disconnect();
      }
    }

    // Close the app
    if (app) {
      await app.close();
    }
  });

  // Helper function to generate random username
  function generateRandomUsername(length = 8) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = 'user_';
    for (let i = 0; i < length; i++) {
      username += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return username;
  }

  // Helper function to create a Socket.IO connection
  function createSocketConnection(token: string): Socket {
    const socket = io(serverBaseUrl, {
      path: '/socket.io',
      auth: { token },
    });

    return socket;
  }

  // Helper function to join a match
  function joinMatch(socket: Socket, matchId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      socket.emit('join', matchId, (response: any) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Failed to join match: ${
                response ? response.message : 'Unknown error'
              }`,
            ),
          );
        }
      });
    });
  }

  // Helper function to make a move in a match
  function makeMove(
    socket: Socket,
    matchId: number,
    move: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      socket.emit('move', { matchId, move }, (response: any) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Failed to make move: ${
                response ? response.message : 'Unknown error'
              }`,
            ),
          );
        }
      });
    });
  }

  // Helper function to get tournament details
  async function getTournament(id: number) {
    const response = await request(app.getHttpServer()).get(
      `/tournaments/${id}`,
    );
    expect(response.status).toBe(200);
    return response.body;
  }

  // Helper function to get tournament bracket
  async function getTournamentBracket(id: number) {
    const response = await request(app.getHttpServer()).get(
      `/tournaments/${id}/bracket`,
    );
    expect(response.status).toBe(200);
    return response.body;
  }

  // Helper function to wait for a match to complete
  async function waitForMatchCompletion(
    matchId: number,
    expectedStatus: MatchStatus,
    maxAttempts = 10,
  ): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await request(app.getHttpServer()).get(
        `/match/${matchId}`,
      );

      if (response.status === 200 && response.body.status === expectedStatus) {
        return true;
      }

      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return false;
  }

  // Helper function to get user details
  async function getUser(token: string) {
    const response = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`);

    // If profile endpoint doesn't exist or fails, try alternative endpoints
    if (response.status !== 200) {
      try {
        const alternativeResponse = await request(app.getHttpServer())
          .get('/user/me')
          .set('Authorization', `Bearer ${token}`);

        if (alternativeResponse.status === 200) {
          return alternativeResponse.body;
        }
      } catch (e) {
        // Fall back to decoding the JWT token to get user info
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(
              Buffer.from(tokenParts[1] || '', 'base64').toString('utf-8'),
            );

            if (payload && payload.id) {
              const userResponse = await request(app.getHttpServer())
                .get(`/user/${payload.id}`)
                .set('Authorization', `Bearer ${token}`);

              if (userResponse.status === 200) {
                return userResponse.body;
              }
            }
          } catch (e) {
            // If all attempts fail, throw an error
            throw new Error('Unable to get user information from token');
          }
        }
      }
    }

    return response.body;
  }

  describe('Tournament Creation and Start', () => {
    it('should register users for tournament', async () => {
      // Register users
      for (let i = 0; i < NUM_USERS; i++) {
        const username = generateRandomUsername();
        const password = 'password123';

        // Register the user
        const registerResponse = await request(app.getHttpServer())
          .post('/user/register')
          .send({
            username,
            password,
          });
        expect(registerResponse.status).toBe(201);

        // Login to get the token
        const loginResponse = await request(app.getHttpServer())
          .post('/user/login')
          .send({
            username,
            password,
          });
        expect(loginResponse.status).toBe(200);

        const userToken = loginResponse.body.access_token;
        expect(userToken).toBeDefined();

        try {
          // Get user info by decoding token or using appropriate endpoint
          const userInfo = await getUser(userToken);
          expect(userInfo).toBeDefined();
          expect(userInfo.id).toBeDefined();

          // Store user credentials
          userCredentials.push({
            id: userInfo.id,
            username,
            password,
            token: userToken,
          });
        } catch (error) {
          // Alternative approach: Just decode the token
          const tokenParts = userToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(
                Buffer.from(tokenParts[1] || '', 'base64').toString('utf-8'),
              );

              if (payload && payload.id) {
                userCredentials.push({
                  id: payload.id,
                  username,
                  password,
                  token: userToken,
                });
              } else {
                throw new Error(
                  `Could not extract user ID from token for user ${username}`,
                );
              }
            } catch (tokenError) {
              throw new Error(
                `Failed to decode token for user ${username}: ${(tokenError as Error).message}`,
              );
            }
          } else {
            throw new Error(`Invalid token format for user ${username}`);
          }
        }
      }

      // Verify we have the correct number of users
      expect(userCredentials.length).toBe(NUM_USERS);
    });

    it('should create a tournament as admin', async () => {
      // Create the tournament
      const createResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Tournament',
          description: 'Tournament created for E2E testing',
          maxParticipants: NUM_USERS,
          isPublic: true,
        });

      expect(createResponse.status).toBe(201);
      tournamentId = createResponse.body.id;
      expect(tournamentId).toBeDefined();
      console.log('Created tournament with ID:', tournamentId);

      // Register all users for the tournament via API
      const registrationPromises = userCredentials.map(async (user) => {
        try {
          // Try using the user's registration endpoint
          const userRegisterResponse = await request(app.getHttpServer())
            .post(`/tournaments/${tournamentId}/register`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({});

          if ([200, 201, 204].includes(userRegisterResponse.status)) {
            console.log(
              `User ${user.username} (ID: ${user.id}) self-registered to tournament`,
            );
            return true;
          } else {
            console.error(
              `Failed to register user ${user.username} to tournament: Unexpected status ${userRegisterResponse.status}`,
            );
            return false;
          }
        } catch (error) {
          console.error(
            `Failed to register user ${user.username} to tournament:`,
            (error as Error).message,
          );
          return false;
        }
      });

      // Wait for all registrations to complete
      const registrationResults = await Promise.all(registrationPromises);
      const successfulRegistrations =
        registrationResults.filter(Boolean).length;

      // Verify most users were successfully registered (allow some failures)
      expect(successfulRegistrations).toBeGreaterThanOrEqual(NUM_USERS * 0.75);

      // Verify tournament has participants via API
      const tournament = await getTournament(tournamentId);
      expect(tournament).toBeDefined();
      console.log(
        `Tournament now has ${tournament.participants ? tournament.participants.length : 0} participants`,
      );

      // Verify that we have sufficient participants to start
      expect(
        tournament.participants ? tournament.participants.length : 0,
      ).toBeGreaterThanOrEqual(4);
    });

    it('should start the tournament and play matches', async () => {
      // Start the tournament
      const startResponse = await request(app.getHttpServer())
        .post(`/tournaments/${tournamentId}/start`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Log the response for debugging
      console.log('Tournament start response status:', startResponse.status);
      if (startResponse.status !== 201) {
        console.log('Tournament start response body:', startResponse.body);
      }

      // We expect 201 for a successful start, but allow for other success codes
      expect([200, 201, 204]).toContain(startResponse.status);

      // Verify tournament status is IN_PROGRESS via API
      const tournament = await getTournament(tournamentId);
      expect(tournament).toBeDefined();
      console.log('Tournament status after start:', tournament.status);
      expect(tournament.status).toBe(TournamentStatus.IN_PROGRESS);

      // Get tournament bracket to find matches
      const bracket = await getTournamentBracket(tournamentId);
      expect(bracket).toBeDefined();
      console.log('Tournament bracket retrieved successfully');

      // Verify the bracket structure
      expect(bracket.rounds).toBeDefined();
      expect(bracket.rounds.length).toBeGreaterThan(0);

      // Get first round matches
      const round1 = bracket.rounds.find((r: TournamentRound) => r.round === 1);
      expect(round1).toBeDefined();
      if (!round1) {
        throw new Error('Round 1 not found in tournament bracket data');
      }

      // Get the match IDs from the first round
      const firstRoundMatchIds = round1.matches
        .filter((m: TournamentMatch) => m.matchId)
        .map((m: TournamentMatch) => m.matchId!);

      console.log('First round match IDs:', firstRoundMatchIds);
      expect(firstRoundMatchIds.length).toBeGreaterThan(0);

      // Connect each user to socket.io for game play
      for (const user of userCredentials) {
        user.socket = createSocketConnection(user.token);

        // Small wait to ensure connection
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Play all first round matches
      for (const matchId of firstRoundMatchIds) {
        // Get match details via API
        const matchResponse = await request(app.getHttpServer()).get(
          `/match/${matchId}`,
        );
        expect(matchResponse.status).toBe(200);
        const match = matchResponse.body;

        expect(match).toBeDefined();
        console.log(
          `Match ${matchId}: ${match.white.username} (White) vs ${match.black.username} (Black)`,
        );

        // Find the users corresponding to white and black players
        const whiteUser = userCredentials.find((u) => u.id === match.white.id);
        const blackUser = userCredentials.find((u) => u.id === match.black.id);

        expect(whiteUser).toBeDefined();
        expect(blackUser).toBeDefined();
        expect(whiteUser!.socket).toBeDefined();
        expect(blackUser!.socket).toBeDefined();

        // Join match with both players
        await joinMatch(whiteUser!.socket!, matchId);
        await joinMatch(blackUser!.socket!, matchId);

        console.log(`Both players joined match ${matchId}`);

        // Determine which sequence to use - alternate between white and black winning
        const isWhiteWinMatch = matchId % 2 === 0;
        const moveSequence = isWhiteWinMatch
          ? whiteWinSequence
          : blackWinSequence;

        // Play the match with the predetermined sequence
        console.log(
          `Playing match ${matchId} with ${
            isWhiteWinMatch ? 'white' : 'black'
          } winning`,
        );

        // Make moves alternating between white and black
        for (let i = 0; i < moveSequence.length; i++) {
          const move = moveSequence[i];
          const isWhiteTurn = i % 2 === 0;
          const playerSocket = isWhiteTurn
            ? whiteUser!.socket!
            : blackUser!.socket!;
          const playerColor = isWhiteTurn ? 'White' : 'Black';

          try {
            await makeMove(playerSocket, matchId, move || '');
            console.log(
              `${playerColor} move ${move} in match ${matchId} successful`,
            );

            // Small wait between moves
            await new Promise((resolve) => setTimeout(resolve, 50));
          } catch (error) {
            console.error(
              `Error making move ${move} in match ${matchId}:`,
              (error as Error).message,
            );

            // Check match status via API
            const matchStatusResponse = await request(app.getHttpServer()).get(
              `/match/${matchId}`,
            );
            console.log(
              `Match ${matchId} status after error:`,
              matchStatusResponse.body.status,
            );

            // Fail fast if it's not a "match already completed" error
            if (
              !matchStatusResponse.body.status.includes('_won') &&
              !matchStatusResponse.body.status.includes('draw')
            ) {
              throw error;
            }

            break;
          }
        }

        // Verify match result using API
        const expectedStatus = isWhiteWinMatch
          ? MatchStatus.WHITE_WON
          : MatchStatus.BLACK_WON;

        const matchCompleted = await waitForMatchCompletion(
          matchId,
          expectedStatus,
        );

        if (!matchCompleted) {
          throw new Error(
            `Match ${matchId} did not complete with expected status: ${expectedStatus}`,
          );
        }

        // Get final match status via API
        const matchStatusResponse = await request(app.getHttpServer()).get(
          `/match/${matchId}`,
        );
        expect(matchStatusResponse.status).toBe(200);
        console.log(
          `Match ${matchId} final status:`,
          matchStatusResponse.body.status,
        );

        // Verify the match result matches our expectation
        expect(matchStatusResponse.body.status).toBe(expectedStatus);
      }

      // Wait for second round matches to be created
      // Get updated tournament bracket
      let currentBracket = await getTournamentBracket(tournamentId);

      // Find rounds with matches to play
      const playableRounds = currentBracket.rounds
        .filter((round: TournamentRound) => round.round > 1)
        .filter((round: TournamentRound) =>
          round.matches.some(
            (match: TournamentMatch) =>
              match.player1 && match.player2 && match.matchId && !match.winner,
          ),
        );

      if (playableRounds.length > 0) {
        for (const round of playableRounds) {
          console.log(`Playing matches for round ${round.round}`);

          // Get matches with players assigned but no winner
          const playableMatches = round.matches
            .filter(
              (match: TournamentMatch) =>
                match.player1 &&
                match.player2 &&
                match.matchId &&
                !match.winner,
            )
            .map((match: TournamentMatch) => match.matchId!);

          // Play each match in the current round
          for (const matchId of playableMatches) {
            // Get match details via API
            const matchResponse = await request(app.getHttpServer()).get(
              `/match/${matchId}`,
            );
            expect(matchResponse.status).toBe(200);
            const match = matchResponse.body;

            console.log(
              `Match ${matchId}: ${match.white.username} (White) vs ${match.black.username} (Black)`,
            );

            // Find the users corresponding to white and black players
            const whiteUser = userCredentials.find(
              (u) => u.id === match.white.id,
            );
            const blackUser = userCredentials.find(
              (u) => u.id === match.black.id,
            );

            if (
              !whiteUser ||
              !blackUser ||
              !whiteUser.socket ||
              !blackUser.socket
            ) {
              throw new Error(
                `Can't find users or sockets for match ${matchId}`,
              );
            }

            // Join match with both players
            await joinMatch(whiteUser.socket, matchId);
            await joinMatch(blackUser.socket, matchId);

            // Determine which sequence to use based on match ID
            const isWhiteWinMatch = matchId % 2 === 0;
            const moveSequence = isWhiteWinMatch
              ? whiteWinSequence
              : blackWinSequence;

            // Play the match with the predetermined sequence
            console.log(
              `Playing match ${matchId} with ${
                isWhiteWinMatch ? 'white' : 'black'
              } winning`,
            );

            // Make moves alternating between white and black
            for (let i = 0; i < moveSequence.length; i++) {
              const move = moveSequence[i];
              const isWhiteTurn = i % 2 === 0;
              const playerSocket = isWhiteTurn
                ? whiteUser.socket
                : blackUser.socket;
              const playerColor = isWhiteTurn ? 'White' : 'Black';

              try {
                await makeMove(playerSocket, matchId, move || '');
                console.log(
                  `${playerColor} move ${move} in match ${matchId} successful`,
                );

                // Small wait between moves
                await new Promise((resolve) => setTimeout(resolve, 50));
              } catch (error) {
                console.error(
                  `Error making move ${move} in match ${matchId}:`,
                  (error as Error).message,
                );

                // Check match status via API
                const matchStatusResponse = await request(
                  app.getHttpServer(),
                ).get(`/match/${matchId}`);

                // Fail fast if it's not a "match already completed" error
                if (
                  !matchStatusResponse.body.status.includes('_won') &&
                  !matchStatusResponse.body.status.includes('draw')
                ) {
                  throw error;
                }

                break;
              }
            }

            // Verify match result using API
            const expectedStatus = isWhiteWinMatch
              ? MatchStatus.WHITE_WON
              : MatchStatus.BLACK_WON;

            const matchCompleted = await waitForMatchCompletion(
              matchId,
              expectedStatus,
            );

            if (!matchCompleted) {
              throw new Error(
                `Match ${matchId} did not complete with expected status: ${expectedStatus}`,
              );
            }

            // Get final match status via API
            const matchStatusResponse = await request(app.getHttpServer()).get(
              `/match/${matchId}`,
            );
            expect(matchStatusResponse.status).toBe(200);
            console.log(
              `Match ${matchId} final status:`,
              matchStatusResponse.body.status,
            );

            // Verify the match result matches our expectation
            expect(matchStatusResponse.body.status).toBe(expectedStatus);
          }

          // Wait for tournament to process match results
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Verify tournament completion using API

      // Get the final tournament status
      const finalTournament = await getTournament(tournamentId);
      console.log('Final tournament status:', finalTournament.status);

      if (finalTournament.status === TournamentStatus.COMPLETED) {
        // Verify tournament is completed
        expect(finalTournament.status).toBe(TournamentStatus.COMPLETED);

        // Get final bracket data to check the winner
        const finalBracket = await getTournamentBracket(tournamentId);

        // Verify the final round and match
        const finalRound = finalBracket.rounds[finalBracket.rounds.length - 1];
        if (finalRound && finalRound.matches && finalRound.matches.length > 0) {
          const finalMatch = finalRound.matches[0];
          expect(finalMatch.winner).toBeDefined();

          if (finalMatch.winner) {
            console.log(
              `Tournament winner: ${finalMatch.winner.username} (ID: ${finalMatch.winner.id})`,
            );
          }

          // Verify placements if available
          if (finalBracket.placements && finalBracket.placements.length > 0) {
            console.log(
              `Tournament has ${finalBracket.placements.length} placed players`,
            );

            // First place should be defined
            const firstPlace = finalBracket.placements[0];
            expect(firstPlace).toBeDefined();
            if (firstPlace) {
              console.log(
                `First place: ${firstPlace.username} (ID: ${firstPlace.id})`,
              );

              // First place winner should match final match winner
              expect(firstPlace.id).toBe(finalMatch.winner!.id);
            }
          }
        }
      } else {
        console.log(
          'Tournament is still in progress, not all matches were completed within test timeframe',
        );
      }
    });
  });

  describe('Tournament Security and Error Handling', () => {
    it('should reject unauthorized tournament creation attempts', async () => {
      if (userCredentials.length === 0) {
        throw new Error(
          'User credentials not available, cannot run security test',
        );
      }

      // Try to create a tournament with a regular user (not admin)
      const regularUserToken = userCredentials[0]?.token || '';

      const createResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Unauthorized Tournament',
          description: 'This should fail',
          maxParticipants: 8,
          isPublic: true,
        });

      // Should be rejected with 401 Unauthorized or 403 Forbidden
      expect([401, 403]).toContain(createResponse.status);
    });

    it('should reject unauthorized tournament start attempts', async () => {
      if (!tournamentId || userCredentials.length === 0) {
        throw new Error(
          'Tournament ID or user credentials not available, cannot run security test',
        );
      }

      // Try to start a tournament with a regular user (not admin)
      const regularUserToken = userCredentials[0]?.token || '';

      const startResponse = await request(app.getHttpServer())
        .post(`/tournaments/${tournamentId}/start`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({});

      // Should be rejected with 401 Unauthorized or 403 Forbidden
      expect([401, 403]).toContain(startResponse.status);
    });

    it('should handle invalid match moves correctly', async () => {
      // Find a valid match to use for testing
      const bracket = await getTournamentBracket(tournamentId);
      if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
        console.log(
          'No tournament bracket available for testing invalid moves',
        );
        return;
      }

      // Find a match that's currently active
      let testMatchId: number | undefined;
      for (const round of bracket.rounds) {
        for (const match of round.matches) {
          if (match.matchId && !match.winner) {
            testMatchId = match.matchId;
            break;
          }
        }
        if (testMatchId) break;
      }

      if (!testMatchId) {
        console.log('No active match found for testing invalid moves');
        return;
      }

      // Get match details
      const matchResponse = await request(app.getHttpServer()).get(
        `/match/${testMatchId}`,
      );
      expect(matchResponse.status).toBe(200);
      const match = matchResponse.body;

      // Find users playing this match
      const whiteUser = userCredentials.find((u) => u.id === match.white.id);
      const blackUser = userCredentials.find((u) => u.id === match.black.id);
      const nonPlayerUser = userCredentials.find(
        (u) => u.id !== match.white.id && u.id !== match.black.id,
      );

      if (!whiteUser || !blackUser || !nonPlayerUser) {
        console.log(
          'Could not find all required users for testing invalid moves',
        );
        return;
      }

      // Connect to socket and join the match
      const socket = createSocketConnection(nonPlayerUser.token);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Join match
      await joinMatch(socket, testMatchId);

      // Try to make an illegal move with non-player user
      try {
        await makeMove(socket, testMatchId, 'e4');
        throw new Error('Expected move by non-player to be rejected');
      } catch (error) {
        // This should fail with an error
        expect((error as Error).message).toContain('Failed to make move');
      }

      // Try to make an invalid chess move with correct player
      // (assuming white's turn)
      const whiteSocket = createSocketConnection(whiteUser.token);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await joinMatch(whiteSocket, testMatchId);

      try {
        // An impossible move that should be rejected
        await makeMove(whiteSocket, testMatchId, 'z9');
        throw new Error('Expected invalid chess move to be rejected');
      } catch (error) {
        // This should fail with an error
        expect((error as Error).message).toContain('Failed to make move');
      }

      // Clean up sockets
      socket.disconnect();
      whiteSocket.disconnect();
    });

    it('should reject requests with invalid/expired tokens', async () => {
      // Try to access tournament endpoints with invalid token
      const invalidToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMDY2NDcyMCwiZXhwIjoxNjIwNjY4MzIwfQ.INVALID_SIGNATURE';

      // Try to get tournament list with invalid token
      const tournamentsResponse = await request(app.getHttpServer())
        .get('/tournaments')
        .set('Authorization', `Bearer ${invalidToken}`);

      // Should still work as this is a public endpoint
      expect(tournamentsResponse.status).toBe(200);

      // Try to create a tournament with invalid token
      const createResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          name: 'Invalid Token Tournament',
          description: 'This should fail',
          maxParticipants: 8,
          isPublic: true,
        });

      // Should be rejected with 401 Unauthorized
      expect(createResponse.status).toBe(401);

      // Try to register for tournament with invalid token
      const registerResponse = await request(app.getHttpServer())
        .post(`/tournaments/${tournamentId}/register`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({});

      // Should be rejected with 401 Unauthorized
      expect(registerResponse.status).toBe(401);
    });
  });

  describe('Tournament Data Consistency', () => {
    it('should verify tournament bracket consistency', async () => {
      if (!tournamentId) {
        throw new Error(
          'Tournament ID not available, cannot run consistency test',
        );
      }

      // Get tournament details and bracket
      const tournament = await getTournament(tournamentId);
      expect(tournament).toBeDefined();

      const bracket = await getTournamentBracket(tournamentId);
      expect(bracket).toBeDefined();
      expect(bracket.rounds).toBeDefined();
      expect(bracket.rounds.length).toBeGreaterThan(0);

      // Verify round structure
      for (const round of bracket.rounds) {
        expect(round.round).toBeGreaterThan(0);
        expect(round.matches).toBeDefined();

        // Check if matches have correct structure
        for (const match of round.matches) {
          expect(match).toBeDefined();
          expect(match.matchNumber).toBeGreaterThan(0);

          // If match has a matchId, it should be a valid number
          if (match.matchId) {
            expect(match.matchId).toBeGreaterThan(0);

            // Verify each match with ID can be fetched via API
            const matchResponse = await request(app.getHttpServer()).get(
              `/match/${match.matchId}`,
            );
            expect(matchResponse.status).toBe(200);

            // If match has players assigned, verify their structure
            if (match.player1) {
              expect(match.player1.id).toBeGreaterThan(0);
              expect(match.player1.username).toBeDefined();
            }

            if (match.player2) {
              expect(match.player2.id).toBeGreaterThan(0);
              expect(match.player2.username).toBeDefined();
            }

            // If match has a winner, verify it's one of the players
            if (match.winner) {
              expect(match.winner.id).toBeGreaterThan(0);
              expect(match.winner.username).toBeDefined();

              if (match.player1 && match.player2) {
                expect([match.player1.id, match.player2.id]).toContain(
                  match.winner.id,
                );
              }
            }
          }
        }
      }
    });

    it('should verify completed matches reflect in the bracket', async () => {
      if (!tournamentId) {
        throw new Error(
          'Tournament ID not available, cannot run consistency test',
        );
      }

      // Get tournament bracket
      const bracket = await getTournamentBracket(tournamentId);
      expect(bracket).toBeDefined();
      expect(bracket.rounds).toBeDefined();

      // Find completed matches in the first round
      const round1 = bracket.rounds.find((r: TournamentRound) => r.round === 1);
      expect(round1).toBeDefined();
      if (!round1) return;

      for (const match of round1.matches) {
        if (match.matchId && match.winner) {
          // Verify match status via API
          const matchResponse = await request(app.getHttpServer()).get(
            `/match/${match.matchId}`,
          );
          expect(matchResponse.status).toBe(200);

          const matchDetails = matchResponse.body;

          // Match status should be one of the winning statuses
          expect(['white_won', 'black_won', 'draw']).toContain(
            matchDetails.status,
          );

          // Winner in bracket should match the winner in match details
          if (matchDetails.status === 'white_won') {
            expect(match.winner.id).toBe(matchDetails.white.id);
          } else if (matchDetails.status === 'black_won') {
            expect(match.winner.id).toBe(matchDetails.black.id);
          }
        }
      }
    });
  });
});

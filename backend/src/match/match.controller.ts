import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Match, MatchService, MatchStatus } from './match.service';
import { AuthGuard } from '../user/jwt.guard';
import { UpdateResult } from 'typeorm';
import { UserResponse, userToResponse } from 'src/user/user.controller';
import { TournamentResponse } from 'src/tournament/tournament.controller';
interface MatchResponse {
  status: MatchStatus;
  id: number;
  white: UserResponse;
  black: UserResponse;
  moves: string;
  fen: string;
  tournament?: TournamentResponse;
}

interface MatchRequest {
  white: UserResponse;
  black: UserResponse;
}

interface UpdateMatchRequest {
  white: UserResponse;
  black: UserResponse;
}

const matchToResponse = (match: Match): MatchResponse => {
  return {
    status: match.status,
    id: match.id,
    white: userToResponse(match.white),
    black: userToResponse(match.black),
    moves: match.moves,
    fen: match.fen,
    tournament: match.tournament,
  };
};

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  async findAll(): Promise<MatchResponse[]> {
    return (await this.matchService.findAll()).map(matchToResponse);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MatchResponse | null> {
    const matchId = parseInt(id, 10);
    if (isNaN(matchId)) {
      throw new BadRequestException(`Invalid match ID: ${id}`);
    }
    const match = await this.matchService.findOne(matchId);
    if (!match) {
      throw new NotFoundException(`Match not found for ID: ${id}`);
    }
    return matchToResponse(match);
  }

  @Post()
  @UseGuards(AuthGuard(['admin']))
  async create(@Body() match: MatchRequest): Promise<MatchResponse> {
    return matchToResponse(
      await this.matchService.create({
        white: match.white,
        black: match.black,
      }),
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard(['admin']))
  delete(@Param('id') id: string): Promise<void> {
    return this.matchService.delete(+id);
  }

  @Put(':id')
  @UseGuards(AuthGuard(['admin']))
  update(
    @Param('id') id: string,
    @Body() match: Partial<MatchRequest>,
  ): Promise<UpdateResult> {
    return this.matchService.update(+id, match);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserResponse, userToResponse } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../user/jwt';
import { MatchStatus, Match } from './match.entity';
import { MatchService } from './match.service';

interface MatchResponse {
  status: MatchStatus;
  id: number;
  white: UserResponse;
  black: UserResponse;
  moves: string;
  fen: string;
}

interface MatchRequest {
  white: { id: number };
  black: { id: number };
}

const matchToResponse = (match: Match): MatchResponse => {
  return {
    status: match.status,
    id: match.id,
    white: userToResponse(match.white),
    black: userToResponse(match.black),
    moves: match.moves,
    fen: match.fen,
  };
};

@Controller('matches')
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
}

@UseGuards(AuthGuard(['admin']))
@Controller('admin/matches')
export class MatchAdminController {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() match: MatchRequest): Promise<MatchResponse> {
    const white = await this.userService.findOne(match.white.id);
    const black = await this.userService.findOne(match.black.id);
    if (!white || !black) {
      throw new NotFoundException('User not found');
    }
    return matchToResponse(
      await this.matchService.create({
        white,
        black,
      }),
    );
  }
}

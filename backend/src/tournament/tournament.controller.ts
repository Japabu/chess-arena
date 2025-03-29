import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TournamentService, TournamentBracket } from './tournament.service';
import { Tournament } from './tournament.entity';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { AdminGuard } from '../user/admin.guard';
import { User as CurrentUser } from '../user/user.decorator';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentService.findOne(id);
  }

  @Get(':id/bracket')
  getBracket(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TournamentBracket | null> {
    return this.tournamentService.getTournamentBracket(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() tournament: Partial<Tournament>) {
    return this.tournamentService.create(tournament);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() tournamentData: Partial<Tournament>,
  ) {
    return this.tournamentService.update(id, tournamentData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentService.delete(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.tournamentService.registerParticipant(id, user.id);
    } catch (error: any) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to register for tournament',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async startTournament(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.tournamentService.startTournament(id);
    } catch (error: any) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to start tournament',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Development only endpoints that will be removed in production
  // These endpoints should be protected or removed entirely for production
  @Post(':id/dev/register-by-id')
  async registerById(
    @Param('id', ParseIntPipe) tournamentId: number,
    @Body() userData: { userId: number },
  ) {
    try {
      return await this.tournamentService.registerParticipant(
        tournamentId,
        userData.userId,
      );
    } catch (error: any) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Failed to register for tournament',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/dev/start-tournament')
  async startTournamentDev(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.tournamentService.startTournament(id);
    } catch (error: any) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to start tournament',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

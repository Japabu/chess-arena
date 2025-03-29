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
import { TournamentEntity } from './tournament.entity';
import { UserEntity } from '../user/user.entity';
import { AuthGuard } from '../user/jwt.guard';
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
  @UseGuards(AuthGuard(['admin']))
  create(@Body() tournament: Partial<TournamentEntity>) {
    return this.tournamentService.create(tournament);
  }

  @Put(':id')
  @UseGuards(AuthGuard(['admin']))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() tournamentData: Partial<TournamentEntity>,
  ) {
    return this.tournamentService.update(id, tournamentData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(['admin']))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentService.delete(id);
  }

  @Post(':id/register')
  @UseGuards(AuthGuard())
  async register(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
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
  @UseGuards(AuthGuard(['admin']))
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
}

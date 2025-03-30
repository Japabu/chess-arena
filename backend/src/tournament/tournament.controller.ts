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
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentEntity, TournamentStatus } from './tournament.entity';
import { AuthGuard } from '../user/jwt';

export interface TournamentResponse {
  id: number;
  name: string;
  description: string;
  status: TournamentStatus;
}

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
}

@Controller('admin/tournaments')
export class TournamentAdminController {
  constructor(private readonly tournamentService: TournamentService) {}

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
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchEntity } from './match.entity';
import { AuthGuard } from '../user/jwt.guard';
import { UpdateResult } from 'typeorm';
import { Match } from './match.model';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  findAll(): Promise<Match[]> {
    return this.matchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Match | null> {
    const matchId = parseInt(id, 10);
    if (isNaN(matchId)) {
      throw new Error(`Invalid match ID: ${id}`);
    }
    return this.matchService.findOne(matchId);
  }

  @Post()
  @UseGuards(AuthGuard(['admin']))
  create(@Body() match: Partial<MatchEntity>): Promise<Match> {
    return this.matchService.create(match);
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
    @Body() match: Partial<MatchEntity>,
  ): Promise<UpdateResult> {
    return this.matchService.update(+id, match);
  }
}

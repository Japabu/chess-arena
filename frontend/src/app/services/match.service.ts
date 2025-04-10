import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  constructor(private apiService: ApiService) {}

  getMatches(): Observable<Match[]> {
    return this.apiService.get<Match[]>('matches');
  }

  getUserMatches(userId: number): Observable<Match[]> {
    return this.apiService.get<Match[]>(`users/${userId}/matches`);
  }

  getMatchById(id: number): Observable<Match> {
    return this.apiService.get<Match>(`matches/${id}`);
  }

  createMatch(matchData: {
    white: { id: number };
    black: { id: number };
  }): Observable<Match> {
    return this.apiService.post<Match>('admin/matches', matchData);
  }

  makeMove(matchId: number, move: string): Observable<Match> {
    return this.apiService.post<Match>(`matches/${matchId}/move`, { move });
  }

  forfeitMatch(matchId: number): Observable<Match> {
    return this.apiService.post<Match>(`matches/${matchId}/forfeit`, {});
  }

  getActiveMatches(): Observable<Match[]> {
    return this.apiService.get<Match[]>('matches/active');
  }

  deleteMatch(matchId: number): Observable<any> {
    return this.apiService.delete<any>(`matches/${matchId}`);
  }
}

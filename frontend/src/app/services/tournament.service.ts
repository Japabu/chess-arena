import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tournament } from '../models/tournament.model';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  constructor(private apiService: ApiService) {}

  getTournaments(): Observable<Tournament[]> {
    return this.apiService.get<Tournament[]>('tournaments');
  }

  getTournamentById(id: number): Observable<Tournament> {
    return this.apiService.get<Tournament>(`tournaments/${id}`);
  }

  createTournament(
    tournamentData: Partial<Tournament>
  ): Observable<Tournament> {
    return this.apiService.post<Tournament>('tournaments', tournamentData);
  }

  updateTournament(
    id: number,
    tournamentData: Partial<Tournament>
  ): Observable<Tournament> {
    return this.apiService.put<Tournament>(`tournaments/${id}`, tournamentData);
  }

  deleteTournament(id: number): Observable<any> {
    return this.apiService.delete<any>(`tournaments/${id}`);
  }

  registerForTournament(tournamentId: number): Observable<any> {
    return this.apiService.post<any>(
      `tournaments/${tournamentId}/register`,
      {}
    );
  }

  leaveTournament(tournamentId: number): Observable<any> {
    return this.apiService.post<any>(`tournaments/${tournamentId}/leave`, {});
  }

  startTournament(tournamentId: number): Observable<any> {
    return this.apiService.post<any>(`tournaments/${tournamentId}/start`, {});
  }

  bulkDeleteTournaments(tournamentIds: number[]): Observable<any> {
    return this.apiService.post<any>('tournaments/bulk-delete', {
      tournamentIds,
    });
  }
}

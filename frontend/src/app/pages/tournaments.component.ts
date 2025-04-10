import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/tournament.model';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tournaments-container p-4 md:p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Chess Tournaments</h1>
        <button
          (click)="refreshTournaments()"
          class="refresh-button flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <span *ngIf="isLoading" class="animate-spin">⟳</span>
          <span *ngIf="!isLoading">⟳</span>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"
        ></div>
        <span class="ml-3">Loading tournaments...</span>
      </div>

      <!-- Error message -->
      <div
        *ngIf="errorMessage && !isLoading"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
      >
        <p>{{ errorMessage }}</p>
        <button (click)="refreshTournaments()" class="text-sm underline mt-2">
          Try again
        </button>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="tournaments.length === 0 && !isLoading && !errorMessage"
        class="text-center py-12 bg-gray-50 rounded-lg"
      >
        <p class="text-gray-500 mb-3">No tournaments available at this time.</p>
        <p class="text-sm text-gray-400">
          Check back later or refresh to see new tournaments.
        </p>
      </div>

      <!-- Tournament cards grid -->
      <div
        *ngIf="tournaments.length > 0 && !isLoading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          *ngFor="let tournament of tournaments"
          class="tournament-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          (click)="navigateToTournament(tournament.id)"
        >
          <div class="p-4">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-lg line-clamp-2">
                {{ tournament.name }}
              </h3>
              <span
                [class]="getStatusClass(tournament.status)"
                class="status-badge px-2 py-1 text-xs rounded-full"
              >
                {{ getStatusDisplay(tournament.status) }}
              </span>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div class="mb-1 flex items-center">
                <span class="mr-2">👥</span>
                <span
                  >{{ tournament.playerCount || 0 }}/{{
                    tournament.maxPlayers
                  }}
                  players</span
                >
              </div>
              <div class="mb-1 flex items-center">
                <span class="mr-2">📅</span>
                <span>{{
                  tournament.startDate ? (tournament.startDate | date) : 'TBD'
                }}</span>
              </div>
              <div class="flex items-center">
                <span class="mr-2">⏱️</span>
                <span>{{ tournament.timeControl }}</span>
              </div>
            </div>

            <div
              *ngIf="tournament.description"
              class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
            >
              {{ tournament.description }}
            </div>
          </div>

          <div
            class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-sm"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">{{
                tournament.format || 'Standard'
              }}</span>
              <span class="font-medium text-blue-600 dark:text-blue-400"
                >View Details →</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
.status-badge-registration {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400;
}

.status-badge-in-progress {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400;
}

.status-badge-completed {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400;
}

.status-badge-cancelled {
  @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400;
}

.status-badge {
  white-space: nowrap;
}
  `,
})
export class TournamentsComponent implements OnInit {
  tournaments: Tournament[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private tournamentService: TournamentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.tournamentService.getTournaments().subscribe({
      next: (data) => {
        this.tournaments = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          'Failed to load tournaments. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching tournaments:', error);
      },
    });
  }

  navigateToTournament(tournamentId: string): void {
    this.router.navigate(['/tournaments', tournamentId]);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      registration: 'status-badge-registration',
      in_progress: 'status-badge-in-progress',
      completed: 'status-badge-completed',
      cancelled: 'status-badge-cancelled',
    };

    return statusMap[status.toLowerCase()] || 'status-badge-registration';
  }

  getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      registration: 'Registration Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return statusMap[status.toLowerCase()] || status;
  }

  refreshTournaments(): void {
    this.loadTournaments();
  }
}

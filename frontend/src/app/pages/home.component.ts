import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../services/tournament.service';
import { Tournament } from '../models/tournament.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto">
      <section class="mb-12">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to Chess Arena
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Challenge players from around the world and participate in exciting
          chess tournaments.
        </p>
        <div class="flex flex-wrap gap-4">
          <a
            routerLink="/tournaments"
            class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Tournaments
          </a>
          <a
            routerLink="/matches"
            class="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Play a Match
          </a>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Active Tournaments
        </h2>

        <div *ngIf="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            Loading tournaments...
          </p>
        </div>

        <div
          *ngIf="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline">
            Unable to load tournaments. Please try again later.</span
          >
        </div>

        <div
          *ngIf="!loading && !error && tournaments.length === 0"
          class="text-center py-8"
        >
          <p class="text-gray-600 dark:text-gray-400">
            No active tournaments at the moment.
          </p>
          <a
            routerLink="/tournaments"
            class="inline-block mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            See all tournaments
          </a>
        </div>

        <div
          *ngIf="!loading && !error && tournaments.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div
            *ngFor="let tournament of tournaments.slice(0, 4)"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {{ tournament.name }}
            </h3>
            <p
              *ngIf="tournament.description"
              class="text-gray-600 dark:text-gray-300 mb-4"
            >
              {{ tournament.description }}
            </p>
            <div
              class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4"
            >
              <span>Format: {{ tournament.format }}</span>
              <span>Status: {{ tournament.status }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ tournament.participants.length }}/{{
                  tournament.maxParticipants
                }}
                players
              </span>
              <a
                [routerLink]="['/tournaments', tournament.id]"
                class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                View Details
              </a>
            </div>
          </div>
        </div>

        <div
          *ngIf="!loading && !error && tournaments.length > 4"
          class="text-center mt-6"
        >
          <a
            routerLink="/tournaments"
            class="inline-block px-4 py-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            View All Tournaments
          </a>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  tournaments: Tournament[] = [];
  loading = true;
  error = false;

  private tournamentService = inject(TournamentService);

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    this.tournamentService.getTournaments().subscribe({
      next: (data) => {
        this.tournaments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tournaments', err);
        this.error = true;
        this.loading = false;
      },
    });
  }
}

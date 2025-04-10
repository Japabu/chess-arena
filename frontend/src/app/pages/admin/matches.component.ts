import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Match Management</h1>
        <a
          routerLink="/admin/matches/create"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Match
        </a>
      </div>

      <!-- Placeholder content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p class="text-center text-gray-500">Match management coming soon.</p>
      </div>
    </div>
  `,
  styles: [
    `
      /* Matches component styles */
    `,
  ],
})
export class MatchesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }
}

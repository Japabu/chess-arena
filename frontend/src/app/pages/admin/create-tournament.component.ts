import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-tournament',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="mb-4">
        <a
          routerLink="/admin/tournaments"
          class="text-blue-600 hover:underline flex items-center"
        >
          <span class="mr-1">←</span> Back to Tournaments
        </a>
      </div>

      <h1 class="text-2xl font-bold mb-6">Create New Tournament</h1>

      <!-- Placeholder content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p class="text-center text-gray-500">
          Tournament creation form coming soon.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      /* Create tournament component styles */
    `,
  ],
})
export class CreateTournamentComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }
}

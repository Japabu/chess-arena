import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Tournament Management</h1>
        <a
          routerLink="/admin/tournaments/create"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Tournament
        </a>
      </div>

      <!-- Placeholder content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p class="text-center text-gray-500">
          Tournament management coming soon.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      /* Tournaments component styles */
    `,
  ],
})
export class TournamentsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }
}

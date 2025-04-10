import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <h1 class="text-2xl font-bold mb-6">Chess Matches</h1>

      <!-- Placeholder content -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center"
      >
        <p class="text-gray-500 mb-3">Matches feature is coming soon.</p>
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

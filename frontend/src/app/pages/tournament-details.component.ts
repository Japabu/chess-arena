import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tournament-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="mb-4">
        <button
          (click)="goBack()"
          class="text-blue-600 hover:underline flex items-center"
        >
          <span class="mr-1">←</span> Back to Tournaments
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-6">Tournament Details</h1>

      <!-- Placeholder content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p class="text-center text-gray-500">Loading tournament details...</p>
      </div>
    </div>
  `,
  styles: [
    `
      /* Tournament details component styles */
    `,
  ],
})
export class TournamentDetailsComponent implements OnInit {
  tournamentId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.tournamentId = this.route.snapshot.paramMap.get('id');
    // Here you would load tournament data using the ID
  }

  goBack(): void {
    this.router.navigate(['/tournaments']);
  }
}

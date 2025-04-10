import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <!-- Placeholder content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
          <p class="text-gray-500">No recent activity to display.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">Statistics</h2>
          <p class="text-gray-500">Statistics coming soon.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Dashboard component styles */
    `,
  ],
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold mb-6">User Management</h1>

      <!-- Placeholder content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p class="text-center text-gray-500">User management coming soon.</p>
      </div>
    </div>
  `,
  styles: [
    `
      /* Users component styles */
    `,
  ],
})
export class UsersComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }
}

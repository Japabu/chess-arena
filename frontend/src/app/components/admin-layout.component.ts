import { Component, inject, OnInit } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <div
        [ngClass]="{
          hidden: !isSidebarOpen,
          block: isSidebarOpen,
          'md:block': true
        }"
        class="sidebar w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
      >
        <div class="flex flex-col h-full">
          <!-- Sidebar header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div>
              <h2
                class="text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Chess Arena
              </h2>
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Admin Panel</span
              >
            </div>
            <button
              class="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              (click)="toggleSidebar()"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Sidebar navigation -->
          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </a>
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
              class="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Users
            </a>
            <a
              routerLink="/admin/matches"
              routerLinkActive="bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
              class="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Matches
            </a>
            <a
              routerLink="/admin/tournaments"
              routerLinkActive="bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
              class="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Tournaments
            </a>
          </nav>

          <!-- Logout button -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              (click)="handleLogout()"
              class="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Mobile header -->
        <header
          class="md:hidden bg-white dark:bg-gray-800 shadow-sm py-2 px-4 flex items-center"
        >
          <button
            class="p-1 mr-4 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            (click)="toggleSidebar()"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 class="text-lg font-medium text-gray-900 dark:text-white">
            Admin Panel
          </h1>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 h-full"
          >
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = true;

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Check if user is an admin, if not redirect to home
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

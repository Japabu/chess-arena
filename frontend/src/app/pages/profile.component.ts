import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        User Profile
      </h1>

      <div *ngIf="isLoading" class="flex justify-center items-center py-8">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"
        ></div>
        <span class="ml-3 text-gray-700 dark:text-gray-300"
          >Loading profile...</span
        >
      </div>

      <div
        *ngIf="!isLoading"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center">
            <div
              class="w-16 h-16 flex-shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mr-4"
            >
              {{ getInitial() }}
            </div>
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ userData.username || 'Unknown User' }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                User ID: {{ userData.id }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Username
                </h3>
                <p class="mt-1 text-gray-900 dark:text-white">
                  {{ userData.username }}
                </p>
              </div>

              <div>
                <h3
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Member Since
                </h3>
                <p class="mt-1 text-gray-900 dark:text-white">
                  {{ formatDate(userData.createdAt) }}
                </p>
              </div>
            </div>

            <div
              class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-inner"
            >
              <h3
                class="text-lg font-medium text-gray-900 dark:text-white mb-3"
              >
                Chess Arena Stats
              </h3>
              <ul class="space-y-2">
                <li class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Matches played:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white"
                    >0</span
                  >
                </li>
                <li class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Tournaments joined:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white"
                    >0</span
                  >
                </li>
                <li class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Wins:</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >0</span
                  >
                </li>
                <li class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Losses:</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >0</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <div
            *ngIf="isCurrentUser"
            class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              routerLink="/settings"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  userData: User = {
    id: 0,
    username: '',
    createdAt: '',
  };
  isLoading = true;
  isCurrentUser = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.isLoading = true;

    const userId = this.route.snapshot.paramMap.get('userId');
    let targetUserId: number;

    if (userId) {
      targetUserId = parseInt(userId, 10);
    } else {
      // If no userId provided, show the current user's profile
      const currentUser = this.authService.authUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }
      targetUserId = currentUser.id;
      this.isCurrentUser = true;
    }

    this.userService.getUserById(targetUserId).subscribe({
      next: (user) => {
        this.userData = {
          ...user,
          username: user.username || '',
        };

        // Check if this is the current user's profile
        const currentUser = this.authService.authUser();
        if (currentUser) {
          this.isCurrentUser = currentUser.id === this.userData.id;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.isLoading = false;
      },
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  getInitial(): string {
    const name = this.userData.username || '';
    return name.charAt(0).toUpperCase() || '?';
  }
}

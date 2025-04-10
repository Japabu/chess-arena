import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Login
      </h1>

      <div
        *ngIf="errorMessage"
        class="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded"
      >
        {{ errorMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
            >Username</label
          >
          <input
            type="text"
            id="username"
            formControlName="username"
            required
            [disabled]="isLoading"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div
            *ngIf="
              loginForm.get('username')?.invalid &&
              loginForm.get('username')?.touched
            "
            class="text-red-600 text-sm mt-1"
          >
            Username is required
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
            >Password</label
          >
          <input
            type="password"
            id="password"
            formControlName="password"
            required
            [disabled]="isLoading"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div
            *ngIf="
              loginForm.get('password')?.invalid &&
              loginForm.get('password')?.touched
            "
            class="text-red-600 text-sm mt-1"
          >
            Password is required
          </div>
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || isLoading"
          class="w-full mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // If already authenticated, redirect based on role
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.isLoading = false;
        this.redirectBasedOnRole();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password';
        console.error('Login error:', error);
      },
    });
  }

  private redirectBasedOnRole(): void {
    // Get return URL from query parameters or default to home
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authService.isAdmin()) {
      this.router.navigateByUrl('/admin/dashboard');
    } else {
      this.router.navigateByUrl(returnUrl);
    }
  }
}

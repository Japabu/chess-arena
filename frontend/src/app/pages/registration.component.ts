import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Register
      </h1>

      <div
        *ngIf="errorMessage"
        class="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded"
      >
        {{ errorMessage }}
      </div>

      <form
        [formGroup]="registrationForm"
        (ngSubmit)="onSubmit()"
        class="space-y-4"
      >
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
              registrationForm.get('username')?.invalid &&
              registrationForm.get('username')?.touched
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
              registrationForm.get('password')?.invalid &&
              registrationForm.get('password')?.touched
            "
            class="text-red-600 text-sm mt-1"
          >
            Password is required
          </div>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
            >Confirm Password</label
          >
          <input
            type="password"
            id="confirmPassword"
            formControlName="confirmPassword"
            required
            [disabled]="isLoading"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div
            *ngIf="
              registrationForm.get('confirmPassword')?.invalid &&
              registrationForm.get('confirmPassword')?.touched
            "
            class="text-red-600 text-sm mt-1"
          >
            Confirm password is required
          </div>
          <div
            *ngIf="
              registrationForm.get('confirmPassword')?.touched &&
              registrationForm.get('password')?.valid &&
              !passwordsMatch
            "
            class="text-red-600 text-sm mt-1"
          >
            Passwords do not match
          </div>
        </div>

        <button
          type="submit"
          [disabled]="registrationForm.invalid || !passwordsMatch || isLoading"
          class="w-full mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
  `,
})
export class RegistrationComponent {
  registrationForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  isLoading = false;
  errorMessage = '';

  private userService = inject(UserService);
  private router = inject(Router);

  get passwordsMatch(): boolean {
    const passwordValue = this.registrationForm.get('password')?.value;
    const confirmPasswordValue =
      this.registrationForm.get('confirmPassword')?.value;
    return passwordValue === confirmPasswordValue;
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || !this.passwordsMatch) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.registrationForm.value;

    this.userService.register(username!, password!).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      },
    });
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';
import { switchMap, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

interface AuthResponse {
  access_token: string;
}

interface TokenClaims {
  id: number;
  username: string;
  roles: string[];
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal(false);
  private isAdminSignal = signal(false);
  private isLoadingSignal = signal(true);

  // Computed values
  public readonly authUser = this.authUserSignal.asReadonly();
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public readonly isAdmin = this.isAdminSignal.asReadonly();
  public readonly isLoading = this.isLoadingSignal.asReadonly();
  public readonly userDisplayName = computed(() => {
    const user = this.authUser();
    return user ? user.username : 'Guest';
  });

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  getUserClaims(): TokenClaims | null {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<TokenClaims>(token);

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  async checkAuthStatus(): Promise<void> {
    this.isLoadingSignal.set(true);

    const claims = this.getUserClaims();

    if (claims && claims.id) {
      // User is authenticated
      this.isAuthenticatedSignal.set(true);

      try {
        const user = await this.apiService
          .get<User>(`users/${claims.id}`)
          .toPromise();
        this.authUserSignal.set(user || null);
        this.isAdminSignal.set(claims.roles.includes('admin'));
      } catch (error) {
        this.logout();
      }
    } else {
      // No valid token
      this.logout();
    }

    this.isLoadingSignal.set(false);
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.access_token);
        }),
        switchMap(() => {
          return of(this.checkAuthStatus());
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSignal.set(false);
    this.authUserSignal.set(null);
    this.isAdminSignal.set(false);
    this.router.navigate(['/login']);
  }
}

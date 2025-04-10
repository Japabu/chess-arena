import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/registration.component').then(
        (c) => c.RegistrationComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile.component').then((c) => c.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile/:userId',
    loadComponent: () =>
      import('./pages/profile.component').then((c) => c.ProfileComponent),
  },
  {
    path: 'matches',
    loadComponent: () =>
      import('./pages/matches.component').then((c) => c.MatchesComponent),
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./pages/tournaments.component').then(
        (c) => c.TournamentsComponent
      ),
  },
  {
    path: 'tournaments/:id',
    loadComponent: () =>
      import('./pages/tournament-details.component').then(
        (c) => c.TournamentDetailsComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin-layout.component').then(
        (c) => c.AdminLayoutComponent
      ),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users.component').then((c) => c.UsersComponent),
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./pages/admin/matches.component').then(
            (c) => c.MatchesComponent
          ),
      },
      {
        path: 'matches/create',
        loadComponent: () =>
          import('./pages/admin/create-match.component').then(
            (c) => c.CreateMatchComponent
          ),
      },
      {
        path: 'tournaments',
        loadComponent: () =>
          import('./pages/admin/tournaments.component').then(
            (c) => c.TournamentsComponent
          ),
      },
      {
        path: 'tournaments/create',
        loadComponent: () =>
          import('./pages/admin/create-tournament.component').then(
            (c) => c.CreateTournamentComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

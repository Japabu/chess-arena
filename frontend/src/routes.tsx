import { lazy } from 'solid-js';
import { RouteDefinition } from '@solidjs/router';
import AdminLayout from './components/AdminLayout';

const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
  },
  {
    path: '/register',
    component: lazy(() => import('./pages/Registration')),
  },
  {
    path: '/login',
    component: lazy(() => import('./pages/Login')),
  },
  {
    path: '/profile',
    component: lazy(() => import('./pages/Profile')),
  },
  {
    path: '/profile/:userId',
    component: lazy(() => import('./pages/Profile')),
  },
  {
    path: '/matches',
    component: lazy(() => import('./pages/Matches')),
  },
  {
    path: '/tournaments',
    component: lazy(() => import('./pages/Tournaments')),
  },
  {
    path: '/tournaments/:id',
    component: lazy(() => import('./pages/TournamentDetails')),
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '/dashboard',
        component: lazy(() => import('./pages/admin/Dashboard')),
      },
      {
        path: '/users',
        component: lazy(() => import('./pages/admin/Users')),
      },
      {
        path: '/matches',
        component: lazy(() => import('./pages/admin/Matches')),
      },
      {
        path: '/matches/create',
        component: lazy(() => import('./pages/admin/CreateMatch')),
      },
      {
        path: '/tournaments',
        component: lazy(() => import('./pages/admin/Tournaments')),
      },
      {
        path: '/tournaments/create',
        component: lazy(() => import('./pages/admin/CreateTournament')),
      },
    ],
  },
];

export default routes; 
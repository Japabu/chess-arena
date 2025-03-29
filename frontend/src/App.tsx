import { Component, createEffect } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registration from './pages/BotRegistration';
import Matches from './pages/Matches';
import Login from './pages/AdminLogin';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';

// Admin pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMatches from './pages/admin/AdminMatches';
import CreateMatch from './pages/admin/CreateMatch';
import AdminTournaments from './pages/admin/AdminTournaments';
import CreateTournament from './pages/admin/CreateTournament';

const App: Component = () => {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router root={(props) => (
        <>
          <Navbar />
          <div class="container mx-auto px-4 py-8">{props.children}</div>
        </>
      )}>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/register" component={Registration} />
        <Route path="/login" component={Login} />
        <Route path="/matches" component={Matches} />
        <Route path="/tournaments" component={Tournaments} />
        <Route path="/tournaments/:id" component={TournamentDetails} />
        
        {/* Admin routes with layout - AdminLayout component checks for admin role */}
        <Route path="/admin" component={AdminLayout}>
          <Route path="/dashboard" component={AdminDashboard} />
          <Route path="/users" component={AdminUsers} />
          <Route path="/matches" component={AdminMatches} />
          <Route path="/matches/create" component={CreateMatch} />
          <Route path="/tournaments" component={AdminTournaments} />
          <Route path="/tournaments/create" component={CreateTournament} />
        </Route>
      </Router>
    </div>
  );
};

export default App;

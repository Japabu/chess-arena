import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';

interface Stats {
  totalUsers: number;
  totalMatches: number;
  totalTournaments: number;
  activeMatches: number;
  activeTournaments: number;
}

const AdminDashboard: Component = () => {
  const [stats, setStats] = createSignal<Stats>({
    totalUsers: 0,
    totalMatches: 0,
    totalTournaments: 0,
    activeMatches: 0,
    activeTournaments: 0
  });
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const navigate = useNavigate();
  
  // Check for authentication and fetch stats
  createEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchStats();
    }
  });
  
  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch users count
      const usersResponse = await fetch(`http://localhost:3000/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (usersResponse.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      const usersData = await usersResponse.json();
      
      // Fetch matches
      const matchesResponse = await fetch(`http://localhost:3000/match`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const matchesData = await matchesResponse.json();
      
      // Fetch tournaments
      const tournamentsResponse = await fetch(`http://localhost:3000/tournaments`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const tournamentsData = await tournamentsResponse.json();
      
      // Calculate stats
      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalMatches: Array.isArray(matchesData) ? matchesData.length : 0,
        totalTournaments: Array.isArray(tournamentsData) ? tournamentsData.length : 0,
        activeMatches: Array.isArray(matchesData) ? matchesData.filter(m => m.status === 'in_progress').length : 0,
        activeTournaments: Array.isArray(tournamentsData) ? tournamentsData.filter(t => t.status !== 'completed').length : 0
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };
  
  return (
    <div class="admin-dashboard-page">
      <h1 class="page-title">Dashboard</h1>
      <p class="dashboard-date">{formatDate()}</p>
      
      {error() && <div class="error-message">{error()}</div>}
      
      {isLoading() ? (
        <div class="loading-indicator">Loading dashboard data...</div>
      ) : (
        <>
          <div class="stats-grid">
            <div class="stat-card">
              <h3 class="stat-title">Total Users</h3>
              <p class="stat-value">{stats().totalUsers}</p>
              <span class="stat-description">Registered users</span>
            </div>
            
            <div class="stat-card">
              <h3 class="stat-title">Total Matches</h3>
              <p class="stat-value">{stats().totalMatches}</p>
              <span class="stat-description">All-time matches</span>
            </div>
            
            <div class="stat-card">
              <h3 class="stat-title">Active Matches</h3>
              <p class="stat-value">{stats().activeMatches}</p>
              <span class="stat-description">Currently in progress</span>
            </div>
            
            <div class="stat-card">
              <h3 class="stat-title">Total Tournaments</h3>
              <p class="stat-value">{stats().totalTournaments}</p>
              <span class="stat-description">All-time tournaments</span>
            </div>
          </div>
          
          <div class="dashboard-sections">
            <div class="section-card">
              <h2 class="card-title">Quick Actions</h2>
              <div class="quick-actions">
                <button class="btn btn-primary" onClick={() => navigate('/admin/matches/create')}>
                  Create Match
                </button>
                <button class="btn btn-primary" onClick={() => navigate('/admin/tournaments/create')}>
                  Create Tournament
                </button>
              </div>
            </div>
            
            <div class="section-card">
              <h2 class="card-title">System Status</h2>
              <div class="status-item">
                <span class="status-label">API Server</span>
                <span class="status-badge status-online">Online</span>
              </div>
              <div class="status-item">
                <span class="status-label">Database</span>
                <span class="status-badge status-online">Connected</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 
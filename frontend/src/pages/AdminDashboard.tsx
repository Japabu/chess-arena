import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ChessBoard from '../components/ChessBoard';
import './AdminDashboard.css';

interface Bot {
  id: number;
  username: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
}

interface Match {
  id: number;
  white: User;
  black: User;
  fen: string;
  createdAt: string;
  status: string;
}

const AdminDashboard: Component = () => {
  const [bots, setBots] = createSignal<Bot[]>([]);
  const [matches, setMatches] = createSignal<Match[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isCreatingMatch, setIsCreatingMatch] = createSignal(false);
  const [isUpdatingMatch, setIsUpdatingMatch] = createSignal(false);
  const [selectedBot1, setSelectedBot1] = createSignal<number | null>(null);
  const [selectedBot2, setSelectedBot2] = createSignal<number | null>(null);
  const [editingMatch, setEditingMatch] = createSignal<Match | null>(null);
  const [customFen, setCustomFen] = createSignal<string>('');
  const [error, setError] = createSignal('');
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const [createSuccess, setCreateSuccess] = createSignal('');
  const [updateSuccess, setUpdateSuccess] = createSignal('');
  const [activeTab, setActiveTab] = createSignal('bots');
  const navigate = useNavigate();
  
  // Check for authentication
  createEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchBots();
      fetchMatches();
    }
  });
  
  const fetchBots = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setBots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/match`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Failed to fetch matches');
      }
      
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching matches:', err);
    }
  };
  
  const handleDeleteBot = async (botId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/auth/users/${botId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      
      // Remove the bot from the list
      setBots(prev => prev.filter(b => b.id !== botId));
      
      setDeleteSuccess('User deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return;
    }
    
    setError('');
    setDeleteSuccess('');
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/match/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete match');
      }
      
      // Remove the match from the list
      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      // Refresh the match list
      await fetchMatches();
      setDeleteSuccess('Match deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const handleCreateMatch = async (e: Event) => {
    e.preventDefault();
    
    if (!selectedBot1() || !selectedBot2() || selectedBot1() === selectedBot2()) {
      setError('Please select two different bots for the match');
      return;
    }
    
    setError('');
    setCreateSuccess('');
    setIsCreatingMatch(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const bot1 = bots().find(b => b.id === selectedBot1());
      const bot2 = bots().find(b => b.id === selectedBot2());
      
      if (!bot1 || !bot2) {
        throw new Error('Selected bots not found');
      }
      
      const response = await fetch(`http://localhost:3000/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          white: { id: selectedBot1() },
          black: { id: selectedBot2() },
        }),
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create match');
      }
      
      // Refresh the matches list and switch to matches tab
      await fetchMatches();
      setCreateSuccess('Match created successfully!');
      setActiveTab('matches');
      setSelectedBot1(null);
      setSelectedBot2(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCreateSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreatingMatch(false);
    }
  };
  
  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setCustomFen(match.fen);
    setActiveTab('edit-match');
  };
  
  const validateFen = (fen: string): boolean => {
    // Basic FEN validation
    const fenPattern = /^([pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+\s[wb]\s[KQkq-]+\s[a-h1-8-]+\s\d+\s\d+$/;
    return fenPattern.test(fen);
  };
  
  const handleUpdateMatch = async (e: Event) => {
    e.preventDefault();
    
    if (editingMatch()) {
      const match = editingMatch()!;
      
      setIsUpdatingMatch(true);
      
      // Validate FEN if custom FEN is provided
      if (customFen() && !validateFen(customFen())) {
        setError('Invalid FEN format');
        setIsUpdatingMatch(false);
        return;
      }
      
      // Prepare update data
      const updateData: any = {
      };
      
      // Only update FEN if custom FEN is provided
      if (customFen()) {
        updateData.fen = customFen();
      }
      
      try {
        const token = localStorage.getItem('admin_token');
        
        const response = await fetch(`http://localhost:3000/match/${match.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update match');
        }
        
        // Update the match in the list
        setMatches(prev => prev.map(m => m.id === match.id ? data.match : m));
        
        // Close the modal and reset form
        setEditingMatch(null);
        setCustomFen('');
        setError('');
        
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error updating match:', err);
      } finally {
        setIsUpdatingMatch(false);
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div class="admin-dashboard">
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} class="button-secondary">Logout</button>
      </div>
      
      {error() && <div class="error-message">{error()}</div>}
      {deleteSuccess() && <div class="success-message">{deleteSuccess()}</div>}
      {createSuccess() && <div class="success-message">{createSuccess()}</div>}
      {updateSuccess() && <div class="success-message">{updateSuccess()}</div>}
      
      <div class="dashboard-tabs">
        <button 
          class={activeTab() === 'bots' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('bots')}
        >
          Manage Users
        </button>
        <button 
          class={activeTab() === 'matches' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('matches')}
        >
          Manage Matches
        </button>
        <button 
          class={activeTab() === 'create-match' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('create-match')}
        >
          Create Match
        </button>
        <Show when={activeTab() === 'edit-match'}>
          <button class="tab-active">
            Edit Match
          </button>
        </Show>
      </div>
      
      <div class="dashboard-content">
        <Show when={activeTab() === 'bots'}>
          <div class="admin-section">
            <h2>Registered Users</h2>
            <p>View and manage all registered users.</p>
            
            <Show when={isLoading()}>
              <p>Loading users...</p>
            </Show>
            
            <Show when={!isLoading() && bots().length === 0}>
              <p>No users found.</p>
            </Show>
            
            <Show when={!isLoading() && bots().length > 0}>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={bots()}>
                    {(bot) => (
                      <tr>
                        <td>{bot.id}</td>
                        <td>{bot.username}</td>
                        <td>{formatDate(bot.createdAt)}</td>
                        <td class="action-buttons">
                          <button 
                            class="button-danger"
                            onClick={() => handleDeleteBot(bot.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </Show>
          </div>
        </Show>
        
        <Show when={activeTab() === 'matches'}>
          <div class="section-header">
            <h2>Match Management</h2>
            <button onClick={fetchMatches} class="button-secondary">
              Refresh
            </button>
          </div>
          
          <Show when={matches().length > 0} fallback={<p>No matches created yet.</p>}>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>White Player</th>
                  <th>Black Player</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={matches()}>
                  {(match) => (
                    <tr>
                      <td>{match.id}</td>
                      <td>{match.white?.username || 'Unknown'}</td>
                      <td>{match.black?.username || 'Unknown'}</td>
                      <td>{formatDate(match.createdAt)}</td>
                      <td class="action-buttons">
                        <button 
                          onClick={() => handleEditMatch(match)} 
                          class="button-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteMatch(match.id)} 
                          class="button-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </Show>
        
        <Show when={activeTab() === 'create-match'}>
          <div class="admin-section">
            <h2>Create New Match</h2>
            <p>Select two users to start a new match.</p>
            
            <form onSubmit={handleCreateMatch} class="match-form">
              <div class="form-group">
                <label for="white-player">White Player</label>
                <select 
                  id="white-player"
                  value={selectedBot1() || ''}
                  onChange={(e) => setSelectedBot1(parseInt(e.currentTarget.value))}
                >
                  <option value="">Select White Player</option>
                  <For each={bots()}>
                    {(bot) => (
                      <option value={bot.id}>{bot.username}</option>
                    )}
                  </For>
                </select>
              </div>
              
              <div class="form-group">
                <label for="black-player">Black Player</label>
                <select 
                  id="black-player"
                  value={selectedBot2() || ''}
                  onChange={(e) => setSelectedBot2(parseInt(e.currentTarget.value))}
                >
                  <option value="">Select Black Player</option>
                  <For each={bots()}>
                    {(bot) => (
                      <option value={bot.id}>{bot.username}</option>
                    )}
                  </For>
                </select>
              </div>
              
              <button 
                type="submit" 
                class="button-primary"
                disabled={isCreatingMatch() || !selectedBot1() || !selectedBot2()}
              >
                {isCreatingMatch() ? 'Creating...' : 'Create Match'}
              </button>
            </form>
          </div>
        </Show>
        
        <Show when={activeTab() === 'edit-match' && editingMatch()}>
          <div class="section-header">
            <h2>Edit Match #{editingMatch()?.id}</h2>
          </div>
          
          <form onSubmit={handleUpdateMatch} class="match-form">
            <div class="form-group">
              <label>Bots</label>
              <div class="match-players-info">
                <strong>White: </strong>{editingMatch()?.white?.username || 'Unknown'} 
                <span class="vs">vs</span> 
                <strong>Black: </strong>{editingMatch()?.black?.username || 'Unknown'}
              </div>
            </div>
            
            <div class="form-group">
              <label for="customFen">Chess Position (FEN)</label>
              <input 
                type="text" 
                id="customFen" 
                value={customFen()} 
                onChange={(e) => setCustomFen(e.currentTarget.value)}
                placeholder="Enter FEN notation"
                disabled={isUpdatingMatch()}
              />
              <div class="hint">
                Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
              </div>
            </div>
            
            <div class="preview-board">
              <h3>Preview</h3>
              <div class="position-preview">
                <ChessBoard fen={customFen() || editingMatch()?.fen || ''} />
              </div>
            </div>
            
            <div class="form-buttons">
              <button type="button" class="button-secondary" onClick={() => setActiveTab('matches')} disabled={isUpdatingMatch()}>
                Cancel
              </button>
              <button type="submit" class="button" disabled={isUpdatingMatch()}>
                {isUpdatingMatch() ? 'Updating Match...' : 'Update Match'}
              </button>
            </div>
          </form>
        </Show>
      </div>
    </div>
  );
};

export default AdminDashboard; 
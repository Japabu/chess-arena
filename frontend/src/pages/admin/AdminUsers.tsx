import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import '../../styles/Admin.css';

interface User {
  id: number;
  username: string;
  createdAt: string;
}

const AdminUsers: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const [searchQuery, setSearchQuery] = createSignal('');
  const navigate = useNavigate();
  
  // Check for authentication and fetch users
  createEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchUsers();
    }
  });
  
  const fetchUsers = async () => {
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
      
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`http://localhost:3000/auth/users/${userId}`, {
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
      
      // Remove the user from the list
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      setDeleteSuccess('User deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const filteredUsers = () => {
    if (!searchQuery()) return users();
    
    const query = searchQuery().toLowerCase();
    return users().filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.id.toString().includes(query)
    );
  };
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div class="admin-users-page">
      <h1 class="page-title">User Management</h1>
      
      {error() && <div class="error-message">{error()}</div>}
      {deleteSuccess() && <div class="success-message">{deleteSuccess()}</div>}
      
      <div class="section-card">
        <div class="search-form">
          <input 
            type="text" 
            placeholder="Search users by name or ID..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <button class="btn btn-primary" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
        
        <Show when={isLoading()}>
          <div class="loading-indicator">Loading users...</div>
        </Show>
        
        <Show when={!isLoading() && filteredUsers().length === 0}>
          <div class="empty-state">
            {searchQuery() ? 'No users match your search.' : 'No users found.'}
          </div>
        </Show>
        
        <Show when={!isLoading() && filteredUsers().length > 0}>
          <div class="user-grid">
            <For each={filteredUsers()}>
              {(user) => (
                <div class="user-card">
                  <div class="user-header">
                    <div class="user-avatar">{getInitials(user.username)}</div>
                    <div>
                      <h3 class="user-name">{user.username}</h3>
                      <div class="user-id">ID: {user.id}</div>
                    </div>
                  </div>
                  
                  <div class="user-info">
                    <div class="info-item">
                      <span class="info-label">Registered:</span>
                      <span class="info-value">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div class="user-actions">
                    <button 
                      class="btn btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default AdminUsers; 
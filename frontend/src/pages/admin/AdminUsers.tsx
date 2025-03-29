import { Component, createSignal, createEffect, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService } from '../../services/api';
import { User as ApiUser } from '../../services/api/types';
import '../../styles/Admin.css';

interface User extends ApiUser {
  username?: string;
  createdAt?: string;
}

const AdminUsers: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal('');
  const navigate = useNavigate();
  
  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/admin/login');
    } else {
      fetchUsers();
    }
  });
  
  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await UserService.getAllUsers();
    const mappedUsers = data.map(user => ({
      ...user,
      username: user.name
    }));
    setUsers(mappedUsers);
    setIsLoading(false);
  };
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure?')) return;
    await UserService.deleteUser(userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric'
    }).format(date);
  };
  
  const filteredUsers = () => {
    if (!searchQuery()) return users();
    const query = searchQuery().toLowerCase();
    return users().filter(user => 
      (user.username || user.name || '').toLowerCase().includes(query) || 
      user.id.toString().includes(query)
    );
  };
  
  return (
    <div class="admin-users-page">
      <h1 class="page-title">User Management</h1>
      
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
        
        {isLoading() ? (
          <div class="loading-indicator">Loading users...</div>
        ) : filteredUsers().length === 0 ? (
          <div class="empty-state">
            {searchQuery() ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <div class="user-grid">
            <For each={filteredUsers()}>
              {(user) => (
                <div class="user-card">
                  <div class="user-header">
                    <div class="user-avatar">
                      {(user.username || user.name || '??').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 class="user-name">{user.username || user.name}</h3>
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
        )}
      </div>
    </div>
  );
};

export default AdminUsers; 
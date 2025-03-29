import { Component, createSignal, createEffect, For } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { UserService } from '../../services/api';
import { User as ApiUser } from '../../services/api/types';

interface User extends ApiUser {
  username?: string;
  createdAt?: string;
}

const Users: Component = () => {
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
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex flex-wrap gap-3 mb-6">
          <input 
            type="text" 
            placeholder="Search users by name or ID..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" 
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
        
        {isLoading() ? (
          <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <span class="ml-3 text-gray-700 dark:text-gray-300">Loading users...</span>
          </div>
        ) : filteredUsers().length === 0 ? (
          <div class="text-center py-8 text-gray-700 dark:text-gray-300">
            {searchQuery() ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={filteredUsers()}>
              {(user) => (
                <div class="bg-gray-50 dark:bg-gray-750 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <A href={`/profile/${user.id}`} class="block hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="p-4 flex items-center">
                      <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center mr-3 font-bold">
                        {(user.username || user.name || '??').substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-white">{user.username || user.name}</h3>
                        <div class="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </A>
                  
                  <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">Registered:</span>
                      <span class="text-sm text-gray-900 dark:text-gray-200">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <div class="flex gap-2">
                      <A 
                        href={`/profile/${user.id}`}
                        class="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        View Profile
                      </A>
                      <button 
                        class="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default Users; 
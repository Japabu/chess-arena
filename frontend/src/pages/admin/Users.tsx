import { Component, createSignal, For, onMount } from 'solid-js';
import { UserService } from '../../services/api';
import { User } from '../../services/api/types';

const Users: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  
  onMount(async () => {
      setUsers((await UserService.getAllUsers()).users);
  });
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure?')) return;
    await UserService.deleteUser(userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  const formatDate = (isoDate: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric'
    }).format(new Date(isoDate));
  };
  
  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="text-center py-8 text-gray-700 dark:text-gray-300">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input type="checkbox" />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <For each={users()}>
                {(user) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-gray-900 dark:text-white">{user.username}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button 
                        class="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users; 
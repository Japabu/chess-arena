import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { UserService } from '../../services/api';
import { User } from '../../services/api/types';

const Users: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [selectedUsers, setSelectedUsers] = createSignal<number[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [deleteSuccess, setDeleteSuccess] = createSignal('');
  const [error, setError] = createSignal('');
  const [selectAll, setSelectAll] = createSignal(false);
  
  onMount(async () => {
    await fetchUsers();
  });
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      setUsers((await UserService.getAllUsers()).users);
      // Reset selections when fetching new data
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure?')) return;
    
    setIsLoading(true);
    setError('');
    try {
      await UserService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setDeleteSuccess('User deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setSelectAll(false);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(users().map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleBulkDelete = async () => {
    const selectedIds = selectedUsers();
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;
    
    setIsLoading(true);
    setError('');
    try {
      await UserService.bulkDeleteUsers(selectedIds);
      setUsers(prev => prev.filter(user => !selectedIds.includes(user.id)));
      setSelectedUsers([]);
      setSelectAll(false);
      setDeleteSuccess(`${selectedIds.length} users deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (isoDate: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric'
    }).format(new Date(isoDate));
  };
  
  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">User Management</h1>
        
        <div class="flex gap-2">
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors"
            onClick={fetchUsers}
          >
            Refresh
          </button>
          <Show when={selectedUsers().length > 0}>
            <button 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
              onClick={handleBulkDelete}
              disabled={isLoading()}
            >
              Delete Selected ({selectedUsers().length})
            </button>
          </Show>
        </div>
      </div>
      
      {error() && <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900/30 dark:text-red-400">{error()}</div>}
      {deleteSuccess() && <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 dark:bg-green-900/30 dark:text-green-400">{deleteSuccess()}</div>}
      
      <Show when={isLoading()}>
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p class="mt-2 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </Show>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={selectAll()}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <For each={users()}>
                {(user) => (
                  <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers().includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-gray-900 dark:text-white">{user.username}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{formatDate(user.createdAt)}</td>
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
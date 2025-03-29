import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService } from '../../services/api';

const Dashboard: Component = () => {
  const navigate = useNavigate();
  const [stats, setStats] = createSignal({
    users: 0,
    matches: 0,
    tournaments: 0,
  });

  createEffect(() => {
    if (!UserService.isAdmin()) {
      navigate('/');
    } 
  });

  return (
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Users</p>
              <button 
                class="text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Matches</p>
              <button 
                class="text-xl font-semibold text-gray-800 dark:text-white hover:text-green-500 dark:hover:text-green-400 transition-colors"
                onClick={() => navigate('/admin/matches')}
              >
                Manage Matches
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-4">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Tournaments</p>
              <button 
                class="text-xl font-semibold text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                onClick={() => navigate('/admin/tournaments')}
              >
                Manage Tournaments
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button 
              class="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center justify-center"
              onClick={() => navigate('/admin/matches/create')}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New Match
            </button>
            
            <button 
              class="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center justify-center"
              onClick={() => navigate('/admin/tournaments/create')}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New Tournament
            </button>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Admin Resources</h2>
          <ul class="space-y-3 text-gray-700 dark:text-gray-300">
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Manage user accounts and permissions
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Create and oversee chess matches
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Organize and monitor tournaments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
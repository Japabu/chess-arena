import { Component, createSignal, createEffect, Show } from 'solid-js';
import { A, useNavigate, useLocation } from '@solidjs/router';
import { AuthStore } from '../services/auth.store';
import ContextMenu from './ContextMenu';

const Navbar: Component = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthStore.logout();
    navigate('/');
  };

  return (
    <nav class="bg-white dark:bg-gray-800 shadow-md">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex-shrink-0">
            <A href="/" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Chess Arena
            </A>
          </div>
          
          {/* Desktop menu */}
          <div class="flex items-center space-x-4">
            <A href="/matches" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200">
              Matches
            </A>
            <A href="/tournaments" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200">
              Tournaments
            </A>
            
            <Show when={!AuthStore.isAuthenticated()} fallback={
              <ContextMenu
                trigger={
                  <button class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2">
                        {AuthStore.userDisplayName().charAt(0).toUpperCase()}
                      </div>
                      <span>{AuthStore.userDisplayName()}</span>
                      <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                }
                class="transition-all duration-200"
              >
                <div>
                  <div class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                    <div class="font-medium">Logged in as</div>
                    <div class="truncate text-indigo-500 dark:text-indigo-400">{AuthStore.userDisplayName()}</div>
                  </div>
                  
                  {AuthStore.isAdmin() && (
                    <A 
                      href="/admin/dashboard" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Admin Dashboard
                      </span>
                    </A>
                  )}
                  
                  <A 
                    href={`/profile/${AuthStore.authUser()?.id}`}
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Your Profile
                    </span>
                  </A>
                  
                  <div class="border-t border-gray-100 dark:border-gray-700"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Sign out
                    </span>
                  </button>
                </div>
              </ContextMenu>
            }>
              <div class="flex space-x-2">
                <A 
                  href="/login" 
                  class="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Sign in
                </A>
                <A 
                  href="/register" 
                  class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
                >
                  Sign up
                </A>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
import { Component, createSignal, createEffect, Show, onMount } from 'solid-js';
import { A, useNavigate, useLocation } from '@solidjs/router';
import { UserService } from '../services';

const Navbar: Component = () => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = createSignal(false);
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [isAdmin, setIsAdmin] = createSignal(false);
  const [username, setUsername] = createSignal('');
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsAdmin(UserService.isAdmin());
    
    const claims = UserService.getUserClaims();
    if (claims) {
      setUsername(claims.username);
    }
  };

  // Check auth status whenever component mounts or route changes
  onMount(() => {
    checkAuthStatus();
    
    // Add event listener for storage changes (logout in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        checkAuthStatus();
      }
    });
    
    // Create custom event for auth state changes
    window.addEventListener('auth-state-changed', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('auth-state-changed', checkAuthStatus);
    };
  });
  
  // Re-check auth status when location changes
  createEffect(() => {
    location.pathname; // Track route changes
    checkAuthStatus();
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsUserMenuOpen(false);
    navigate('/');
    
    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed'));
  };

  // Close dropdowns when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (isUserMenuOpen() && !(e.target as HTMLElement).closest('.user-menu-container')) {
      setIsUserMenuOpen(false);
    }
  };

  createEffect(() => {
    if (isUserMenuOpen()) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

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
          <div class="hidden md:flex md:items-center md:space-x-4">
            <A href="/matches" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200">
              Matches
            </A>
            <A href="/tournaments" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200">
              Tournaments
            </A>
            
            <Show when={!isLoggedIn()} fallback={
              <div class="relative user-menu-container">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen())}
                  class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2">
                      {username().charAt(0).toUpperCase()}
                    </div>
                    <span>{username()}</span>
                    <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
                
                {/* User dropdown menu - Improved styling */}
                <div 
                  class={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 ${isUserMenuOpen() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                >
                  <div class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                    <div class="font-medium">Logged in as</div>
                    <div class="truncate text-indigo-500 dark:text-indigo-400">{username()}</div>
                  </div>
                  
                  {isAdmin() && (
                    <A 
                      href="/admin/dashboard" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
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
                    href="/profile" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
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
              </div>
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
          
          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button 
              type="button"
              class="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen())}
            >
              <span class="sr-only">Open main menu</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={isMenuOpen() ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div class={`md:hidden ${isMenuOpen() ? "block" : "hidden"}`}>
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <A href="/matches" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
            Matches
          </A>
          <A href="/tournaments" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
            Tournaments
          </A>
          
          <Show when={!isLoggedIn()} fallback={
            <>
              <div class="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">
                <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2">
                  {username().charAt(0).toUpperCase()}
                </div>
                <span>{username()}</span>
              </div>
              
              {isAdmin() && (
                <A 
                  href="/admin/dashboard" 
                  class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Admin Dashboard
                </A>
              )}
              
              <A 
                href="/profile" 
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Your Profile
              </A>
              
              <button 
                onClick={handleLogout}
                class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </>
          }>
            <div class="grid grid-cols-2 gap-2 px-3 py-2">
              <A 
                href="/login" 
                class="px-4 py-2 rounded-md text-center text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"
              >
                Sign in
              </A>
              <A 
                href="/register" 
                class="px-4 py-2 rounded-md text-center text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign up
              </A>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
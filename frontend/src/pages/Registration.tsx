import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService } from '../services';

const Registration: Component = () => {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  createEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  });
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Register the user
      await UserService.register(username(), password());
      
      // Login the user to get the token
      const loginData = await UserService.login(username(), password());
      localStorage.setItem('token', loginData.access_token);
      setSuccess(true);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Register New Account</h1>
      
      {success() && (
        <div class="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400 px-4 py-3 rounded mb-4">
          <p class="text-lg font-medium">Registration successful! Redirecting to homepage...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Username</label>
          <input
            type="text"
            id="username"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            required
            disabled={isLoading() || success()}
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            disabled={isLoading() || success()}
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Register a new account to participate in chess matches.
        </p>
        <button 
          type="submit" 
          disabled={isLoading() || success()}
          class="w-full mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading() ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Registration; 
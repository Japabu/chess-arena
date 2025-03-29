import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService } from '../services';

const Login: Component = () => {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const navigate = useNavigate();
  
  // Redirect if already logged in
  createEffect(() => {
    if (localStorage.getItem('token')) {
      const claims = UserService.getUserClaims();
      if (claims?.roles?.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  });
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await UserService.login(username(), password());
      localStorage.setItem('token', data.access_token);
      
      // Notify the app that auth state has changed
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
      
      // Redirect based on user role
      const claims = UserService.getUserClaims();
      if (claims?.roles?.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Login</h1>
      
      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error()}
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
            disabled={isLoading()}
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
            disabled={isLoading()}
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <button type="submit" class="w-full mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200" disabled={isLoading()}>
          {isLoading() ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 
import { Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { UserService } from '../services';
import './BotRegistration.css';

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
      const data = await UserService.register(username(), password());
      localStorage.setItem('token', data.access_token);
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
    <div class="bot-registration">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Register New Account</h1>
      
      {success() && (
        <div class="success-message text-green-600 dark:text-green-400 mb-4">
          <p class="text-lg font-medium">Registration successful! Redirecting to homepage...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} class="registration-form">
        <div class="form-group">
          <label for="username" class="text-gray-800 dark:text-gray-200 font-medium">Username</label>
          <input
            type="text"
            id="username"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            required
            disabled={isLoading() || success()}
          />
        </div>
        <div class="form-group">
          <label for="password" class="text-gray-800 dark:text-gray-200 font-medium">Password</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            disabled={isLoading() || success()}
          />
        </div>
        <p class="info-text text-gray-600 dark:text-gray-300">
          Register a new account to participate in chess matches.
        </p>
        <button type="submit" class="button" disabled={isLoading() || success()}>
          {isLoading() ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Registration; 
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import './AdminLogin.css';

const AdminLogin: Component = () => {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3000/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username(),
          password: password(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      // Store the token in localStorage
      localStorage.setItem('admin_token', data.access_token);
      
      // Check if user has admin privileges by trying to access admin-only endpoint
      const adminCheckResponse = await fetch(`http://localhost:3000/auth/users`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      if (adminCheckResponse.status === 403) {
        localStorage.removeItem('admin_token');
        throw new Error('You do not have administrator privileges');
      }
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="admin-login">
      <h1>Admin Login</h1>
      
      {error() && <div class="error-message">{error()}</div>}
      
      <form onSubmit={handleSubmit} class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            required
            disabled={isLoading()}
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            disabled={isLoading()}
          />
        </div>
        
        <button type="submit" class="button" disabled={isLoading()}>
          {isLoading() ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 
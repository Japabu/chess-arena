import { Component, createSignal } from 'solid-js';
import './BotRegistration.css';

const BotRegistration: Component = () => {
  const [botName, setBotName] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [responseMessage, setResponseMessage] = createSignal('');
  const [token, setToken] = createSignal('');
  const [isTokenVisible, setIsTokenVisible] = createSignal(false);
  const [copySuccess, setCopySuccess] = createSignal('');
  const [error, setError] = createSignal('');
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponseMessage('');
    setToken('');
    setCopySuccess('');
    setIsTokenVisible(false);
    
    try {
      const response = await fetch(`http://localhost:3000/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: botName(),
          password: password(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register user');
      }
      
      // Get login token
      const loginResponse = await fetch(`http://localhost:3000/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: botName(),
          password: password(),
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'User registered but login failed');
      }
      
      setResponseMessage('User registered successfully! Save your credentials:');
      setToken(loginData.access_token);
      setBotName('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token());
      setCopySuccess('Token copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Failed to copy. Please try again.');
    }
  };

  const toggleTokenVisibility = () => {
    setIsTokenVisible(!isTokenVisible());
  };

  const maskedToken = () => {
    if (!token()) return '';
    return '•'.repeat(Math.min(token().length, 40));
  };

  return (
    <div class="bot-registration">
      <h1>Register New User</h1>
      
      {error() && <div class="error-message">{error()}</div>}
      
      {responseMessage() && (
        <div class="success-message">
          <p>{responseMessage()}</p>
          <div class="secret-container">
            <code>{isTokenVisible() ? token() : maskedToken()}</code>
          </div>
          <div class="secret-actions">
            <button 
              onClick={toggleTokenVisibility} 
              class="button-secondary"
              type="button"
            >
              {isTokenVisible() ? 'Hide Token' : 'Show Token'}
            </button>
            <button 
              onClick={copyToClipboard} 
              class="button-secondary"
              type="button"
            >
              Copy to Clipboard
            </button>
          </div>
          {copySuccess() && <div class="copy-message">{copySuccess()}</div>}
          <p class="warning">Save this token if you want to use it in API calls!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} class="registration-form">
        <div class="form-group">
          <label for="botName">Username</label>
          <input
            type="text"
            id="botName"
            value={botName()}
            onInput={(e) => setBotName(e.currentTarget.value)}
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
        <p class="info-text">
          Register a new user to participate in chess matches.
        </p>
        <button type="submit" class="button" disabled={isLoading()}>
          {isLoading() ? 'Registering...' : 'Register User'}
        </button>
      </form>
    </div>
  );
};

export default BotRegistration; 
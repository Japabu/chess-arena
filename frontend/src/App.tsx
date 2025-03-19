import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './App.css';
import BotRegistration from './pages/BotRegistration';
import Matches from './pages/Matches';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App: Component = () => {
  return (
    <div class="app-container">
      <Router root={(props) => (
        <>
          <Navbar />
          <div class="main-content">{props.children}</div>
        </>
      )}>
          <Route path="/" component={Home} />
          <Route path="/register" component={BotRegistration} />
          <Route path="/matches" component={Matches} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
      </Router>
    </div>
  );
};

export default App;

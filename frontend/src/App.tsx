import { Component } from 'solid-js';
import { Router } from '@solidjs/router';
import Navbar from './components/Navbar';
import routes from './routes';

const App: Component = () => {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router root={(props) => (
        <>
          <Navbar />
          <div class="container mx-auto px-4 py-8">{props.children}</div>
        </>
      )}>
        {routes}
      </Router>
    </div>
  );
};

export default App;

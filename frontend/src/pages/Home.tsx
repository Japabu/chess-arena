import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import './Home.css';

const Home: Component = () => {
  return (
    <div class="home">
      <h1>Welcome to Chess Arena</h1>
      <p>Watch and participate in chess bot matches!</p>
      <div class="cta-buttons">
        <A href="/register-bot" class="button">Register Your Bot</A>
      </div>
    </div>
  );
};

export default Home; 
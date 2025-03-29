import { Component } from 'solid-js';
import { A } from '@solidjs/router';

const Navbar: Component = () => {
  return (
    <nav class="navbar">
      <div class="navbar-brand">
        <A href="/" class="navbar-link">Chess Arena</A>
      </div>
      <div class="navbar-links">
        <A href="/matches" class="navbar-link">Matches</A>
        <A href="/tournaments" class="navbar-link">Tournaments</A>
        <A href="/register" class="navbar-link">Register</A>
        <A href="/admin/dashboard" class="navbar-link">Admin</A>
      </div>
    </nav>
  );
};

export default Navbar; 
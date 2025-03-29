import { Component } from 'solid-js';
import { A } from '@solidjs/router';

const Navbar: Component = () => {
  return (
    <nav class="bg-secondary-bg py-4 px-8 flex justify-between items-center shadow-md">
      <div class="navbar-brand">
        <A href="/" class="text-2xl font-bold text-accent-primary">Chess Arena</A>
      </div>
      <div class="flex gap-4">
        <A href="/matches" class="py-2 px-4 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors">Matches</A>
        <A href="/tournaments" class="py-2 px-4 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors">Tournaments</A>
        <A href="/register" class="py-2 px-4 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors">Register</A>
        <A href="/admin/dashboard" class="py-2 px-4 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors">Admin</A>
      </div>
    </nav>
  );
};

export default Navbar; 
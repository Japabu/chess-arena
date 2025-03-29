import { Component, JSX } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

interface AdminLayoutProps {
  children?: JSX.Element;
}

const AdminLayout: Component<AdminLayoutProps> = (props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div class="flex min-h-screen bg-primary-bg">
      <div class="w-64 bg-secondary-bg flex flex-col shadow-lg">
        <div class="p-6 border-b border-border">
          <h2 class="text-xl font-bold text-accent-primary">Chess Arena</h2>
          <span class="text-sm text-secondary-text">Admin Panel</span>
        </div>
        <nav class="flex-1 py-6 flex flex-col gap-2 px-4">
          <A 
            href="/admin/dashboard" 
            end 
            activeClass="bg-tertiary-bg text-accent-primary" 
            class="px-4 py-2 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors"
          >
            Dashboard
          </A>
          <A 
            href="/admin/users" 
            activeClass="bg-tertiary-bg text-accent-primary" 
            class="px-4 py-2 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors"
          >
            Users
          </A>
          <A 
            href="/admin/matches" 
            activeClass="bg-tertiary-bg text-accent-primary" 
            class="px-4 py-2 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors"
          >
            Matches
          </A>
          <A 
            href="/admin/tournaments" 
            activeClass="bg-tertiary-bg text-accent-primary" 
            class="px-4 py-2 rounded text-secondary-text hover:bg-tertiary-bg hover:text-accent-primary transition-colors"
          >
            Tournaments
          </A>
        </nav>
        <div class="p-4 border-t border-border">
          <button onClick={handleLogout} class="w-full py-2 px-4 bg-[#3e1c26] text-[#ef9a9a] rounded hover:bg-[#4e2c36] transition-colors">
            Logout
          </button>
        </div>
      </div>
      <div class="flex-1 p-6">
        <div class="bg-secondary-bg rounded-lg p-6 shadow-md min-h-[calc(100vh-3rem)]">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 
import { Component, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const AdminDashboard: Component = () => {
  const navigate = useNavigate();
  
  // Redirect to new admin dashboard route
  createEffect(() => {
    navigate('/admin/dashboard');
  });
  
  return (
    <div class="flex justify-center items-center h-40">
      <p class="text-gray-700 dark:text-gray-200 text-lg">
        Redirecting to new admin dashboard...
      </p>
    </div>
  );
};

export default AdminDashboard; 
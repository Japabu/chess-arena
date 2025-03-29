import { Component, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const AdminDashboard: Component = () => {
  const navigate = useNavigate();
  
  // Redirect to new admin dashboard route
  createEffect(() => {
    navigate('/admin/dashboard');
  });
  
  return (
    <div>
      Redirecting to new admin dashboard...
    </div>
  );
};

export default AdminDashboard; 
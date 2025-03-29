import { Component, JSX } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import '../styles/AdminLayout.css';

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
    <div class="admin-layout">
      <div class="admin-sidebar">
        <div class="admin-logo">
          <h2>Chess Arena</h2>
          <span>Admin Panel</span>
        </div>
        <nav class="admin-nav">
          <A href="/admin/dashboard" end activeClass="active">Dashboard</A>
          <A href="/admin/users" activeClass="active">Users</A>
          <A href="/admin/matches" activeClass="active">Matches</A>
          <A href="/admin/tournaments" activeClass="active">Tournaments</A>
        </nav>
        <div class="admin-sidebar-footer">
          <button onClick={handleLogout} class="logout-button">Logout</button>
        </div>
      </div>
      <div class="admin-content">
        <div class="admin-content-inner">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 
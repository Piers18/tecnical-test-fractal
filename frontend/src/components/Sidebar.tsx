import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="material-icons brand-icon">inventory_2</span>
          <span className="brand-text">OrderApp</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/my-orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="material-icons">receipt_long</span>
            <span>Orders</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="material-icons">category</span>
            <span>Products</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            <span className="material-icons">person</span>
          </div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-email">admin@orderapp.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

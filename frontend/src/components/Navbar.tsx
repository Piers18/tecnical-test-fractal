import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="material-icons navbar-logo">inventory_2</span>
        <span className="navbar-title">Order Manager</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/my-orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="material-icons nav-icon">receipt_long</span>
          My Orders
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="material-icons nav-icon">category</span>
          Products
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;

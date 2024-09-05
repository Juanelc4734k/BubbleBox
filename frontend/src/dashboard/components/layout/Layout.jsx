import React from 'react';
import Navbar from '../../../components/layout/Navbar';
import Sidebar from '../../../components/layout/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

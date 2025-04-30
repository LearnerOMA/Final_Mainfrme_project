import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Home, PlusCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8 mt-4">Customer CRM</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={`flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/')}`}>
                  <Users className="mr-3" size={20} />
                  <span>Customers</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/add" 
                  className={`flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/add')}`}>
                  <PlusCircle className="mr-3" size={20} />
                  <span>Add Customer</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/' && 'Customer Dashboard'}
              {location.pathname === '/add' && 'Add New Customer'}
              {location.pathname.includes('/edit/') && 'Edit Customer'}
            </h2>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
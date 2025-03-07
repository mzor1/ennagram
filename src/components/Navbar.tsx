import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Home size={24} />
            <Link to="/dashboard" className="text-xl font-bold">
              Enneagram Test
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="hover:text-indigo-200">
                  Dashboard
                </Link>
                <Link to="/admin/dealers" className="hover:text-indigo-200">
                  Manage Dealers
                </Link>
              </>
            )}
            
            {user?.role === 'dealer' && (
              <>
                <Link to="/dealer" className="hover:text-indigo-200">
                  Dashboard
                </Link>
                <Link to="/dealer/students" className="hover:text-indigo-200">
                  Manage Students
                </Link>
              </>
            )}
            
            {user?.role === 'student' && (
              <>
                <Link to="/student" className="hover:text-indigo-200">
                  Dashboard
                </Link>
                <Link to="/test" className="hover:text-indigo-200">
                  Take Test
                </Link>
                <Link to="/results" className="hover:text-indigo-200">
                  My Results
                </Link>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <User size={18} />
              <span>{user?.name}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;